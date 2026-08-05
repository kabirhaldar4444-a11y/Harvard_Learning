import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import { useToast } from '../components/common/AlertProvider';

const MasterRecovery = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleReset = async (e) => {
    e.preventDefault();

    if (email !== 'kabirhaldar4444@gmail.com' && email !== 'support@harvardlearning.in' && email !== 'karthikriyan7@gmail.com') {
      toast('Access Denied: Only the Master Administrator can initiate recovery from this portal.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSent(true);
      toast('Recovery link dispatched to the Master Administrative email.', 'success');
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
          <div className="w-48 h-auto p-5 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100/50 hover:scale-[1.03] transition-transform duration-700 group cursor-pointer" onClick={() => navigate('/login')}>
            <img src="/Elitetoolistic.png" alt="Harvard Learning" className="w-full h-full object-contain" />
          </div>
          <div className="mt-8 text-center space-y-1">
            <h1 className="text-2xl font-black tracking-widest text-[#1e293b] uppercase font-serif">Master Recovery</h1>
            <p className="text-[10px] font-black tracking-[0.4em] text-[#A51C30] uppercase">Administrative Access Restoration</p>
          </div>
        </div>

        {/* ── RECOVERY FORM ── */}
        <div className="glass-card-saas p-10 !rounded-[2.5rem] shadow-2xl border-t-4 border-t-[#A51C30]">
          {!sent ? (
            <form onSubmit={handleReset} className="flex flex-col gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    Master Admin Email
                  </label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 text-slate-300 group-focus-within:text-[#A51C30] transition-colors">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="input-premium w-full !pl-14 text-sm"
                      placeholder="Enter Master Admin Email only"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-premium w-full shadow-2xl relative overflow-hidden group"
              >
                <span className={`relative z-10 flex items-center justify-center gap-3 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                  Send Recovery Link
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" className="group-hover:translate-x-1 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </span>

                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-xs font-bold text-slate-400 hover:text-[#A51C30] transition-colors text-center uppercase tracking-widest"
              >
                Return to Login
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <svg width="32" height="32" fill="none" stroke="#10b981" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800">Email Dispatched</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Please check the inbox of <strong>{email}</strong> for instructions to reset your administrative credentials.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="btn-premium w-full !bg-slate-800 hover:!bg-slate-900"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterRecovery;
