"use client";

import { useState, useMemo } from 'react';
import { useBrew } from '@/lib/BrewContext';
import { InventoryItem } from '@/lib/mockData';
import { useLanguage } from '@/lib/i18nContext';
import { Database, Plus, Search, Edit2, Trash2, Building2, Filter } from 'lucide-react';
import InventoryItemModal from '@/components/InventoryItemModal';
import SupplierManagerModal from '@/components/SupplierManagerModal';

export default function InventoryPage() {
  const { inventory, deleteInventoryItem, suppliers } = useBrew();
  const { t } = useLanguage();

  // States for Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Input States for Filtering
  const [searchQueryInput, setSearchQueryInput] = useState('');
  const [categoryFilterInput, setCategoryFilterInput] = useState('All');
  const [companyFilterInput, setCompanyFilterInput] = useState('All');

  // Applied States for Filtering (trigger on 'Apply Filters' button)
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');

  const handleApplyFilters = () => {
    setSearchQuery(searchQueryInput);
    setCategoryFilter(categoryFilterInput);
    setCompanyFilter(companyFilterInput);
  };

  // Filter Logic uses Applied States
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      // 1. Text Search (matches name or company)
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.company && item.company.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Category Filter
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

      // 3. Company Filter
      const matchesCompany = companyFilter === 'All' || item.company === companyFilter;

      return matchesSearch && matchesCategory && matchesCompany;
    });
  }, [inventory, searchQuery, categoryFilter, companyFilter]);

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteInventoryItem(id);
    }
  };

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto">
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Database className="w-8 h-8 text-brand-amber" />
              {t('Inventory Management')}
            </h1>
            <p className="text-text-secondary mt-2">{t('Track raw materials and packaging supplies.')}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsSupplierModalOpen(true)}
              className="flex items-center gap-2 bg-white/5 text-white px-4 py-2 rounded-xl font-bold hover:bg-white/10 transition-colors border border-white/10"
            >
              <Building2 className="w-5 h-5" />
              {t('Manage Suppliers')}
            </button>
            <button
              onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-brand-amber text-black px-4 py-2 rounded-xl font-bold hover:bg-brand-amber-dark transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('Add Item')}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-bg-panel border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name or company..."
              value={searchQueryInput}
              onChange={e => setSearchQueryInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleApplyFilters()}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-amber/50 transition-colors"
            />
          </div>

          <select
            value={categoryFilterInput}
            onChange={e => setCategoryFilterInput(e.target.value)}
            className="w-full md:w-auto px-4 py-2.5 bg-bg-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-amber/50 transition-colors"
          >
            <option value="All">All Categories</option>
            <option value="Malt">Malt</option>
            <option value="Hops">Hops</option>
            <option value="Yeast">Yeast</option>
            <option value="Packaging">Packaging</option>
            <option value="Other">Other</option>
          </select>

          <div className="relative w-full md:w-auto">
            <Building2 className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <select
              value={companyFilterInput}
              onChange={e => setCompanyFilterInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-amber/50 transition-colors appearance-none"
            >
              <option value="All">All Suppliers</option>
              {suppliers.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleApplyFilters}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-green/20 text-brand-green border border-brand-green/30 rounded-xl font-bold hover:bg-brand-green/30 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Apply Filters
          </button>
        </div>
      </header>

      <div className="bg-bg-panel border border-white/5 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-black/20 border-b border-white/5">
                <th className="p-4 font-bold text-text-secondary uppercase tracking-wider text-sm">{t('Item Name')}</th>
                <th className="p-4 font-bold text-text-secondary uppercase tracking-wider text-sm">{t('Category')}</th>
                <th className="p-4 font-bold text-text-secondary uppercase tracking-wider text-sm text-right">{t('Quantity')}</th>
                <th className="p-4 font-bold text-text-secondary uppercase tracking-wider text-sm">{t('Unit')}</th>
                <th className="p-4 font-bold text-text-secondary uppercase tracking-wider text-sm">{t('Status')}</th>
                <th className="p-4 font-bold text-text-secondary uppercase tracking-wider text-sm text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted font-semibold">
                    No items found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-white group-hover:text-brand-amber transition-colors">
                        {item.name}
                      </div>
                      {item.company && (
                        <div className="text-xs text-text-muted mt-1 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {item.company}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-text-muted">
                      <span className="bg-white/5 px-3 py-1 rounded-lg border border-white/5 text-xs font-semibold">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-white font-mono text-right font-bold text-lg">
                      {item.quantity.toLocaleString()}
                    </td>
                    <td className="p-4 text-text-muted">
                      {item.unit}
                    </td>
                    <td className="p-4">
                      {item.status === 'In Stock' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-green/20 text-brand-green border border-brand-green/20">
                          In Stock
                        </span>
                      )}
                      {item.status === 'Low' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-amber/20 text-brand-amber border border-brand-amber/20">
                          Low Stock
                        </span>
                      )}
                      {item.status === 'Out of Stock' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-500 border border-red-500/20">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-text-muted hover:text-brand-amber hover:bg-brand-amber/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <InventoryItemModal
          item={selectedItem}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isSupplierModalOpen && (
        <SupplierManagerModal
          onClose={() => setIsSupplierModalOpen(false)}
        />
      )}
    </div>
  );
}