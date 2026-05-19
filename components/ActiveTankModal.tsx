"use client";

import { useBrew } from '@/lib/BrewContext';
import { X, Calendar, Activity, Wheat, Leaf, CheckSquare, Square, Snowflake } from 'lucide-react';
import { useMemo } from 'react';

export default function ActiveTankModal({ tankId, onClose }: { tankId: string, onClose: () => void }) {
  const { tanks, recipes, toggleDryHop, coldCrashTank } = useBrew();
  
  const tank = tanks.find(t => t.id === tankId);
  const recipe = recipes.find(r => r.id === tank?.currentRecipeId);

  const handleColdCrash = () => {
    if (confirm('Initiate cold crash for this tank?')) {
      const res = coldCrashTank(tankId);
      if (!res.success) alert(res.message);
      else onClose();
    }
  };

  const daysFermenting = useMemo(() => {
    if (!tank?.startDate) return 0;
    const start = new Date(tank.startDate).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  }, [tank?.startDate]);

  const aggregatedMalts = useMemo(() => {
    if (!recipe?.malts) return [];
    const sums: Record<string, number> = {};
    recipe.malts.forEach(m => {
      sums[m.name] = (sums[m.name] || 0) + (m.weight || 0);
    });
    return Object.entries(sums).map(([name, weight]) => ({ name, weight }));
  }, [recipe?.malts]);

  const aggregatedHops = useMemo(() => {
    if (!recipe?.hops) return [];
    const sums: Record<string, number> = {};
    recipe.hops.forEach(h => {
      sums[h.name] = (sums[h.name] || 0) + (h.weight || 0);
    });
    return Object.entries(sums).map(([name, weight]) => ({ name, weight }));
  }, [recipe?.hops]);

  if (!tank || !recipe || tank.status === 'Empty') return null;

  const dryHops = recipe.hops?.filter(h => h.use === 'Dry Hop') || [];
  const dryHopDaySetting = recipe.process?.dryHopDay || (dryHops.length > 0 ? Math.min(...dryHops.map(h => h.time || 0)) : null);
  const daysUntilDryHop = dryHopDaySetting !== null ? dryHopDaySetting - daysFermenting : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-bg-panel border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${tank.status === 'ColdCrash' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-brand-amber/20 text-brand-amber border-brand-amber/30'}`}>
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">{tank.name} Details</h2>
              <p className={`text-sm font-medium mt-0.5 ${tank.status === 'ColdCrash' ? 'text-blue-400' : 'text-brand-amber'}`}>
                {tank.status === 'ColdCrash' ? 'Cold Crashing' : 'Brewing'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

          {/* Action Buttons */}
          {tank.status === 'Brewing' && (
            <div className="flex justify-between items-center mb-4">
              <div>
                {dryHops.length > 0 && (
                  tank.dryHopCompleted ? (
                    <div className="flex items-center gap-2 text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 font-bold text-sm">
                      <CheckSquare className="w-4 h-4" /> Hopped
                    </div>
                  ) : (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-sm ${
                      daysUntilDryHop !== null && daysUntilDryHop <= 0
                        ? 'text-red-500 bg-red-500/10 border-red-500/30 animate-pulse'
                        : 'text-brand-green bg-brand-green/10 border-brand-green/30'
                    }`}>
                      <Leaf className="w-4 h-4" />
                      Dry Hop Due: {daysUntilDryHop !== null ? `${daysUntilDryHop} day(s)` : 'Not set'}
                    </div>
                  )
                )}
              </div>
              <button
                onClick={handleColdCrash}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl transition-all flex items-center gap-2 font-bold text-sm tracking-wider shadow-lg shadow-blue-500/10 border border-blue-500/30"
              >
                <Snowflake className="w-4 h-4" /> Start Cold Crash
              </button>
            </div>
          )}
          
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Recipe</p>
              <h3 className="text-lg font-bold text-white">{recipe.name}</h3>
              <p className="text-xs text-brand-amber/80 mt-1">{recipe.style}</p>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Current OG</p>
              <h3 className="text-2xl font-black text-white font-mono">{tank.currentOg?.toFixed(3) || 'N/A'}</h3>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Current pH</p>
              <h3 className="text-2xl font-black text-white font-mono">{tank.currentPh?.toFixed(2) || 'N/A'}</h3>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Time Elapsed</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-amber" />
                <h3 className="text-xl font-bold text-white">{daysFermenting} <span className="text-sm font-medium text-text-muted">Days</span></h3>
              </div>
            </div>
          </div>

          {/* Bill of Materials (Aggregated) */}
          {(aggregatedMalts.length > 0 || aggregatedHops.length > 0) && (
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <Wheat className="w-4 h-4 text-brand-amber" />
                Total Ingredients Used
              </h4>
              <div className="bg-black/20 border border-white/5 rounded-xl p-1">
                <ul className="divide-y divide-white/5">
                  {aggregatedMalts.map((malt, i) => (
                    <li key={`malt-${i}`} className="p-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-brand-amber/20 text-brand-amber px-2 py-0.5 rounded font-bold uppercase tracking-wider">Malt</span>
                        <span className="text-sm font-bold text-slate-300">{malt.name}</span>
                      </div>
                      <span className="text-sm font-mono text-white bg-white/10 px-2 py-1 rounded-lg">{malt.weight.toFixed(2)} kg</span>
                    </li>
                  ))}
                  {aggregatedHops.map((hop, i) => (
                    <li key={`hop-${i}`} className="p-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-brand-green/20 text-brand-green px-2 py-0.5 rounded font-bold uppercase tracking-wider">Hop</span>
                        <span className="text-sm font-bold text-slate-300">{hop.name}</span>
                      </div>
                      <span className="text-sm font-mono text-white bg-white/10 px-2 py-1 rounded-lg">{hop.weight.toFixed(2)} g</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Dry Hop Section */}
          {dryHops.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <Leaf className="w-4 h-4 text-brand-green" />
                Dry Hops
              </h4>
              <div className="bg-brand-green/5 border border-brand-green/20 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-brand-green/10 flex justify-between items-center bg-brand-green/10">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-brand-green">Dry Hop Required</span>
                  </div>
                  <button 
                    onClick={() => toggleDryHop(tank.id, !tank.dryHopCompleted)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${tank.dryHopCompleted ? 'bg-brand-green text-white' : 'bg-black/40 text-text-muted hover:text-white'}`}
                  >
                    {tank.dryHopCompleted ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    {tank.dryHopCompleted ? 'Hopped' : 'Mark as Hopped'}
                  </button>
                </div>
                <ul className="divide-y divide-white/5 p-1">
                  {dryHops.map((hop, i) => (
                    <li key={i} className="p-3 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-300">{hop.name}</span>
                        <span className="text-[10px] text-text-muted mt-0.5">{hop.time} days</span>
                      </div>
                      <span className="text-sm font-mono text-white bg-white/10 px-2 py-1 rounded-lg">{hop.weight} g</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
