import React, { useState, useRef, useEffect } from 'react';

const MultiSelectExams = ({ exams, selectedIds, onToggle, label = "Allotted Examinations", readOnly = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(search.toLowerCase())
  );

  const selectedExams = exams.filter(exam => selectedIds.includes(exam.id));

  return (
    <div className="space-y-3" ref={wrapperRef}>
      <label className="text-xs font-black uppercase tracking-[0.2em] ml-1 text-[color:var(--text-light)]">{label}</label>
      <div className="relative">
        <div 
          onClick={() => !readOnly && setIsOpen(!isOpen)}
          className={`w-full border rounded-2xl px-5 py-4 min-h-[60px] transition-all flex flex-wrap gap-2 items-center ${readOnly ? 'cursor-default opacity-80' : 'cursor-pointer hover:border-primary-500/30'} ${isOpen ? 'ring-2 ring-primary-500/50 border-primary-500' : ''}`}
          style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)' }}
        >
          {selectedExams.length === 0 ? (
            <span className="text-slate-400 font-medium">{readOnly ? 'No examinations allotted' : 'Select examinations to allot...'}</span>
          ) : (
            selectedExams.map(exam => (
              <div 
                key={exam.id}
                className={`bg-primary-500/10 border border-primary-500/20 text-primary-600 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 group/tag transition-all ${!readOnly ? 'hover:bg-primary-500/20' : ''}`}
                onClick={(e) => {
                  if (readOnly) return;
                  e.stopPropagation();
                  onToggle(exam.id);
                }}
              >
                {exam.title}
                {!readOnly && <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" className="opacity-50 group-hover/tag:opacity-100 transition-opacity"><path d="M6 18L18 6M6 6l12 12"/></svg>}
              </div>
            ))
          )}
          {!readOnly && (
            <div className="ml-auto text-slate-400">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}><path d="M19 9l-7 7-7-7"/></svg>
            </div>
          )}
        </div>

        {isOpen && !readOnly && (
          <div className="absolute z-[9999] top-full mt-3 w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-slide-up origin-top">
            <div className="p-4 border-b border-slate-50 bg-slate-50/50">
              <div className="relative">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input 
                  type="text"
                  placeholder="Search examinations..."
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar-light">
              {filteredExams.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-bold text-sm">No examinations found</div>
              ) : (
                filteredExams.map(exam => {
                  const isSelected = selectedIds.includes(exam.id);
                  return (
                    <div 
                      key={exam.id}
                      onClick={() => onToggle(exam.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all mb-1 ${isSelected ? 'bg-primary-500/5 text-primary-600' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                      <span className="text-sm font-bold tracking-tight">{exam.title}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'border-slate-200'}`}>
                        {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 13l4 4L19 7"/></svg>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-3 bg-slate-50 flex justify-between gap-3">
               <button 
                type="button"
                onClick={() => {
                  const allIds = exams.map(e => e.id);
                  allIds.forEach(id => {
                    if (!selectedIds.includes(id)) onToggle(id);
                  });
                }}
                className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-primary-500 hover:bg-primary-500/10 rounded-xl transition-all"
               >
                 Select All
               </button>
               <button 
                type="button"
                onClick={() => {
                  selectedIds.forEach(id => onToggle(id));
                }}
                className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
               >
                 Clear All
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectExams;
