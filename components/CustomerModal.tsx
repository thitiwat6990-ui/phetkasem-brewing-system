"use client";

import { useState } from 'react';
import { Customer } from '@/lib/mockData';
import { X, Edit2, Save, Plus, Trash2, MapPin } from 'lucide-react';
import { useBrew } from '@/lib/BrewContext';

type Props = {
  onClose: () => void;
};

export default function CustomerModal({ onClose }: Props) {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useBrew();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<Omit<Customer, 'id'>>({ name: '', shopName: '', mapsUrl: '' });

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{type: 'error' | 'success', message: string} | null>(null);

  const handleEditClick = (c: Customer) => {
    setEditingId(c.id);
    setEditForm(c);
    setToast(null);
  };

  const showToast = (type: 'error' | 'success', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name) {
      showToast('error', 'Customer name is required.');
      return;
    }
    
    if (editingId) {
      setIsLoading(true);
      try {
        await updateCustomer(editingId, editForm);
        setEditingId(null);
        showToast('success', 'Customer updated successfully!');
        setTimeout(onClose, 1000); // Auto-close after 1s
      } catch (e: any) {
        showToast('error', 'Failed to update customer: ' + e.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name) {
      showToast('error', 'Customer name is required.');
      return;
    }

    setIsLoading(true);
    try {
      await addCustomer(addForm);
      setIsAdding(false);
      setAddForm({ name: '', shopName: '', mapsUrl: '' });
      showToast('success', 'Customer added successfully!');
      setTimeout(onClose, 1000); // Auto-close after 1s
    } catch (e: any) {
      showToast('error', 'Failed to add customer: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      setIsLoading(true);
      try {
        await deleteCustomer(id);
        showToast('success', 'Customer deleted.');
      } catch (e: any) {
        showToast('error', 'Failed to delete customer.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const inputClass = "w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-brand-amber focus:ring-1 focus:ring-brand-amber outline-none transition-all text-sm";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-panel border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Manage Customers</h2>
            <p className="text-xs text-text-muted mt-1">Add, edit, or remove customer records.</p>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative">
          
          {/* Toast */}
          {toast && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-bold border ${toast.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-brand-green/10 text-brand-green border-brand-green/20'}`}>
              {toast.message}
            </div>
          )}

          {/* Add New Customer */}
          {isAdding ? (
            <form onSubmit={handleAddSubmit} className="bg-brand-amber/5 border border-brand-amber/20 rounded-xl p-4 mb-6">
              <h3 className="text-brand-amber font-bold text-sm uppercase tracking-wider mb-3">Add New Customer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Customer Name *</label>
                  <input type="text" required value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} className={inputClass} placeholder="e.g. Somchai Beer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Shop Name</label>
                  <input type="text" value={addForm.shopName} onChange={e => setAddForm({...addForm, shopName: e.target.value})} className={inputClass} placeholder="e.g. Craft Beer Bar" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-text-secondary mb-1">Google Maps URL</label>
                  <input type="url" value={addForm.mapsUrl} onChange={e => setAddForm({...addForm, mapsUrl: e.target.value})} className={inputClass} placeholder="https://maps.app.goo.gl/..." />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" disabled={isLoading} onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-bold text-text-muted hover:text-white transition-colors disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 text-xs font-bold bg-brand-amber text-black rounded-lg hover:bg-brand-amber-dark transition-colors disabled:opacity-50">
                  {isLoading ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setIsAdding(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-brand-amber/10 text-brand-amber border border-brand-amber/20 rounded-xl font-bold hover:bg-brand-amber hover:text-black transition-all mb-6">
              <Plus className="w-4 h-4" /> Add New Customer
            </button>
          )}

          {/* Customer List */}
          <div className="space-y-3">
            {customers.map(c => (
              <div key={c.id} className="bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {editingId === c.id ? (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className={inputClass} placeholder="Name" />
                    <input type="text" value={editForm.shopName} onChange={e => setEditForm({...editForm, shopName: e.target.value})} className={inputClass} placeholder="Shop Name" />
                    <div className="md:col-span-2">
                      <input type="text" value={editForm.mapsUrl} onChange={e => setEditForm({...editForm, mapsUrl: e.target.value})} className={inputClass} placeholder="Maps URL" />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-lg">{c.name}</h4>
                      {c.shopName && <span className="text-xs font-mono bg-white/10 text-text-secondary px-2 py-0.5 rounded-full">{c.shopName}</span>}
                    </div>
                    {c.mapsUrl && (
                      <a href={c.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-brand-green hover:text-emerald-400">
                        <MapPin className="w-3 h-3" /> View on Maps
                      </a>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 md:w-auto w-full justify-end">
                  {editingId === c.id ? (
                    <>
                      <button disabled={isLoading} onClick={handleSaveEdit} className="p-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/80 transition-colors disabled:opacity-50"><Save className="w-4 h-4" /></button>
                      <button disabled={isLoading} onClick={() => setEditingId(null)} className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"><X className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(c)} className="p-2 text-text-muted hover:text-brand-amber hover:bg-brand-amber/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                      {c.id !== '4' && (
                        <button disabled={isLoading} onClick={() => handleDelete(c.id, c.name)} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            {customers.length === 0 && (
              <p className="text-center text-text-muted text-sm italic py-8">No customers found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
