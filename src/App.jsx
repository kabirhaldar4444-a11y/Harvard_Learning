import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/common/Header';
import AdminDashboard from './components/admin/AdminDashboard';
import CandidateDashboard from './components/candidate/CandidateDashboard';
import ExamPortal from './components/candidate/ExamPortal';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Users from './pages/admin/Users';
import CreateUser from './components/admin/CreateUser';
import EditUser from './components/admin/EditUser';
import CompleteProfile from './pages/candidate/CompleteProfile';
import supabase from './utils/supabase';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [exams, setExams] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      const currentUser = data?.user;
      
      if (currentUser) {
        setUser(currentUser);
        // Special case for admin email
        const isAdminEmail = currentUser.email === 'info@elitetoolistic.com';
        await fetchProfile(currentUser.id, isAdminEmail, currentUser.email);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Auth Check Error:', err);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const fetchProfile = async (userId, isAdminEmail = false, email = '') => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        // If it's the admin email but role is not admin, update it
        if (isAdminEmail && data.role !== 'admin') {
          const { data: updatedData } = await supabase
            .from('profiles')
            .update({ role: 'admin', profile_completed: true })
            .eq('id', userId)
            .select()
            .single();
          if (updatedData) setProfile(updatedData);
        } else {
          setProfile(data);
        }
      } else if (error) {
        // Profile not found, create one if it's the admin email
        if (isAdminEmail && error.code === 'PGRST116') {
          const { data: newData } = await supabase
            .from('profiles')
            .insert([{ id: userId, email: email, role: 'admin', full_name: 'Administrator', profile_completed: true }])
            .select()
            .single();
          if (newData) setProfile(newData);
        } else {
          console.error('Profile Fetch Error:', error.message);
        }
      }
    } catch (err) {
      console.error('Profile Fetch Exception:', err);
    }
  };

  useEffect(() => {
    if (user) fetchExams();
  }, [user, profile?.profile_completed]);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*');
      if (data) setExams(data);
      if (error) console.error('Fetch Exams Error:', error);
    } catch (err) {
      console.error('Fetch Exams Exception:', err);
    }
  };

  const addExam = async (newExam) => {
    const { data, error } = await supabase
      .from('exams')
      .insert([newExam])
      .select();
    if (data) fetchExams();
  };

  const deleteExam = async (id) => {
    await supabase.from('exams').delete().eq('id', id);
    fetchExams();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    navigate('/login');
  };

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [submitSignal, setSubmitSignal] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const isLoginRoute = location.pathname === '/login' || location.pathname === '/complete-profile';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="premium-container relative min-h-screen">
      {!isLoginRoute && (
        <Header 
          isAdmin={profile?.role === 'admin'} 
          isCandidate={profile?.role === 'candidate'}
          isExamActive={!!activeExam}
          onLogout={handleLogout}
          onSubmitExam={() => setSubmitSignal(prev => prev + 1)}
        />
      )}
      <main className={isLoginRoute ? 'p-0 max-w-none' : ''}>
        <Routes>
          <Route path="/login" element={
            user ? (
              !loading && !profile ? (
                <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 text-center px-4 animate-fade-in">
                  <h2 className="text-4xl font-black text-red-500 tracking-tight">Profile Not Found</h2>
                  <p className="text-slate-400 max-w-md">Your account exists but we couldn't find your profile details.</p>
                  <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-bold transition-all">Back to Login</button>
                </div>
              ) : (
                profile?.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/" />
              )
            ) : <Login onLoginSuccess={checkAuth} />
          } />
          
          <Route path="/" element={
            !user ? <Navigate to="/login" /> :
            profile?.role === 'candidate' ? (
              !profile?.profile_completed ? <Navigate to="/complete-profile" /> :
              activeExam ? (
                <ExamPortal exam={activeExam} onFinish={() => setActiveExam(null)} submitSignal={submitSignal} />
              ) : (
                <CandidateDashboard exams={exams} onStartExam={setActiveExam} profile={profile} />
              )
            ) : profile?.role === 'admin' ? <Navigate to="/admin" /> : (
              <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 text-center px-4 animate-fade-in">
                <h2 className="text-4xl font-black text-red-500 tracking-tight">Identity Mismatch</h2>
                <p className="text-slate-400 max-w-md">We found your account but your profile details are missing or corrupted.</p>
                <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-bold transition-all">Sign Out & Retry</button>
              </div>
            )
          } />

          <Route path="/complete-profile" element={
            profile?.role === 'candidate' ? (
              profile?.profile_completed ? <Navigate to="/" /> : <CompleteProfile profile={profile} onComplete={checkAuth} />
            ) : <Navigate to="/login" />
          } />

          <Route path="/profile" element={
            profile?.role === 'candidate' ? (
              <Profile profile={profile} />
            ) : <Navigate to="/login" />
          } />
           <Route path="/admin" element={
            profile?.role === 'admin' ? (
              <AdminDashboard exams={exams} addExam={addExam} deleteExam={deleteExam} onRefresh={fetchExams} />
            ) : <Navigate to="/login" />
          } />

          <Route path="/admin/users" element={
            profile?.role === 'admin' ? (
              <Users />
            ) : <Navigate to="/login" />
          } />

          <Route path="/admin/users/new" element={
            profile?.role === 'admin' ? (
              <CreateUser />
            ) : <Navigate to="/login" />
          } />

          <Route path="/admin/users/edit/:id" element={
            profile?.role === 'admin' ? (
              <EditUser />
            ) : <Navigate to="/login" />
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Global Floating Theme Toggle */}
      <div className="fixed bottom-8 right-8 z-[9999] animate-fade-in">
        <button 
          onClick={toggleTheme}
          className="w-14 h-14 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-300 group"
          style={{ 
            backgroundColor: 'var(--glass-bg)', 
            borderColor: 'var(--glass-border)',
            color: 'var(--text-dark)'
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <svg className="w-6 h-6 group-hover:rotate-[30deg] transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z"/></svg>
          ) : (
            <svg className="w-6 h-6 group-hover:-rotate-[30deg] transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default App;
