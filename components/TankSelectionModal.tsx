"use client";

import { useState } from 'react';
import { useBrew } from '@/lib/BrewContext';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TankSelectionModal({ tankId, onClose }: { tankId: string, onClose: () => void }) {
  const { inventory, recipes, startBrew } = useBrew();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);

  // Check if we have enough ingredients for the selected recipe
  const hasInsufficientIngredients = () => {
    if (!selectedRecipe) return false;
    for (const ing of selectedRecipe.ingredients) {
      const invItem = inventory.find(i => i.id === ing.itemId);
      if (!invItem || invItem.quantity < ing.quantity) {
        return true;
      }
    }
    return false;
  };

  const handleStart = () => {
    if (!selectedRecipeId || hasInsufficientIngredients()) return;
    const res = startBrew(tankId, selectedRecipeId);
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
                <div className="text-xs mt-1 opacity-80">{recipe.style}</div>
              </button>
            ))}
          </div>

          {/* Recipe Details & Ingredients */}
          <div className="bg-bg-dark rounded-xl border border-white/5 p-5">
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

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-semibold whitespace-pre-wrap">
                    {error}
                  </div>
                )}
                {!error && hasInsufficientIngredients() && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-semibold">
                    You do not have enough inventory to brew this recipe.
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

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-text-secondary hover:text-white hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleStart}
            disabled={!selectedRecipeId || hasInsufficientIngredients()}
            className={`px-6 py-2.5 rounded-xl font-bold transition-colors ${
              selectedRecipeId && !hasInsufficientIngredients()
                ? 'bg-brand-amber text-black hover:bg-brand-amber-dark' 
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            Start Brew
          </button>
        </div>

      </div>
    </div>
  );
}
