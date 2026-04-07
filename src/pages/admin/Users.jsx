import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../../utils/supabase';
import UserSubmissions from '../../components/admin/UserSubmissions';
import { useConfirm, useToast } from '../../components/common/AlertProvider';

const Users = () => {
  const confirm = useConfirm();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchExams();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'candidate')
      .order('full_name');
      
    if (data) setUsers(data);
    setLoading(false);
  };

  const fetchExams = async () => {
    const { data } = await supabase.from('exams').select('id, title').order('title');
    if (data) setExams(data);
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleExamLock = async (user) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_exam_locked: !user.is_exam_locked })
      .eq('id', user.id);
    if (!error) fetchUsers();
  };

  const handleDeleteUser = async (user) => {
    const isConfirmed = await confirm({
      title: 'Permanently Delete Candidate',
      message: `Are you sure you want to delete candidate "${user.full_name}"? This will permanently remove their profile, submissions, and login access.`,
      type: 'error',
      confirmText: 'Delete Permanently'
    });
    if (!isConfirmed) return;

    try {
      setLoading(true);
      const { error } = await supabase.rpc('admin_delete_user', { target_user_id: user.id });
      
      if (error) {
        console.error('Failed to delete user:', error);
        throw new Error(error.message || "Failed to delete user account.");
      }

      setUsers(users.filter(u => u.id !== user.id));
      toast('User deleted successfully!', 'success');
    } catch (err) {
      toast('Error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans selection:bg-primary-500/30 pt-10">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-600/10 rounded-full blur-[128px] animate-blob pointer-events-none"></div>
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 animate-fade-in">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-[color:var(--text-dark)]">
              All Candidates
            </h1>
            <p className="text-[color:var(--text-light)] font-medium italic">View and manage candidate accounts and exam access</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group w-full md:w-80">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </span>
              <input 
                type="text" 
                placeholder="Search candidates..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all backdrop-blur-md"
                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-dark)' }}
              />
            </div>
            
            <Link to="/admin/users/new">
              <button className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 whitespace-nowrap text-sm">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                New User
              </button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Candidates', value: users.length, color: 'from-blue-500' },
            { label: 'Active Access', value: users.filter(u => !u.is_exam_locked).length, color: 'from-emerald-500' },
            { label: 'Pending Assessments', value: users.filter(u => u.allotted_exam_ids?.length > 0).length, color: 'from-amber-500' }
          ].map((stat, i) => (
            <div key={i} className="glass-card-saas p-6 border-l-4 border-l-primary-500 flex flex-col gap-1 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <span className="text-xs font-bold uppercase tracking-widest text-[color:var(--text-light)]">{stat.label}</span>
              <span className="text-4xl font-extrabold tracking-tight text-[color:var(--text-dark)]">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-20 text-center animate-pulse">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400 font-medium">Loading candidates...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full py-20 text-center glass-card-saas">
              <p className="text-slate-400 font-medium">No candidates found matching your search.</p>
            </div>
          ) : (
            filteredUsers.map((user, i) => (
              <div 
                key={user.id} 
                className={`glass-card-saas p-8 flex flex-col gap-6 hover:-translate-y-2 hover:shadow-primary-500/10 animate-slide-up group ${user.is_exam_locked ? 'opacity-60 saturate-50' : 'opacity-100'}`}
                style={{ animationDelay: `${(i % 9) * 100}ms` }}
              >
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-primary-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/5 overflow-hidden">
                      {user.profile_photo_url ? (
                        <img src={user.profile_photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-8 h-8 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight line-clamp-1 text-[color:var(--text-dark)]">{user.full_name || 'Unnamed'}</h3>
                    <p className="text-sm font-medium text-[color:var(--text-light)]">{user.email || 'No email'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-[10px] font-black uppercase tracking-tighter text-primary-400">
                    {user.allotted_exam_ids?.length || 0} Assignments
                  </div>
                  {user.is_exam_locked && (
                    <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] font-black uppercase tracking-tighter text-rose-400">
                      Locked
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="p-2.5 rounded-xl hover:text-blue-400 hover:bg-blue-400/10 transition-all duration-300"
                      style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-light)' }}
                      title="View Details"
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                    <button 
                      onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                      className="p-2.5 rounded-xl hover:text-amber-400 hover:bg-amber-400/10 transition-all duration-300"
                      style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-light)' }}
                      title="Edit"
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user)}
                      className="p-2.5 rounded-xl hover:text-rose-400 hover:bg-rose-400/10 transition-all duration-300"
                      style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-light)' }}
                      title="Archive"
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>

                  <button 
                    onClick={() => handleToggleExamLock(user)}
                    className={`p-2.5 rounded-xl transition-all duration-300 ${user.is_exam_locked ? 'bg-rose-500/10 text-rose-400' : 'bg-primary-500/10 text-primary-400'}`}
                    title={user.is_exam_locked ? "Unlock Access" : "Lock Access"}
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      {user.is_exam_locked ? (
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
      </div>

      {/* Modal Profile View */}
      {selectedUser && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 md:p-12 backdrop-blur-xl animate-fade-in bg-black/60">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-10 md:p-14 shadow-2xl relative" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/5 transition-all text-xl"
              style={{ color: 'var(--text-light)' }}
            >✕</button>

            <div className="flex flex-col md:flex-row gap-12 mb-12">
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary-500 to-purple-600 rounded-3xl blur opacity-30"></div>
                <img 
                  src={selectedUser.profile_photo_url || 'https://via.placeholder.com/200'} 
                  alt=""
                  className="relative w-48 h-48 rounded-[2rem] object-cover border-4 border-slate-800 shadow-2xl"
                />
              </div>
              <div className="flex-1 space-y-4">
                <h2 className="text-5xl font-black tracking-tight leading-none text-[color:var(--text-dark)]">{selectedUser.full_name}</h2>
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center gap-3 text-lg font-bold text-primary-400">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    {selectedUser.email}
                  </div>
                  <div className="flex items-center gap-3 font-medium text-[color:var(--text-light)]">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    {selectedUser.phone || 'No contact provided'}
                  </div>
                  <div className="flex items-center gap-3 font-medium text-[color:var(--text-light)]">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {selectedUser.address || 'No location provided'}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t" style={{ borderColor: 'var(--glass-border)' }}>
              <h3 className="text-2xl font-black mb-8 tracking-tight text-[color:var(--text-dark)]">Exam Results</h3>
              <UserSubmissions userId={selectedUser.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
