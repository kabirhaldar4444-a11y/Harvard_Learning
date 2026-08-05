import React, { useState, useEffect } from 'react';
import supabase from '../../utils/supabase';
import { useToast, useConfirm } from '../common/AlertProvider';
import MultiSelectExams from './MultiSelectExams';

export default function AdmissionsManagement({ user, profile }) {
  const toast = useToast();
  const confirm = useConfirm();

  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'
  
  // Media Modal state
  const [activeMedia, setActiveMedia] = useState(null); // { type: 'video' | 'image', url: string, title: string }
  
  // Accept & Create User Modal state
  const [acceptModalItem, setAcceptModalItem] = useState(null);
  const [candidatePassword, setCandidatePassword] = useState('');
  const [allottedExamIds, setAllottedExamIds] = useState([]);
  const [exams, setExams] = useState([]);
  const [isSubmittingAccept, setIsSubmittingAccept] = useState(false);

  // Reject Modal state
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  // Success Created Credentials Modal
  const [createdCredentials, setCreatedCredentials] = useState(null);

  useEffect(() => {
    fetchAdmissions();
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data } = await supabase.from('exams').select('id, title').order('title');
      if (data) setExams(data);
    } catch (e) {
      console.warn('Error fetching exams:', e);
    }
  };

  const fetchAdmissions = async () => {
    setLoading(true);
    let supabaseData = [];
    try {
      const { data, error } = await supabase
        .from('admissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        supabaseData = data;
      }
    } catch (err) {
      console.warn('Supabase admissions fetch notice:', err);
    }

    // Merge with localStorage admissions if any offline/fallback records exist
    const localData = JSON.parse(localStorage.getItem('harvard_admissions') || '[]');
    const mergedMap = new Map();

    supabaseData.forEach(item => mergedMap.set(item.id || item.email, item));
    localData.forEach(item => {
      const key = item.id || item.email;
      if (!mergedMap.has(key)) {
        mergedMap.set(key, item);
      }
    });

    const combined = Array.from(mergedMap.values());
    setAdmissions(combined);
    setLoading(false);
  };

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCandidatePassword(pass);
  };

  const handleOpenAcceptModal = (item) => {
    setAcceptModalItem(item);
    generateRandomPassword();
    setAllottedExamIds([]);
  };

  const handleExecuteAccept = async (e) => {
    e.preventDefault();
    if (!acceptModalItem) return;
    setIsSubmittingAccept(true);

    const emailToCreate = acceptModalItem.email.trim().toLowerCase();
    const nameToCreate = acceptModalItem.full_name.trim();
    const passwordToCreate = candidatePassword.trim();

    if (!passwordToCreate) {
      toast('Please enter or generate a password.', 'warning');
      setIsSubmittingAccept(false);
      return;
    }

    try {
      // 1. Create User via RPC function
      const { data: newUserId, error: createError } = await supabase.rpc('admin_create_user', {
        user_email: emailToCreate,
        user_password: passwordToCreate,
        user_name: nameToCreate,
        user_role: 'candidate',
        allotted_exams: allottedExamIds
      });

      if (createError) {
        throw new Error(createError.message || "Failed to create candidate account.");
      }

      // 2. Update status in Supabase admissions table
      if (acceptModalItem.id && !acceptModalItem.id.startsWith('HL-ADM-')) {
        await supabase
          .from('admissions')
          .update({ status: 'approved', remarks: 'Accepted & Candidate Account Created' })
          .eq('id', acceptModalItem.id);
      }

      // 3. Update localStorage fallback if present
      const localData = JSON.parse(localStorage.getItem('harvard_admissions') || '[]');
      const updatedLocal = localData.map(a => 
        (a.id === acceptModalItem.id || a.email === acceptModalItem.email)
          ? { ...a, status: 'approved', remarks: 'Accepted & Candidate Account Created' }
          : a
      );
      localStorage.setItem('harvard_admissions', JSON.stringify(updatedLocal));

      // 4. Update UI local state
      setAdmissions(prev => prev.map(a => 
        (a.id === acceptModalItem.id || a.email === acceptModalItem.email)
          ? { ...a, status: 'approved' }
          : a
      ));

      toast(`Successfully accepted admission & created candidate user!`, 'success');
      setCreatedCredentials({
        name: nameToCreate,
        email: emailToCreate,
        password: passwordToCreate,
        course: acceptModalItem.course_name
      });
      setAcceptModalItem(null);
    } catch (err) {
      toast('Error: ' + err.message, 'error');
    } finally {
      setIsSubmittingAccept(false);
    }
  };

  const handleExecuteReject = async (e) => {
    e.preventDefault();
    if (!rejectModalItem) return;
    setIsSubmittingReject(true);

    try {
      if (rejectModalItem.id && !rejectModalItem.id.startsWith('HL-ADM-')) {
        await supabase
          .from('admissions')
          .update({ status: 'rejected', remarks: rejectRemarks.trim() || 'Rejected by Administrator' })
          .eq('id', rejectModalItem.id);
      }

      const localData = JSON.parse(localStorage.getItem('harvard_admissions') || '[]');
      const updatedLocal = localData.map(a => 
        (a.id === rejectModalItem.id || a.email === rejectModalItem.email)
          ? { ...a, status: 'rejected', remarks: rejectRemarks.trim() || 'Rejected by Administrator' }
          : a
      );
      localStorage.setItem('harvard_admissions', JSON.stringify(updatedLocal));

      setAdmissions(prev => prev.map(a => 
        (a.id === rejectModalItem.id || a.email === rejectModalItem.email)
          ? { ...a, status: 'rejected', remarks: rejectRemarks.trim() || 'Rejected' }
          : a
      ));

      toast('Admission application rejected.', 'info');
      setRejectModalItem(null);
      setRejectRemarks('');
    } catch (err) {
      toast('Error rejecting application: ' + err.message, 'error');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  // Filtering
  const filteredAdmissions = admissions.filter(item => {
    const matchesSearch = 
      item.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.state?.toLowerCase().includes(searchQuery.toLowerCase());

    const itemStatus = item.status || 'pending';
    const matchesStatus = statusFilter === 'all' || itemStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = admissions.filter(a => (a.status || 'pending') === 'pending').length;
  const approvedCount = admissions.filter(a => a.status === 'approved').length;
  const rejectedCount = admissions.filter(a => a.status === 'rejected').length;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in font-sans pb-16">
      
      {/* Top Header Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-[#1e293b] font-serif tracking-tight">
            New Admissions
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Review and accept pending candidate admission forms.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Status Filter Badges */}
          <div className="flex bg-slate-100 p-1.5 rounded-full border border-slate-200/60 shadow-inner text-xs font-bold">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-5 py-2 rounded-full transition-all uppercase tracking-wider text-[10px] ${
                statusFilter === 'pending'
                  ? 'bg-[#1e293b] text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-5 py-2 rounded-full transition-all uppercase tracking-wider text-[10px] ${
                statusFilter === 'approved'
                  ? 'bg-[#16a34a] text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-5 py-2 rounded-full transition-all uppercase tracking-wider text-[10px] ${
                statusFilter === 'rejected'
                  ? 'bg-[#dc2626] text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Rejected ({rejectedCount})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-5 py-2 rounded-full transition-all uppercase tracking-wider text-[10px] ${
                statusFilter === 'all'
                  ? 'bg-[#1e293b] text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({admissions.length})
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchAdmissions}
            className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm active:scale-95 shrink-0"
            title="Refresh Admissions"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="py-24 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-14 h-14 border-4 border-[#1e293b] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-serif text-base">Loading admissions directory...</p>
        </div>
      ) : filteredAdmissions.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
            <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 font-serif">No Admissions Found</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-md">There are no admission applications matching the selected criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAdmissions.map((item) => {
            const isApproved = item.status === 'approved';
            const isRejected = item.status === 'rejected';

            return (
              <div 
                key={item.id || item.email}
                className="group relative bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 hover:border-slate-300 transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-8"
              >
                {/* Left Side: Avatar & Details */}
                <div className="flex flex-col sm:flex-row items-start gap-6 flex-1 min-w-0">
                  {/* Candidate Avatar */}
                  <div className="relative shrink-0">
                    <img 
                      src={item.profile_photo_url || item.video_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
                      alt={item.full_name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-slate-100 shadow-md grayscale-[0.1] group-hover:grayscale-0 transition-all"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                    {isApproved && (
                      <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white text-xs font-bold" title="Approved">
                        ✓
                      </span>
                    )}
                    {isRejected && (
                      <span className="absolute bottom-0 right-0 w-6 h-6 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-white text-xs font-bold" title="Rejected">
                        ✕
                      </span>
                    )}
                  </div>

                  {/* Info Column */}
                  <div className="space-y-4 flex-1 min-w-0">
                    {/* Header Line */}
                    <div>
                      <h3 className="text-2xl font-bold text-[#1e293b] font-serif tracking-tight leading-tight">
                        {item.full_name}
                      </h3>
                      <p className="text-sm font-semibold text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                        <span>{item.email}</span>
                        <span className="text-slate-300">•</span>
                        <span>{item.phone}</span>
                      </p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-8 pt-1 text-xs">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">COURSE</span>
                        <span className="font-bold text-slate-800 text-sm">{item.course_name || 'N/A'}</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">LOCATION</span>
                        <span className="font-bold text-slate-800 text-sm">
                          {item.city && item.state ? `${item.city}, ${item.state}` : item.state || item.city || 'N/A'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">SUBMITTED</span>
                        <span className="font-bold text-slate-800 text-sm">{formatDate(item.created_at)}</span>
                      </div>

                      <div className="sm:col-span-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">ADDRESS</span>
                        <span className="font-medium text-slate-700 text-xs leading-relaxed block truncate">
                          {item.address ? `${item.address}${item.pincode ? ` - ${item.pincode}` : ''}` : 'N/A'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">IP ADDRESS</span>
                        <span className="inline-block bg-slate-100 text-slate-600 font-mono px-2.5 py-1 rounded-md text-[11px] font-bold border border-slate-200/50">
                          {item.ip_address || 'Not captured'}
                        </span>
                      </div>
                    </div>

                    {/* Document Badges Row */}
                    <div className="flex items-center gap-2.5 pt-3 flex-wrap">
                      {/* Video Button */}
                      {item.video_url || item.profile_photo_url ? (
                        <button
                          onClick={() => setActiveMedia({
                            type: 'video',
                            url: item.video_url || item.profile_photo_url,
                            title: `${item.full_name} — Live Video Statement`
                          })}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 border border-rose-100"
                        >
                          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          Video
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 bg-slate-50 text-slate-400 rounded-xl text-xs italic border border-slate-100">No Video</span>
                      )}

                      {/* Aadhaar Front */}
                      {item.aadhaar_front_url ? (
                        <button
                          onClick={() => setActiveMedia({
                            type: 'image',
                            url: item.aadhaar_front_url,
                            title: `${item.full_name} — Aadhaar Card (Front)`
                          })}
                          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl text-xs transition-all active:scale-95 border border-indigo-100"
                        >
                          Aadhaar (F)
                        </button>
                      ) : null}

                      {/* Aadhaar Back */}
                      {item.aadhaar_back_url ? (
                        <button
                          onClick={() => setActiveMedia({
                            type: 'image',
                            url: item.aadhaar_back_url,
                            title: `${item.full_name} — Aadhaar Card (Back)`
                          })}
                          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl text-xs transition-all active:scale-95 border border-indigo-100"
                        >
                          Aadhaar (B)
                        </button>
                      ) : null}

                      {/* PAN Card */}
                      {item.pan_url ? (
                        <button
                          onClick={() => setActiveMedia({
                            type: 'image',
                            url: item.pan_url,
                            title: `${item.full_name} — PAN Card`
                          })}
                          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl text-xs transition-all active:scale-95 border border-blue-100"
                        >
                          PAN Card
                        </button>
                      ) : null}

                      {/* Signature */}
                      {item.signature_url ? (
                        <button
                          onClick={() => setActiveMedia({
                            type: 'image',
                            url: item.signature_url,
                            title: `${item.full_name} — Digital Signature`
                          })}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all active:scale-95 border border-slate-200/60"
                        >
                          Signature
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Right Side: Action Button */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {isApproved ? (
                    <div className="flex items-center gap-3">
                      <span className="px-6 py-3.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2">
                        ✓ APPROVED & USER CREATED
                      </span>
                    </div>
                  ) : isRejected ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-6 py-3.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2">
                        ✕ REJECTED
                      </span>
                      {item.remarks && (
                        <span className="text-[10px] font-medium text-rose-500 italic max-w-xs text-right">
                          "{item.remarks}"
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => handleOpenAcceptModal(item)}
                        className="px-8 py-4 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 border border-slate-900"
                      >
                        ACCEPT & CREATE USER ✓
                      </button>

                      <button
                        onClick={() => setRejectModalItem(item)}
                        className="px-6 py-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        REJECT
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ── MEDIA INSPECTION MODAL (Video / Image) ── */}
      {activeMedia && (
        <div 
          className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setActiveMedia(null); }}
        >
          <div className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h4 className="font-bold text-slate-800 text-sm font-serif">{activeMedia.title}</h4>
              <div className="flex items-center gap-2">
                <a
                  href={activeMedia.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold text-xs flex items-center gap-1 transition-all"
                >
                  Download
                </a>
                <button
                  onClick={() => setActiveMedia(null)}
                  className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Media Body */}
            <div className="p-6 flex-1 overflow-auto flex flex-col items-center justify-center bg-slate-900 min-h-[350px]">
              {activeMedia.type === 'video' ? (
                <div className="w-full flex flex-col items-center justify-center space-y-3">
                  <video 
                    controls 
                    autoPlay 
                    playsInline
                    preload="auto"
                    src={activeMedia.url}
                    key={activeMedia.url}
                    className="max-w-full max-h-[65vh] rounded-2xl shadow-2xl bg-black border border-slate-800"
                  >
                    <source src={activeMedia.url} type="video/webm" />
                    <source src={activeMedia.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {activeMedia.url?.startsWith('http') ? (
                    <p className="text-[11px] text-slate-400 font-medium">
                      If video does not start automatically, click Play above or{' '}
                      <a 
                        href={activeMedia.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-emerald-400 underline font-bold hover:text-emerald-300"
                      >
                        Open Video File in New Tab
                      </a>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 font-medium">
                      ▶ Recorded Live Video Statement (Saved in Portal Database)
                    </p>
                  )}
                </div>
              ) : (
                <img 
                  src={activeMedia.url} 
                  alt={activeMedia.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ACCEPT & CREATE USER MODAL ── */}
      {acceptModalItem && (
        <div 
          className="fixed inset-0 z-[5500] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setAcceptModalItem(null); }}
        >
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-[#0f172a] text-white p-6">
              <h3 className="text-xl font-bold font-serif">Accept Admission & Create User</h3>
              <p className="text-xs text-slate-400 mt-1">
                Creating candidate login credentials for <strong className="text-white">{acceptModalItem.full_name}</strong>
              </p>
            </div>

            <form onSubmit={handleExecuteAccept} className="p-6 space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Candidate Email</label>
                <input 
                  type="email" 
                  value={acceptModalItem.email} 
                  disabled 
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 font-bold text-slate-700 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Set Initial Password</label>
                  <button 
                    type="button" 
                    onClick={generateRandomPassword}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    🎲 Regenerate
                  </button>
                </div>
                <input 
                  type="text" 
                  value={candidatePassword}
                  onChange={(e) => setCandidatePassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-900 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Allot Examinations (Optional)</label>
                <MultiSelectExams 
                  exams={exams} 
                  selectedIds={allottedExamIds} 
                  onChange={setAllottedExamIds} 
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAcceptModalItem(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAccept}
                  className="px-6 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingAccept ? 'Creating User...' : 'Confirm & Create Account ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── REJECT MODAL ── */}
      {rejectModalItem && (
        <div 
          className="fixed inset-0 z-[5500] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setRejectModalItem(null); }}
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-rose-600 text-white p-6">
              <h3 className="text-xl font-bold font-serif">Reject Application</h3>
              <p className="text-xs text-rose-100 mt-1">
                Applicant: <strong>{rejectModalItem.full_name}</strong> ({rejectModalItem.email})
              </p>
            </div>

            <form onSubmit={handleExecuteReject} className="p-6 space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Rejection Reason / Remarks</label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Incomplete Aadhaar verification or missing details..."
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalItem(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReject}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingReject ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SUCCESS CREATED CREDENTIALS MODAL ── */}
      {createdCredentials && (
        <div className="fixed inset-0 z-[7000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-200 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900 font-serif">Account Created!</h3>
              <p className="text-xs text-slate-500 mt-1">The candidate profile is active and ready for login.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Candidate Name</span>
                <span className="font-bold text-slate-800 text-sm">{createdCredentials.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Login Email</span>
                <span className="font-mono font-bold text-indigo-600">{createdCredentials.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Generated Password</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">{createdCredentials.password}</span>
              </div>
            </div>

            <button
              onClick={() => setCreatedCredentials(null)}
              className="w-full py-3 bg-[#0f172a] hover:bg-[#1e293b] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
