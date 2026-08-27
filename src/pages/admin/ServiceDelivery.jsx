import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../../utils/supabase';
import { 
  SERVICE_DELIVERY_STAGES, 
  mapProfileToCandidate 
} from '../../utils/serviceDeliveryData';
import { useToast } from '../../components/common/AlertProvider';

const ServiceDelivery = ({ user, profile }) => {
  const navigate = useNavigate();
  const toast = useToast();

  const [rawProfiles, setRawProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'COMPLETED' | 'IN_PROGRESS'
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  // Fetch real candidate profiles from Supabase and subscribe to realtime updates
  useEffect(() => {
    fetchRealCandidates();

    // REALTIME: Listen for any new (future) or updated (past) candidate profiles
    const channel = supabase
      .channel('service-delivery-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          if (payload.new.role === 'candidate') {
            setRawProfiles(prev => [payload.new, ...prev.filter(p => p.id !== payload.new.id)]);
            toast(`New candidate registered: ${payload.new.full_name || payload.new.email}`, 'info');
          }
        } else if (payload.eventType === 'UPDATE') {
          setRawProfiles(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
        } else if (payload.eventType === 'DELETE') {
          setRawProfiles(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRealCandidates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'candidate')
        .order('full_name', { ascending: true, nullsFirst: false });

      if (error) {
        console.error('Error fetching candidate profiles:', error);
        toast('Failed to load candidate profiles from database', 'error');
      } else if (data) {
        setRawProfiles(data);
      }
    } catch (err) {
      console.error('Exception fetching candidates:', err);
      toast('Database connection issue', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Map real database profiles to candidate service delivery models (Always 12/12 Completed)
  const candidates = useMemo(() => {
    return rawProfiles.map(p => mapProfileToCandidate(p));
  }, [rawProfiles]);

  const selectedCandidate = useMemo(() => {
    if (!selectedCandidateId) return null;
    return candidates.find(c => c.id === selectedCandidateId) || null;
  }, [candidates, selectedCandidateId]);

  // Dynamic counts derived purely from real users (Always 100% completed)
  const totalCount = candidates.length;
  const completedCount = candidates.length;
  const inProgressCount = 0;

  // Filter & search
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.id?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === 'COMPLETED') return true;
      if (statusFilter === 'IN_PROGRESS') return false;
      return true;
    });
  }, [candidates, searchQuery, statusFilter]);

  return (
    <div className="min-h-[calc(100vh-96px)] bg-[#fbfbfe] text-slate-800 relative overflow-hidden font-sans pb-24">
      {/* Harvard Crimson & Gold Ambience */}
      <div className="absolute top-0 -left-20 w-[35rem] h-[35rem] bg-[#A51C30]/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 -right-20 w-[35rem] h-[35rem] bg-[#C49619]/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 relative z-10">
        
        {/* ============================================================ */}
        {/* VIEW 1: LIVE STEPPER VIEW (Exact Match to Screenshot 4)      */}
        {/* ============================================================ */}
        {selectedCandidate ? (
          <div className="animate-fade-in space-y-6">
            {/* Top Navigation Button */}
            <div>
              <button
                onClick={() => setSelectedCandidateId(null)}
                className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 text-xs font-black uppercase tracking-widest shadow-sm transition-all duration-300 active:scale-95 group"
              >
                <svg className="w-4 h-4 text-slate-600 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path d="M19 12H5m7 7l-7-7 7-7" />
                </svg>
                BACK TO CANDIDATE CARDS
              </button>
            </div>

            {/* Stepper Card Container */}
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
              {/* Header inside Stepper Card */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-slate-100">
                {/* Candidate Real Info */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img 
                      src={selectedCandidate.avatar_url} 
                      alt={selectedCandidate.full_name}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCandidate.full_name)}&background=A51C30&color=fff&bold=true`;
                      }}
                      className="w-20 h-20 rounded-full object-cover border-4 border-slate-100 shadow-md bg-slate-50"
                    />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm text-xs font-bold">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 font-serif tracking-tight uppercase">
                      {selectedCandidate.full_name}
                    </h2>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1 font-medium">
                      <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      <span>{selectedCandidate.email}</span>
                      {selectedCandidate.phone && selectedCandidate.phone !== 'Not provided' && (
                        <span className="text-slate-400 text-xs ml-2 font-mono">• {selectedCandidate.phone}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Service Delivery Title & Status */}
                <div className="flex flex-col md:items-end gap-3">
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 font-serif tracking-tight">
                    Service Delivery
                  </h1>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-slate-700 shadow-sm">
                    <span className="text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">STATUS</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-emerald-700 font-extrabold">Service Delivery Completed</span>
                  </div>
                </div>
              </div>

              {/* 12-Stage Stepper Component (Always all 12 stages completed) */}
              <div className="pt-14 pb-4 overflow-x-auto">
                <div className="min-w-[1020px] relative px-4">
                  {/* Connecting Gradient Line */}
                  <div 
                    className="absolute top-[48px] left-[5%] right-[5%] h-1 rounded-full -z-0"
                    style={{
                      background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 40%, #10b981 100%)'
                    }}
                  />

                  {/* 12 Stage Nodes Grid */}
                  <div className="grid grid-cols-12 gap-2 relative z-10">
                    {SERVICE_DELIVERY_STAGES.map((stage) => {
                      return (
                        <div 
                          key={stage.id} 
                          className="flex flex-col items-center group"
                        >
                          {/* Step Number Circle (Above line) */}
                          <div className="w-7 h-7 rounded-full border-2 border-emerald-500 bg-white text-emerald-700 flex items-center justify-center text-[11px] font-black shadow-sm mb-3 transition-all duration-300 group-hover:scale-110">
                            {stage.id}
                          </div>

                          {/* Checkmark Icon on the line (Always Completed) */}
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-emerald-500/30 ring-4 ring-white transition-all duration-300 group-hover:scale-110">
                            ✓
                          </div>

                          {/* Step Description Label (Below line) */}
                          <div className="mt-4 text-center">
                            <p className="text-[11px] font-semibold text-slate-800 leading-tight text-center max-w-[95px] break-words">
                              {stage.name}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* VIEW 2: SERVICE DELIVERY MANAGEMENT (Exact Screenshot 3)     */
          /* ============================================================ */
          <div className="animate-fade-in space-y-8">
            {/* Title & Stats Badges Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 font-serif tracking-tight">
                  Service Delivery Management
                </h1>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  Track and manage candidate 12-stage service delivery lifecycle
                </p>
              </div>

              {/* Right Stats Pills */}
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                  <span className="text-slate-400 font-extrabold text-xs uppercase tracking-wider">TOTAL</span>
                  <span className="text-slate-900 font-black text-sm">{totalCount}</span>
                </div>
                <div className="px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200 shadow-sm flex items-center gap-2">
                  <span className="text-emerald-700 font-extrabold text-xs uppercase tracking-wider">COMPLETED</span>
                  <span className="text-emerald-700 font-black text-sm">{completedCount}</span>
                </div>
              </div>
            </div>

            {/* Search Input & Filters Row */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidates by name, email or phone.."
                  className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A51C30]/20 focus:border-[#A51C30] shadow-sm transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black tracking-wider uppercase transition-all duration-300 ${
                    statusFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  ALL ({totalCount})
                </button>
                <button
                  onClick={() => setStatusFilter('COMPLETED')}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black tracking-wider uppercase transition-all duration-300 ${
                    statusFilter === 'COMPLETED'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  COMPLETED
                </button>
                <button
                  onClick={() => setStatusFilter('IN_PROGRESS')}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black tracking-wider uppercase transition-all duration-300 ${
                    statusFilter === 'IN_PROGRESS'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  IN PROGRESS
                </button>
              </div>
            </div>

            {/* Candidate Cards Grid */}
            {loading ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#A51C30] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-bold text-sm">Loading real candidate registry from database...</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">
                  {candidates.length === 0 ? 'No Candidates in Database' : 'No Matching Candidates'}
                </h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  {candidates.length === 0 
                    ? 'When new candidates are added in Scholars or sign up in the portal, they will automatically appear here in real time.'
                    : 'No candidate matches your current search criteria.'
                  }
                </p>
                {candidates.length === 0 ? (
                  <Link
                    to="/admin/users/new"
                    className="mt-5 inline-block px-6 py-2.5 rounded-full bg-[#A51C30] text-white text-xs font-black uppercase tracking-wider shadow-md hover:bg-[#7F1D1D] transition-colors"
                  >
                    + Create First Candidate
                  </Link>
                ) : (
                  <button 
                    onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
                    className="mt-4 px-6 py-2 rounded-full bg-[#A51C30] text-white text-xs font-bold"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCandidates.map((candidate) => {
                  return (
                    <div
                      key={candidate.id}
                      className="bg-white rounded-3xl p-6 border border-slate-100/90 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Top Card Row: Avatar & Status Badge */}
                        <div className="flex items-start justify-between gap-4">
                          {/* Real Avatar with Verified Check Badge */}
                          <div className="relative">
                            <img
                              src={candidate.avatar_url}
                              alt={candidate.full_name}
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.full_name)}&background=A51C30&color=fff&bold=true`;
                              }}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-sm bg-slate-50"
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm text-[10px] font-bold">
                              ✓
                            </div>
                          </div>

                          {/* Status Pill Badge (Always COMPLETED) */}
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              COMPLETED
                            </span>
                          </div>
                        </div>

                        {/* Real Candidate Information */}
                        <div className="mt-4">
                          <h3 className="text-base font-black text-slate-900 uppercase font-serif tracking-tight truncate group-hover:text-[#A51C30] transition-colors">
                            {candidate.full_name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 truncate">
                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            <span className="truncate">{candidate.email}</span>
                          </div>
                          {candidate.phone && candidate.phone !== 'Not provided' && (
                            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                              📞 {candidate.phone}
                            </div>
                          )}
                        </div>

                        {/* Progress Section (Always 12/12 Delivered • PC verified - 100%) */}
                        <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-100/90 mt-5">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-bold text-slate-700">
                              12/12 Delivered • PC verified
                            </span>
                            <span className="font-black text-emerald-600 font-mono">
                              100%
                            </span>
                          </div>

                          {/* Gradient Progress Bar (100% full) */}
                          <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-700"
                              style={{ 
                                width: '100%',
                                background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #10b981 100%)'
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => setSelectedCandidateId(candidate.id)}
                        className="w-full mt-5 bg-[#0f172a] hover:bg-[#A51C30] text-white text-xs font-black uppercase tracking-widest py-3.5 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-[#A51C30]/20 active:scale-98"
                      >
                        <span>VIEW LIVE STEPPER</span>
                        <span className="font-mono text-sm">›</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ServiceDelivery;
