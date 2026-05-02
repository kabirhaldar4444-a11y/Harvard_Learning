import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../../utils/supabase';
import UserSubmissions from '../../components/admin/UserSubmissions';
import CreateUser from '../../components/admin/CreateUser';
import CandidateInspection from '../../components/admin/CandidateInspection';
import { useConfirm, useToast } from '../../components/common/AlertProvider';

const Users = ({ user, profile: activeProfile }) => {
  const confirm = useConfirm();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [docViewUrl, setDocViewUrl] = useState(null);
  const [docViewLabel, setDocViewLabel] = useState('');
  const [activeTab, setActiveTab] = useState('candidates');
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const navigate = useNavigate();

  const isSuperAdmin = user?.email === 'info@harvardlearning.com';

  useEffect(() => {
    fetchUsers();
    fetchExams();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase
      .from('profiles')
      .select('*')
      .order('full_name');

    if (!isSuperAdmin) {
      query = query.eq('role', 'candidate');
    }

    const { data, error } = await query;
    if (data) setUsers(data);
    setLoading(false);
  };

  const fetchExams = async () => {
    const { data } = await supabase.from('exams').select('id, title').order('title');
    if (data) setExams(data);
  };

  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'candidate' : 'admin';
    const isConfirmed = await confirm({
      title: `${newRole === 'admin' ? 'Grant Admin Access' : 'Revoke Admin Access'}`,
      message: `Are you sure you want to ${newRole === 'admin' ? 'grant admin access to' : 'revoke admin access from'} "${targetUser.full_name}"?`,
      type: 'warning',
      confirmText: 'Yes, Change Role'
    });

    if (!isConfirmed) return;

    setTogglingId(targetUser.id);
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', targetUser.id);

    if (error) {
      toast('Error changing role: ' + error.message, 'error');
    } else {
      toast(`User successfully updated to ${newRole}!`, 'success');
      fetchUsers();
    }
    setTogglingId(null);
  };

  const handleToggleExamLock = async (u) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_exam_locked: !u.is_exam_locked })
      .eq('id', u.id);
    if (!error) fetchUsers();
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.email === 'info@harvardlearning.com') {
      toast('The Master Admin account cannot be deleted.', 'error');
      return;
    }

    const isConfirmed = await confirm({
      title: 'Permanently Delete User',
      message: `Are you sure you want to delete "${targetUser.full_name}"? This will permanently remove their profile, submissions, and login access.`,
      type: 'error',
      confirmText: 'Delete Permanently'
    });
    if (!isConfirmed) return;

    try {
      setLoading(true);
      const { error } = await supabase.rpc('admin_delete_user', { target_user_id: targetUser.id });
      if (error) throw new Error(error.message || 'Failed to delete user account.');
      setUsers(users.filter(u => u.id !== targetUser.id));
      toast('User deleted successfully!', 'success');
    } catch (err) {
      toast('Error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExam = async (examId) => {
    if (!selectedUser) return;
    const currentExams = selectedUser.allotted_exam_ids || [];
    const newExams = currentExams.includes(examId)
      ? currentExams.filter(id => id !== examId)
      : [...currentExams, examId];

    // Optimistic Update
    setSelectedUser({ ...selectedUser, allotted_exam_ids: newExams });

    const { error } = await supabase
      .from('profiles')
      .update({ allotted_exam_ids: newExams })
      .eq('id', selectedUser.id);

    if (error) {
      toast('Error updating assignments: ' + error.message, 'error');
      // Rollback
      setSelectedUser({ ...selectedUser, allotted_exam_ids: currentExams });
    } else {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, allotted_exam_ids: newExams } : u));
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRoleUsers = users.filter(u =>
    u.role === 'admin' &&
    u.email !== 'info@harvardlearning.com' && (
      u.full_name?.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(roleSearchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen relative overflow-hidden font-sans selection:bg-[#A51C30]/10 pt-10">
      {/* Background Ambience - Crimson & Gold */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-[#A51C30]/5 rounded-full blur-[128px] animate-blob pointer-events-none"></div>
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-[#C49619]/5 rounded-full blur-[128px] animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">

        {/* ── PAGE HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 animate-fade-in border-b border-slate-200 pb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 text-[#1e293b] font-serif">
              {isSuperAdmin ? 'Institutional Governance' : 'Scholar Registry'}
            </h1>
            <p className="text-[#A51C30] font-black text-[10px] uppercase tracking-[0.4em]">
              {isSuperAdmin ? 'Administrative personnel and collegiate access oversight' : 'Comprehensive directory of active scholar accounts'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {activeTab === 'candidates' && (
              <div className="relative group w-full md:w-80">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#A51C30] transition-colors">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </span>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-premium !rounded-full !pl-14 w-full !bg-white shadow-sm"
                />
              </div>
            )}
            <Link to="/admin/users/new" className="w-full sm:w-auto">
              <button className="btn-premium w-full sm:w-auto !py-3 !px-8">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>
                Enroll Scholar
              </button>
            </Link>
          </div>
        </div>

        {/* ── TAB NAVIGATION ── */}
        {isSuperAdmin && (
          <div className="flex gap-2 mb-12 p-2 rounded-[2rem] w-fit bg-white border border-slate-100 shadow-sm">
            {[
              { id: 'candidates', label: 'Scholars', icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg> },
              { id: 'roles', label: 'Faculty Access', icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.333 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.956 11.956 0 0112 2.714z"/></svg> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 font-serif ${
                  activeTab === tab.id
                    ? 'bg-[#A51C30] text-white shadow-xl shadow-[#A51C30]/20'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ── SCHOLARS TAB ── */}
        {activeTab === 'candidates' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {[
                { label: 'Total Registry', value: users.length },
                { label: 'Administrative Faculty', value: users.filter(u => u.role === 'admin').length },
                { label: 'Active Scholars', value: users.filter(u => u.role === 'candidate').length }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-xl flex flex-col gap-2 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A51C30]">{stat.label}</span>
                  <span className="text-4xl font-black tracking-tight text-[#1e293b] font-serif">{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-full py-24 text-center">
                  <div className="w-16 h-16 border-4 border-[#A51C30] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-slate-400 font-serif text-lg">Accessing Registry...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-slate-50">
                  <p className="text-slate-400 font-serif text-lg">No scholars found matching the criteria.</p>
                </div>
              ) : (
                filteredUsers.map((u, i) => (
                  <div
                    key={u.id}
                    className={`group relative bg-white p-10 rounded-[3rem] shadow-xl border border-slate-50 hover:border-[#A51C30]/20 hover:shadow-2xl transition-all duration-700 animate-slide-up flex flex-col gap-8`}
                    style={{ animationDelay: `${(i % 9) * 100}ms` }}
                  >
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-tr from-[#A51C30] to-[#C49619] rounded-[2rem] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
                        <div className="relative w-20 h-20 bg-slate-50 rounded-[1.8rem] flex items-center justify-center border border-slate-100 overflow-hidden shadow-inner">
                          {u.profile_photo_url ? (
                            <img src={u.profile_photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-10 h-10 text-slate-200" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-black tracking-tight text-[#1e293b] font-serif group-hover:text-[#A51C30] transition-colors truncate">{u.full_name || 'Unnamed Scholar'}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{u.email || 'No credentials'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {u.role === 'admin' ? (
                        <div className="px-4 py-1.5 bg-[#A51C30]/5 border border-[#A51C30]/10 rounded-full text-[9px] font-black uppercase tracking-widest text-[#A51C30] flex items-center gap-2">
                          <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.333 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.956 11.956 0 0112 2.714z"/></svg>
                          Faculty Personnel
                        </div>
                      ) : (
                        <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400">
                          {u.allotted_exam_ids?.length || 0} Intellectual Assets
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-auto">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="w-11 h-11 rounded-[1rem] bg-slate-50 hover:bg-[#A51C30] hover:text-white text-slate-400 transition-all duration-500 flex items-center justify-center shadow-sm"
                          title="View Records"
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M2.036 12.322a1.012 1.012 0 010-.644C3.323 8.19 7.303 5.25 12 5.25c4.697 0 8.677 2.94 9.964 6.428.085.23.085.414 0 .644-1.287 3.488-5.267 6.428-9.964 6.428-4.697 0-8.677-2.94-9.964-6.428z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </button>
                        <button
                          onClick={() => navigate(`/admin/users/edit/${u.id}`)}
                          className="w-11 h-11 rounded-[1rem] bg-slate-50 hover:bg-[#C49619] hover:text-white text-slate-400 transition-all duration-500 flex items-center justify-center shadow-sm"
                          title="Modify Record"
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/></svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="w-11 h-11 rounded-[1rem] bg-slate-50 hover:bg-rose-500 hover:text-white text-slate-400 transition-all duration-500 flex items-center justify-center shadow-sm"
                          title="Archive Account"
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ── FACULTY ACCESS TAB ── */}
        {activeTab === 'roles' && isSuperAdmin && (
          <div className="animate-fade-in">
            <div className="bg-white p-12 md:p-16 rounded-[3.5rem] shadow-2xl border border-slate-50 border-t-8 border-t-[#C49619] mb-12">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                  <div className="max-w-2xl">
                    <h2 className="text-4xl font-black text-[#1e293b] font-serif mb-4 flex items-center gap-4">
                      Faculty Governance
                    </h2>
                    <p className="text-slate-400 font-medium text-lg leading-relaxed">Commission collegiate personnel with administrative authority. Precise oversight of institutional permissions is paramount.</p>
                  </div>
                  <div className="shrink-0 flex gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-black text-[#A51C30] font-serif">{users.filter(u => u.role === 'admin' && u.email !== 'info@harvardlearning.com').length}</div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">Staff Faculty</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-black text-[#1e293b] font-serif">{users.filter(u => u.role === 'candidate').length}</div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">Active Scholars</div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Search bar */}
            <div className="relative group w-full md:w-96 mb-10">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#A51C30] transition-colors">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </span>
              <input
                type="text"
                placeholder="Locate personnel by name or ID..."
                value={roleSearchQuery}
                onChange={e => setRoleSearchQuery(e.target.value)}
                className="input-premium !rounded-full !pl-16 w-full !bg-white shadow-sm"
              />
            </div>

            {/* Role toggle list */}
            {loading ? (
               <div className="py-24 text-center">
                  <div className="w-16 h-16 border-4 border-[#A51C30] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-slate-400 font-serif text-lg">Accessing Records...</p>
               </div>
            ) : filteredRoleUsers.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-50 flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-8">
                  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.333 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.956 11.956 0 0112 2.714z"/></svg>
                </div>
                <p className="text-slate-400 font-serif text-xl">No administrative personnel registered.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredRoleUsers.map((u, i) => {
                  const isAdmin = u.role === 'admin';
                  const isToggling = togglingId === u.id;

                  return (
                    <div
                      key={u.id}
                      className="group bg-white p-8 rounded-[2.5rem] flex items-center gap-8 shadow-xl border border-slate-50 hover:border-[#A51C30]/20 transition-all duration-700 animate-slide-up"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="relative shrink-0">
                        <div className="relative w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                          {u.profile_photo_url ? (
                            <img src={u.profile_photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black text-[#1e293b] font-serif truncate group-hover:text-[#A51C30] transition-colors">{u.full_name || 'Anonymous User'}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{u.email}</p>
                      </div>

                      <div className="flex items-center gap-10">
                         <div className="hidden lg:flex flex-col items-end">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Authorization Status</span>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${isAdmin ? 'text-[#A51C30]' : 'text-slate-400'}`}>{isAdmin ? 'Faculty Privileges' : 'Scholar Credentials'}</span>
                         </div>
                         <button
                            onClick={() => handleToggleRole(u)}
                            disabled={isToggling}
                            className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-700 focus:outline-none ${isAdmin ? 'bg-[#A51C30] shadow-lg shadow-[#A51C30]/30' : 'bg-slate-100'}`}
                         >
                            <span className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-xl transition-all duration-700 ${isAdmin ? 'translate-x-8' : 'translate-x-1'}`}>
                               {isToggling && (
                                 <svg className="animate-spin h-3 w-3 text-[#A51C30] m-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                               )}
                            </span>
                         </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE ADMIN MODAL & OTHER VIEWS REMAIN... */}


      {/* ── CREATE ADMIN MODAL ── */}
      {showCreateAdmin && (
        <div
          className="fixed inset-0 z-[3000] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in bg-black/60 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreateAdmin(false); }}
        >
          <div className="relative w-full max-w-md my-4 rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>

            {/* Header with close button always visible */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <h3 className="text-white font-black text-base leading-none">Create Staff Admin</h3>
                  <p className="text-purple-200 text-xs mt-0.5">New account will have full admin privileges</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateAdmin(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-90 shrink-0"
                title="Close"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Compact form body */}
            <div className="p-5 max-h-[75vh] overflow-y-auto">
              <CreateUser user={user} profile={activeProfile} initialRole="admin" />
            </div>
          </div>
        </div>
      )}


      {/* ── INSPECTION VIEW ── */}
      {selectedUser && (
        <CandidateInspection 
          candidate={selectedUser} 
          exams={exams} 
          onToggleExam={handleToggleExam} 
          onClose={() => setSelectedUser(null)} 
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {/* ── DOCUMENT VIEWER MODAL ── */}
      {docViewUrl && (
        <div
          className="fixed inset-0 z-[4000] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in bg-black/80"
          onClick={(e) => { if (e.target === e.currentTarget) setDocViewUrl(null); }}
        >
          <div className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                  <svg width="16" height="16" fill="none" stroke="#818cf8" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <div>
                  <h4 className="font-black text-sm text-[color:var(--text-dark)]">{docViewLabel}</h4>
                  <p className="text-xs" style={{ color: 'var(--text-light)' }}>{docViewUrl.toLowerCase().includes('.pdf') ? 'PDF Document' : 'Image Preview'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={docViewUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all hover:scale-105 no-underline"
                  style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Download
                </a>
                <button
                  id="doc-viewer-close-btn"
                  onClick={() => setDocViewUrl(null)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-rose-500/10 hover:text-rose-400"
                  style={{ color: 'var(--text-light)' }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            {/* Modal content */}
            <div className="flex-1 overflow-auto min-h-0 p-4">
              {docViewUrl.toLowerCase().includes('.pdf') ? (
                <iframe
                  src={docViewUrl}
                  title={docViewLabel}
                  className="w-full rounded-xl border"
                  style={{ height: '65vh', borderColor: 'var(--glass-border)' }}
                />
              ) : (
                <div className="flex items-center justify-center min-h-[300px]">
                  <img
                    src={docViewUrl}
                    alt={docViewLabel}
                    className="max-w-full max-h-[65vh] rounded-2xl shadow-2xl object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
