import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname === '/admin/login';

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden relative font-sans transition-colors duration-500" style={{ background: 'var(--bg-gradient)' }}>
      {/* Background Animated Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-[var(--blob-opacity)] animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-[var(--blob-opacity)] animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-[var(--blob-opacity)] animate-blob animation-delay-4000"></div>
      <div className="absolute -bottom-8 right-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-[var(--blob-opacity)] animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-[480px] px-6 animate-fade-in mx-auto">
        <div className="glass-card rounded-[2.5rem] p-10 md:p-14 shadow-[0_22px_70px_4px_rgba(0,0,0,0.2)] border-2 relative overflow-hidden transition-all duration-500" 
             style={{ 
               backgroundColor: 'var(--card-bg)', 
               borderColor: 'var(--glass-border)',
               backdropFilter: 'blur(30px)',
               WebkitBackdropFilter: 'blur(30px)'
             }}>
          
          <div className="flex flex-col items-center mb-12">
            <div className="relative group mb-8">
              {/* Premium Logo 'Island' - Expertly Proportioned */}
              <div className="absolute -inset-2 bg-gradient-to-r from-primary-500/40 to-secondary-500/40 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <div className="relative w-40 h-auto bg-white rounded-[1.5rem] p-4 shadow-2xl transition-all duration-500 hover:scale-[1.05] hover:-translate-y-1">
                <img src="/Elitetoolistic.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            <h1 className="text-3xl font-extrabold mb-2 tracking-tight transition-colors duration-300 text-center" style={{ color: 'var(--text-dark)' }}>{title}</h1>
            <p className="text-sm font-semibold leading-relaxed transition-colors duration-300 opacity-60 text-center" style={{ color: 'var(--text-light)' }}>{subtitle}</p>
          </div>

          {children}

          {/* Footer branding */}
          <div className="mt-10 pt-8 border-t flex flex-col items-center gap-1" style={{ borderColor: 'var(--glass-border)' }}>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40" style={{ color: 'var(--text-light)' }}>
              Elite Engineering Solutions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
