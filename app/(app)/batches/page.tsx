"use client";

import { useBrew } from '@/lib/BrewContext';
import { KanbanSquare, Calendar } from 'lucide-react';
import { useLanguage } from '@/lib/i18nContext';

export default function BatchTrackerPage() {
  const { t } = useLanguage();
  const { batches, recipes, tanks } = useBrew();

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto h-full flex flex-col">
      <header className="mb-10 flex-shrink-0">
        <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <KanbanSquare className="w-8 h-8 text-brand-amber" />
          {t('Batch Tracker')}
        </h1>
        <p className="text-text-secondary mt-2">{t('Monitor brewing stages across all active and past batches.')}</p>
      </header>

      <div className="flex-1 bg-bg-panel border border-white/5 rounded-2xl shadow-lg overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 text-xs uppercase tracking-wider text-text-muted font-bold border-b border-white/5">
                <th className="p-4">{t('Batch Number')}</th>
                <th className="p-4">{t('Date / Time')}</th>
                <th className="p-4">{t('Recipe Name')}</th>
                <th className="p-4">{t('Style')}</th>
                <th className="p-4 text-center">{t('OG')}</th>
                <th className="p-4 text-center">{t('pH')}</th>
                <th className="p-4 text-center">{t('FG')}</th>
                <th className="p-4 text-right">{t('Tank')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {batches.map(batch => {
                const recipe = recipes.find(r => r.id === batch.recipeId);
                const tank = tanks.find(t => t.currentBatchId === batch.id) || { name: 'N/A', currentOg: undefined };
                
                return (
                  <tr key={batch.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <span className="font-black text-brand-amber tracking-wide">{batch.batchNumber}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-white">
                        <Calendar className="w-4 h-4 text-text-muted" />
                        {batch.startDate}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white">{recipe?.name || 'Unknown Recipe'}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-text-secondary uppercase tracking-wider">{recipe?.style || '-'}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-mono text-white">{(tank as any).currentOg?.toFixed(3) || recipe?.vitals?.originalGravity?.toFixed(3) || '-'}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-mono text-white">{(tank as any).currentPh?.toFixed(2) || '-'}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-mono text-brand-amber">{batch.specificGravity?.toFixed(3) || recipe?.vitals?.finalGravity?.toFixed(3) || '-'}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-white/5 text-text-muted">
                        {tank.name}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {batches.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted italic">
                    {t('No batches found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
