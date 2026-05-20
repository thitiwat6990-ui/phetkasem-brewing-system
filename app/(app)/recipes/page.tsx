"use client";

import { useState } from 'react';
import { useBrew } from '@/lib/BrewContext';
import { Recipe } from '@/lib/mockData';
import { BookOpen, Plus, Search, Droplets, Gauge, Trash2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18nContext';
import RecipeDetailsModal from '@/components/RecipeDetailsModal';

export default function RecipesPage() {
  const { recipes, addRecipe, deleteRecipe } = useBrew();
  const { t } = useLanguage();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.style.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNew = () => {
    addRecipe({
      name: 'New Recipe',
      style: 'Hazy',
      targetAbv: 5.0,
      ibu: 30,
      ingredients: [],
      vitals: { originalGravity: 1.050, finalGravity: 1.010, colorEBC: 10, buGuRatio: 0.5 },
      process: { equipment: 'BrewZilla 65L', efficiency: 80, batchVolume: 120, boilTime: 60, mashWater: 40, spargeWater: 100, dryHopDay: 10 },
      mashSteps: [],
      malts: [],
      hops: [],
      yeasts: []
    });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // prevent opening the modal
    if (confirm('Are you sure you want to delete this recipe?')) {
      deleteRecipe(id);
    }
  };

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-brand-amber" />
            {t('Recipe Library')}
          </h1>
          <p className="text-text-secondary mt-2">{t('Manage and explore your brewing recipes.')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder={t('Search recipes...')} 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-bg-panel border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-amber/50 transition-colors"
            />
          </div>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-brand-amber text-black px-4 py-2 rounded-xl font-bold hover:bg-brand-amber-dark transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('New Recipe')}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map(recipe => (
          <div 
            key={recipe.id} 
            onClick={() => setSelectedRecipe(recipe)}
            className="bg-bg-panel border border-white/5 rounded-2xl p-6 shadow-lg hover:border-brand-amber/50 transition-all duration-300 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-amber/5 rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold px-3 py-1 bg-white/5 border border-white/10 text-brand-amber rounded-lg uppercase tracking-wider">
                  {recipe.style === 'Custom Style' ? 'Hazy' : recipe.style}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted text-sm font-mono">{recipe.id}</span>
                  <button 
                    onClick={(e) => handleDelete(e, recipe.id)}
                    className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h2 className="text-2xl font-black text-white mb-6 group-hover:text-brand-amber transition-colors">
                {recipe.name}
              </h2>
              
              <div className="flex items-center gap-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-text-secondary">
                  <div className="p-2 bg-brand-amber/10 rounded-lg text-brand-amber">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-muted uppercase">ABV</div>
                    <div className="font-mono text-white font-bold">{recipe.targetAbv}%</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-text-secondary">
                  <div className="p-2 bg-brand-green/10 rounded-lg text-brand-green">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-muted uppercase">IBU</div>
                    <div className="font-mono text-white font-bold">{recipe.ibu}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRecipe && (
        <RecipeDetailsModal 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}
    </div>
  );
}