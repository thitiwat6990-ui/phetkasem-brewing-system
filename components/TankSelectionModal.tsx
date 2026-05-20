"use client";

import { useState } from 'react';
import { useBrew } from '@/lib/BrewContext';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TankSelectionModal({ tankId, onClose }: { tankId: string, onClose: () => void }) {
  const { inventory, recipes, tanks, startBrew } = useBrew();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [secondTankId, setSecondTankId] = useState<string>('');
  const [error, setError] = useState('');

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);
  
  // Detect if it's a 100L batch
  const is100L = selectedRecipe ? (selectedRecipe.name.includes('100L') || selectedRecipe.process?.batchVolume === 100) : false;
  
  // Get available tanks for second tank selection
  const availableSecondTanks = tanks.filter(t => t.status === 'Empty' && t.id !== tankId);

  // Check if we have enough ingredients for the selected recipe
  const getMissingIngredients = () => {
    if (!selectedRecipe) return [];
    
    const requiredIngredients: { name: string; quantity: number }[] = [];
    selectedRecipe.malts?.forEach(m => requiredIngredients.push({ name: m.name, quantity: m.weight }));
    selectedRecipe.hops?.forEach(h => requiredIngredients.push({ name: h.name, quantity: h.weight }));
    selectedRecipe.yeasts?.forEach(y => requiredIngredients.push({ name: y.name, quantity: y.weight }));

    const missingItems: { name: string; shortBy: number; unit: string }[] = [];
    
    for (const req of requiredIngredients) {
      const invItem = inventory.find(i => i.name.toLowerCase().trim() === req.name.toLowerCase().trim());
      if (!invItem) {
        missingItems.push({ name: req.name, shortBy: req.quantity, unit: 'units' });
      } else if (invItem.quantity < req.quantity) {
        missingItems.push({ name: req.name, shortBy: req.quantity - invItem.quantity, unit: invItem.unit });
      }
    }
    return missingItems;
  };

  const missingItems = getMissingIngredients();

  const handleStart = () => {
    if (!selectedRecipeId || missingItems.length > 0) return;
    if (is100L && !secondTankId) {
      setError('A second tank is required for a 100L batch.');
      return;
    }
    const res = startBrew(tankId, selectedRecipeId, is100L ? secondTankId : undefined);
    if (res.success) {
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-panel border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-2xl font-black text-white">Select Recipe</h2>
            <p className="text-text-muted text-sm mt-1">Assigning to {tankId.toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Recipe List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Available Recipes</h3>
            {recipes.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => { setSelectedRecipeId(recipe.id); setError(''); }}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  selectedRecipeId === recipe.id 
                    ? 'bg-brand-amber/10 border-brand-amber text-white' 
                    : 'bg-bg-dark border-white/5 text-text-secondary hover:border-white/20 hover:text-white'
                }`}
              >
                <div className="font-bold text-lg">{recipe.name}</div>
                <div className="text-xs mt-1 opacity-80">{recipe.style === 'Custom Style' ? 'Hazy' : recipe.style}</div>
              </button>
            ))}
          </div>

          {/* Recipe Details & Ingredients */}
          <div className="flex flex-col gap-6">
            
            {/* Second Tank Selection (Dynamic) */}
            {is100L && (
              <div className="bg-brand-amber/10 border border-brand-amber/20 rounded-xl p-5 shadow-inner">
                <h3 className="text-sm font-bold text-brand-amber uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  100L Batch Detected
                </h3>
                <p className="text-xs text-white/70 mb-4 leading-relaxed">
                  This recipe requires 100L of capacity. Please select an additional available fermenter to distribute the brew.
                </p>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Select Second Tank</label>
                <select 
                  value={secondTankId}
                  onChange={(e) => setSecondTankId(e.target.value)}
                  className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:border-brand-amber outline-none cursor-pointer"
                >
                  <option value="" disabled>-- Choose a tank --</option>
                  {availableSecondTanks.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (50L)</option>
                  ))}
                </select>
                {availableSecondTanks.length === 0 && (
                  <p className="text-red-500 text-xs font-bold mt-2">No other empty tanks available!</p>
                )}
              </div>
            )}

            <div className="bg-bg-dark rounded-xl border border-white/5 p-5 flex-1">
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Ingredients Required</h3>
            
            {selectedRecipe ? (
              <div className="space-y-4">
                {selectedRecipe.ingredients.length === 0 && (
                  <div className="text-text-muted text-sm italic">No ingredients defined for this recipe.</div>
                )}
                {selectedRecipe.ingredients.map(ing => {
                  const invItem = inventory.find(i => i.id === ing.itemId);
                  const isEnough = invItem && invItem.quantity >= ing.quantity;
                  
                  return (
                    <div key={ing.itemId} className="flex items-center justify-between p-3 bg-bg-panel rounded-lg border border-white/5">
                      <div>
                        <div className="font-bold text-white text-sm">{invItem?.name || 'Unknown Item'}</div>
                        <div className="text-xs text-text-muted">Need: {ing.quantity} {invItem?.unit}</div>
                      </div>
                      <div className="flex flex-col items-end">
                        {isEnough ? (
                          <CheckCircle2 className="w-5 h-5 text-brand-green" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div className={`text-[10px] mt-1 font-bold ${isEnough ? 'text-text-muted' : 'text-red-500'}`}>
                          Stock: {invItem?.quantity || 0}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Ingredient Check Warning */}
            {selectedRecipeId && missingItems.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 shadow-inner mb-6">
                <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Insufficient Inventory
                </h3>
                <p className="text-xs text-red-400 mb-3">Not enough stock to brew this recipe. Missing:</p>
                <ul className="space-y-1.5 list-disc list-inside">
                  {missingItems.map((item, idx) => (
                    <li key={idx} className="text-sm text-red-200">
                      <strong className="text-white">{item.name}:</strong> Short by <span className="font-mono text-red-400">{item.shortBy.toFixed(2)} {item.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-semibold whitespace-pre-wrap">
                    {error}
                  </div>
                )}

              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted text-sm pb-10">
                Select a recipe to view required ingredients.
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-text-secondary hover:text-white hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleStart}
            disabled={!selectedRecipeId || missingItems.length > 0 || (is100L && !secondTankId)}
            className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
              !selectedRecipeId || missingItems.length > 0 || (is100L && !secondTankId)
                ? 'bg-white/5 text-text-muted cursor-not-allowed border border-white/5'
                : 'bg-brand-green hover:bg-emerald-500 text-white'
            }`}
          >
            Start Brew
          </button>
        </div>

      </div>
    </div>
  );
}
