"use client";

import { useState } from 'react';
import { useBrew } from '@/lib/BrewContext';
import { X, Trash2, Plus, Building2 } from 'lucide-react';

export default function SupplierManagerModal({ onClose }: { onClose: () => void }) {
  const { suppliers, addSupplier, deleteSupplier } = useBrew();
  const [newSupplier, setNewSupplier] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSupplier.trim()) {
      addSupplier(newSupplier.trim());
      setNewSupplier('');
    }
  };

  const handleDelete = (name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This won't remove them from existing inventory items.`)) {
      deleteSupplier(name);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-panel border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-brand-amber" />
            <h2 className="text-xl font-black text-white">Manage Suppliers</h2>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Supplier Form */}
        <div className="p-6 border-b border-white/5">
          <form onSubmit={handleAdd} className="flex gap-3">
            <input 
              type="text" 
              placeholder="Enter new supplier name..." 
              value={newSupplier}
              onChange={e => setNewSupplier(e.target.value)}
              className="flex-1 bg-bg-dark border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-amber/50 transition-colors"
            />
            <button 
              type="submit"
              disabled={!newSupplier.trim()}
              className="px-4 py-2.5 bg-brand-amber text-black rounded-xl font-bold hover:bg-brand-amber-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add
            </button>
          </form>
        </div>

        {/* Supplier List */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-2">
            {suppliers.map(supplier => (
              <div key={supplier} className="flex items-center justify-between p-3 rounded-xl bg-bg-dark border border-white/5 group hover:border-white/10 transition-colors">
                <span className="font-bold text-white">{supplier}</span>
                <button 
                  onClick={() => handleDelete(supplier)}
                  className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Supplier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {suppliers.length === 0 && (
              <p className="text-text-muted text-center py-4">No suppliers added yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
