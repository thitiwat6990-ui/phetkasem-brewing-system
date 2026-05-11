"use client";

import { useState, useMemo } from 'react';
import { useBrew } from '@/lib/BrewContext';
import { useLanguage } from '@/lib/i18nContext';
import { Activity, AlertTriangle, TrendingUp, Plus, Trash2, Calendar, Snowflake, Archive } from 'lucide-react';
import TankSelectionModal from '@/components/TankSelectionModal';
import KeggingModal from '@/components/KeggingModal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { tanks, inventory, batches, recipes, cancelBrew, updateTankOg, coldCrashTank } = useBrew();
  const { t } = useLanguage();
  const [selectedEmptyTankId, setSelectedEmptyTankId] = useState<string | null>(null);
  const [packagingTankId, setPackagingTankId] = useState<string | null>(null);

  // Date Filter State (Default to current month)
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  // Filter batches based on date range
  const filteredBatches = useMemo(() => {
    return batches.filter(b => b.startDate >= startDate && b.startDate <= endDate);
  }, [batches, startDate, endDate]);

  // Computed metrics from context
  const availableTanksCount = tanks.filter(t => t.status === 'Empty').length;
  const batchesThisMonth = filteredBatches.length;
  const totalVolume = filteredBatches.reduce((sum, b) => { 
    const r = recipes.find(rec => rec.id === b.recipeId); 
    return sum + (r?.process?.batchVolume || 0); 
  }, 0);
  const lowInventoryCount = inventory.filter(i => i.status === 'Low' || i.status === 'Out of Stock').length;

  // Group tanks into 4 zones
  const zones = [1, 2, 3, 4].map(zoneId => ({
    id: zoneId,
    tanks: tanks.filter(t => t.zoneId === zoneId)
  }));

  const getRecipeName = (id?: string) => recipes.find(r => r.id === id)?.name || 'Unknown Recipe';

  const handleCancelBrew = (e: React.MouseEvent, tankId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to cancel this brew? The ingredients will be returned to inventory.')) {
      const res = cancelBrew(tankId);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const handleColdCrash = (e: React.MouseEvent, tankId: string) => {
    e.stopPropagation();
    if (confirm('Initiate cold crash for this tank?')) {
      const res = coldCrashTank(tankId);
      if (!res.success) alert(res.message);
    }
  };

  const handleOgChange = (e: React.ChangeEvent<HTMLInputElement>, tankId: string) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      updateTankOg(tankId, val);
    }
  };

  // --- Charts Data Preparation ---

  // Pie Chart: Most Brewed Recipes
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredBatches.forEach(b => {
      counts[b.recipeId] = (counts[b.recipeId] || 0) + 1;
    });
    return Object.entries(counts).map(([recipeId, count]) => ({
      name: getRecipeName(recipeId),
      value: count,
    })).sort((a, b) => b.value - a.value);
  }, [filteredBatches, recipes]);

  const PIE_COLORS = ['#FFBF00', '#F97316', '#3B82F6', '#10B981', '#8B5CF6'];
  const mostBrewed = pieData.length > 0 ? pieData[0] : null;

  // Bar Chart: Target vs Actual OG
  const barData = useMemo(() => {
    return filteredBatches.map(b => {
      const recipe = recipes.find(r => r.id === b.recipeId);
      const targetOg = recipe?.vitals?.originalGravity || 1.050;
      
      // Try to find if this batch is currently in a tank to get live actual OG, otherwise use specificGravity or target as fallback
      const activeTank = tanks.find(t => t.currentBatchId === b.id);
      const actualOg = activeTank?.currentOg || b.specificGravity || targetOg;
      
      return {
        name: b.batchNumber,
        recipeName: recipe?.name || 'Unknown',
        target: targetOg,
        actual: actualOg,
      };
    });
  }, [filteredBatches, recipes, tanks]);


  return (
    <div className="p-8 font-sans max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            {t('Brewery Overview')}
          </h1>
          <p className="text-text-secondary mt-2">{t('Monitor your production zones and fermentor tanks.')}</p>
        </div>
        
        {/* Date Filter */}
        <div className="flex items-center gap-4 relative z-20">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-brand-amber" />
              {t('From Date')}
            </label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-bg-panel border border-white/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber text-sm font-bold text-white w-40 shadow-lg cursor-pointer transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-brand-amber" />
              {t('To Date')}
            </label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-bg-panel border border-white/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber text-sm font-bold text-white w-40 shadow-lg cursor-pointer transition-all"
            />
          </div>
        </div>
      </header>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-bg-panel border border-white/5 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-brand-amber/50 transition-colors">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-amber/10 rounded-full group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">{t('Available Tanks')}</p>
              <h3 className="text-4xl font-black text-white">{availableTanksCount}</h3>
            </div>
            <div className="p-3 bg-brand-amber/20 text-brand-amber rounded-xl shrink-0">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-bg-panel border border-white/5 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-brand-amber/50 transition-colors">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-amber/10 rounded-full group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">{t('Batches Brewed')}</p>
              <h3 className="text-4xl font-black text-white">{batchesThisMonth}</h3>
            </div>
            <div className="p-3 bg-brand-amber/20 text-brand-amber rounded-xl shrink-0">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-bg-panel border border-white/5 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-red-500/50 transition-colors">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">{t('Low Inventory')}</p>
              <h3 className="text-4xl font-black text-white">{lowInventoryCount}</h3>
            </div>
            <div className="p-3 bg-red-500/20 text-red-500 rounded-xl shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-bg-panel border border-white/5 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-brand-green/50 transition-colors">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-green/10 rounded-full group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">{t('Total Production')}</p>
              <h3 className="text-4xl font-black text-white mt-1">{totalVolume} L</h3>
            </div>
            <div className="p-3 bg-brand-green/20 text-brand-green rounded-xl shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Production Zones (4 Boxes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {zones.map(zone => (
          <div key={zone.id} className="bg-bg-panel border border-white/5 rounded-2xl shadow-lg p-6 hover:border-brand-amber/30 transition-colors duration-300">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <div className="bg-brand-amber/10 text-brand-amber px-3 py-1 rounded-lg text-sm uppercase tracking-wider border border-brand-amber/20">
                Zone {zone.id}
              </div>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {zone.tanks.map(tank => (
                <div 
                  key={tank.id} 
                  onClick={() => tank.status === 'Empty' && setSelectedEmptyTankId(tank.id)}
                  className={`relative p-4 rounded-xl border transition-all duration-200 flex flex-col items-center text-center ${
                    tank.status === 'Empty' 
                      ? 'bg-bg-dark border-white/10 hover:border-brand-amber hover:shadow-[0_0_15px_rgba(255,191,0,0.2)] cursor-pointer group' 
                      : tank.status === 'ColdCrash'
                      ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)] cursor-default'
                      : 'bg-brand-amber/5 border-brand-amber/30 cursor-default'
                  }`}
                >
                  <div className="font-black text-lg text-white mb-1">{tank.name}</div>
                  <div className="text-[10px] text-text-muted mb-3">{tank.capacity}L Capacity</div>
                  
                  {tank.status === 'Empty' ? (
                    <div className="mt-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-amber group-hover:text-black transition-colors">
                      <Plus className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="mt-auto w-full relative group/tank">
                      <button 
                        onClick={(e) => handleCancelBrew(e, tank.id)}
                        className="absolute -top-12 -left-2 p-1.5 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-md opacity-0 group-hover/tank:opacity-100 transition-all z-10"
                        title="Cancel Brew"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {tank.status === 'Brewing' && (
                        <button 
                          onClick={(e) => handleColdCrash(e, tank.id)}
                          className="absolute -top-12 -right-2 p-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-md opacity-0 group-hover/tank:opacity-100 transition-all z-10 flex items-center gap-1 font-bold text-[10px] tracking-wider"
                          title="Cold Crash"
                        >
                          <Snowflake className="w-4 h-4" /> CC
                        </button>
                      )}

                      {tank.status === 'ColdCrash' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setPackagingTankId(tank.id); }}
                          className="absolute -top-12 -right-2 p-1.5 bg-brand-green/20 text-brand-green hover:bg-brand-green hover:text-white rounded-md opacity-0 group-hover/tank:opacity-100 transition-all z-10 flex items-center gap-1 font-bold text-[10px] tracking-wider"
                          title="Package to Keg"
                        >
                          <Archive className="w-4 h-4" /> KEG
                        </button>
                      )}
                      
                      <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${tank.status === 'ColdCrash' ? 'text-blue-400' : 'text-brand-amber'}`}>
                        {tank.status === 'ColdCrash' ? 'Cold Crash' : 'Brewing'}
                      </div>
                      <div className="text-sm font-bold text-white truncate px-1 mb-1" title={getRecipeName(tank.currentRecipeId)}>{getRecipeName(tank.currentRecipeId)}</div>
                      
                      <div className="flex justify-between items-center text-xs mt-2 bg-black/20 p-1.5 rounded border border-white/5">
                        <span className="text-text-muted">{tank.startDate || 'Unknown'}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-text-muted">OG:</span>
                          <input 
                            type="number" 
                            step="0.001" 
                            value={tank.currentOg || ''} 
                            onChange={(e) => handleOgChange(e, tank.id)}
                            className={`w-14 bg-transparent border-b text-white text-center focus:outline-none ${tank.status === 'ColdCrash' ? 'border-blue-500/30 focus:border-blue-400' : 'border-white/20 focus:border-brand-amber'}`}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        
        {/* Pie Chart: Recipe Distribution */}
        <div className="bg-bg-panel border border-white/5 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-2">{t('Monthly Brews Summary')}</h2>
          <p className="text-sm text-text-muted mb-6">{t('Distribution of recipes brewed in the selected period.')}</p>
          
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1A1C23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted text-sm italic">
                No batches found in this date range.
              </div>
            )}
          </div>
          
          {mostBrewed && (
            <div className="mt-4 p-4 bg-brand-amber/10 border border-brand-amber/20 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-brand-amber uppercase tracking-wider">{t('Most Brewed')}</p>
                <p className="text-white font-bold mt-1">{mostBrewed.name}</p>
              </div>
              <div className="text-2xl font-black text-brand-amber">{mostBrewed.value} <span className="text-sm font-bold">{t('batches')}</span></div>
            </div>
          )}
        </div>

        {/* Bar Chart: Target vs Actual OG */}
        <div className="bg-bg-panel border border-white/5 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-2">{t('Gravity Accuracy (Target vs Actual OG)')}</h2>
          <p className="text-sm text-text-muted mb-6">{t('Comparing recipe target original gravity against actual reading.')}</p>
          
          <div className="h-64 mt-4">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.3)" 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    domain={['dataMin - 0.010', 'dataMax + 0.010']} 
                    tickFormatter={(val) => val.toFixed(3)}
                    stroke="rgba(255,255,255,0.3)" 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1A1C23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '8px' }}
                    formatter={(value: any) => typeof value === 'number' ? value.toFixed(3) : value}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="target" name="Target OG" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="actual" name="Actual OG" fill="#FFBF00" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted text-sm italic">
                No batches found in this date range.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modals */}
      {selectedEmptyTankId && (
        <TankSelectionModal 
          tankId={selectedEmptyTankId} 
          onClose={() => setSelectedEmptyTankId(null)} 
        />
      )}

      {packagingTankId && (
        <KeggingModal 
          tankId={packagingTankId}
          onClose={() => setPackagingTankId(null)}
        />
      )}
    </div>
  );
}