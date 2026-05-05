"use client";

import { useState, useEffect } from 'react';
import { useBrew } from '@/lib/BrewContext';
import { InventoryItem } from '@/lib/mockData';
import { X } from 'lucide-react';

type Props = {
  item?: InventoryItem | null; // null means "Create mode"
  onClose: () => void;
};

export default function InventoryItemModal({ item, onClose }: Props) {
  const { addInventoryItem, updateInventoryItem, suppliers } = useBrew();

  const [formData, setFormData] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    category: 'Malt',
    quantity: 0,
    unit: 'kg',
    company: '',
    status: 'In Stock'
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        company: item.company || '',
        status: item.status
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item) {
      updateInventoryItem(item.id, formData);
    } else {
      addInventoryItem(formData);
    }
    onClose();
  };

  const isEditing = !!item;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-panel border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
          <div>
            <h2 className="text-xl font-black text-white">{isEditing ? 'Edit Item' : 'Add New Item'}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 space-y-4">
            
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Item Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-amber/50 transition-colors"
                placeholder="e.g. Pale Ale Malt"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-amber/50 transition-colors"
              >
                <option value="Malt">Malt</option>
                <option value="Hops">Hops</option>
                <option value="Yeast">Yeast</option>
                <option value="Packaging">Packaging</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Company / Supplier */}
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Company / Supplier</label>
              <select
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-amber/50 transition-colors"
              >
                <option value="">-- No Supplier --</option>
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
            </div>

            {/* Quantity & Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Quantity</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  required
                  value={formData.quantity}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    let newStatus = formData.status;
                    if (val === 0) newStatus = 'Out of Stock';
                    else if (val < 10) newStatus = 'Low';
                    else newStatus = 'In Stock';

                    setFormData({ ...formData, quantity: val, status: newStatus });
                  }}
                  className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-amber/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Unit</label>
                <input 
                  type="text" 
                  required
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-amber/50 transition-colors"
                  placeholder="e.g. kg, lbs, pkgs"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Status</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-amber/50 transition-colors"
              >
                <option value="In Stock">In Stock</option>
                <option value="Low">Low</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3 mt-auto">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-xl font-bold text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold bg-brand-amber text-black hover:bg-brand-amber-dark transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
