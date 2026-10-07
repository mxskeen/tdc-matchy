import React, { useState } from 'react';

export function ImpactSimulator() {
  const [eliminationRate, setEliminationRate] = useState(85);

  const baseShared = 1000;
  const baseAccepted = 310;
  const preventableWaste = 241; // 35% of 690 rejections

  const recoveredProfiles = Math.round(preventableWaste * (eliminationRate / 100));
  const newAccepted = baseAccepted + Math.round(recoveredProfiles * 0.7);
  const newRate = ((newAccepted / baseShared) * 100).toFixed(1);
  const newMeetings = Math.round(newAccepted * (42 / 310));

  return (
    <div className="space-y-4">
      {/* Funnel Table */}
      <div className="bg-white border border-stone-200 rounded-lg p-4">
        <h3 className="font-semibold text-stone-900 text-sm mb-2">
          30-Day Assessment Funnel Data
        </h3>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500 bg-stone-50">
              <th className="py-2 px-3">Stage</th>
              <th className="py-2 px-3">Count</th>
              <th className="py-2 px-3">Step %</th>
              <th className="py-2 px-3">Identified Friction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            <tr>
              <td className="py-2 px-3 font-medium">Profiles shared</td>
              <td className="py-2 px-3 font-mono">1,000</td>
              <td className="py-2 px-3">100%</td>
              <td className="py-2 px-3 text-stone-500">2 hours per client/week manual search</td>
            </tr>
            <tr className="bg-red-50/50">
              <td className="py-2 px-3 font-medium text-red-900">Profiles accepted</td>
              <td className="py-2 px-3 font-mono text-red-900 font-semibold">310</td>
              <td className="py-2 px-3 text-red-900 font-semibold">31.0%</td>
              <td className="py-2 px-3 text-red-800">
                35% of rejections (~241 profiles) failed on stated dealbreakers
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3">Contact details shared</td>
              <td className="py-2 px-3 font-mono">210</td>
              <td className="py-2 px-3">67.7%</td>
              <td className="py-2 px-3 text-stone-500">100 accepted matches lost before phone swap</td>
            </tr>
            <tr>
              <td className="py-2 px-3">Conversations started</td>
              <td className="py-2 px-3 font-mono">150</td>
              <td className="py-2 px-3">71.4%</td>
              <td className="py-2 px-3 text-stone-500">Drop-off after exchanging numbers</td>
            </tr>
            <tr>
              <td className="py-2 px-3">Meetings fixed</td>
              <td className="py-2 px-3 font-mono">75</td>
              <td className="py-2 px-3">50.0%</td>
              <td className="py-2 px-3 text-stone-500">Scheduling friction</td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-medium">Meetings completed</td>
              <td className="py-2 px-3 font-mono">42</td>
              <td className="py-2 px-3">56.0%</td>
              <td className="py-2 px-3 text-stone-500">4.2% total conversion from profiles shared</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Projection Controls & Summary */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-800">
            Preventable Dealbreaker Elimination: {eliminationRate}%
          </span>
          <span className="text-stone-500">
            Recovers ~{recoveredProfiles} bad recommendations / month
          </span>
        </div>

        <input
          type="range"
          min="30"
          max="95"
          value={eliminationRate}
          onChange={(e) => setEliminationRate(Number(e.target.value))}
          className="w-full accent-[#1b3a2f]"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="border border-stone-200 p-3 rounded">
            <span className="text-[11px] text-stone-500 block">Projected Acceptance Rate</span>
            <div className="text-xl font-bold text-[#1b3a2f] mt-0.5">{newRate}%</div>
            <span className="text-[11px] text-stone-400">Baseline: 31.0%</span>
          </div>

          <div className="border border-stone-200 p-3 rounded">
            <span className="text-[11px] text-stone-500 block">Projected Completed Dates</span>
            <div className="text-xl font-bold text-[#1b3a2f] mt-0.5">{newMeetings} / mo</div>
            <span className="text-[11px] text-stone-400">Baseline: 42 / mo</span>
          </div>

          <div className="border border-stone-200 p-3 rounded">
            <span className="text-[11px] text-stone-500 block">Search Time per Client</span>
            <div className="text-xl font-bold text-[#1b3a2f] mt-0.5">~40 mins / wk</div>
            <span className="text-[11px] text-stone-400">Baseline: 2 hours / wk</span>
          </div>
        </div>
      </div>
    </div>
  );
}
