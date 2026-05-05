"use client";

import { useState, useEffect } from 'react';
import { startBrewAction, getBrewDetailsAction } from '@/actions/brew';
import { Beaker, Calendar, Info, Clock, TestTube2, AlertCircle, Loader2, ListOrdered, Users } from 'lucide-react';

export default function TankModal({ tank, materials, recipes, statusColor }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [details, setDetails] = useState<{ingredients: any[], reservations: any[]}>({ ingredients: [], reservations: [] });

  const isEmpty = tank.current_status === 'empty';

  useEffect(() => {
    if (isOpen && !isEmpty && tank.brew_batch_id) {
      setDetailsLoading(true);
      getBrewDetailsAction(tank.brew_batch_id, tank.recipe_id).then(res => {
        if (res.success) {
          setDetails({ ingredients: res.ingredients || [], reservations: res.reservations || [] });
        }
        setDetailsLoading(false);
      });
    }
  }, [isOpen, isEmpty, tank.brew_batch_id, tank.recipe_id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append('tankId', tank.id.toString());
    
    const res = await startBrewAction(formData);
    
    if (!res.success) {
      setError(res.error || 'Failed to start brew');
    } else {
      setIsOpen(false);
    }
    setLoading(false);
  };

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className={`relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all hover:scale-105 active:scale-95 group flex flex-col items-center justify-center p-6 min-h-[160px] ${statusColor}`}
      >
        <div className="absolute top-2 right-2 text-xs font-bold opacity-70">
          T-{tank.position}
        </div>
        
        <Beaker className={`w-12 h-12 mb-3 ${isEmpty ? 'opacity-30' : 'opacity-90 animate-pulse'}`} />
        
        {isEmpty ? (
          <span className="font-semibold tracking-widest text-sm uppercase opacity-50">Empty</span>
        ) : (
          <div className="text-center">
            <h3 className="font-bold text-lg leading-tight">{tank.recipe_name}</h3>
            <div className="text-xs font-medium uppercase tracking-wider mt-1 opacity-80">
              {tank.current_status.replace('_', ' ')} • Day {tank.day}
            </div>
            <div className="text-xs mt-1 opacity-60 font-mono">
              {tank.volume}L / {tank.capacity}L
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950 sticky top-0 z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Beaker className="w-5 h-5 text-amber-500" />
                Tank {tank.zone}-{tank.position} Details
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition">
                ✕
              </button>
            </div>

            <div className="p-6">
              {isEmpty ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Recipe</label>
                    <select name="recipeId" required className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none">
                      <option value="">Select a recipe...</option>
                      {recipes.map((r: any) => (
                        <option key={r.id} value={r.id}>{r.name} ({r.style})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Volume (Liters)</label>
                    <input 
                      type="number" 
                      name="volume" 
                      required 
                      min="1" 
                      max={tank.capacity}
                      defaultValue={tank.capacity}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">Max capacity: {tank.capacity}L</p>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm flex gap-2 items-start">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {loading ? 'Starting Brew...' : 'Start Brew Process'}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <h3 className="text-xl font-bold text-amber-500 mb-1">{tank.recipe_name}</h3>
                    <p className="text-slate-400 text-sm">{tank.recipe_style}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                      <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Info className="w-3 h-3"/> Status</div>
                      <div className="font-semibold capitalize text-lg text-amber-400">{tank.current_status.replace('_', ' ')}</div>
                    </div>
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                      <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Day</div>
                      <div className="font-semibold text-lg">{tank.day} / 14+</div>
                    </div>
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                      <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><TestTube2 className="w-3 h-3"/> Volume</div>
                      <div className="font-semibold text-lg">{tank.volume}L</div>
                    </div>
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                      <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Brewed On</div>
                      <div className="font-semibold text-sm mt-0.5 truncate" title={new Date(tank.brew_date).toLocaleString()}>
                        {new Date(tank.brew_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-2">
                        <ListOrdered className="w-4 h-4 text-slate-400" /> Ingredients Used
                      </h4>
                      {detailsLoading ? (
                        <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-slate-500" /></div>
                      ) : (
                        <ul className="space-y-1 text-sm text-slate-400">
                          {details.ingredients.map((ing, i) => (
                            <li key={i} className="flex justify-between">
                              <span>{ing.name}</span>
                              <span className="font-mono text-slate-300">{(ing.amount_per_liter * tank.volume).toFixed(2)} {ing.unit}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-slate-400" /> Reservations
                      </h4>
                      {detailsLoading ? (
                        <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-slate-500" /></div>
                      ) : details.reservations.length > 0 ? (
                        <ul className="space-y-1 text-sm text-slate-400">
                          {details.reservations.map((res, i) => (
                            <li key={i} className="flex justify-between">
                              <span>{res.customer_name}</span>
                              <span className="font-mono text-amber-500">{res.quantity}L</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-500 italic">No reservations yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
