"use client";

import { useState, useMemo } from 'react';
import { useBrew } from '@/lib/BrewContext';
import {
  Archive, DollarSign, TrendingUp, ShoppingCart, Calendar,
  Filter, Users, Truck, CheckCircle, Clock
} from 'lucide-react';
import { useLanguage } from '@/lib/i18nContext';
import KegReservationModal from '@/components/KegReservationModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from 'recharts';

export default function KegStockPage() {
  const { kegBatches, recipes } = useBrew();
  const { t } = useLanguage();
  const [selectedKegBatchId, setSelectedKegBatchId] = useState<string | null>(null);

  // States ใหม่สำหรับฟีเจอร์ที่เพิ่มเข้ามา
  const [selectedStyle, setSelectedStyle] = useState<string>('All');
  // สมมติว่า context ยังไม่มีระบบเก็บ status แยก เลยใช้ local state เก็บสถานะชั่วคราว (อ้างอิงจาก res.id หรือ index)
  const [orderStatuses, setOrderStatuses] = useState<Record<string, string>>({});

  const getRecipe = (id?: string) => recipes.find(r => r.id === id);
  const getRecipeName = (id?: string) => getRecipe(id)?.name || 'Unknown Recipe';

  // 1. Metrics & Charts Data (เดิม)
  const totalKegsSold = useMemo(() => {
    return kegBatches.reduce((total, batch) => {
      const soldInBatch = batch.reservations.reduce((sum, res) => sum + res.quantity, 0);
      return total + soldInBatch;
    }, 0);
  }, [kegBatches]);

  const totalRevenue = useMemo(() => {
    return kegBatches.reduce((total, batch) => {
      const soldInBatch = batch.reservations.reduce((sum, res) => sum + res.quantity, 0);
      return total + (soldInBatch * batch.pricePerKeg);
    }, 0);
  }, [kegBatches]);

  const activeKegBatchesCount = kegBatches.filter(kb => kb.availableKegs > 0).length;

  const salesByRecipeData = useMemo(() => {
    const counts: Record<string, number> = {};
    kegBatches.forEach(batch => {
      const sold = batch.reservations.reduce((sum, res) => sum + res.quantity, 0);
      counts[batch.recipeId] = (counts[batch.recipeId] || 0) + sold;
    });

    return Object.entries(counts)
      .map(([recipeId, count]) => ({
        name: getRecipeName(recipeId),
        sold: count
      }))
      .filter(item => item.sold > 0)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [kegBatches, recipes]);

  const CHART_COLORS = ['#10B981', '#3B82F6', '#FFBF00', '#F97316', '#8B5CF6'];

  // 2. ฟิลเตอร์ Style สำหรับ Current Keg Stock
  const uniqueStyles = useMemo(() => {
    const styles = new Set<string>();
    kegBatches.forEach(kb => {
      const style = getRecipe(kb.recipeId)?.style || 'Uncategorized';
      styles.add(style);
    });
    return ['All', ...Array.from(styles)];
  }, [kegBatches, recipes]);

  const filteredKegBatches = useMemo(() => {
    if (selectedStyle === 'All') return kegBatches;
    return kegBatches.filter(kb => {
      const style = getRecipe(kb.recipeId)?.style || 'Uncategorized';
      return style === selectedStyle;
    });
  }, [kegBatches, recipes, selectedStyle]);

  // 3. รวบรวมข้อมูล Reservations ทั้งหมดเพื่อนำมาทำ Order Tracking และ Customer Summary
  const allOrders = useMemo(() => {
    const orders: any[] = [];
    kegBatches.forEach(batch => {
      batch.reservations.forEach((res, index) => {
        // สร้าง unique key เผื่อว่า res ไม่มี id มาให้
        const resKey = res.id || `${batch.id}-res-${index}`;
        orders.push({
          ...res,
          resKey,
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          recipeName: getRecipeName(batch.recipeId),
          pricePerKeg: batch.pricePerKeg,
          totalPrice: res.quantity * batch.pricePerKeg,
        });
      });
    });
    // เรียงอันดับจากล่าสุด (สมมติให้อยู่ท้ายสุด หรือสลับตามสะดวก)
    return orders.reverse();
  }, [kegBatches, recipes]);

  // 4. สรุปยอดตามลูกค้า (Customer Analytics)
  const customerSummaries = useMemo(() => {
    const summaries: Record<string, { totalKegs: number, totalRevenue: number }> = {};

    allOrders.forEach(order => {
      const customerName = order.customerName || 'ลูกค้าทั่วไป (ไม่ระบุชื่อ)';
      if (!summaries[customerName]) {
        summaries[customerName] = { totalKegs: 0, totalRevenue: 0 };
      }
      summaries[customerName].totalKegs += order.quantity;
      summaries[customerName].totalRevenue += order.totalPrice;
    });

    return Object.entries(summaries)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue); // เรียงตามยอดเงินสูงสุด
  }, [allOrders]);

  // ตัวจัดการเปลี่ยนสถานะ
  const handleStatusChange = (resKey: string, newStatus: string) => {
    setOrderStatuses(prev => ({ ...prev, [resKey]: newStatus }));
    // TODO: ถ้ามี API/Context Function ให้เรียกใช้งานตรงนี้ เช่น updateReservationStatus(resId, newStatus)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'รอชำระ': return 'text-brand-amber bg-brand-amber/10 border-brand-amber/20';
      case 'ชำระแล้ว': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'รอส่งสินค้า': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'ส่งแล้ว': return 'text-brand-green bg-brand-green/10 border-brand-green/20';
      default: return 'text-brand-amber bg-brand-amber/10 border-brand-amber/20';
    }
  };

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
          {t('Keg Stock & Sales')}
        </h1>
        <p className="text-text-secondary mt-2">{t('Manage packaged kegs, track reservations, and view sales analytics.')}</p>
      </header>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-bg-panel border border-white/5 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-brand-green/50 transition-colors">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-green/10 rounded-full group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">{t('Total Revenue')}</p>
              <h3 className="text-4xl font-black text-white">฿ {totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-brand-green/20 text-brand-green rounded-xl shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-bg-panel border border-white/5 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">{t('Total Kegs Sold')}</p>
              <h3 className="text-4xl font-black text-white">{totalKegsSold}</h3>
            </div>
            <div className="p-3 bg-blue-500/20 text-blue-500 rounded-xl shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-bg-panel border border-white/5 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-brand-amber/50 transition-colors">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-amber/10 rounded-full group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">{t('Active Keg Batches')}</p>
              <h3 className="text-4xl font-black text-white">{activeKegBatchesCount}</h3>
            </div>
            <div className="p-3 bg-brand-amber/20 text-brand-amber rounded-xl shrink-0">
              <Archive className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

        {/* Top Selling Chart */}
        <div className="lg:col-span-1 bg-bg-panel border border-white/5 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-2">{t('Best Selling Recipes')}</h2>
          <p className="text-sm text-text-muted mb-6">{t('Top recipes by kegs sold.')}</p>

          <div className="h-64">
            {salesByRecipeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByRecipeData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 'bold' }} width={120} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1A1C23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="sold" name="Kegs Sold" radius={[0, 4, 4, 0]} barSize={24}>
                    {salesByRecipeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted text-sm italic">
                No sales data available.
              </div>
            )}
          </div>
        </div>

        {/* Keg Batches Table */}
        <div className="lg:col-span-2 bg-bg-panel border border-white/5 rounded-2xl shadow-lg overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/20">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Archive className="w-5 h-5 text-brand-amber" /> {t('Current Keg Stock')}
            </h2>

            {/* Filter by Style */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-text-muted" />
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-brand-amber focus:border-brand-amber block w-full p-2"
              >
                {uniqueStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 text-xs uppercase tracking-wider text-text-muted font-bold border-b border-white/5">
                  <th className="p-4">Batch / Recipe</th>
                  <th className="p-4">Packaged</th>
                  <th className="p-4">Volume/Price</th>
                  <th className="p-4 text-center">Availability</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredKegBatches.map((kb) => (
                  <tr key={kb.id} className={`hover:bg-white/[0.02] transition-colors ${kb.availableKegs === 0 ? 'opacity-50' : ''}`}>
                    <td className="p-4 align-top">
                      <div className="font-bold text-white">{kb.batchNumber}</div>
                      <div className="text-sm text-text-muted mt-1">{getRecipeName(kb.recipeId)}</div>
                      <div className="text-xs text-brand-amber/70 mt-1">{getRecipe(kb.recipeId)?.style}</div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-1.5 text-sm text-slate-300">
                        <Calendar className="w-4 h-4 text-text-muted" />
                        {kb.datePackaged}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="text-sm font-bold text-white">{kb.litersPerKeg}L / Keg</div>
                      <div className="text-xs text-text-muted mt-1">฿{kb.pricePerKeg.toLocaleString()}</div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex flex-col items-center">
                        <div className="text-2xl font-black text-brand-amber leading-none">
                          {kb.availableKegs}<span className="text-sm text-text-muted font-medium ml-1">/ {kb.totalKegs}</span>
                        </div>
                        {kb.reservations.length > 0 && (
                          <div className="text-[10px] text-brand-green mt-1 font-bold uppercase tracking-wider">
                            {kb.reservations.reduce((sum, r) => sum + r.quantity, 0)} Reserved
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-top text-right">
                      {kb.availableKegs > 0 ? (
                        <button
                          onClick={() => setSelectedKegBatchId(kb.id)}
                          className="px-4 py-2 bg-brand-green/20 text-brand-green hover:bg-brand-green hover:text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 w-full max-w-[140px] ml-auto"
                        >
                          <ShoppingCart className="w-4 h-4" /> Reserve
                        </button>
                      ) : (
                        <span className="inline-block px-4 py-2 bg-white/5 text-text-muted rounded-xl text-sm font-bold uppercase tracking-wider">
                          Sold Out
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredKegBatches.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-text-muted italic">
                      No keg batches matching this style.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- NEW SECTION: Orders & Customers Analytics --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

        {/* Order Tracking Table */}
        <div className="bg-bg-panel border border-white/5 rounded-2xl shadow-lg overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-400" /> Order Tracking (สถานะออเดอร์)
            </h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 text-xs uppercase tracking-wider text-text-muted font-bold border-b border-white/5">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Order Details</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allOrders.map((order) => {
                  const currentStatus = orderStatuses[order.resKey] || order.status || 'รอชำระ';
                  return (
                    <tr key={order.resKey} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{order.customerName || 'ไม่ระบุชื่อ'}</div>
                        <div className="text-xs text-text-muted mt-1">{order.batchNumber}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-white">{order.recipeName}</div>
                        <div className="text-xs text-text-muted mt-1">{order.quantity} Kegs</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-brand-green">฿{order.totalPrice.toLocaleString()}</div>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(order.resKey, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none appearance-none cursor-pointer ${getStatusColor(currentStatus)}`}
                        >
                          <option value="รอชำระ">⏳ รอชำระ</option>
                          <option value="ชำระแล้ว">💸 ชำระแล้ว</option>
                          <option value="รอส่งสินค้า">📦 รอส่งสินค้า</option>
                          <option value="ส่งแล้ว">✅ ส่งแล้ว</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
                {allOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-text-muted italic">
                      No orders to track yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Analytics / Top Customers */}
        <div className="bg-bg-panel border border-white/5 rounded-2xl shadow-lg overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-green" /> Top Customers (สรุปยอดตามร้าน)
            </h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 text-xs uppercase tracking-wider text-text-muted font-bold border-b border-white/5">
                  <th className="p-4">Rank</th>
                  <th className="p-4">Customer / Store</th>
                  <th className="p-4 text-center">Total Kegs</th>
                  <th className="p-4 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customerSummaries.map((customer, index) => (
                  <tr key={customer.name} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-brand-amber/20 text-brand-amber' :
                        index === 1 ? 'bg-slate-300/20 text-slate-300' :
                          index === 2 ? 'bg-amber-700/20 text-amber-600' : 'text-text-muted'
                        }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{customer.name}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 bg-white/5 rounded-lg text-sm font-bold text-white">
                        {customer.totalKegs}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-black text-brand-green">
                        ฿{customer.totalRevenue.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
                {customerSummaries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-text-muted italic">
                      No customer data available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {selectedKegBatchId && (
        <KegReservationModal
          kegBatchId={selectedKegBatchId}
          onClose={() => setSelectedKegBatchId(null)}
        />
      )}
    </div>
  );
}