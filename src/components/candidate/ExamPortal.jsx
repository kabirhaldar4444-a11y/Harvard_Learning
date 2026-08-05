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

  // New states for tracking progress
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));
  const [reviewedQuestions, setReviewedQuestions] = useState(new Set());

  const answersRef = React.useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
    // Save answers and index to localStorage
    if (exam?.id) {
      localStorage.setItem(`exam_progress_${exam.id}`, JSON.stringify({
        answers,
        currentQuestionIndex,
        timeLeft,
        visitedQuestions: Array.from(visitedQuestions),
        reviewedQuestions: Array.from(reviewedQuestions)
      }));
    }
  }, [answers, currentQuestionIndex, timeLeft, exam.id, visitedQuestions, reviewedQuestions]);

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
      const { answers: savedAnswers, currentQuestionIndex: savedIndex, timeLeft: savedTime, visitedQuestions: savedVisited, reviewedQuestions: savedReviewed } = JSON.parse(savedProgress);
      if (savedAnswers) setAnswers(savedAnswers);
      if (savedIndex !== undefined) setCurrentQuestionIndex(savedIndex);
      if (savedTime !== undefined) setTimeLeft(savedTime);
      if (savedVisited) setVisitedQuestions(new Set(savedVisited));
      if (savedReviewed) setReviewedQuestions(new Set(savedReviewed));
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

  const toggleReview = () => {
    const newReviewed = new Set(reviewedQuestions);
    if (newReviewed.has(currentQuestionIndex)) {
      newReviewed.delete(currentQuestionIndex);
    } else {
      newReviewed.add(currentQuestionIndex);
    }
    setReviewedQuestions(newReviewed);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setVisitedQuestions(prev => new Set(prev).add(nextIdx));
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
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
                      <svg className={`w-5 h-5 text-white transition-transform duration-500 ${acceptedCheckbox ? 'scale-100' : 'scale-0'}`} fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
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
            Your academic responses have been securely archived.<br />
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
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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

      <div className="exam-portal w-full animate-fade-in relative z-10 pt-4 pb-12 px-4 md:px-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Examination Area */}
          <div className="flex-1 w-full bg-white p-6 md:p-12 rounded-[2.5rem] border border-slate-100 flex flex-col min-h-[75vh] shadow-xl relative">

            {/* Header Info */}
            <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-8">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Question</span>
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">{currentQuestionIndex + 1}</span>
                    <span className="text-slate-300 font-bold">/</span>
                    <span className="text-slate-400 font-bold">{questions.length}</span>
                  </div>
                </div>
              </div>

              {/* Mobile Map Toggle */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>

            <div className="flex-1 animate-slide-up" key={currentQuestionIndex}>
              <h3 className="text-xl md:text-2xl font-bold leading-relaxed mb-12 text-[#1e293b] border-l-4 border-[#A51C30] pl-6">
                {currentQuestion.question_text}
              </h3>

              <div className="grid gap-4">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentQuestionIndex] === idx;
                  const label = String.fromCharCode(65 + idx); // A, B, C, D
                  return (
                    <label
                      key={idx}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-5 group ${isSelected
                          ? 'border-slate-100 bg-slate-50/50'
                          : 'hover:border-slate-200 border-slate-50 bg-white'
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
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 font-bold text-sm transition-all duration-300 ${isSelected ? 'bg-white border-slate-200 text-slate-400 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'
                        }`}>
                        {label}
                      </div>
                      <span className={`text-base font-semibold transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                        {option}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-slate-50 flex items-center justify-between">
              <button
                onClick={toggleReview}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-bold transition-all ${reviewedQuestions.has(currentQuestionIndex)
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                {reviewedQuestions.has(currentQuestionIndex) ? 'REVIEWED' : 'REVIEW'}
              </button>

              <div className="flex gap-4">
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={handlePrev}
                    className="px-8 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all text-sm uppercase tracking-widest"
                  >
                    PREV
                  </button>
                )}
                {currentQuestionIndex === questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-3 rounded-xl bg-[#22c55e] text-white font-bold hover:bg-[#1db954] transition-all text-sm uppercase tracking-widest shadow-lg shadow-green-500/20"
                  >
                    FINISH
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 rounded-xl bg-[#1e293b] text-white font-bold hover:bg-black transition-all text-sm uppercase tracking-widest flex items-center gap-2"
                  >
                    NEXT
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar MAP - Persistent on Large screens, Drawer on small */}
          <div
            className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          <aside className={`fixed top-0 right-0 h-screen w-80 bg-white z-[101] p-8 shadow-2xl transition-transform duration-500 lg:static lg:h-auto lg:rounded-[2.5rem] lg:shadow-xl lg:border lg:border-slate-100 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h7" /></svg>
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">MAP</h4>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">TIME LEFT</span>
                <div className={`text-xl font-black font-mono ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-900'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-10">
              {questions.map((_, idx) => {
                const isCurrent = currentQuestionIndex === idx;
                const isReviewed = reviewedQuestions.has(idx);
                const isAnswered = answers[idx] !== undefined;
                const isVisited = visitedQuestions.has(idx);

                let status = 'not-visited';
                if (isReviewed) status = 'reviewed';
                else if (isAnswered) status = 'answered';
                else if (isVisited) status = 'not-answered';

                // Shape styling
                let shapeClass = "rounded-xl border-slate-200 text-slate-400";
                let style = {};

                if (isCurrent) {
                  shapeClass = "bg-[#1e293b] text-white border-transparent scale-110 z-10 font-bold";
                  style = { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' };
                } else {
                  switch (status) {
                    case 'reviewed':
                      shapeClass = "bg-purple-600 text-white border-transparent rounded-full font-bold";
                      break;
                    case 'answered':
                      shapeClass = "bg-[#22c55e] text-white border-transparent font-bold";
                      style = { clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)' };
                      break;
                    case 'not-answered':
                      shapeClass = "bg-[#f97316] text-white border-transparent font-bold";
                      style = { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' };
                      break;
                    default:
                      shapeClass = "bg-white border-slate-200 text-slate-400 font-bold";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setVisitedQuestions(prev => new Set(prev).add(idx));
                      setIsSidebarOpen(false);
                    }}
                    className={`aspect-square w-full flex items-center justify-center text-xs transition-all duration-300 border-2 ${shapeClass}`}
                    style={style}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-4 pt-6 border-t border-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md border border-slate-200"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NOT VISITED</span>
                </div>
                <span className="text-sm font-black text-slate-900">{questions.length - visitedQuestions.size}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#f97316]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NOT ANSWERED</span>
                </div>
                <span className="text-sm font-black text-slate-900">
                  {Array.from(visitedQuestions).filter(idx => answers[idx] === undefined && !reviewedQuestions.has(idx)).length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#22c55e]" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)' }}></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ANSWERED</span>
                </div>
                <span className="text-sm font-black text-slate-900">
                  {Array.from(visitedQuestions).filter(idx => answers[idx] !== undefined && !reviewedQuestions.has(idx)).length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-600"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">REVIEWED</span>
                </div>
                <span className="text-sm font-black text-slate-900">{reviewedQuestions.size}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default ExamPortal;

