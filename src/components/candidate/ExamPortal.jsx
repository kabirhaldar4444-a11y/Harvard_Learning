import React, { useState, useEffect } from 'react';
import supabase from '../../utils/supabase';
import { useToast } from '../common/AlertProvider';

const ExamPortal = ({ exam, onFinish, submitSignal }) => {
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReEntry, setIsReEntry] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [hasAcceptedDeclaration, setHasAcceptedDeclaration] = useState(false);
  const [acceptedCheckbox, setAcceptedCheckbox] = useState(false);

  const answersRef = React.useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
    // Save answers and index to localStorage
    if (exam?.id) {
      localStorage.setItem(`exam_progress_${exam.id}`, JSON.stringify({
        answers,
        currentQuestionIndex,
        timeLeft
      }));
    }
  }, [answers, currentQuestionIndex, timeLeft, exam.id]);

  const [confirmedSignal, setConfirmedSignal] = useState(0);

  useEffect(() => {
    if (submitSignal > 0 && submitSignal !== confirmedSignal && !isSubmitted) {
      setShowConfirm(true);
      setConfirmedSignal(submitSignal);
    }
  }, [submitSignal]);

  useEffect(() => {
    // Load persisted state on mount
    const savedProgress = localStorage.getItem(`exam_progress_${exam.id}`);
    if (savedProgress) {
      const { answers: savedAnswers, currentQuestionIndex: savedIndex, timeLeft: savedTime } = JSON.parse(savedProgress);
      if (savedAnswers) setAnswers(savedAnswers);
      if (savedIndex !== undefined) setCurrentQuestionIndex(savedIndex);
      if (savedTime !== undefined) setTimeLeft(savedTime);
    }
    fetchQuestions();
  }, [exam.id]);

  const fetchQuestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Check if already submitted (Corrected column name: user_id)
      const { data: existingSub } = await supabase
        .from('submissions')
        .select('id')
        .eq('user_id', user.id)
        .eq('exam_id', exam.id)
        .single();
      
      if (existingSub) {
        setIsSubmitted(true);
        setIsReEntry(true);
        setLoading(false);
        return;
      }

      // 2. Fetch questions if not submitted
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', exam.id);
      
      if (data && data.length > 0) {
        setQuestions(data);
      } else {
        // No questions found in database
        setQuestions([]);
        if (error) {
          toast('Database access error: ' + error.message, 'error');
        }
      }
    } catch (err) {
      console.error('Error in ExamPortal init:', err);
      toast('Failed to load examination questions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft <= 0 && !isSubmitted) {
      // Time is up! Automatic submission
      setTimeExpired(true);
      setShowConfirm(true);
      // Wait 3 seconds so the user can actually see the "Time's Up" modal before auto-submitting
      const autoSubmitTimer = setTimeout(() => {
        if (!isSubmitted) {
          setShowConfirm(false);
          handleSubmitWithAnswers(answersRef.current);
        }
      }, 3000);
      return () => clearTimeout(autoSubmitTimer);
    }
    if (isSubmitted || !hasAcceptedDeclaration) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, hasAcceptedDeclaration]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOptionSelect = (optionIdx) => {
    setAnswers({ ...answers, [currentQuestionIndex]: optionIdx });
  };

  const handleSubmitWithAnswers = async (currentAnswers) => {
    if (isSubmitted) return;
    
    // calculate score uses answers state, we need local calculation
    let score = 0;
    questions.forEach((q, idx) => {
      if (currentAnswers[idx] === q.correct_option) score += 5;
    });

    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    
    if (user) {
      const { error } = await supabase.from('submissions').insert([{
        user_id: user.id,
        exam_id: exam.id,
        score: score,
        total_questions: questions.length,
        answers: currentAnswers,
        is_released: false
      }]);

      if (error) {
        toast('Error saving submission: ' + error.message, 'error');
        return;
      }
    }

    setIsSubmitted(true);
    localStorage.removeItem(`exam_progress_${exam.id}`);
    toast('Your exam has been submitted successfully!', 'success');
  };

  const handleSubmit = () => {
    setShowConfirm(true);
  };

  const confirmAndSubmit = () => {
    setShowConfirm(false);
    handleSubmitWithAnswers(answersRef.current);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_option) {
        score += 5;
      }
    });
    return score;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!hasAcceptedDeclaration) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 md:p-12 animate-fade-in relative z-10 w-full overflow-y-auto font-sans">
        {/* Ambient background decoration - Harvard Crimson & Gold */}
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#A51C30]/5 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[50rem] h-[50rem] bg-[#C49619]/5 rounded-full blur-[160px] pointer-events-none" />

        <div className="relative w-full max-w-5xl bg-white shadow-2xl rounded-[3.5rem] border border-slate-100 z-10 p-10 md:p-16 animate-slide-up border-t-8 border-t-[#A51C30]">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16 border-b border-slate-100 pb-12">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 rounded-[2rem] bg-[#A51C30] text-white flex items-center justify-center shrink-0 shadow-2xl shadow-[#A51C30]/30 border border-[#A51C30]">
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#1e293b] font-serif leading-none mb-3">{exam.title}</h1>
                <p className="text-[#A51C30] font-black text-xs uppercase tracking-[0.4em]">Scholastic Examination Hall</p>
              </div>
            </div>
            
            <div className="flex bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100 shadow-inner">
              <div className="px-8 py-3 text-center border-r border-slate-200">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Duration</p>
                <p className="text-lg font-black text-[#1e293b] font-serif">{exam.duration} Min</p>
              </div>
              <div className="px-8 py-3 text-center">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Load</p>
                <p className="text-lg font-black text-[#1e293b] font-serif">{questions.length} Items</p>
              </div>
            </div>
          </div>

          {/* Instructions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="w-2 h-8 bg-[#A51C30] rounded-full"></span>
                <h3 className="text-xl font-black text-[#1e293b] font-serif uppercase tracking-tight">Institutional Directives</h3>
              </div>
              <div className="space-y-6 text-slate-500 font-medium">
                {[
                  "Maintain a persistent network connection for integrity tracking.",
                  "Atomic submission protocol initiates upon temporal expiration.",
                  "Collegiate proctoring logs all navigational diversions.",
                  "Session state persistence is active; avoid manual refreshes."
                ].map((text, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-[#A51C30] font-black">†</span>
                    <p className="text-[15px] leading-relaxed italic">{text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="w-2 h-8 bg-[#C49619] rounded-full"></span>
                <h3 className="text-xl font-black text-[#1e293b] font-serif uppercase tracking-tight">Merit Assessment</h3>
              </div>
              <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Successful Validation</span>
                  <span className="text-sm font-black text-[#22c55e] font-serif">+5 Points</span>
                </div>
                <div className="flex justify-between items-center bg-[#A51C30]/5 p-6 rounded-2xl border border-[#A51C30]/10 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-[#A51C30] tracking-widest">Deduction Penalty</span>
                  <span className="px-4 py-1.5 rounded-full bg-[#A51C30] text-white text-[9px] font-black tracking-widest uppercase">Nullified</span>
                </div>
              </div>
            </section>
          </div>

          {/* Candidate Oath & Acceptance */}
          <div className="bg-slate-50 rounded-[3rem] p-10 md:p-14 border border-slate-200">
            <div className="max-w-2xl mx-auto space-y-12">
              <div className="text-center space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A51C30]">Honor Declaration</h4>
                <p className="text-lg font-bold text-slate-700 leading-relaxed italic font-serif">
                  "I solemnly affirm that I have comprehended all collegiate mandates. I shall execute this evaluation with uncompromised intellectual honesty and adherence to the Institutional Code of Conduct."
                </p>
              </div>

              <div className="flex flex-col items-center gap-10">
                <label className="flex items-center gap-5 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={acceptedCheckbox}
                      onChange={(e) => setAcceptedCheckbox(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-8 h-8 rounded-xl border-2 border-slate-300 bg-white transition-all peer-checked:bg-[#A51C30] peer-checked:border-[#A51C30] group-hover:border-[#A51C30] flex items-center justify-center">
                      <svg className={`w-5 h-5 text-white transition-transform duration-500 ${acceptedCheckbox ? 'scale-100' : 'scale-0'}`} fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-[#1e293b] uppercase tracking-widest group-hover:text-[#A51C30] transition-colors">
                    I signify my agreement to the institutional mandates
                  </span>
                </label>

                <div className={`w-full transition-all duration-1000 transform ${acceptedCheckbox ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'}`}>
                  <button
                    onClick={() => setHasAcceptedDeclaration(true)}
                    className="w-full py-7 rounded-[2rem] font-black tracking-[0.4em] flex items-center justify-center gap-5 transition-all duration-700 shadow-2xl bg-slate-900 text-white hover:bg-[#A51C30] shadow-slate-900/20 hover:shadow-[#A51C30]/30 hover:scale-[1.01] active:scale-95 uppercase text-xs"
                  >
                    Commence Evaluation
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </button>
                  <p className="text-[9px] text-center text-slate-400 font-black uppercase tracking-[0.4em] mt-6">Examination chronometer initiates immediately</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Confirm Submit Modal ── */
  const ConfirmModal = () => (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1e293b]/80 backdrop-blur-md" onClick={() => setShowConfirm(false)} />
      {/* Card */}
      <div className="relative bg-white p-10 max-w-md w-full animate-slide-up border-t-8 border-t-[#C49619] shadow-2xl rounded-[3rem] text-center z-10">
        <div className="w-20 h-20 mx-auto mb-8 rounded-[1.5rem] bg-[#C49619]/10 text-[#C49619] flex items-center justify-center border border-[#C49619]/20">
          <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
        </div>
        <h3 className="text-3xl font-black mb-4 text-[#1e293b] font-serif">Finalize Session?</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-4">
          You have successfully validated <span className="font-black text-[#A51C30]">{Object.keys(answers).length}</span> out of <span className="font-black text-[#1e293b]">{questions.length}</span> academic items.
        </p>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C49619] mb-10">
          Submitting will conclude the proctored evaluation.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => setShowConfirm(false)}
            className="flex-1 py-4 px-6 rounded-2xl font-black text-[9px] uppercase tracking-widest border border-slate-100 hover:bg-slate-50 text-slate-400 transition-all"
          >
            Return
          </button>
          <button
            onClick={confirmAndSubmit}
            className="flex-1 py-4 px-6 rounded-2xl font-black text-[9px] uppercase tracking-widest bg-slate-900 text-white hover:bg-[#A51C30] hover:shadow-xl hover:shadow-[#A51C30]/20 transition-all active:scale-95"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-6 animate-fade-in relative z-10 w-full">
        {/* Animated Background Ambience */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-[#22c55e]/5 rounded-full blur-[160px] pointer-events-none"></div>
        
        <div className="bg-white p-12 md:p-20 text-center max-w-2xl w-full relative z-10 animate-slide-up border-t-8 border-t-[#22c55e] rounded-[4rem] shadow-2xl">
          <div className="w-28 h-28 mx-auto bg-[#22c55e] text-white rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl shadow-[#22c55e]/30 border-4 border-white">
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-[#1e293b] font-serif">Evaluation Concluded</h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed mb-12 italic">
            Your academic responses have been securely archived.<br/>
            <span className="text-[#A51C30] font-black uppercase tracking-[0.3em] text-xs mt-4 inline-block">Institutional Review Pending</span>
          </p>
          
          {!isReEntry && (
            <div className="mb-12 p-8 rounded-[2rem] flex flex-col items-center gap-2 border border-slate-100 bg-slate-50/50">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Temporal Duration</span>
              <span className="text-3xl font-black text-[#1e293b] font-serif">{formatTime(exam.duration * 60 - timeLeft)}</span>
            </div>
          )}
          
          <button onClick={onFinish} className="w-full py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all duration-700 bg-slate-900 text-white hover:bg-[#A51C30] shadow-2xl shadow-slate-900/20 hover:shadow-[#A51C30]/30 hover:scale-[1.02]">
            Return to Faculty Dashboard
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-6 animate-fade-in relative z-10 w-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="glass-card-saas p-10 md:p-14 text-center max-w-xl w-full relative z-10 animate-slide-up border-t-4 border-t-amber-500">
          <div className="w-20 h-20 mx-auto bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-8">
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-3xl font-black mb-4" style={{ color: 'var(--text-dark)' }}>No Questions Available</h2>
          <p className="mb-8" style={{ color: 'var(--text-light)' }}>
            This exam has been scheduled but no questions have been added yet. Please contact the administrator.
          </p>
          <button onClick={onFinish} className="btn-premium w-full py-4">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      {/* Confirm Submit Modal Overlay */}
      {showConfirm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          {/* Card */}
        <div className="relative bg-white p-10 max-w-md w-full animate-slide-up border-t-8 shadow-2xl rounded-[3rem] text-center z-10" style={{ borderTopColor: timeExpired ? '#A51C30' : '#22c55e' }}>
            <div className={`w-20 h-20 mx-auto mb-8 rounded-[1.5rem] flex items-center justify-center border-2 ${timeExpired ? 'bg-[#A51C30]/5 text-[#A51C30] border-[#A51C30]/20' : 'bg-[#22c55e]/5 text-[#22c55e] border-[#22c55e]/20'}`}>
              {timeExpired ? (
                <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              )}
            </div>
            <h3 className="text-3xl font-black mb-4 text-[#1e293b] font-serif">
              {timeExpired ? "Temporal Expiration" : 'Finalize Session?'}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              {timeExpired 
                ? 'The institutional chronometer has reached zero. Your current progress will be archived immediately.'
                : <>You have validated <span className="font-black text-[#A51C30]">{Object.keys(answers).length}</span> out of <span className="font-black text-[#1e293b]">{questions.length}</span> academic items.</>
              }
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C49619] mb-10">
              This action concludes the proctored evaluation.
            </p>
            <div className="flex gap-4">
              {!timeExpired && (
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-4 px-6 rounded-2xl font-black text-[9px] uppercase tracking-widest border border-slate-100 hover:bg-slate-50 text-slate-400 transition-all"
                >
                  Return
                </button>
              )}
              <button
                onClick={confirmAndSubmit}
                className={`flex-1 py-4 px-6 rounded-2xl font-black text-[9px] uppercase tracking-widest text-white transition-all active:scale-95 shadow-xl ${timeExpired ? 'bg-[#A51C30] shadow-[#A51C30]/20' : 'bg-slate-900 shadow-slate-900/20'}`}
              >
                {timeExpired ? 'Archive Now' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="exam-portal w-full animate-fade-in relative z-10 pt-4 pb-12">
      {/* Immersive HUD Header - Harvard Crimson Redesign */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-8 bg-white border-l-8 border-l-[#A51C30] sticky top-4 z-50 shadow-2xl rounded-r-[2rem] border border-slate-100">
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#A51C30] mb-2">Examination in Progress</span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#1e293b] font-serif line-clamp-1">{exam.title}</h2>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-1">Temporal Remaining</span>
            <div className={`text-3xl font-black font-serif flex items-center gap-3 ${timeLeft < 300 ? 'text-[#A51C30] animate-pulse' : 'text-[#1e293b]'}`}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full relative">
        {/* Main Examination Area (Full Width) - Harvard Rebranded */}
        <div className="bg-white p-10 md:p-16 rounded-[3.5rem] border border-slate-100 flex flex-col min-h-[65vh] relative overflow-hidden transition-all duration-300 shadow-xl">
          {/* Progress Indicator & Drawer Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 pb-8 border-b border-slate-100 gap-6">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="w-14 h-14 rounded-2xl bg-[#A51C30]/5 text-[#A51C30] hover:bg-[#A51C30] hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center group"
                title="Open Curriculum Navigation"
              >
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </button>
              
              <div className="flex flex-col">
                 <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-1">Item Progress</span>
                 <span className="text-sm font-black text-[#1e293b] flex items-center gap-2 font-serif">
                   Section Item 
                   <span className="text-[#A51C30] text-lg">{currentQuestionIndex + 1}</span>
                   <span className="text-slate-300">/</span> 
                   {questions.length}
                 </span>
              </div>
            </div>
            
            <div className="w-full sm:w-64 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
              <div 
                className="h-full bg-[#A51C30] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-[0_0_10px_rgba(165,28,48,0.3)]" 
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex-1 animate-slide-up" key={currentQuestionIndex}>
            <h3 className="text-2xl md:text-4xl font-black leading-tight mb-12 text-[#1e293b] font-serif break-words">
              {currentQuestion.question_text}
            </h3>
            
            <div className="grid gap-5">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestionIndex] === idx;
                return (
                  <label 
                    key={idx} 
                    className={`relative p-7 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 flex items-center gap-6 group ${
                      isSelected 
                        ? 'border-[#A51C30] bg-[#A51C30]/5 shadow-xl shadow-[#A51C30]/5' 
                        : 'hover:border-[#A51C30]/30 hover:bg-slate-50 border-slate-100 bg-white'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="option" 
                      value={idx} 
                      checked={isSelected}
                      onChange={() => handleOptionSelect(idx)}
                      className="sr-only"
                    />
                    <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-500 ${
                      isSelected ? 'border-[#A51C30] bg-[#A51C30] rotate-45' : 'border-slate-300 group-hover:border-[#A51C30]'
                    }`}>
                      {isSelected && <div className="w-3 h-3 rounded-sm bg-white -rotate-45"></div>}
                    </div>
                    <span className={`text-lg font-bold transition-colors break-words ${isSelected ? 'text-[#A51C30]' : 'text-slate-600'}`}>
                      {option}
                    </span>
                    {isSelected && (
                       <div className="ml-auto opacity-20">
                          <svg width="24" height="24" fill="#A51C30" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                       </div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
            {/* Previous Button */}
            <button 
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-3 hover:bg-slate-50 text-slate-400 hover:text-[#1e293b] w-full sm:w-auto justify-center border border-transparent hover:border-slate-100"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
              Previous Item
            </button>

            {/* Save & Next OR Submit Exam (last question) */}
            {currentQuestionIndex === questions.length - 1 ? (
              <button 
                onClick={handleSubmit}
                className="px-12 py-5 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 rounded-[1.5rem] w-full sm:w-auto justify-center transition-all duration-500 hover:scale-[1.03] active:scale-95 bg-[#22c55e] text-white shadow-2xl shadow-[#22c55e]/30 hover:shadow-[#22c55e]/50"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                Final Submission
              </button>
            ) : (
              <button 
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)} 
                className="px-12 py-5 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 rounded-[1.5rem] w-full sm:w-auto justify-center transition-all duration-700 hover:scale-[1.03] active:scale-95 bg-slate-900 hover:bg-[#A51C30] text-white shadow-2xl shadow-slate-900/20 hover:shadow-[#A51C30]/30"
              >
                Validate & Proceed
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* Hidden Sidebar Drawer (Overlay) - Curriculum Navigation */}
        <div 
          className={`fixed inset-0 z-[9998] bg-[#1e293b]/60 backdrop-blur-md transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>

        <div 
          className={`fixed top-0 right-0 h-screen w-full max-w-[400px] z-[9999] bg-white p-10 shadow-[-20px_0_60px_rgba(0,0,0,0.1)] flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} border-l-8 border-[#A51C30]`}
        >
          <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-100">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#A51C30] mb-2">Institutional</span>
              <h4 className="text-2xl font-black text-[#1e293b] font-serif">
                Curriculum Map
              </h4>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="w-12 h-12 rounded-full hover:bg-slate-50 text-slate-300 hover:text-[#A51C30] transition-all flex items-center justify-center shrink-0 border border-transparent hover:border-slate-100"
            >
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-4 gap-3">
              {questions.map((_, idx) => {
                const isCurrent = currentQuestionIndex === idx;
                const isAnswered = answers[idx] !== undefined;
                
                let stylingClass = "text-slate-400 bg-slate-50 border-slate-100 hover:border-[#A51C30]/30 hover:bg-white";
                
                if (isCurrent) {
                  stylingClass = "bg-[#A51C30] text-white shadow-xl shadow-[#A51C30]/30 border-[#A51C30] scale-110 z-10 font-black";
                } else if (isAnswered) {
                  stylingClass = "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20 hover:bg-[#22c55e]/20 font-black";
                }

                return (
                  <button 
                    key={idx}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setIsSidebarOpen(false);
                    }}
                    className={`aspect-square w-full rounded-2xl flex items-center justify-center text-sm transition-all duration-500 border-2 ${stylingClass}`}
                    title={`Academic Item ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#22c55e]"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Validated</span>
              </div>
              <span className="text-sm font-black text-[#1e293b] font-serif">{Math.max(0, Object.keys(answers).length)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending</span>
              </div>
              <span className="text-sm font-black text-[#1e293b] font-serif">{Math.max(0, questions.length - Object.keys(answers).length)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ExamPortal;

