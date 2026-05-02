import React from 'react';
import UserSubmissions from './UserSubmissions';

const CandidateInspection = ({ candidate, onClose, exams = [], onToggleExam, isSuperAdmin }) => {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 md:p-6 backdrop-blur-2xl bg-slate-900/40 animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl bg-white shadow-2xl rounded-[3rem] overflow-hidden flex flex-col max-h-[95vh] scale-in-center border border-slate-200">
        
        {/* Header Bar */}
        <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-tr from-slate-200 to-slate-100 rounded-2xl blur-sm"></div>
              <img
                src={candidate.profile_photo_url || 'https://via.placeholder.com/200'}
                alt=""
                className="relative w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm"
              />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-none tracking-tight">{candidate.full_name}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{candidate.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:rotate-90"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar-light">
          <div className="space-y-12">
            
            {/* Identification Data Section */}
            <section className="flex flex-col md:flex-row gap-10">
              <div className="w-48 h-48 rounded-[2.5rem] bg-slate-50 border border-slate-100 overflow-hidden shrink-0 group shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200">
                <img
                  src={candidate.profile_photo_url || 'https://via.placeholder.com/200'}
                  alt=""
                  className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1] transition-all group-hover:scale-110"
                />
              </div>

              <div className="flex-1 space-y-8 py-2">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-slate-900 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                  <svg width="10" height="10" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                  Identification Data
                </div>

                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{candidate.full_name}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Electronic Node</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{candidate.email}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Vocal Link</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                      </div>
                      <span className={`text-sm font-bold ${isSuperAdmin ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                        {isSuperAdmin ? (candidate.phone || 'No phone') : '+91 XXXXXX'}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Physical Location</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                      </div>
                      <span className={`text-sm font-bold ${isSuperAdmin ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                        {isSuperAdmin ? (candidate.address || 'No location') : 'Masked for Security'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Identity Artifacts Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-900">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
                </div>
                <h3 className="text-lg font-black text-slate-900">Identity Artifacts</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Aadhar Front', url: candidate.aadhaar_front_url },
                  { label: 'Aadhar Back', url: candidate.aadhaar_back_url },
                  { label: 'PAN Card', url: candidate.pan_url }
                ].map((doc, idx) => (
                  <div key={idx} className="bg-slate-50/50 rounded-[2rem] border border-slate-100 p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 tracking-tight">{doc.label}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verified Artifact</p>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${doc.url ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-300 shadow-slate-300/20'} shadow-lg animate-pulse`}></div>
                    </div>

                    <div className="aspect-video bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group">
                      {!isSuperAdmin ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner border border-slate-100">
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Masked for Security</p>
                        </div>
                      ) : doc.url ? (
                        doc.url.toLowerCase().includes('.pdf') ? (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-indigo-500 hover:text-indigo-600 transition-colors">
                            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            <span className="text-[10px] font-bold uppercase tracking-widest">View PDF</span>
                          </a>
                        ) : (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="w-full h-full">
                            <img src={doc.url} alt={doc.label} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          </a>
                        )
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-300">
                          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                          <span className="text-[10px] font-bold uppercase tracking-widest">Not Uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ALLOCATED EXAMINATIONS */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-900">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 002-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                </div>
                <h3 className="text-lg font-black text-slate-900">Allocated Examinations</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map(exam => {
                  const isAssigned = candidate.allotted_exam_ids?.includes(exam.id);
                  return (
                    <button
                      key={exam.id}
                      onClick={() => onToggleExam(exam.id)}
                      className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${
                        isAssigned 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10' 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-sm font-bold tracking-tight">{exam.title}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isAssigned ? 'bg-white border-white text-slate-900' : 'border-slate-200'
                      }`}>
                        {isAssigned && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 13l4 4L19 7"/></svg>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Performance & Exam Data Section */}
            <section className="space-y-6 pb-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-900">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"/></svg>
                </div>
                <h3 className="text-lg font-black text-slate-900">Performance & Exam Records</h3>
              </div>
              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
                 <UserSubmissions userId={candidate.id} />
              </div>
            </section>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-center">
          <button
            onClick={onClose}
            className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-1 transition-all active:scale-95"
          >
            Terminate Inspection
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateInspection;
