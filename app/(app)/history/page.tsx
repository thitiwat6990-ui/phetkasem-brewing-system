"use client";

import { useBrew } from '@/lib/BrewContext';
import { Clock, Activity, User, Info } from 'lucide-react';

export default function HistoryPage() {
  const { logs } = useBrew();

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Clock className="w-8 h-8 text-brand-amber" />
          System Log History
        </h1>
        <p className="text-text-secondary mt-2">Track all actions performed within the brewery system.</p>
      </header>

      <div className="bg-bg-panel border border-white/5 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 border-b border-white/5">
                <th className="p-4 font-bold text-text-secondary uppercase tracking-wider text-sm w-48">Timestamp</th>
                <th className="p-4 font-bold text-text-secondary uppercase tracking-wider text-sm w-32">User</th>
                <th className="p-4 font-bold text-text-secondary uppercase tracking-wider text-sm w-48">Action</th>
                <th className="p-4 font-bold text-text-secondary uppercase tracking-wider text-sm">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-muted font-semibold">
                    No history logs found. Start interacting with the system to generate logs.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-text-muted font-mono text-sm">
                        <Clock className="w-4 h-4 text-brand-amber/50" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <User className="w-4 h-4 text-brand-green" />
                        {log.user}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-brand-amber uppercase tracking-wider">
                        <Activity className="w-3 h-3" />
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-text-muted">
                        <Info className="w-4 h-4 text-brand-amber/50 shrink-0" />
                        <span className="group-hover:text-white transition-colors">{log.details}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}