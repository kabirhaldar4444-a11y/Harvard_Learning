import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = ({ isAdmin, isCandidate, onLogout, isExamActive, onSubmitExam }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  
  const navLinkClass = (path) => `
    relative px-5 py-2.5 rounded-full text-xs font-black transition-all duration-500 uppercase tracking-widest font-serif
    ${location.pathname === path 
      ? 'bg-[#A51C30] text-white shadow-lg shadow-[#A51C30]/20' 
      : 'text-[#1e293b] hover:text-[#A51C30] hover:bg-[#A51C30]/5'}
  `;

  return (
    <div className="w-full sticky top-0 z-[1000] glass-navbar">
      <header className="px-8 md:px-12 h-24 flex items-center w-full max-w-7xl mx-auto transition-all duration-500">
        <div className="flex items-center justify-between w-full">
          {/* Left Section: Logo */}
          <div className="flex-1 flex justify-start">
            <Link to="/" className="flex items-center group">
              <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                <img src="/Elitetoolistic.png" alt="Harvard Learning" className="h-9 object-contain" />
              </div>
            </Link>
          </div>

          {/* Center Section: Navigation */}
          <nav className="flex-2 flex justify-center items-center gap-3 md:gap-6">
            {!isExamActive && isAdminRoute && (
              <>
                <Link to="/admin/users" className={navLinkClass('/admin/users')}>
                  Scholars
                </Link>
                <Link to="/admin" className={navLinkClass('/admin')}>
                  Curriculum
                </Link>
              </>
            )}

            {!isExamActive && isCandidate && !isAdminRoute && (
              <>
                <Link to="/" className={navLinkClass('/')}>
                  Assessments
                </Link>
                <Link to="/profile" className={navLinkClass('/profile')}>
                  Archive
                </Link>
              </>
            )}
          </nav>

          {/* Right Section: Actions */}
          <div className="flex-1 flex justify-end gap-4 md:gap-8 items-center">
            {isExamActive ? (
              <button 
                onClick={onSubmitExam} 
                className="btn-premium !py-2.5 !px-6 !text-xs"
              >
                Finalize Session
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </button>
            ) : (isAdmin || isCandidate) ? (
              <button 
                onClick={() => { onLogout(); navigate('/'); }} 
                className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-900 hover:text-[#A51C30] transition-colors"
              >
                Sign Out
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-[#A51C30]/30 group-hover:bg-[#A51C30]/5 transition-all">
                   <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/></svg>
                </div>
              </button>
            ) : (
              <div className="flex gap-6 items-center">
                <Link to="/login" className="text-xs font-black uppercase tracking-widest text-[color:var(--text-dark)] hover:text-primary-color transition-colors">Portal Access</Link>
                <Link to="/admin" className="btn-premium !py-2.5 !px-6 !text-[10px]">Admin Intelligence</Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
