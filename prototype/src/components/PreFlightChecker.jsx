import React, { useState } from 'react';
import { validateCandidateAgainstClient, formatTag } from '../utils/matchingEngine';

export function PreFlightChecker({ clients, candidates, selectedClientId, setSelectedClientId }) {
  const [overrideTarget, setOverrideTarget] = useState(null);
  const [overrideNotes, setOverrideNotes] = useState({});
  const [overrideInput, setOverrideInput] = useState('');
  const [sentList, setSentList] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const client = clients.find((c) => c.id === selectedClientId) || clients[0];

  const handleSend = (candidate, validation) => {
    if (validation.status === 'BLOCKED' && !overrideNotes[candidate.id]) {
      setOverrideTarget(candidate);
      setOverrideInput('');
      return;
    }
    setSentList((prev) => ({ ...prev, [candidate.id]: true }));
  };

  const submitOverride = () => {
    if (!overrideTarget) return;
    setOverrideNotes((prev) => ({
      ...prev,
      [overrideTarget.id]: overrideInput.trim() || 'Approved by matchmaker',
    }));
    setSentList((prev) => ({ ...prev, [overrideTarget.id]: true }));
    setOverrideTarget(null);
  };

  const copyPitch = (candidate, validation) => {
    navigator.clipboard.writeText(validation.pitchDraft.join('\n'));
    setCopiedId(candidate.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Client Context */}
      <div className="pb-6 border-b border-[#eeebe2]">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xs uppercase tracking-wider text-stone-400 font-medium">Client</span>
            <div className="flex gap-2">
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClientId(c.id)}
                  className={`text-sm px-2.5 py-1 rounded transition-colors ${
                    c.id === client.id
                      ? 'bg-[#1b3a2f] text-white font-medium'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-[#f2efe8]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs text-stone-400">
            {client.age} yrs • {client.location} • {client.profession}
          </span>
        </div>

        {/* Quiet, minimal constraints line */}
        <div className="text-xs text-stone-600 space-y-1">
          <div>
            <span className="text-stone-400 font-medium">Non-negotiables:</span>{' '}
            {client.dealbreakers.smoking} • {client.dealbreakers.children} • {client.dealbreakers.locationsAllowed.join(', ')} • {client.dealbreakers.minAge}-{client.dealbreakers.maxAge} yrs
          </div>
          {client.extractedTags && client.extractedTags.length > 0 && (
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-stone-400 font-medium">Notes from feedback:</span>
              <div className="flex flex-wrap gap-1.5">
                {client.extractedTags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-[#f2efe8] text-stone-700 border border-[#e5e1d7]"
                  >
                    {formatTag(t)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Candidate List */}
      <div className="space-y-6">
        {candidates.slice(0, 4).map((candidate) => {
          const validation = validateCandidateAgainstClient(candidate, client);
          const isBlocked = validation.status === 'BLOCKED';
          const isSent = sentList[candidate.id];
          const hasOverride = overrideNotes[candidate.id];

          return (
            <div
              key={candidate.id}
              className="bg-white border border-[#eeebe2] rounded-xl p-6 transition-all hover:border-stone-300 shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 max-w-xl">
                  {/* Name and headline */}
                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#1c1917]">
                      {candidate.name}, <span className="text-stone-500 font-sans text-base">{candidate.age}</span>
                    </h3>
                    <p className="text-xs text-stone-500">
                      {candidate.profession} • {candidate.location}
                    </p>
                  </div>

                  {/* Core Attributes */}
                  <p className="text-xs text-stone-600">
                    {candidate.smoking} • {candidate.children} • {candidate.diet}
                  </p>

                  {/* Short Bio */}
                  <p className="text-xs text-stone-500 italic leading-relaxed">
                    "{candidate.bio}"
                  </p>

                  {/* Clean Status Line - No colorful slop */}
                  <div className="pt-2">
                    {isBlocked ? (
                      <div className="text-xs text-[#991b1b] bg-[#fef2f2] border border-[#fee2e2] px-3 py-2 rounded-lg space-y-0.5">
                        <span className="font-medium">Dealbreaker mismatch:</span>
                        {validation.dealbreakerClashes.map((c, i) => (
                          <div key={i} className="text-stone-700">
                            Candidate is {c.candidateValue.toLowerCase()}, but {client.name.split(' ')[0]} requires {c.clientRule.toLowerCase()}.
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-[#1b3a2f] flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1b3a2f]"></span>
                        All client dealbreakers satisfied
                      </div>
                    )}

                    {hasOverride && (
                      <div className="text-xs text-stone-500 mt-1.5">
                        Override note: "{hasOverride}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-end gap-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => copyPitch(candidate, validation)}
                    className="text-xs text-stone-500 hover:text-stone-800 transition-colors py-1 px-2.5 rounded border border-transparent hover:border-stone-200"
                  >
                    {copiedId === candidate.id ? 'Copied' : 'Copy Pitch'}
                  </button>

                  <button
                    onClick={() => handleSend(candidate, validation)}
                    className={`text-xs px-4 py-2 rounded-full font-medium transition-colors ${
                      isSent
                        ? 'bg-stone-100 text-stone-600'
                        : isBlocked && !hasOverride
                        ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                        : 'bg-[#1b3a2f] text-white hover:bg-[#254f3f]'
                    }`}
                  >
                    {isSent ? 'Queued' : isBlocked && !hasOverride ? 'Override & Send' : 'Send to Client'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clean Override Prompt */}
      {overrideTarget && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 border border-[#eeebe2] shadow-xl space-y-4">
            <div>
              <h4 className="font-serif text-base font-medium text-[#1c1917]">
                Send despite dealbreaker?
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                {overrideTarget.name} clashes with {client.name.split(' ')[0]}'s preferences.
                Please note your rationale for the record.
              </p>
            </div>

            <input
              type="text"
              autoFocus
              value={overrideInput}
              onChange={(e) => setOverrideInput(e.target.value)}
              placeholder="e.g. Candidate confirmed they are quitting smoking"
              className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-[#1b3a2f]"
            />

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setOverrideTarget(null)}
                className="px-3 py-1.5 text-stone-500 hover:text-stone-800"
              >
                Cancel
              </button>
              <button
                onClick={submitOverride}
                className="px-4 py-1.5 bg-[#1b3a2f] text-white rounded-full font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
