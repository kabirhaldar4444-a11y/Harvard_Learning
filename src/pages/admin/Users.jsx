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
    <div className="min-h-screen relative overflow-hidden font-sans selection:bg-primary-500/30 pt-10">
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-600/10 rounded-full blur-[128px] animate-blob pointer-events-none"></div>
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">

        {/* ── PAGE HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 animate-fade-in">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-[color:var(--text-dark)]">
              {isSuperAdmin ? 'Platform Management' : 'All Candidates'}
            </h1>
            <p className="text-[color:var(--text-light)] font-medium italic">
              {isSuperAdmin ? 'Manage administrative staff and student access' : 'View and manage candidate accounts and exam access'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {activeTab === 'candidates' && (
              <div className="relative group w-full md:w-80">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </span>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all backdrop-blur-md"
                  style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-dark)' }}
                />
              </div>
            )}
            <Link to="/admin/users/new">
              <button className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 whitespace-nowrap text-sm">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                New User
              </button>
            </Link>
          </div>
        </div>

        {/* ── TAB NAVIGATION (super admin only) ── */}
        {isSuperAdmin && (
          <div className="flex gap-2 mb-10 p-1.5 rounded-2xl w-fit" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--glass-border)' }}>
            {[
              { id: 'candidates', label: 'Candidates', icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
              { id: 'roles', label: 'Admin Roles', icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-[color:var(--text-light)] hover:text-[color:var(--text-dark)]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ── CANDIDATES TAB ── */}
        {activeTab === 'candidates' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { label: 'Total Users', value: users.length },
                { label: 'Active Access', value: users.filter(u => !u.is_exam_locked).length },
                { label: 'Staff Admins', value: users.filter(u => u.role === 'admin').length }
              ].map((stat, i) => (
                <div key={i} className="glass-card-saas p-6 border-l-4 border-l-primary-500 flex flex-col gap-1 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <span className="text-xs font-bold uppercase tracking-widest text-[color:var(--text-light)]">{stat.label}</span>
                  <span className="text-4xl font-extrabold tracking-tight text-[color:var(--text-dark)]">{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-full py-20 text-center animate-pulse">
                  <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400 font-medium">Loading participants...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="col-span-full py-20 text-center glass-card-saas">
                  <p className="text-slate-400 font-medium">No users found matching your search.</p>
                </div>
              ) : (
                filteredUsers.map((u, i) => (
                  <div
                    key={u.id}
                    className={`glass-card-saas p-8 flex flex-col gap-6 hover:-translate-y-2 hover:shadow-primary-500/10 animate-slide-up group ${u.is_exam_locked ? 'opacity-60 saturate-50' : 'opacity-100'}`}
                    style={{ animationDelay: `${(i % 9) * 100}ms` }}
                  >
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-primary-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/5 overflow-hidden">
                          {u.profile_photo_url ? (
                            <img src={u.profile_photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-8 h-8 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold tracking-tight line-clamp-1 text-[color:var(--text-dark)]">{u.full_name || 'Unnamed'}</h3>
                        <p className="text-sm font-medium text-[color:var(--text-light)] line-clamp-1">{u.email || 'No email'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {u.role === 'admin' ? (
                        <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black uppercase tracking-tighter text-purple-400 flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                          Admin Staff
                        </div>
                      ) : (
                        <div className="px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-[10px] font-black uppercase tracking-tighter text-primary-400">
                          {u.allotted_exam_ids?.length || 0} Assignments
                        </div>
                      )}
                      {u.is_exam_locked && (
                        <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] font-black uppercase tracking-tighter text-rose-400">
                          Locked
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="p-2.5 rounded-xl hover:text-blue-400 hover:bg-blue-400/10 transition-all duration-300"
                          style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-light)' }}
                          title="View Details"
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </button>
                        <button
                          onClick={() => navigate(`/admin/users/edit/${u.id}`)}
                          className="p-2.5 rounded-xl hover:text-amber-400 hover:bg-amber-400/10 transition-all duration-300"
                          style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-light)' }}
                          title="Edit"
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-2.5 rounded-xl hover:text-rose-400 hover:bg-rose-400/10 transition-all duration-300"
                          style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-light)' }}
                          title="Delete User"
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>

                      <button
                        onClick={() => handleToggleExamLock(u)}
                        className={`p-2.5 rounded-xl transition-all duration-300 ${u.is_exam_locked ? 'bg-rose-500/10 text-rose-400' : 'bg-primary-500/10 text-primary-400'}`}
                        title={u.is_exam_locked ? 'Unlock Access' : 'Lock Access'}
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          {u.is_exam_locked ? (
                            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                          ) : (
                            <path d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ── ADMIN ROLES TAB ── */}
        {activeTab === 'roles' && isSuperAdmin && (
          <div className="animate-fade-in">
            {/* Roles summary banner */}
            <div className="glass-card-saas p-8 mb-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[color:var(--text-dark)] mb-1 flex items-center gap-3">
                    <span className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </span>
                    Admin Access Control
                  </h2>
                  <p className="text-sm font-medium text-[color:var(--text-light)]">Toggle admin privileges for any user. A confirmation is required before every change.</p>
                </div>
                <div className="flex flex-wrap gap-4 items-center shrink-0">
                  <div className="flex gap-3 text-center">
                    <div className="px-5 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                      <div className="text-2xl font-black text-purple-500">{users.filter(u => u.role === 'admin' && u.email !== 'info@harvardlearning.com').length}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mt-0.5">Staff Admins</div>
                    </div>
                    <div className="px-5 py-3 rounded-2xl bg-slate-500/10 border border-slate-300/30">
                      <div className="text-2xl font-black text-[color:var(--text-dark)]">{users.filter(u => u.role === 'candidate').length}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--text-light)] mt-0.5">Candidates</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateAdmin(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:scale-105 active:scale-95 transition-all duration-300 text-sm whitespace-nowrap"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                    Add New Admin
                  </button>
                </div>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative group w-full md:w-96 mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </span>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={roleSearchQuery}
                onChange={e => setRoleSearchQuery(e.target.value)}
                className="w-full rounded-full pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-dark)' }}
              />
            </div>

            {/* Role toggle list */}
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-medium" style={{ color: 'var(--text-light)' }}>Loading users...</p>
              </div>
            ) : filteredRoleUsers.length === 0 ? (
              <div className="py-16 text-center glass-card-saas">
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-500">
                  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <p className="font-bold text-[color:var(--text-dark)] mb-1">No staff admins yet</p>
                <p className="text-sm font-medium text-[color:var(--text-light)] mb-4">Click "Add New Admin" to create your first staff administrator.</p>
                <button
                  onClick={() => setShowCreateAdmin(true)}
                  className="inline-flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 font-bold py-2.5 px-6 rounded-full transition-all text-sm"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                  Add New Admin
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredRoleUsers.map((u, i) => {
                  const isAdmin = u.role === 'admin';
                  const isToggling = togglingId === u.id;

                  return (
                    <div
                      key={u.id}
                      className="glass-card-saas px-6 py-4 flex items-center gap-5 hover:shadow-lg transition-all duration-300 animate-slide-up"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className={`absolute -inset-1 rounded-xl blur-sm transition-all duration-500 ${isAdmin ? 'bg-gradient-to-br from-purple-400 to-indigo-500 opacity-40' : 'opacity-0'}`}></div>
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--glass-border)' }}>
                          {u.profile_photo_url ? (
                            <img src={u.profile_photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--text-light)' }}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          )}
                        </div>
                      </div>

                      {/* Name & email */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-[color:var(--text-dark)] truncate">{u.full_name || 'Unnamed User'}</h3>
                        <p className="text-xs text-[color:var(--text-light)] truncate">{u.email}</p>
                      </div>

                      {/* Role pill */}
                      <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                        isAdmin
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-500'
                          : 'border-[color:var(--glass-border)] text-[color:var(--text-light)]'
                      }`} style={isAdmin ? {} : { backgroundColor: 'var(--input-bg)' }}>
                        {isAdmin ? (
                          <><svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Admin</>
                        ) : (
                          <><svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>User</>
                        )}
                      </div>

                      {/* Toggle group */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-semibold hidden sm:block select-none" style={{ color: 'var(--text-light)' }}>Admin Access</span>
                        {/* Pill toggle */}
                        <button
                          onClick={() => handleToggleRole(u)}
                          disabled={isToggling}
                          title={isAdmin ? 'Revoke Admin Access' : 'Grant Admin Access'}
                          aria-pressed={isAdmin}
                          className={`relative inline-flex w-14 h-7 rounded-full items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed ${
                            isAdmin ? 'bg-purple-500 shadow-lg shadow-purple-500/30' : ''
                          }`}
                          style={isAdmin ? {} : { backgroundColor: 'var(--glass-border)' }}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-300 ease-in-out ${isAdmin ? 'translate-x-7' : 'translate-x-0'}`}
                          >
                            {isToggling ? (
                              <svg className="animate-spin w-3 h-3 text-purple-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                              </svg>
                            ) : isAdmin ? (
                              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" className="text-purple-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            ) : (
                              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" className="text-slate-400"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
