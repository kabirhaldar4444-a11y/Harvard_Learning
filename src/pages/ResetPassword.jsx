import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import { useToast } from '../components/common/AlertProvider';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Check if we have a session (the recovery link automatically logs the user in)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast('Session expired or invalid. Please request a new recovery link.', 'error');
        navigate('/login');
      }
    };
    checkSession();
  }, [navigate, toast]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast('Passwords do not match.', 'error');
      return;
    }

    if (password.length < 6) {
      toast('Password must be at least 6 characters.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      toast('Password updated successfully. You can now login with your new credentials.', 'success');
      // Sign out to force a fresh login with the new password
      await supabase.auth.signOut();
      navigate('/login');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fffcf9] relative overflow-hidden font-sans selection:bg-rose-100">
      
      {/* ── PRESTIGIOUS ACADEMIC ATMOSPHERE ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#fffcf9]">
        <div className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-[#A51C30]/5 rounded-full blur-[150px] animate-drift-left opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-[#C49619]/5 rounded-full blur-[150px] animate-drift-right opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-[400px] px-6 animate-fade-in py-12">
        
        {/* ── LOGO SECTION ── */}
        <div className="flex flex-col items-center mb-16">
          <div className="w-48 h-auto p-5 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100/50 hover:scale-[1.03] transition-transform duration-700 group">
            <img src="/Elitetoolistic.png" alt="Harvard Learning" className="w-full h-full object-contain" />
          </div>
          <div className="mt-8 text-center space-y-1">
             <h1 className="text-2xl font-black tracking-widest text-[#1e293b] uppercase font-serif">Secure Update</h1>
             <p className="text-[10px] font-black tracking-[0.4em] text-[#A51C30] uppercase">Credentials Reconfiguration</p>
          </div>
        </div>

        {/* ── RESET FORM ── */}
        <div className="glass-card-saas p-10 !rounded-[2.5rem] shadow-2xl border-t-4 border-t-[#A51C30]">
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  New Access Key
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute left-4 text-slate-300 group-focus-within:text-[#A51C30] transition-colors">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-premium w-full !pl-14 pr-12 text-sm"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-[#A51C30] transition-colors"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Confirm Access Key
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute left-4 text-slate-300 group-focus-within:text-[#A51C30] transition-colors">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="input-premium w-full !pl-14 pr-12 text-sm"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 text-slate-400 hover:text-[#A51C30] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-premium w-full shadow-2xl relative overflow-hidden group"
            >
              <span className={`relative z-10 flex items-center justify-center gap-3 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                Update Password
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" className="group-hover:translate-x-1 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </span>
              
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
