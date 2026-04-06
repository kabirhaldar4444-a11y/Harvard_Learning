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
    </div>
  );
};

export default UserSubmissions;
