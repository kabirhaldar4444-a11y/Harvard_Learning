import React from 'react';

const Profile = ({ profile }) => {
  return (
    <div className="min-h-[calc(100vh-80px)] relative overflow-hidden font-sans flex items-center justify-center p-6 selection:bg-[#A51C30]/10">
      {/* Background Ambience - Harvard Crimson & Gold */}
      <div className="absolute top-1/4 -left-12 w-[35rem] h-[35rem] bg-[#A51C30]/5 rounded-full blur-[160px] animate-blob pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-12 w-[35rem] h-[35rem] bg-[#C49619]/5 rounded-full blur-[160px] animate-blob animation-delay-4000 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-2xl animate-slide-up">
        <div className="bg-white p-12 md:p-20 flex flex-col items-center text-center rounded-[4rem] shadow-2xl border border-slate-100 border-t-8 border-t-[#A51C30]">
          {/* Avatar Section */}
          <div className="relative mb-10 group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#A51C30] to-[#C49619] rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
            <div className="relative w-40 h-40 rounded-[2.5rem] border-4 border-white flex items-center justify-center text-6xl font-black shadow-2xl bg-slate-900 text-white font-serif transform group-hover:rotate-3 transition-transform duration-500 overflow-hidden">
              {profile?.profile_photo_url ? (
                <img src={profile.profile_photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                profile?.full_name?.charAt(0) || 'S'
              )}
            </div>
            <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-[#C49619] rounded-2xl border-4 border-white flex items-center justify-center shadow-lg">
               <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
            </div>
          </div>

          {/* Name & Title */}
          <div className="mb-14">
            <p className="text-[#A51C30] font-black text-[10px] uppercase tracking-[0.5em] mb-3">Scholar Profile</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-[#1e293b] font-serif">
              {profile?.full_name || 'Academic Scholar'}
            </h2>
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#C49619]">
              <span className="w-2 h-2 rounded-full bg-[#C49619] animate-pulse"></span>
              Accredited Institutional Identity
            </div>
          </div>
          
          {/* Info Details */}
          <div className="w-full grid grid-cols-1 gap-6 text-left">
            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-2 group hover:bg-white hover:shadow-xl hover:border-[#A51C30]/10 transition-all duration-500">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Email</label>
              <p className="text-xl font-black text-[#1e293b] font-serif truncate">{profile?.email || 'unassigned@harvard.edu'}</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-2 group hover:bg-white hover:shadow-xl hover:border-[#A51C30]/10 transition-all duration-500">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Governance Role</label>
              <p className="text-xl font-black text-[#A51C30] font-serif capitalize tracking-widest">{profile?.role || 'scholar'}</p>
            </div>
          </div>

          <div className="mt-16 pt-10 border-t border-slate-100 w-full">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Identity protected by Harvard Institutional Governance</p>
          </div>
        </div>
      </div>
    </div>

  );
};

export default Profile;
