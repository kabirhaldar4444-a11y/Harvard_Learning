import React, { useState } from 'react';
import supabase from '../../utils/supabase';
import CreateUser from './CreateUser';
import ManageQuestions from './ManageQuestions';

const AdminDashboard = ({ user, profile, exams, addExam, deleteExam, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('exams');
  const isSuperAdmin = user?.email === 'info@harvardlearning.com';
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);

  const handleSubmitExam = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDuration) return;
    await addExam({ title: newTitle, duration: parseInt(newDuration) });
    setNewTitle('');
    setNewDuration('');
  };

  if (selectedExam) {
    return (
      <ManageQuestions
        exam={selectedExam}
        onBack={() => {
          setSelectedExam(null);
          onRefresh();
        }}
      />
    );
  }

  return (
    <div className="admin-dashboard container-premium min-h-[calc(100vh-80px)] p-6 md:p-12 relative overflow-hidden font-sans">
      {/* Background Ambience - Harvard Crimson & Gold */}
      <div className="absolute top-0 -left-12 w-[40rem] h-[40rem] bg-[#A51C30]/5 rounded-full blur-[160px] animate-blob pointer-events-none"></div>
      <div className="absolute top-1/4 -right-12 w-[40rem] h-[40rem] bg-[#C49619]/5 rounded-full blur-[160px] animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto animate-fade-in">
        {/* Header Title */}
        <div className="mb-14 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-10">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#1e293b] mb-3 font-serif">
               Executive Dashboard
            </h1>
            <p className="text-[#A51C30] font-black text-xs uppercase tracking-[0.4em]">Administrative Intelligence Command</p>
          </div>
        </div>

        {/* Tab Switcher - Academic Registry Style */}
        <div className="flex flex-col md:flex-row justify-center md:justify-start mb-16">
          <div className="flex p-2 rounded-[2rem] border bg-white shadow-xl border-slate-100">
            <button
              onClick={() => setActiveTab('exams')}
              className={`relative px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 font-serif ${activeTab === 'exams' ? 'bg-[#A51C30] text-white shadow-2xl shadow-[#A51C30]/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Curriculum
            </button>
            <button
              onClick={() => setActiveTab('candidates')}
              className={`relative px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 font-serif ${activeTab === 'candidates' ? 'bg-[#A51C30] text-white shadow-2xl shadow-[#A51C30]/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Create Records
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('staff')}
                className={`relative px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 font-serif ${activeTab === 'staff' ? 'bg-[#A51C30] text-white shadow-2xl shadow-[#A51C30]/20' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Master Registry
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Content Views */}
        <div className="transition-all duration-700 relative">
          {activeTab === 'exams' ? (
            <div className="exams-tab animate-slide-up">
              {/* Creation Module */}
              <div className="glass-card-saas p-10 md:p-14 mb-16 border-t-8 border-t-[#A51C30] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-1000 pointer-events-none">
                  <svg width="250" height="250" fill="#A51C30" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                </div>

                <div className="mb-10">
                  <h3 className="text-3xl font-black tracking-tight text-[#1e293b] font-serif mb-2">
                    Initialize Assessment
                  </h3>
                  <p className="text-slate-400 text-sm font-medium">Deploy new intellectual evaluations to the curriculum registry.</p>
                </div>

                <form onSubmit={handleSubmitExam} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end relative z-10">
                  <div className="md:col-span-6 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] ml-2 text-slate-400">Evaluation Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Theoretical Physics Final Examination"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="input-premium w-full !bg-white shadow-sm"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] ml-2 text-slate-400">Duration (Minutes)</label>
                    <input
                      type="number"
                      placeholder="60"
                      value={newDuration}
                      min="1"
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="input-premium w-full !bg-white shadow-sm"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <button type="submit" className="w-full btn-premium">
                      Initialize
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    </button>
                  </div>
                </form>
              </div>

              {/* Grid Module */}
              <div className="exam-list">
                <div className="mb-10 pb-6 border-b border-slate-200">
                  <h3 className="text-3xl font-black tracking-tight text-[#1e293b] font-serif">Curriculum Registry</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {exams.length === 0 ? (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                      <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" /></svg>
                      </div>
                      <p className="text-slate-400 font-serif text-xl">The registry is currently vacant.</p>
                      <p className="text-slate-300 font-black text-[9px] uppercase tracking-[0.4em] mt-2">Initialize an evaluation above to begin.</p>
                    </div>
                  ) : (
                    exams.map((exam, i) => (
                      <div key={exam.id} className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 hover:border-[#A51C30]/20 hover:shadow-2xl transition-all duration-700 h-full flex flex-col overflow-hidden" style={{ animationDelay: `${i * 100}ms` }}>
                        {/* Decorative Corner */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#A51C30]/5 to-transparent rounded-bl-[5rem] group-hover:from-[#C49619]/10 transition-colors duration-700"></div>

                        <div className="flex-1 relative z-10">
                          <div className="w-14 h-14 rounded-2xl bg-[#A51C30] flex items-center justify-center text-white mb-8 shadow-2xl shadow-[#A51C30]/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" /></svg>
                          </div>
                          <h4 className="text-2xl font-black mb-3 text-[#1e293b] font-serif group-hover:text-[#A51C30] transition-colors leading-tight">{exam.title}</h4>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full w-fit mb-8">
                             <svg width="14" height="14" fill="none" stroke="#A51C30" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{exam.duration} Min Session</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-100 relative z-10">
                          <button
                            onClick={() => setSelectedExam(exam)}
                            className="bg-slate-900 hover:bg-[#A51C30] text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                          >
                            Intelligence
                          </button>
                          <button
                            onClick={() => deleteExam(exam.id)}
                            className="bg-white hover:bg-rose-50 text-rose-500 border border-rose-100 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                          >
                            Archive
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'candidates' ? (
            <div className="candidates-tab animate-slide-up">
              <CreateUser user={user} profile={profile} />
            </div>
          ) : (
            <div className="staff-tab animate-slide-up">
              <div className="bg-white p-12 md:p-16 rounded-[3.5rem] shadow-2xl border border-slate-100 border-t-8 border-t-[#C49619]">
                <div className="mb-12">
                  <h3 className="text-4xl font-black mb-4 text-[#1e293b] font-serif">
                    Master Registry Access
                  </h3>
                  <p className="text-slate-400 font-medium text-lg max-w-3xl">As a Master Administrator, you possess the authority to initialize administrative credentials for collegiate personnel.</p>
                </div>
                <CreateUser user={user} profile={profile} initialRole="admin" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
