import React, { useState, useEffect } from 'react';
import supabase from '../../utils/supabase';
import { useToast } from '../common/AlertProvider';

const UserSubmissions = ({ userId }) => {
  const toast = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, [userId]);

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from('submissions')
      .select('*, exams(title)')
      .eq('user_id', userId);
    if (data) setSubmissions(data);
    setLoading(false);
  };

  const handleUpdateScore = async (id, newScore) => {
    const { error } = await supabase
      .from('submissions')
      .update({ admin_score_override: parseInt(newScore) })
      .eq('id', id);
    if (!error) fetchSubmissions();
    else toast(error.message, 'error');
  };

  const handleToggleRelease = async (id, currentStatus) => {
    const { error } = await supabase
      .from('submissions')
      .update({ is_released: !currentStatus })
      .eq('id', id);
    if (!error) fetchSubmissions();
    else toast(error.message, 'error');
  };

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionQuestions, setSubmissionQuestions] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const viewDetails = async (sub) => {
    setSelectedSubmission(sub);
    setDetailsLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('exam_id', sub.exam_id)
      .order('created_at', { ascending: true });
    
    if (data) setSubmissionQuestions(data);
    setDetailsLoading(false);
  };

  if (loading) return <p>Loading submissions...</p>;
  if (submissions.length === 0) return <p style={{ color: 'var(--text-light)' }}>No assessments completed yet.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {submissions.map(sub => (
        <div key={sub.id} style={{ 
          backgroundColor: 'var(--input-bg)', padding: '20px', borderRadius: '15px', border: '1px solid var(--input-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-dark)'
        }}>
          <div>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{sub.exams?.title}</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>
              Base Score: {sub.score} / {sub.total_questions}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={() => viewDetails(sub)}
              style={{ 
                padding: '8px 15px', borderRadius: '8px', border: '1px solid var(--primary-color)', cursor: 'pointer',
                backgroundColor: 'transparent', color: 'var(--primary-color)', fontWeight: 600
              }}
            >
              View Analysis
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Override Score</label>
              <input 
                type="number" 
                defaultValue={sub.admin_score_override ?? sub.score}
                onBlur={(e) => handleUpdateScore(sub.id, e.target.value)}
                style={{ width: '60px', padding: '5px', borderRadius: '4px', border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-dark)' }}
              />
            </div>
            <button 
              onClick={() => handleToggleRelease(sub.id, sub.is_released)}
              style={{ 
                padding: '8px 15px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                backgroundColor: sub.is_released ? '#10b981' : '#3b82f6', color: 'white', fontWeight: 600
              }}
            >
              {sub.is_released ? 'Result Released' : 'Release Result'}
            </button>
          </div>
        </div>
      ))}

      {/* Analysis Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[color:var(--premium-bg)] w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl border" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="p-6 border-b flex justify-between items-center bg-[color:var(--card-bg)]" style={{ borderColor: 'var(--glass-border)' }}>
              <div>
                <h3 className="text-xl font-black text-[color:var(--text-dark)]">{selectedSubmission.exams?.title} - Analysis</h3>
                <p className="text-sm text-[color:var(--text-light)]">Candidate Score: {selectedSubmission.score} / {selectedSubmission.total_questions}</p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[color:var(--premium-bg)]">
              {detailsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-sm font-bold text-primary-500">Loading Question Breakdown...</p>
                </div>
              ) : (
                submissionQuestions.map((q, idx) => {
                  const userAnswerIdx = selectedSubmission.answers[idx];
                  const isCorrect = userAnswerIdx === q.correct_option;
                  
                  return (
                    <div key={q.id} className="p-6 rounded-2xl border bg-[color:var(--card-bg)]" style={{ borderColor: isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.1)' }}>
                      <div className="flex items-start gap-4 mb-4">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-sm ${isCorrect ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-lg font-bold text-[color:var(--text-dark)] mb-4">{q.question_text}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt, optIdx) => {
                              const isCorrectOption = optIdx === q.correct_option;
                              const isUserAnswer = optIdx === userAnswerIdx;
                              
                              let borderClass = 'border-transparent';
                              let bgClass = 'bg-[color:var(--input-bg)]';
                              let icon = null;

                              if (isCorrectOption) {
                                borderClass = 'border-emerald-500/50';
                                bgClass = 'bg-emerald-500/10';
                                icon = <svg className="text-emerald-500" width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>;
                              } else if (isUserAnswer && !isCorrect) {
                                borderClass = 'border-rose-500/50';
                                bgClass = 'bg-rose-500/10';
                                icon = <svg className="text-rose-500" width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/></svg>;
                              }

                              return (
                                <div key={optIdx} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${borderClass} ${bgClass}`}>
                                  <span className="text-sm font-medium text-[color:var(--text-dark)]">{opt}</span>
                                  {icon}
                                </div>
                              );
                            })}
                          </div>

                          {q.explanation && (
                            <div className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-sm">
                              <span className="font-black text-blue-500 uppercase tracking-widest text-[9px] block mb-1">Explanation</span>
                              <p className="text-[color:var(--text-light)] italic leading-relaxed">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="p-6 border-t bg-[color:var(--card-bg)]" style={{ borderColor: 'var(--glass-border)' }}>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="w-full btn-premium !py-3"
              >
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSubmissions;
