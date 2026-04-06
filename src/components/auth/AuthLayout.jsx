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

      <div className="relative z-10 w-full max-w-[460px] px-6 animate-fade-in mx-auto">
        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 shadow-2xl border relative overflow-hidden transition-all duration-500" 
             style={{ 
               backgroundColor: 'var(--card-bg)', 
               borderColor: 'var(--glass-border)',
               backdropFilter: 'blur(20px)'
             }}>
          
          <div className="flex flex-col items-center mb-10">
            <div className="relative group mb-6">
              {/* Premium Logo 'Island' - Expertly Proportioned */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/30 to-purple-600/30 rounded-[1.5rem] blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-500"></div>
              <div className="relative w-36 h-auto bg-white rounded-[1.25rem] p-3 shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                <img src="/logo_full.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-1 tracking-tight transition-colors duration-300" style={{ color: 'var(--text-dark)' }}>{title}</h2>
            <p className="text-sm font-medium leading-relaxed transition-colors duration-300 opacity-80" style={{ color: 'var(--text-light)' }}>{subtitle}</p>
          </div>

          {children}

          {/* Footer branding */}
          <div className="mt-8 pt-6 border-t flex justify-center" style={{ borderColor: 'var(--glass-border)' }}>
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--text-light)', opacity: 0.5 }}>
              Elite Engineering Solutions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
