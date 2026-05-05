import { MOCK_BATCHES, MOCK_RECIPES, BatchStage, Batch } from '@/lib/mockData';
import { KanbanSquare, Thermometer, Droplets, Calendar, ChevronRight } from 'lucide-react';

const STAGES: BatchStage[] = [
  'Preparation',
  'Mashing',
  'Boiling',
  'Fermentation',
  'Conditioning',
  'Packaged',
];

export default function BatchTrackerPage() {
  // Helper to get recipe name
  const getRecipeName = (recipeId: string) => {
    return MOCK_RECIPES.find(r => r.id === recipeId)?.name || 'Unknown Recipe';
  };

  return (
    <div className="p-8 font-sans h-full flex flex-col max-w-[1600px] mx-auto">
      <header className="mb-10 flex-shrink-0">
        <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <KanbanSquare className="w-8 h-8 text-brand-amber" />
          Batch Tracker
        </h1>
        <p className="text-text-secondary mt-2">Monitor brewing stages across all active and past batches.</p>
      </header>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {STAGES.map((stage, index) => {
            const stageBatches = MOCK_BATCHES.filter(b => b.stage === stage);
            
            return (
              <div key={stage} className="w-80 flex flex-col bg-bg-panel/50 rounded-2xl border border-white/5 h-full overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-bg-panel flex items-center justify-between shadow-sm">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-white/10 text-xs flex items-center justify-center text-text-muted">
                      {index + 1}
                    </span>
                    {stage}
                  </h3>
                  <span className="text-xs font-bold px-2 py-1 bg-white/5 rounded-lg text-text-muted">
                    {stageBatches.length}
                  </span>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                  {stageBatches.map(batch => (
                    <div 
                      key={batch.id} 
                      className="bg-bg-dark border border-white/10 p-4 rounded-xl shadow-lg hover:border-brand-amber/50 transition-all duration-200 cursor-grab active:cursor-grabbing group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-black text-brand-amber tracking-wide">{batch.batchNumber}</span>
                        <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <h4 className="font-bold text-white mb-4">{getRecipeName(batch.recipeId)}</h4>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Calendar className="w-4 h-4 text-text-muted" />
                          <span>{batch.startDate}</span>
                        </div>
                        
                        {batch.temperature !== undefined && (
                          <div className="flex items-center gap-2 text-text-secondary">
                            <Thermometer className="w-4 h-4 text-text-muted" />
                            <span>{batch.temperature}°C</span>
                          </div>
                        )}
                        
                        {batch.specificGravity !== undefined && (
                          <div className="flex items-center gap-2 text-text-secondary">
                            <Droplets className="w-4 h-4 text-brand-amber/70" />
                            <span>SG: {batch.specificGravity.toFixed(3)}</span>
                          </div>
                        )}
                      </div>

                      {batch.notes && (
                        <div className="mt-4 pt-3 border-t border-white/5 text-xs text-text-muted italic">
                          "{batch.notes}"
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {stageBatches.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-text-muted text-sm font-medium">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
