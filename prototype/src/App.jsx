import React, { useState } from 'react';
import { Header } from './components/Header';
import { PreFlightChecker } from './components/PreFlightChecker';
import { FeedbackParser } from './components/FeedbackParser';
import { INITIAL_CLIENTS, CANDIDATES } from './data/mockData';

export function App() {
  const [activeTab, setActiveTab] = useState('review');
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState('client-1');

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-[#1c1917] flex flex-col font-sans selection:bg-[#1b3a2f] selection:text-white">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        {activeTab === 'review' && (
          <PreFlightChecker
            clients={clients}
            candidates={CANDIDATES}
            selectedClientId={selectedClientId}
            setSelectedClientId={setSelectedClientId}
          />
        )}

        {activeTab === 'feedback' && (
          <FeedbackParser
            clients={clients}
            setClients={setClients}
            selectedClientId={selectedClientId}
            setSelectedClientId={setSelectedClientId}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      <footer className="border-t border-[#eeebe2] py-6 text-xs text-stone-400">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <span>The Date Crew</span>
          <span>Matchmaker Copilot</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
