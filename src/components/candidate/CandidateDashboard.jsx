import React, { useState, useEffect } from 'react';
import supabase from '../../utils/supabase';
import DisclaimerOverlay from '../DisclaimerOverlay';

const CandidateDashboard = ({ exams, onStartExam, profile, user }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (profile?.id) {
      fetchSubmissions();

      // REALTIME: Listen for score release or submission updates
      const subSubscription = supabase
        .channel('submission-updates')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'submissions',
          filter: `user_id=eq.${profile.id}`
        }, () => {
          fetchSubmissions();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subSubscription);
      };
    }
  }, [profile?.id]);

  const fetchSubmissions = async () => {
    setLoadingResults(true);
    const { data, error } = await supabase
      .from('submissions')
      .select('*, exams(title)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    
    if (data) setSubmissions(data);
    setLoadingResults(false);
  };

  const completedExamIds = submissions.map(s => s.exam_id);
  const allottedExamIds = profile?.allotted_exam_ids || [];
  const availableExams = exams.filter(e => 
    allottedExamIds.includes(e.id) && !completedExamIds.includes(e.id)
  );
  const filteredExams = availableExams.filter(e =>
    e.title?.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <>
    <DisclaimerOverlay user={user} profile={profile} />
    <div className="premium-container min-h-[calc(100vh-80px)] p-6 md:p-12 relative overflow-hidden font-sans selection:bg-[#A51C30]/10">
      {/* Background Ambience - Harvard Crimson & Gold */}
      <div className="absolute top-0 -right-12 w-[40rem] h-[40rem] bg-[#A51C30]/5 rounded-full blur-[160px] animate-blob pointer-events-none"></div>
      <div className="absolute bottom-0 -left-12 w-[40rem] h-[40rem] bg-[#C49619]/5 rounded-full blur-[160px] animate-blob animation-delay-4000 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto animate-fade-in">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 border-b border-slate-200 pb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#1e293b] mb-4 font-serif">
              Scholar Dashboard
            </h1>
            <p className="text-[#A51C30] font-black text-xs uppercase tracking-[0.4em] mb-2">Academic Excellence Command</p>
            <p className="text-lg font-medium text-slate-500">
              Welcome, <span className="text-[#1e293b] font-serif font-black">{profile?.full_name || 'Scholar'}</span>
            </p>
          </div>
          <div className="bg-white px-8 py-5 rounded-[2rem] border border-slate-100 shadow-xl flex items-center gap-5">
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Status</span>
               <span className="text-[#22c55e] font-black text-sm uppercase tracking-widest">Verified Collegiate</span>
            </div>
            <div className="relative flex h-4 w-4">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-20"></span>
               <span className="relative inline-flex rounded-full h-4 w-4 bg-[#22c55e] border-2 border-white shadow-sm"></span>
            </div>
          </div>
        </div>

        {/* Available Exams Section */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
            <h2 className="text-3xl font-black tracking-tight text-[#1e293b] font-serif flex items-center gap-4">
              Curriculum Evaluations
              {searchQuery && (
                <span className="text-[10px] font-black bg-[#A51C30]/5 text-[#A51C30] px-4 py-2 rounded-full border border-[#A51C30]/10 uppercase tracking-widest">
                  {filteredExams.length} Identified
                </span>
              )}
            </h2>
            
            {/* Search Bar */}
            <div className="relative group w-full md:w-96">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#A51C30] transition-colors">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input
                type="text"
                placeholder="Locate evaluations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-premium !rounded-full !pl-16 w-full !bg-white shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExams.length === 0 ? (
              <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 shadow-sm">
                {searchQuery ? (
                  <>
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                       <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <p className="text-slate-400 font-serif text-xl">No identifiers found for "{searchQuery}"</p>
                    <button onClick={() => setSearchQuery('')} className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-[#A51C30] hover:opacity-70 transition-all border-b border-[#A51C30]">Clear Parameters</button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                       <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" /></svg>
                    </div>
                    <p className="text-slate-400 font-serif text-xl">The curriculum is currently empty.</p>
                    <p className="text-slate-300 font-black text-[9px] uppercase tracking-[0.4em] mt-3">Await faculty assignment for upcoming evaluations.</p>
                  </>
                )}
              </div>
            ) : (
              filteredExams.map((exam, i) => (
                <div 
                  key={exam.id} 
                  className={`group relative bg-white p-10 rounded-[3rem] shadow-xl border border-slate-50 hover:border-[#A51C30]/20 hover:shadow-2xl transition-all duration-700 h-full flex flex-col overflow-hidden animate-slide-up`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Decorative Background Icon */}
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none">
                     <svg width="120" height="120" fill="#A51C30" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                  </div>

                  <div className="flex-1 relative z-10">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-[#A51C30] flex items-center justify-center text-white mb-8 shadow-2xl shadow-[#A51C30]/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" /></svg>
                    </div>
                    <h3 className="text-2xl font-black text-[#1e293b] font-serif leading-tight mb-6 group-hover:text-[#A51C30] transition-colors">{exam.title}</h3>
                    
                    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl mb-10 bg-slate-50 border border-slate-100">
                      <svg width="16" height="16" fill="none" stroke="#A51C30" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{exam.duration} Min Session</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onStartExam(exam)} 
                    className={`relative z-10 w-full py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all duration-500 shadow-xl active:scale-95 bg-slate-900 hover:bg-[#A51C30] text-white shadow-slate-900/10 hover:shadow-[#A51C30]/20`}
                  >
                    Initialize Evaluation
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Completed Assessments Section */}
        <section>
          <div className="mb-10 pb-6 border-b border-slate-100">
             <h2 className="text-3xl font-black tracking-tight text-[#1e293b] font-serif flex items-center gap-4">
               {/* Academic Transcript Label Removed */}
             </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingResults ? (
              <div className="col-span-full py-12 flex justify-center">
                <div className="w-12 h-12 border-4 border-[#A51C30] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : submissions.length === 0 ? (
               <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-[3.5rem] border border-slate-50 shadow-sm">
                 <p className="text-slate-400 font-serif text-xl">Your evaluation history is currently vacant.</p>
               </div>
            ) : (
              submissions.map((sub, i) => (
                <div 
                  key={sub.id} 
                  className={`relative bg-white p-10 rounded-[3rem] shadow-xl border border-slate-50 transition-all duration-700 animate-slide-up hover:-translate-y-1 hover:shadow-2xl flex flex-col ${
                    (sub.is_released) ? 'border-t-8 border-t-[#22c55e]' : 'border-t-8 border-t-[#C49619]'
                  }`}
                  style={{ animationDelay: `${(i % 10) * 100}ms` }}
                >
                  <h4 className="text-xl font-black text-[#1e293b] font-serif mb-3 line-clamp-2 leading-tight">{sub.exams?.title}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">
                    Concluded: {new Date(sub.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}
                  </p>
                  
                  <div className="mt-auto p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Intellectual Integrity</p>
                        <div className={`flex items-center gap-2 font-black text-[11px] uppercase tracking-widest ${(sub.is_released) ? 'text-[#22c55e]' : 'text-[#C49619]'}`}>
                          {(sub.is_released) ? (
                            <>
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                              Validated
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                              Pending
                            </>
                          )}
                        </div>
                      </div>
                      
                      {(sub.is_released) && (
                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Final Merit</p>
                          <p className="text-3xl font-black tracking-tight text-[#A51C30] font-serif">
                            {sub.admin_score_override !== null ? sub.admin_score_override : sub.score}
                            <span className="text-sm font-black text-slate-300 ml-1 font-sans">/{sub.total_questions * 5}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>

    </>
  );
};

export default CandidateDashboard;
