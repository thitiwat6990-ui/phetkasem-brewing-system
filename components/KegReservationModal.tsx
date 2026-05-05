"use client";

import { useState } from 'react';
import { useBrew } from '@/lib/BrewContext';
import { ShoppingCart, X } from 'lucide-react';

export default function KegReservationModal({ 
  kegBatchId, 
  onClose 
}: { 
  kegBatchId: string, 
  onClose: () => void 
}) {
  const { kegBatches, addKegReservation, recipes } = useBrew();
  
  const kegBatch = kegBatches.find(kb => kb.id === kegBatchId);
  const recipe = recipes.find(r => r.id === kegBatch?.recipeId);

  const [customerName, setCustomerName] = useState('');
  const [shopName, setShopName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);

  if (!kegBatch || !recipe) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim() || !shopName.trim()) {
      alert("Customer name and Shop name are required.");
      return;
    }

    if (quantity <= 0 || quantity > kegBatch.availableKegs) {
      alert(`Please enter a valid quantity between 1 and ${kegBatch.availableKegs}.`);
      return;
    }

    const res = addKegReservation(kegBatchId, customerName, shopName, quantity);
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
      <div className="relative bg-bg-panel border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-brand-green/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center shrink-0 border border-brand-green/30">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">Add Reservation</h2>
              <p className="text-sm font-medium text-brand-green mt-0.5">{recipe.name} ({kegBatch.batchNumber})</p>
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
          <form id="reservation-form" onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Customer Name</label>
              <input 
                type="text" 
                required 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Somchai"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 focus:bg-black/50 focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all font-medium text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Shop Name</label>
              <input 
                type="text" 
                required 
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Craft Beer Bar BKK"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 focus:bg-black/50 focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all font-medium text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Quantity (Kegs)</label>
              <div className="relative">
                <input 
                  type="number" 
                  required 
                  min="1"
                  max={kegBatch.availableKegs}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="w-full pl-4 pr-16 py-3 rounded-xl border border-white/10 bg-black/30 focus:bg-black/50 focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all font-bold text-white"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">
                  / {kegBatch.availableKegs} left
                </div>
              </div>
            </div>

            <div className="bg-brand-green/5 rounded-xl p-4 flex justify-between items-center border border-brand-green/10">
              <span className="text-sm font-bold text-text-muted uppercase tracking-wider">Total Price:</span>
              <span className="text-xl font-black text-brand-green">฿ {(quantity * kegBatch.pricePerKeg).toLocaleString()}</span>
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
            form="reservation-form"
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-brand-green hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Reserve Kegs
          </button>
        </div>
      </div>
    </div>
  );
}
