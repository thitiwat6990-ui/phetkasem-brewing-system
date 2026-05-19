"use client";

import { useState } from 'react';
import { useBrew } from '@/lib/BrewContext';
import { Archive, X, Info } from 'lucide-react';

export default function KeggingModal({ tankId, onClose }: { tankId: string, onClose: () => void }) {
  const { tanks, recipes, batches, packageKegs } = useBrew();
  
  const tank = tanks.find(t => t.id === tankId);
  const recipe = recipes.find(r => r.id === tank?.currentRecipeId);
  const batch = batches.find(b => b.id === tank?.currentBatchId);

  const [totalKegs, setTotalKegs] = useState<number | ''>('');
  const [litersPerKeg, setLitersPerKeg] = useState<number | ''>('');
  const [pricePerKeg, setPricePerKeg] = useState<number | ''>('');
  const [shippingCost, setShippingCost] = useState<number | ''>('');
  const [fg, setFg] = useState<number | ''>('');

  if (!tank || !recipe || !batch) return null;

  const og = tank.currentOg || recipe.vitals?.originalGravity || 1.050;
  const abv = typeof fg === 'number' && fg > 0 ? (og - fg) * 131.25 : 0;

  const handlePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalKegs === '' || litersPerKeg === '' || pricePerKeg === '' || shippingCost === '' || fg === '') {
      alert("Please enter valid positive numbers for all fields.");
      return;
    }

    const res = packageKegs(tankId, totalKegs as number, litersPerKeg as number, pricePerKeg as number, shippingCost as number, fg as number);
    if (res.success) {
      onClose();
    } else {
      alert(res.message);
    }
  };

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
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">Package Kegs</h2>
              <p className="text-sm font-medium text-blue-400 mt-0.5">{tank.name} - {recipe.name}</p>
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
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-6 flex gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="text-sm text-blue-200">
                You are about to package <strong className="text-white">{batch.batchNumber}</strong>. 
                The estimated batch volume was <strong className="text-white">{recipe.process?.batchVolume}L</strong>.
                Fill out the keg details below to add them to your Keg Stock.
              </p>
            </div>
          </div>

          <form id="kegging-form" onSubmit={handlePackage} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Total Kegs</label>
                <div className="relative">
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={totalKegs}
                    onChange={(e) => setTotalKegs(e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-white/10 bg-black/30 focus:bg-black/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold text-white"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">kegs</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Liters per Keg</label>
                <div className="relative">
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={litersPerKeg}
                    onChange={(e) => setLitersPerKeg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-white/10 bg-black/30 focus:bg-black/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold text-white"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">L</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Price per Keg</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">฿</span>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    value={pricePerKeg}
                    onChange={(e) => setPricePerKeg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-white/10 bg-black/30 focus:bg-black/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Shipping Cost</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">฿</span>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-white/10 bg-black/30 focus:bg-black/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Final Gravity (FG)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    required 
                    step="0.001"
                    value={fg}
                    onChange={(e) => setFg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-white/10 bg-black/30 focus:bg-black/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold text-white"
                    placeholder="e.g. 1.010"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">SG</div>
                </div>
              </div>
            </div>

            <div className="bg-black/20 rounded-xl p-4 grid grid-cols-2 gap-4 border border-white/5">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">Total Packaged Volume:</span>
                <span className="text-xl font-black text-blue-400">{(totalKegs as number) * (litersPerKeg as number) || 0} L</span>
              </div>
              <div className="flex flex-col border-l border-white/10 pl-4">
                <span className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">Estimated ABV:</span>
                <span className="text-xl font-black text-brand-green">{abv.toFixed(2)}%</span>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-black/20 flex justify-end gap-3 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="kegging-form"
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all flex items-center gap-2"
          >
            <Archive className="w-5 h-5" />
            Complete Packaging
          </button>
        </div>
      </div>
    </div>
  );
}
