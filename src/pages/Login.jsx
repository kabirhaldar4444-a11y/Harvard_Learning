import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import AuthLayout from '../components/auth/AuthLayout';
import { useToast } from '../components/common/AlertProvider';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Trim inputs
    const emailToAuth = email.trim().toLowerCase();
    const passwordToAuth = password.trim();

    try {
      // 1. Unified Logic: Match credentials & Role Verification
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToAuth,
        password: passwordToAuth
      });

      if (error) throw error;
      const user = data.user;

      // 2. Fetch profile to determine role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, profile_completed, full_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        await supabase.auth.signOut();
        throw new Error('Database access error. Your account initialization is incomplete.');
      }

      // 3. Hierarchical Redirect Logic (Professional Secure)
      // MASTER ADMIN CHECK (Hardcoded Email Safety)
      if (user.email === 'info@elitetoolistic.com') {
        await onLoginSuccess();
        toast('Logged in as Master Administrator', 'success');
        navigate('/admin');
        return;
      }

      // STAFF ADMIN CHECK
      if (profile.role === 'admin') {
        await onLoginSuccess();
        toast('Logged in as Staff Administrator', 'success');
        navigate('/admin');
        return;
      }

      // CANDIDATE CHECK
      if (profile.role === 'candidate') {
        await onLoginSuccess();
        toast(`Welcome back, ${profile.full_name || 'Candidate'}`, 'success');
        if (profile.profile_completed) {
          navigate('/');
        } else {
          navigate('/complete-profile');
        }
      } else {
        // Restricted access
        await supabase.auth.signOut();
        throw new Error('Access restricted. Please contact the administrator.');
      }
    } catch (err) {
      console.error('Full Login Error Details:', err);
      let msg = err.message || 'Authentication failed';
      
      // Map technical schema and RLS errors to user-friendly messages
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes('schema') || lowerMsg.includes('permission') || lowerMsg.includes('row-level security') || lowerMsg.includes('initialization')) {
        msg = `Access error: ${err.message || 'Your account is not properly initialized. Please contact the administrator.'}`;
      } else if (lowerMsg.includes('invalid login credentials')) {
        msg = 'Invalid email or password. Please try again.';
      }

      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Examination Portal" 
      subtitle="Sign in to start your journey"
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] ml-2 opacity-60" style={{ color: 'var(--text-dark)' }}>Email Address</label>
          <div className="relative group">
            <input 
              type="email" 
              placeholder="example@elitetoolistic.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              autoComplete="off"
              className="w-full rounded-2xl px-5 py-4 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 border-2"
              style={{ 
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-dark)'
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] ml-2 opacity-60" style={{ color: 'var(--text-dark)' }}>Password</label>
          <div className="relative group flex items-center">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              autoComplete="off"
              className="w-full rounded-2xl px-5 py-4 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 border-2"
              style={{ 
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-dark)'
              }}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 text-slate-400 hover:text-primary-500 transition-colors focus:outline-none"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              )}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-4 w-full bg-gradient-to-br from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-black py-4.5 rounded-2xl shadow-xl shadow-primary-600/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 group border-t border-white/20"
          style={{ minHeight: '60px' }}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="tracking-wide">Verifying...</span>
            </>
          ) : (
            <>
              <span className="tracking-wide text-lg">Enter Portal</span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-1 transition-transform group-hover:translate-x-1">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
