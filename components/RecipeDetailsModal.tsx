"use client";

import { useState } from 'react';
import { Recipe, RecipeMalt, RecipeHop, RecipeYeast, RecipeMashStep, RecipeVitals, RecipeProcess } from '@/lib/mockData';
import { X, Edit2, Save, Plus, Trash2, Leaf } from 'lucide-react';
import { useBrew } from '@/lib/BrewContext';
import Combobox from '@/components/Combobox';

type Props = {
  recipe: Recipe;
  onClose: () => void;
};

export default function RecipeDetailsModal({ recipe, onClose }: Props) {
  const { updateRecipe, inventory } = useBrew();
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState<Recipe>(recipe);

  const maltOptions = inventory.filter(i => i.category === 'Malt').map(i => ({ id: i.id, label: `${i.name}${i.company ? ` - ${i.company}` : ''}` }));
  const hopOptions = inventory.filter(i => i.category === 'Hops').map(i => ({ id: i.id, label: `${i.name}${i.company ? ` - ${i.company}` : ''}` }));
  const yeastOptions = inventory.filter(i => i.category === 'Yeast').map(i => ({ id: i.id, label: `${i.name}${i.company ? ` - ${i.company}` : ''}` }));

  const handleSave = () => {
    updateRecipe(editedRecipe.id, editedRecipe);
    setIsEditing(false);
  };

  // --- Helpers for Vitals ---
  const updateVitals = (field: keyof RecipeVitals, value: number) => {
    setEditedRecipe(prev => ({
      ...prev,
      vitals: {
        ...(prev.vitals || { originalGravity: 1.050, finalGravity: 1.010, colorEBC: 10, buGuRatio: 0.5 }),
        [field]: value
      }
    }));
  };

  // --- Helpers for Process ---
  const updateProcess = (field: keyof RecipeProcess, value: string | number) => {
    setEditedRecipe(prev => ({
      ...prev,
      process: {
        ...(prev.process || { equipment: 'BrewZilla 65L', efficiency: 80, batchVolume: 120, boilTime: 60, mashWater: 40, spargeWater: 100 }),
        [field]: value
      }
    }));
  };

  // --- Helpers for Malts ---
  const updateMalt = (index: number, field: keyof RecipeMalt, value: string | number) => {
    const newMalts = [...(editedRecipe.malts || [])];
    newMalts[index] = { ...newMalts[index], [field]: value };
    setEditedRecipe({ ...editedRecipe, malts: newMalts });
  };
  const addMalt = () => {
    setEditedRecipe({
      ...editedRecipe,
      malts: [...(editedRecipe.malts || []), { name: '', weight: 0, percentage: 0, colorEBC: 0 }]
    });
  };
  const removeMalt = (index: number) => {
    const newMalts = [...(editedRecipe.malts || [])];
    newMalts.splice(index, 1);
    setEditedRecipe({ ...editedRecipe, malts: newMalts });
  };

  // --- Helpers for Hops ---
  const updateHop = (index: number, field: keyof RecipeHop, value: string | number) => {
    const newHops = [...(editedRecipe.hops || [])];
    newHops[index] = { ...newHops[index], [field]: value };
    setEditedRecipe({ ...editedRecipe, hops: newHops });
  };
  const addHop = () => {
    setEditedRecipe({
      ...editedRecipe,
      hops: [...(editedRecipe.hops || []), { name: '', weight: 0, alphaAcid: 0, use: 'Boil', time: 0, ibu: 0 }]
    });
  };
  const removeHop = (index: number) => {
    const newHops = [...(editedRecipe.hops || [])];
    newHops.splice(index, 1);
    setEditedRecipe({ ...editedRecipe, hops: newHops });
  };

  // --- Helpers for Yeasts ---
  const updateYeast = (index: number, field: keyof RecipeYeast, value: string | number) => {
    const newYeasts = [...(editedRecipe.yeasts || [])];
    newYeasts[index] = { ...newYeasts[index], [field]: value };
    setEditedRecipe({ ...editedRecipe, yeasts: newYeasts });
  };
  const addYeast = () => {
    setEditedRecipe({
      ...editedRecipe,
      yeasts: [...(editedRecipe.yeasts || []), { name: '', weight: 0, attenuation: 75 }]
    });
  };
  const removeYeast = (index: number) => {
    const newYeasts = [...(editedRecipe.yeasts || [])];
    newYeasts.splice(index, 1);
    setEditedRecipe({ ...editedRecipe, yeasts: newYeasts });
  };

  // --- Helpers for Mash ---
  const updateMash = (index: number, field: keyof RecipeMashStep, value: string | number) => {
    const newSteps = [...(editedRecipe.mashSteps || [])];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setEditedRecipe({ ...editedRecipe, mashSteps: newSteps });
  };
  const addMash = () => {
    setEditedRecipe({
      ...editedRecipe,
      mashSteps: [...(editedRecipe.mashSteps || []), { stepName: 'Temperature', temperature: 65, time: 60 }]
    });
  };
  const removeMash = (index: number) => {
    const newSteps = [...(editedRecipe.mashSteps || [])];
    newSteps.splice(index, 1);
    setEditedRecipe({ ...editedRecipe, mashSteps: newSteps });
  };

  const STYLE_OPTIONS = ['Hazy', 'AIPA', 'Lager', 'Stout', 'Sour', 'Mead', 'Fruit', 'Wheat', 'Other'];

  const inputClass = "bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-brand-amber focus:ring-1 focus:ring-brand-amber outline-none transition-all placeholder:text-white/20";
  const smallInputClass = "w-20 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-center text-white focus:border-brand-amber focus:ring-1 focus:ring-brand-amber outline-none transition-all placeholder:text-white/20";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-panel border border-white/10 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
          <div className="flex gap-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-amber/10 text-brand-amber border border-brand-amber/20 rounded-xl font-bold hover:bg-brand-amber hover:text-black transition-colors">
                <Edit2 className="w-4 h-4" /> Edit Details
              </button>
            ) : (
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-xl font-bold hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 font-sans text-center text-white">
          
          {/* Header Info */}
          <div className="mb-10">
            {isEditing ? (
              <div className="flex flex-col items-center gap-4">
                <input 
                  type="text" 
                  value={editedRecipe.name} 
                  onChange={e => setEditedRecipe({...editedRecipe, name: e.target.value})}
                  className={`${inputClass} text-2xl font-black text-center w-full max-w-md`}
                  placeholder="Recipe Name"
                />
                <div className="flex flex-wrap justify-center items-center gap-3">
                  <select 
                    value={editedRecipe.style || ''} 
                    onChange={e => setEditedRecipe({...editedRecipe, style: e.target.value})}
                    className={`${inputClass} text-center appearance-none cursor-pointer`}
                  >
                    <option value="" disabled>Select Style</option>
                    {STYLE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span className="text-text-muted">•</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      step="0.1"
                      value={editedRecipe.targetAbv || ''} 
                      onChange={e => setEditedRecipe({...editedRecipe, targetAbv: parseFloat(e.target.value)})}
                      className={smallInputClass}
                      placeholder="ABV"
                    />
                    <span className="text-text-secondary">% ABV</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-4xl font-black text-white">{editedRecipe.name}</h1>
                <p className="text-brand-amber mt-3 text-lg font-bold flex items-center justify-center gap-3">
                  <span>{editedRecipe.style}</span>
                  <span className="text-white/20">•</span>
                  <span>{editedRecipe.targetAbv}% ABV</span>
                  {editedRecipe.vitals?.originalGravity && (
                    <>
                      <span className="text-white/20">•</span>
                      <span>{editedRecipe.vitals.originalGravity.toFixed(3)} OG</span>
                    </>
                  )}
                </p>
                <p className="text-text-muted mt-4 text-xs tracking-[0.2em] uppercase font-bold">All Grain</p>
              </div>
            )}
          </div>

          {/* Process / Equipment */}
          <div className="mb-10">
            {isEditing ? (
              <div className="max-w-md mx-auto space-y-3 text-left bg-black/20 p-6 rounded-2xl border border-white/5 shadow-inner">
                <p className="font-bold text-white mb-4 text-center border-b border-white/5 pb-2">Process & Equipment</p>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Equipment:</span>
                  <input type="text" value={editedRecipe.process?.equipment || ''} onChange={e => updateProcess('equipment', e.target.value)} className={inputClass} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Efficiency (%):</span>
                  <input type="number" value={editedRecipe.process?.efficiency || ''} onChange={e => updateProcess('efficiency', parseFloat(e.target.value))} className={smallInputClass} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Batch Vol (L):</span>
                  <input type="number" value={editedRecipe.process?.batchVolume || ''} onChange={e => updateProcess('batchVolume', parseFloat(e.target.value))} className={smallInputClass} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Boil Time (min):</span>
                  <input type="number" value={editedRecipe.process?.boilTime || ''} onChange={e => updateProcess('boilTime', parseFloat(e.target.value))} className={smallInputClass} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Mash Water (L):</span>
                  <input type="number" value={editedRecipe.process?.mashWater || ''} onChange={e => updateProcess('mashWater', parseFloat(e.target.value))} className={smallInputClass} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Sparge Water (L):</span>
                  <input type="number" value={editedRecipe.process?.spargeWater || ''} onChange={e => updateProcess('spargeWater', parseFloat(e.target.value))} className={smallInputClass} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Pre-Boil Gravity:</span>
                  <input type="number" step="0.001" value={editedRecipe.process?.preBoilGravity || ''} onChange={e => updateProcess('preBoilGravity', parseFloat(e.target.value))} className={smallInputClass} />
                </div>
              </div>
            ) : editedRecipe.process && (
              <div className="bg-black/20 border border-white/5 rounded-2xl p-6 max-w-md mx-auto">
                <p className="font-black text-white text-lg mb-2">{editedRecipe.process.equipment}</p>
                <div className="grid grid-cols-2 gap-y-2 text-sm text-text-secondary">
                  <p>Efficiency: <span className="font-bold text-white">{editedRecipe.process.efficiency}%</span></p>
                  <p>Batch: <span className="font-bold text-white">{editedRecipe.process.batchVolume} L</span></p>
                  <p>Boil: <span className="font-bold text-white">{editedRecipe.process.boilTime} min</span></p>
                  <p>Mash Water: <span className="font-bold text-white">{editedRecipe.process.mashWater} L</span></p>
                  <p>Sparge: <span className="font-bold text-white">{editedRecipe.process.spargeWater} L</span></p>
                  <p>Total Water: <span className="font-bold text-white">{(editedRecipe.process.mashWater + editedRecipe.process.spargeWater).toFixed(2)} L</span></p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                  {editedRecipe.process.preBoilGravity && (
                    <p className="text-sm text-text-secondary">
                      Pre-Boil Gravity: <span className="font-bold text-brand-amber">{editedRecipe.process.preBoilGravity.toFixed(3)}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Vitals */}
          <div className="mb-10">
            {isEditing ? (
              <div className="max-w-md mx-auto space-y-3 text-left bg-black/20 p-6 rounded-2xl border border-white/5 shadow-inner">
                <p className="font-bold text-white mb-4 text-center border-b border-white/5 pb-2">Vitals</p>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Target OG:</span>
                  <input type="number" step="0.001" value={editedRecipe.vitals?.originalGravity || ''} onChange={e => updateVitals('originalGravity', parseFloat(e.target.value))} className={smallInputClass} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Target FG:</span>
                  <input type="number" step="0.001" value={editedRecipe.vitals?.finalGravity || ''} onChange={e => updateVitals('finalGravity', parseFloat(e.target.value))} className={smallInputClass} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">IBU:</span>
                  <input type="number" value={editedRecipe.ibu || ''} onChange={e => setEditedRecipe({...editedRecipe, ibu: parseInt(e.target.value)})} className={smallInputClass} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">BU/GU:</span>
                  <input type="number" step="0.01" value={editedRecipe.vitals?.buGuRatio || ''} onChange={e => updateVitals('buGuRatio', parseFloat(e.target.value))} className={smallInputClass} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Colour EBC:</span>
                  <input type="number" step="0.1" value={editedRecipe.vitals?.colorEBC || ''} onChange={e => updateVitals('colorEBC', parseFloat(e.target.value))} className={smallInputClass} />
                </div>
              </div>
            ) : editedRecipe.vitals ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-2xl mx-auto">
                <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                  <p className="text-xs font-bold text-text-secondary mb-1">OG</p>
                  <p className="text-xl font-black text-white">{editedRecipe.vitals.originalGravity.toFixed(3)}</p>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                  <p className="text-xs font-bold text-text-secondary mb-1">FG</p>
                  <p className="text-xl font-black text-white">{editedRecipe.vitals.finalGravity.toFixed(3)}</p>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                  <p className="text-xs font-bold text-text-secondary mb-1">IBU</p>
                  <p className="text-xl font-black text-white">{editedRecipe.ibu}</p>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                  <p className="text-xs font-bold text-text-secondary mb-1">BU/GU</p>
                  <p className="text-xl font-black text-white">{editedRecipe.vitals.buGuRatio}</p>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                  <p className="text-xs font-bold text-text-secondary mb-1">EBC</p>
                  <p className="text-xl font-black text-brand-amber">{editedRecipe.vitals.colorEBC}</p>
                </div>
              </div>
            ) : (
              <p className="text-text-muted italic">No vitals defined.</p>
            )}
          </div>

          {/* Mash */}
          <div className="mb-10">
            <h3 className="font-bold text-white text-xl mb-4 border-b border-white/10 pb-2">Mash Steps</h3>
            {isEditing ? (
              <div className="space-y-3 max-w-xl mx-auto text-left">
                {(editedRecipe.mashSteps || []).map((step, idx) => (
                  <div key={idx} className="flex flex-wrap gap-2 items-center bg-black/20 p-3 rounded-xl border border-white/5 text-sm">
                    <select value={step.stepName} onChange={e => updateMash(idx, 'stepName', e.target.value)} className={`${inputClass} flex-1 min-w-[150px] appearance-none cursor-pointer`}>
                      <option value="Protien rest">Protien rest</option>
                      <option value="Temperature">Temperature</option>
                      <option value="Mash out">Mash out</option>
                    </select>
                    <div className="flex items-center gap-1">
                      <input type="number" value={step.temperature || ''} onChange={e => updateMash(idx, 'temperature', parseFloat(e.target.value))} className={smallInputClass} placeholder="°C" /> 
                      <span className="text-xs text-text-muted">°C</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input type="number" value={step.time || ''} onChange={e => updateMash(idx, 'time', parseFloat(e.target.value))} className={smallInputClass} placeholder="min" /> 
                      <span className="text-xs text-text-muted">min</span>
                    </div>
                    <button onClick={() => removeMash(idx)} className="text-red-500 hover:text-red-400 p-2 bg-red-500/10 rounded-lg ml-auto"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={addMash} className="text-brand-amber text-sm flex items-center justify-center gap-2 font-bold mt-4 w-full py-3 bg-brand-amber/5 hover:bg-brand-amber/10 border border-brand-amber/20 rounded-xl transition-colors">
                  <Plus className="w-4 h-4"/> Add Mash Step
                </button>
              </div>
            ) : editedRecipe.mashSteps && editedRecipe.mashSteps.length > 0 ? (
              <div className="max-w-md mx-auto space-y-2">
                {editedRecipe.mashSteps.map((step, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-black/20 border border-white/5 p-4 rounded-xl">
                    <span className="font-bold text-white">{step.stepName}</span>
                    <div className="flex gap-4 text-text-secondary">
                      <span><strong className="text-white">{step.temperature} °C</strong></span>
                      <span><strong className="text-white">{step.time} min</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted italic">No mash steps defined.</p>
            )}
          </div>

          {/* Malts */}
          <div className="mb-10">
            <h3 className="font-bold text-white text-xl mb-4 border-b border-white/10 pb-2">Malts</h3>
            {isEditing ? (
              <div className="space-y-3 max-w-2xl mx-auto text-left">
                {(editedRecipe.malts || []).map((malt, idx) => (
                  <div key={idx} className="flex flex-wrap gap-2 items-center bg-black/20 p-3 rounded-xl border border-white/5 text-sm">
                    <div className="flex items-center gap-1">
                      <input type="number" step="0.01" value={malt.weight || ''} onChange={e => updateMalt(idx, 'weight', parseFloat(e.target.value))} className={smallInputClass} placeholder="kg" /> 
                      <span className="text-xs text-text-muted w-4">kg</span>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <Combobox 
                        options={maltOptions} 
                        value={malt.name} 
                        onChange={(val) => updateMalt(idx, 'name', val)} 
                        placeholder="Select Malt..." 
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <input type="number" step="0.1" value={malt.percentage || ''} onChange={e => updateMalt(idx, 'percentage', parseFloat(e.target.value))} className={smallInputClass} placeholder="%" /> 
                      <span className="text-xs text-text-muted w-3">%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input type="number" step="0.1" value={malt.colorEBC || ''} onChange={e => updateMalt(idx, 'colorEBC', parseFloat(e.target.value))} className={smallInputClass} placeholder="EBC" />
                      <span className="text-xs text-text-muted">EBC</span>
                    </div>
                    <button onClick={() => removeMalt(idx)} className="text-red-500 hover:text-red-400 p-2 bg-red-500/10 rounded-lg ml-auto"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={addMalt} className="text-brand-amber text-sm flex items-center justify-center gap-2 font-bold mt-4 w-full py-3 bg-brand-amber/5 hover:bg-brand-amber/10 border border-brand-amber/20 rounded-xl transition-colors">
                  <Plus className="w-4 h-4"/> Add Malt
                </button>
              </div>
            ) : editedRecipe.malts && editedRecipe.malts.length > 0 ? (
              <div className="max-w-2xl mx-auto space-y-2">
                {editedRecipe.malts.map((malt, idx) => (
                  <div key={idx} className="flex flex-wrap justify-between items-center bg-black/20 border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-4">
                      <span className="font-mono bg-brand-amber/20 text-brand-amber px-3 py-1 rounded-lg font-bold">{malt.weight} kg</span>
                      <span className="text-white font-bold">{malt.name}</span>
                    </div>
                    <div className="flex gap-4 text-text-secondary text-sm">
                      <span>{malt.percentage}%</span>
                      <span>Grain</span>
                      <span>{malt.colorEBC} EBC</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted italic">No malts defined.</p>
            )}
          </div>

          {/* Hops */}
          <div className="mb-10">
            <h3 className="font-bold text-white text-xl mb-4 border-b border-white/10 pb-2">Hops</h3>
            
            {/* Global Dry Hop Setting */}
            {isEditing ? (
              <div className="max-w-3xl mx-auto mb-6 bg-brand-green/10 border border-brand-green/30 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-brand-green flex items-center gap-2">
                    <Leaf className="w-4 h-4" /> Global Dry Hop Schedule
                  </h4>
                  <p className="text-xs text-brand-green/80 mt-1">Which day of fermentation should the dry hop occur? (e.g. Day 10)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Day:</span>
                  <input type="number" value={editedRecipe.process?.dryHopDay || ''} onChange={e => updateProcess('dryHopDay', parseFloat(e.target.value))} className={`${inputClass} w-24 text-center`} placeholder="10" />
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto mb-6 bg-black/20 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                <span className="text-sm font-bold text-text-secondary flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-brand-green" /> Scheduled Dry Hop Day:
                </span>
                <span className={`font-black text-lg ${editedRecipe.process.dryHopDay ? 'text-brand-green' : 'text-text-muted italic'}`}>
                  {editedRecipe.process.dryHopDay ? `Day ${editedRecipe.process.dryHopDay}` : 'Not set'}
                </span>
              </div>
            )}

            {isEditing ? (
              <div className="space-y-3 max-w-3xl mx-auto text-left">
                {(editedRecipe.hops || []).map((hop, idx) => (
                  <div key={idx} className="flex flex-wrap gap-3 items-center bg-black/20 p-3 rounded-xl border border-white/5 text-sm">
                    <div className="flex items-center gap-1">
                      <input type="number" step="0.1" value={hop.weight || ''} onChange={e => updateHop(idx, 'weight', parseFloat(e.target.value))} className={smallInputClass} placeholder="g" /> 
                      <span className="text-xs text-text-muted w-3">g</span>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <Combobox 
                        options={hopOptions} 
                        value={hop.name} 
                        onChange={(val) => updateHop(idx, 'name', val)} 
                        placeholder="Select Hop..." 
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <input type="number" step="0.1" value={hop.alphaAcid || ''} onChange={e => updateHop(idx, 'alphaAcid', parseFloat(e.target.value))} className={smallInputClass} placeholder="AA%" /> 
                      <span className="text-xs text-text-muted w-3">%</span>
                    </div>
                    <select value={hop.use} onChange={e => updateHop(idx, 'use', e.target.value)} className={`${inputClass} px-2`}>
                      <option value="Boil">Boil</option>
                      <option value="Dry Hop">Dry Hop</option>
                      <option value="Whirlpool">Whirlpool</option>
                    </select>
                    <div className="flex items-center gap-1">
                      <input type="number" value={hop.time || ''} onChange={e => updateHop(idx, 'time', parseFloat(e.target.value))} className={smallInputClass} placeholder={hop.use === 'Dry Hop' ? "Day" : "min"} /> 
                      <span className="text-xs text-text-muted w-5">{hop.use === 'Dry Hop' ? 'Day' : 'min'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input type="number" step="0.1" value={hop.ibu || ''} onChange={e => updateHop(idx, 'ibu', parseFloat(e.target.value))} className={smallInputClass} placeholder="IBU" />
                      <span className="text-xs text-text-muted">IBU</span>
                    </div>
                    <button onClick={() => removeHop(idx)} className="text-red-500 hover:text-red-400 p-2 bg-red-500/10 rounded-lg ml-auto"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={addHop} className="text-brand-amber text-sm flex items-center justify-center gap-2 font-bold mt-4 w-full py-3 bg-brand-amber/5 hover:bg-brand-amber/10 border border-brand-amber/20 rounded-xl transition-colors">
                  <Plus className="w-4 h-4"/> Add Hop
                </button>
              </div>
            ) : editedRecipe.hops && editedRecipe.hops.length > 0 ? (
              <div className="max-w-3xl mx-auto space-y-2">
                {editedRecipe.hops.map((hop, idx) => (
                  <div key={idx} className="flex flex-wrap justify-between items-center bg-black/20 border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-4">
                      <span className="font-mono bg-brand-green/20 text-brand-green px-3 py-1 rounded-lg font-bold">{hop.weight} g</span>
                      <span className="text-white font-bold">{hop.name} <span className="text-text-secondary font-normal text-sm">({hop.alphaAcid}%)</span></span>
                    </div>
                    <div className="flex gap-4 items-center text-sm">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${hop.use === 'Dry Hop' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>{hop.use}</span>
                      <span className="text-white font-bold">{hop.time} {hop.use === 'Dry Hop' ? 'Days' : 'min'}</span>
                      <span className="text-text-secondary">{hop.ibu} IBU</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted italic">No hops defined.</p>
            )}
          </div>

          {/* Yeasts */}
          <div className="mb-10">
            <h3 className="font-bold text-white text-xl mb-4 border-b border-white/10 pb-2">Yeasts</h3>
            {isEditing ? (
              <div className="space-y-3 max-w-2xl mx-auto text-left">
                {(editedRecipe.yeasts || []).map((yeast, idx) => (
                  <div key={idx} className="flex flex-wrap gap-3 items-center bg-black/20 p-3 rounded-xl border border-white/5 text-sm">
                    <div className="flex-1 min-w-[150px]">
                      <Combobox 
                        options={yeastOptions} 
                        value={yeast.name} 
                        onChange={(val) => updateYeast(idx, 'name', val)} 
                        placeholder="Select Yeast..." 
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <input type="number" step="0.1" value={yeast.weight || ''} onChange={e => updateYeast(idx, 'weight', parseFloat(e.target.value))} className={smallInputClass} placeholder="Qty" /> 
                      <span className="text-xs text-text-muted w-10">pkgs/g</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input type="number" step="0.1" value={yeast.attenuation || ''} onChange={e => updateYeast(idx, 'attenuation', parseFloat(e.target.value))} className={smallInputClass} placeholder="Atten. %" /> 
                      <span className="text-xs text-text-muted w-3">%</span>
                    </div>
                    <button onClick={() => removeYeast(idx)} className="text-red-500 hover:text-red-400 p-2 bg-red-500/10 rounded-lg ml-auto"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={addYeast} className="text-brand-amber text-sm flex items-center justify-center gap-2 font-bold mt-4 w-full py-3 bg-brand-amber/5 hover:bg-brand-amber/10 border border-brand-amber/20 rounded-xl transition-colors">
                  <Plus className="w-4 h-4"/> Add Yeast
                </button>
              </div>
            ) : editedRecipe.yeasts && editedRecipe.yeasts.length > 0 ? (
              <div className="max-w-2xl mx-auto space-y-2">
                {editedRecipe.yeasts.map((yeast, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-black/20 border border-white/5 p-4 rounded-xl">
                    <span className="text-white font-bold">{yeast.name}</span>
                    <div className="flex gap-4 text-text-secondary text-sm">
                      <span><strong className="text-white">{yeast.weight} pkgs/g</strong></span>
                      <span><strong className="text-white">{yeast.attenuation}%</strong> Attenuation</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted italic">No yeast defined.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
