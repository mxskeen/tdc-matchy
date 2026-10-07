import React, { useState } from 'react';
import { SAMPLE_REJECTION_FEEDBACKS } from '../data/mockData';
import { parseUnstructuredFeedback } from '../utils/matchingEngine';

export function FeedbackParser({ clients, setClients, selectedClientId, setSelectedClientId, setActiveTab }) {
  const client = clients.find((c) => c.id === selectedClientId) || clients[0];
  const [text, setText] = useState(SAMPLE_REJECTION_FEEDBACKS[0].text);
  const [extracted, setExtracted] = useState(null);

  const handleExtract = () => {
    const res = parseUnstructuredFeedback(text);
    setExtracted(res);

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === client.id) {
          const merged = Array.from(new Set([...(c.extractedTags || []), ...res.extractedTags]));
          return { ...c, extractedTags: merged };
        }
        return c;
      })
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-serif text-xl font-medium text-[#1c1917]">
          Log Rejection Feedback
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Paste client email notes. MatchGuard parses new constraints to prevent repeat mismatches.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-stone-400">Client:</span>
        <div className="flex gap-1.5">
          {clients.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedClientId(c.id);
                setExtracted(null);
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                c.id === client.id
                  ? 'bg-[#1b3a2f] text-white font-medium'
                  : 'text-stone-600 hover:text-stone-900 bg-[#f2efe8]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Box */}
      <div className="bg-white border border-[#eeebe2] rounded-xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-500">Email Text</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setText(SAMPLE_REJECTION_FEEDBACKS[0].text);
                setExtracted(null);
              }}
              className="text-stone-400 hover:text-stone-700"
            >
              Sample: Allergy
            </button>
            <span className="text-stone-300">•</span>
            <button
              onClick={() => {
                setText(SAMPLE_REJECTION_FEEDBACKS[1].text);
                setExtracted(null);
              }}
              className="text-stone-400 hover:text-stone-700"
            >
              Sample: Relocation
            </button>
          </div>
        </div>

        <textarea
          rows={5}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setExtracted(null);
          }}
          placeholder="Paste raw email feedback from client..."
          className="w-full text-xs p-3 border border-stone-200 rounded-lg focus:outline-none focus:border-[#1b3a2f] text-stone-800 leading-relaxed"
        />

        <div className="flex justify-end">
          <button
            onClick={handleExtract}
            className="text-xs px-4 py-2 bg-[#1b3a2f] text-white rounded-full font-medium hover:bg-[#254f3f] transition-colors"
          >
            Extract & Update Constraints
          </button>
        </div>
      </div>

      {/* Output */}
      {extracted && (
        <div className="bg-white border border-[#eeebe2] rounded-xl p-5 space-y-3 text-xs shadow-2xs">
          <span className="text-stone-400 uppercase tracking-wider text-[11px] font-medium block">
            Extracted Rules
          </span>

          {extracted.detectedDealbreakers.map((db, i) => (
            <div key={i} className="text-stone-800">
              <span className="font-medium text-stone-900">{db.category}:</span> {db.quote}
            </div>
          ))}

          {extracted.extractedInsights.map((insight, i) => (
            <div key={i} className="text-stone-600">
              • {insight}
            </div>
          ))}

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-stone-500">
            <span>Saved to {client.name}'s profile</span>
            <button
              onClick={() => setActiveTab('review')}
              className="text-[#1b3a2f] font-medium hover:underline"
            >
              View candidates &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
