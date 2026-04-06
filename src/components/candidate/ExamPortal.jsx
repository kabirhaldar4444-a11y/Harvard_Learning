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

  const answersRef = React.useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const [confirmedSignal, setConfirmedSignal] = useState(0);

  useEffect(() => {
    if (submitSignal > 0 && submitSignal !== confirmedSignal && !isSubmitted) {
      setShowConfirm(true);
      setConfirmedSignal(submitSignal);
    }
  }, [submitSignal]);

  useEffect(() => {
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
        // Fallback for empty exams
        setQuestions([{ 
          id: 'mock-1', 
          question_text: "What is 2+2?", 
          options: ["3", "4", "5", "6"], 
          correct_option: 1 
        }]);
      }
    } catch (err) {
      console.error('Error in ExamPortal init:', err);
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
    if (isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

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
      if (currentAnswers[idx] === q.correct_option) score++;
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
        score++;
      }
    });
    return score;
  };

  if (loading) return <div>Loading questions...</div>;

  /* ── Confirm Submit Modal ── */
  const ConfirmModal = () => (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
      {/* Card */}
      <div className="relative glass-card-saas p-8 max-w-md w-full animate-slide-up border-t-4 border-t-amber-500 shadow-2xl text-center z-10">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center ring-8 ring-amber-500/5">
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
        </div>
        <h3 className="text-2xl font-black mb-3 text-[color:var(--text-dark)]">Submit Exam?</h3>
        <p className="text-[color:var(--text-light)] text-sm leading-relaxed mb-2">
          You have answered <span className="font-bold text-primary-500">{Object.keys(answers).length}</span> out of <span className="font-bold">{questions.length}</span> questions.
        </p>
        <p className="text-[color:var(--text-light)] text-sm mb-8">
          Once submitted, <span className="text-amber-500 font-bold">you cannot make any changes.</span>
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => setShowConfirm(false)}
            className="flex-1 py-3 px-6 rounded-xl font-bold border transition-all hover:bg-white/5 text-[color:var(--text-light)]"
            style={{ borderColor: 'var(--glass-border)' }}
          >
            No, Continue
          </button>
          <button
            onClick={confirmAndSubmit}
            className="flex-1 py-3 px-6 rounded-xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95"
          >
            Yes, Submit
          </button>
        </div>
      </div>
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-6 animate-fade-in relative z-10 w-full">
        {/* Animated Background Ambience */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] pointer-events-none"></div>
        
        <div className="glass-card-saas p-10 md:p-14 text-center max-w-xl w-full relative z-10 animate-slide-up border-t-4 border-t-emerald-500">
          <div className="w-24 h-24 mx-auto bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-inner ring-8 ring-emerald-500/5">
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-4 text-[color:var(--text-dark)]">Exam Submitted!</h2>
          <p className="text-[color:var(--text-light)] text-base font-medium leading-relaxed mb-8">
            Your responses have been successfully recorded.<br/>
            <span className="text-primary-500 font-bold mt-2 inline-block">Results are currently locked</span> and will be available on your dashboard once approved.
          </p>
          
          {!isReEntry && (
            <div className="mb-8 p-5 rounded-2xl flex flex-col items-center gap-2 border bg-blue-500/5 border-blue-500/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/70">Time Taken</span>
              <span className="text-xl font-black text-blue-500/90">{formatTime(exam.duration * 60 - timeLeft)}</span>
            </div>
          )}
          
          <button onClick={onFinish} className="btn-premium w-full py-4 font-black tracking-wide flex items-center justify-center gap-2 hover:scale-[1.02] shadow-xl shadow-primary-500/20">
            Return to Dashboard
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
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
        <div className="relative glass-card-saas p-8 max-w-md w-full animate-slide-up border-t-4 shadow-2xl text-center z-10" style={{ borderTopColor: timeExpired ? '#f59e0b' : '#10b981' }}>
            <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ring-8 ${timeExpired ? 'bg-amber-500/10 text-amber-500 ring-amber-500/5' : 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/5'}`}>
              {timeExpired ? (
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              )}
            </div>
            <h3 className="text-2xl font-black mb-3 text-[color:var(--text-dark)]">
              {timeExpired ? "⏱️ Time's Up!" : 'Submit Exam?'}
            </h3>
            <p className="text-[color:var(--text-light)] text-sm leading-relaxed mb-2">
              {timeExpired 
                ? 'Your exam time has ended. Your answers will be submitted now.'
                : <>You have answered <span className="font-bold text-primary-500">{Object.keys(answers).length}</span> out of <span className="font-bold">{questions.length}</span> questions.</>
              }
            </p>
            <p className="text-[color:var(--text-light)] text-sm mb-8">
              Once submitted, <span className="text-amber-500 font-bold">you cannot make any changes.</span>
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 px-6 rounded-xl font-bold border transition-all hover:bg-white/5 text-[color:var(--text-light)]"
                style={{ borderColor: 'var(--glass-border)' }}
              >
                No, Continue
              </button>
              <button
                onClick={confirmAndSubmit}
                className="flex-1 py-3 px-6 rounded-xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="exam-portal w-full animate-fade-in relative z-10 pt-4 pb-12">
      {/* Immersive HUD Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-6 glass-card-saas border-l-4 border-l-primary-500 sticky top-4 z-50 shadow-xl shadow-primary-500/5">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-[color:var(--text-light)] mb-1">Current Exam</span>
          <h2 className="text-2xl font-black tracking-tight text-[color:var(--text-dark)] line-clamp-1">{exam.title}</h2>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-[color:var(--text-light)] mb-1">Time Left</span>
            <div className={`text-xl font-black flex items-center gap-2 ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-primary-500'}`}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full relative">
        {/* Main Examination Area (Full Width) */}
        <div className="glass-card-saas p-8 md:p-10 flex flex-col min-h-[60vh] relative overflow-hidden transition-all duration-300">
          {/* Progress Indicator & Drawer Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b gap-4" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-3 rounded-xl bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all shadow-lg active:scale-95 flex items-center gap-2"
                title="Open Question Map"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                <span className="font-bold text-sm hidden sm:block tracking-wide">Question Map</span>
              </button>
              
              <span className="text-sm font-bold text-[color:var(--text-light)] flex items-center gap-2">
                Question 
                <span className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center font-black">
                  {currentQuestionIndex + 1}
                </span>
                of {questions.length}
              </span>
            </div>
            
            <div className="w-full sm:w-48 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 transition-all duration-500 ease-out" 
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex-1 animate-slide-up" key={currentQuestionIndex}>
            <h3 className="text-2xl md:text-3xl font-bold leading-snug mb-10 text-[color:var(--text-dark)] break-words">
              {currentQuestion.question_text}
            </h3>
            
            <div className="grid gap-4">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestionIndex] === idx;
                return (
                  <label 
                    key={idx} 
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-4 group ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-500/5 shadow-lg shadow-primary-500/10' 
                        : 'hover:border-primary-500/50 hover:bg-white/5 border-transparent bg-[color:var(--input-bg)]'
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
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-primary-500 bg-primary-500' : 'border-slate-400 group-hover:border-primary-400'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                    </div>
                    <span className={`text-lg font-medium transition-colors break-words ${isSelected ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-[color:var(--text-dark)]'}`}>
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4" style={{ borderColor: 'var(--glass-border)' }}>
            {/* Previous Button */}
            <button 
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 hover:bg-white/10 dark:hover:bg-black/20 w-full sm:w-auto justify-center"
              style={{ color: 'var(--text-light)' }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Previous
            </button>

            {/* Save & Next OR Submit Exam (last question) */}
            {currentQuestionIndex === questions.length - 1 ? (
              <button 
                onClick={handleSubmit}
                className="px-10 py-4 font-black tracking-wide flex items-center gap-2 rounded-2xl w-full sm:w-auto justify-center transition-all duration-300 hover:scale-[1.03] active:scale-95 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50"
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Submit Exam
              </button>
            ) : (
              <button 
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)} 
                className="btn-premium px-10 py-4 font-black tracking-wide flex items-center gap-2 hover:scale-[1.02] shadow-xl shadow-primary-500/20 w-full sm:w-auto justify-center"
              >
                Save & Next
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* Hidden Sidebar Drawer (Overlay) */}
        {/* Backdrop overlay */}
        <div 
          className={`fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>

        {/* Sliding Drawer Container */}
        <div 
          className={`fixed top-0 right-0 h-screen w-full max-w-[350px] z-[9999] glass-card-saas !rounded-none !border-y-0 !border-r-0 border-l p-6 shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--card-bg)' }}
        >
          <div className="flex items-center justify-between mb-8 pb-4 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <h4 className="text-xl font-black tracking-widest uppercase flex items-center gap-3 text-[color:var(--text-dark)]">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              Question Map
            </h4>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="w-10 h-10 rounded-full hover:bg-rose-500/15 hover:text-rose-500 text-slate-400 transition-all flex items-center justify-center shrink-0"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => {
                const isCurrent = currentQuestionIndex === idx;
                const isAnswered = answers[idx] !== undefined;
                
                let stylingClass = "text-[color:var(--text-dark)] bg-black/5 dark:bg-white/5 border-transparent hover:bg-primary-500/20";
                
                if (isCurrent) {
                  stylingClass = "bg-primary-500 text-white shadow-lg shadow-primary-500/40 ring-2 ring-primary-500/20 ring-offset-1 ring-offset-[color:var(--card-bg)] scale-110 z-10";
                } else if (isAnswered) {
                  stylingClass = "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 font-bold";
                }

                return (
                  <button 
                    key={idx}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setIsSidebarOpen(false); // Optionally close on select, but keeping it open might be better if they want to jump around quickly. Let's not close it automatically for better UX unless requested, wait, they said "On click -> sidebar should slide in smoothly...". If they want to jump questions rapidly, let's keep it open or just close it to view the question.
                    }}
                    className={`aspect-square w-full rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 border ${stylingClass}`}
                    title={`Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t flex flex-col gap-3 shrink-0" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center justify-between text-xs font-bold text-[color:var(--text-light)]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30"></span>
                Answered
              </div>
              <span>{Math.max(0, Object.keys(answers).length)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-[color:var(--text-light)]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-black/10 dark:bg-white/10"></span>
                Unanswered
              </div>
              <span>{Math.max(0, questions.length - Object.keys(answers).length)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ExamPortal;

