import React from 'react';

export function Header({ activeTab, setActiveTab }) {
  return (
    <header className="border-b border-[#eeebe2] bg-[#fbfaf8]">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-xl tracking-tight font-medium text-[#1c1917]">
            The Date Crew
          </span>
          <span className="text-xs text-stone-400 font-sans">Matchmaker Review</span>
        </div>

        <nav className="flex items-center gap-6 text-sm">
          <button
            onClick={() => setActiveTab('review')}
            className={`transition-colors pb-0.5 ${
              activeTab === 'review'
                ? 'text-[#1c1917] font-medium border-b border-[#1c1917]'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            Review Candidates
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`transition-colors pb-0.5 ${
              activeTab === 'feedback'
                ? 'text-[#1c1917] font-medium border-b border-[#1c1917]'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            Log Client Feedback
          </button>
        </nav>
      </div>
    </header>
  );
}
