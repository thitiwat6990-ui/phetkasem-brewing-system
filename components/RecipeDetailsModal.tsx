"use client";

import { useState } from 'react';
import { Recipe, RecipeMalt, RecipeHop, RecipeMashStep, RecipeVitals, RecipeProcess } from '@/lib/mockData';
import { X, Edit2, Save, Plus, Trash2 } from 'lucide-react';
import { useBrew } from '@/lib/BrewContext';

type Props = {
  recipe: Recipe;
  onClose: () => void;
};

export default function RecipeDetailsModal({ recipe, onClose }: Props) {
  const { updateRecipe } = useBrew();
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState<Recipe>(recipe);

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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white text-black rounded-sm w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md font-bold hover:bg-blue-200 transition-colors">
                <Edit2 className="w-4 h-4" /> Edit Details
              </button>
            ) : (
              <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md font-bold hover:bg-green-700 transition-colors">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable. Designed to look like the printout */}
        <div className="p-8 overflow-y-auto flex-1 font-sans text-sm text-center">
          
          {/* Header Info */}
          <div className="mb-8">
            {isEditing ? (
              <input 
                type="text" 
                value={editedRecipe.name} 
                onChange={e => setEditedRecipe({...editedRecipe, name: e.target.value})}
                className="text-2xl font-black text-center border-b-2 border-gray-300 focus:border-black outline-none w-full max-w-sm mb-2"
              />
            ) : (
              <h1 className="text-3xl font-black">{editedRecipe.name}</h1>
            )}
            
            {isEditing ? (
              <div className="flex justify-center items-center gap-2 mt-2">
                <input 
                  type="text" 
                  value={editedRecipe.style} 
                  onChange={e => setEditedRecipe({...editedRecipe, style: e.target.value})}
                  className="text-gray-600 border-b border-gray-300 text-center w-40 outline-none"
                  placeholder="Style"
                />
                <span className="text-gray-400">•</span>
                <input 
                  type="number" 
                  step="0.1"
                  value={editedRecipe.targetAbv} 
                  onChange={e => setEditedRecipe({...editedRecipe, targetAbv: parseFloat(e.target.value)})}
                  className="text-gray-600 border-b border-gray-300 text-center w-16 outline-none"
                  placeholder="ABV %"
                />
                <span className="text-gray-600">%</span>
              </div>
            ) : (
              <p className="text-gray-600 mt-2 text-base">
                {editedRecipe.style} • {editedRecipe.targetAbv}% {editedRecipe.vitals?.originalGravity ? `/ ${editedRecipe.vitals.originalGravity.toFixed(3)} OG` : ''}
              </p>
            )}
            <p className="text-gray-400 mt-4 text-xs tracking-widest uppercase">All Grain</p>
          </div>

          {/* Process / Equipment */}
          <div className="mb-8 text-gray-700">
            {isEditing ? (
              <div className="max-w-xs mx-auto space-y-2 text-left bg-gray-50 p-4 rounded-lg border">
                <p className="font-bold text-black mb-2 text-center">Process & Equipment</p>
                <div className="flex justify-between items-center">
                  <span>Equipment:</span>
                  <input type="text" value={editedRecipe.process?.equipment || ''} onChange={e => updateProcess('equipment', e.target.value)} className="w-32 border p-1 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Efficiency (%):</span>
                  <input type="number" value={editedRecipe.process?.efficiency || 0} onChange={e => updateProcess('efficiency', parseFloat(e.target.value))} className="w-20 border p-1 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Batch Vol (L):</span>
                  <input type="number" value={editedRecipe.process?.batchVolume || 0} onChange={e => updateProcess('batchVolume', parseFloat(e.target.value))} className="w-20 border p-1 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Boil Time (min):</span>
                  <input type="number" value={editedRecipe.process?.boilTime || 0} onChange={e => updateProcess('boilTime', parseFloat(e.target.value))} className="w-20 border p-1 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Mash Water (L):</span>
                  <input type="number" value={editedRecipe.process?.mashWater || 0} onChange={e => updateProcess('mashWater', parseFloat(e.target.value))} className="w-20 border p-1 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Sparge Water (L):</span>
                  <input type="number" value={editedRecipe.process?.spargeWater || 0} onChange={e => updateProcess('spargeWater', parseFloat(e.target.value))} className="w-20 border p-1 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Pre-Boil Gravity:</span>
                  <input type="number" step="0.001" value={editedRecipe.process?.preBoilGravity || 1.000} onChange={e => updateProcess('preBoilGravity', parseFloat(e.target.value))} className="w-20 border p-1 rounded" />
                </div>
              </div>
            ) : editedRecipe.process && (
              <>
                <p className="font-bold text-black text-base mb-1">{editedRecipe.process.equipment}</p>
                <p><span className="font-bold">{editedRecipe.process.efficiency}%</span> efficiency</p>
                <p>Batch Volume: <span className="font-bold">{editedRecipe.process.batchVolume} L</span></p>
                <p>Boil Time: <span className="font-bold">{editedRecipe.process.boilTime} min</span></p>
                
                <div className="mt-4">
                  <p>Mash Water: <span className="font-bold">{editedRecipe.process.mashWater} L</span></p>
                  <p>Sparge Water: <span className="font-bold">{editedRecipe.process.spargeWater} L</span></p>
                  <p>Total Water: <span className="font-bold">{(editedRecipe.process.mashWater + editedRecipe.process.spargeWater).toFixed(2)} L</span></p>
                  {editedRecipe.process.preBoilGravity && (
                    <p>Pre-Boil Gravity: <span className="font-bold">{editedRecipe.process.preBoilGravity.toFixed(3)}</span></p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Vitals */}
          <div className="mb-10 text-gray-700">
            <p className="font-bold text-black mb-2 text-base">Vitals</p>
            {isEditing ? (
              <div className="max-w-xs mx-auto space-y-2 text-left bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                  <span>Target OG:</span>
                  <input type="number" step="0.001" value={editedRecipe.vitals?.originalGravity || 1.000} onChange={e => updateVitals('originalGravity', parseFloat(e.target.value))} className="w-20 border p-1 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Target FG:</span>
                  <input type="number" step="0.001" value={editedRecipe.vitals?.finalGravity || 1.000} onChange={e => updateVitals('finalGravity', parseFloat(e.target.value))} className="w-20 border p-1 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <span>IBU:</span>
                  <input type="number" value={editedRecipe.ibu || 0} onChange={e => setEditedRecipe({...editedRecipe, ibu: parseInt(e.target.value)})} className="w-20 border p-1 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <span>BU/GU:</span>
                  <input type="number" step="0.01" value={editedRecipe.vitals?.buGuRatio || 0} onChange={e => updateVitals('buGuRatio', parseFloat(e.target.value))} className="w-20 border p-1 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Colour EBC:</span>
                  <input type="number" step="0.1" value={editedRecipe.vitals?.colorEBC || 0} onChange={e => updateVitals('colorEBC', parseFloat(e.target.value))} className="w-20 border p-1 rounded" />
                </div>
              </div>
            ) : editedRecipe.vitals ? (
              <>
                <p>Original Gravity: <span className="font-bold">{editedRecipe.vitals.originalGravity.toFixed(3)}</span></p>
                <p>Final Gravity: <span className="font-bold">{editedRecipe.vitals.finalGravity.toFixed(3)}</span></p>
                <p>IBU (Tinseth): <span className="font-bold">{editedRecipe.ibu}</span></p>
                <p>BU/GU: <span className="font-bold">{editedRecipe.vitals.buGuRatio}</span></p>
                <p>Colour: <span className="font-bold">{editedRecipe.vitals.colorEBC} EBC</span> 🍺</p>
              </>
            ) : (
              <p className="text-gray-400 italic">No vitals defined.</p>
            )}
          </div>

          {/* Mash */}
          <div className="mb-10 border-t border-gray-100 pt-8">
            <p className="font-bold text-black mb-3 text-base">Mash Steps</p>
            {isEditing ? (
              <div className="space-y-2 max-w-md mx-auto text-left">
                {(editedRecipe.mashSteps || []).map((step, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded border">
                    <input type="text" value={step.stepName} onChange={e => updateMash(idx, 'stepName', e.target.value)} className="flex-1 border p-1 rounded" placeholder="Step Name (e.g. Temperature)" />
                    <input type="number" value={step.temperature} onChange={e => updateMash(idx, 'temperature', parseFloat(e.target.value))} className="w-16 border p-1 rounded text-center" placeholder="°C" /> <span className="text-xs text-gray-500">°C</span>
                    <input type="number" value={step.time} onChange={e => updateMash(idx, 'time', parseFloat(e.target.value))} className="w-16 border p-1 rounded text-center" placeholder="min" /> <span className="text-xs text-gray-500">min</span>
                    <button onClick={() => removeMash(idx)} className="text-red-500 hover:text-red-700 ml-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={addMash} className="text-blue-600 text-sm flex items-center gap-1 font-bold mt-2"><Plus className="w-4 h-4"/> Add Mash Step</button>
              </div>
            ) : editedRecipe.mashSteps && editedRecipe.mashSteps.length > 0 ? (
              <div className="text-gray-700">
                {editedRecipe.mashSteps.map((step, idx) => (
                  <p key={idx} className="mb-1">{step.stepName} — <span className="font-bold">{step.temperature} °C</span> — <span className="font-bold">{step.time} min</span></p>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No mash steps defined.</p>
            )}
          </div>

          {/* Malts */}
          <div className="mb-10 border-t border-gray-100 pt-8">
            <p className="font-bold text-black mb-3 text-base">Malts</p>
            {isEditing ? (
              <div className="space-y-2 max-w-xl mx-auto text-left">
                {(editedRecipe.malts || []).map((malt, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded border">
                    <input type="number" step="0.01" value={malt.weight} onChange={e => updateMalt(idx, 'weight', parseFloat(e.target.value))} className="w-20 border p-1 rounded text-center" placeholder="kg" /> <span className="text-xs text-gray-500 w-4">kg</span>
                    <input type="text" value={malt.name} onChange={e => updateMalt(idx, 'name', e.target.value)} className="flex-1 border p-1 rounded" placeholder="Malt Name" />
                    <input type="number" step="0.1" value={malt.percentage} onChange={e => updateMalt(idx, 'percentage', parseFloat(e.target.value))} className="w-16 border p-1 rounded text-center" placeholder="%" /> <span className="text-xs text-gray-500 w-4">%</span>
                    <input type="number" step="0.1" value={malt.colorEBC} onChange={e => updateMalt(idx, 'colorEBC', parseFloat(e.target.value))} className="w-16 border p-1 rounded text-center" placeholder="EBC" />
                    <button onClick={() => removeMalt(idx)} className="text-red-500 hover:text-red-700 ml-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={addMalt} className="text-blue-600 text-sm flex items-center gap-1 font-bold mt-2"><Plus className="w-4 h-4"/> Add Malt</button>
              </div>
            ) : editedRecipe.malts && editedRecipe.malts.length > 0 ? (
              <div className="text-gray-700">
                {editedRecipe.malts.map((malt, idx) => (
                  <p key={idx} className="mb-1">
                    <span className="font-bold">{malt.weight} kg</span> ({malt.percentage}%) — {malt.name} — Grain — {malt.colorEBC} EBC
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No malts defined.</p>
            )}
          </div>

          {/* Hops */}
          <div className="mb-10 border-t border-gray-100 pt-8">
            <p className="font-bold text-black mb-3 text-base">Hops</p>
            {isEditing ? (
              <div className="space-y-2 max-w-2xl mx-auto text-left">
                {(editedRecipe.hops || []).map((hop, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded border text-sm">
                    <input type="number" step="0.1" value={hop.weight} onChange={e => updateHop(idx, 'weight', parseFloat(e.target.value))} className="w-16 border p-1 rounded text-center" placeholder="g" /> <span className="text-xs text-gray-500 mr-1">g</span>
                    <input type="text" value={hop.name} onChange={e => updateHop(idx, 'name', e.target.value)} className="flex-1 border p-1 rounded" placeholder="Hop Name" />
                    <input type="number" step="0.1" value={hop.alphaAcid} onChange={e => updateHop(idx, 'alphaAcid', parseFloat(e.target.value))} className="w-16 border p-1 rounded text-center" placeholder="AA%" /> <span className="text-xs text-gray-500">%</span>
                    <select value={hop.use} onChange={e => updateHop(idx, 'use', e.target.value)} className="w-24 border p-1 rounded">
                      <option value="Boil">Boil</option>
                      <option value="Dry Hop">Dry Hop</option>
                      <option value="Whirlpool">Whirlpool</option>
                    </select>
                    <input type="number" value={hop.time} onChange={e => updateHop(idx, 'time', parseFloat(e.target.value))} className="w-16 border p-1 rounded text-center" placeholder="min" /> <span className="text-xs text-gray-500 mr-1">min</span>
                    <input type="number" step="0.1" value={hop.ibu} onChange={e => updateHop(idx, 'ibu', parseFloat(e.target.value))} className="w-16 border p-1 rounded text-center" placeholder="IBU" />
                    <button onClick={() => removeHop(idx)} className="text-red-500 hover:text-red-700 ml-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={addHop} className="text-blue-600 text-sm flex items-center gap-1 font-bold mt-2"><Plus className="w-4 h-4"/> Add Hop</button>
              </div>
            ) : editedRecipe.hops && editedRecipe.hops.length > 0 ? (
              <div className="text-gray-700">
                {editedRecipe.hops.map((hop, idx) => (
                  <p key={idx} className="mb-1">
                    <span className="font-bold">{hop.weight} g</span> ({hop.ibu} IBU) — {hop.name} {hop.alphaAcid}% — <span className="font-bold text-red-600">{hop.use}</span> — <span className="font-bold">{hop.time} min</span>
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No hops defined.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
