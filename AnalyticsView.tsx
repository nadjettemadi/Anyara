/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Sale } from '../types';
import { TrendingUp, BarChart3, PieChart, Coins, Percent, ArrowUpRight, DollarSign } from 'lucide-react';

interface AnalyticsViewProps {
  products: Product[];
  sales: Sale[];
}

export default function AnalyticsView({ products, sales }: AnalyticsViewProps) {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [products, sales]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const kpis = analytics?.kpis || {
    totalRevenue: sales.filter(s => s.status === 'Completed').reduce((acc, s) => acc + s.totalAmount, 0),
    totalProfit: sales.filter(s => s.status === 'Completed').reduce((acc, s) => acc + s.totalProfit, 0),
    averageMargin: 15,
    inventoryValue: products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0)
  };

  const categoryBreakdown = analytics?.categoryBreakdown || [];
  const monthlyHistory = analytics?.monthlyHistory || [];
  const counts = analytics?.counts || { totalProducts: products.length, expired: 0, lowStock: 0, outOfStock: 0 };

  // Calculate simulated regular overhead expenses
  const simulatedExpenses = Math.round(kpis.totalRevenue * 0.08) + 15000; // 8% rent/electricity simulation
  const computedNetProfit = Math.max(0, kpis.totalProfit - simulatedExpenses);

  return (
    <div className="space-y-6" id="analytics-view-root">
      
      {/* 3 KPIs Headers Row (Profits, margins, overheads) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Gross Profit */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Bénéfice Brut Estimé</span>
            <span className="text-xl font-bold text-slate-800 font-mono block">
              {kpis.totalProfit.toLocaleString()} DZD
            </span>
          </div>
        </div>

        {/* Average Margin % */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Marge Commerciale Moyenne</span>
            <span className="text-xl font-bold text-slate-800 font-mono block">
              {kpis.averageMargin.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Operating expenses */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-650 text-red-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Charges & Dépenses (Simulé)</span>
            <span className="text-xl font-bold text-red-600 font-mono block">
              {simulatedExpenses.toLocaleString()} DZD
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Marge commerciale et Analyse Category Breakdown [7 cols] */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-emerald-500" />
              Analyse de Rentabilité par Grande Catégorie
            </h3>
            <span className="text-xs text-slate-400 font-medium">Algorithme de Marge ANYARA</span>
          </div>

          <div className="space-y-5">
            {categoryBreakdown.map((cat: any, i: number) => {
              const maxMargin = 100;
              const marginPercentage = Math.min(100, Math.max(0, cat.margin));
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{cat.category}</span>
                    <span className="font-mono text-slate-500">
                      Rev: <strong className="text-slate-800">{cat.revenue.toLocaleString()}</strong> | Marge: <strong className="text-emerald-650 text-emerald-600">{cat.margin.toFixed(1)}%</strong>
                    </span>
                  </div>
                  
                  {/* Progress bar representing profit contribution */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${marginPercentage}%` }}
                      className="bg-emerald-500 rounded-full h-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              );
            })}

            {categoryBreakdown.length === 0 && (
              <p className="text-center text-slate-400 py-6 text-xs">En attente de factures complétées pour ventiler les marges.</p>
            )}
          </div>

          {/* Additional details about the Top Category list requirements */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs font-mono text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Top Catégories (High Margin)</span>
              <p className="text-slate-800 font-semibold mt-1">Entretien-Hygiène et Produits-Frais (marge de ~15-25%)</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Catégorie Alimentaire / Volume</span>
              <p className="text-slate-800 font-semibold mt-1">Alimentation-Générale (~10-15% mais grosse rotation de stock)</p>
            </div>
          </div>
        </div>

        {/* Right column: Net profit analysis / monthly history overview [5 cols] */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                Bénéfice Net Simplifié
              </h3>
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Bénéfice Brut Commercial</span>
                <span className="font-mono text-slate-800 font-semibold">+{kpis.totalProfit.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Simulé Loyer, Salaires & Électricité</span>
                <span className="font-mono text-red-500 font-semibold">-{simulatedExpenses.toLocaleString()} DZD</span>
              </div>
              
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 uppercase">Bénéfice NET Final</span>
                <span className="font-mono text-xl font-extrabold text-emerald-600">
                  {computedNetProfit.toLocaleString()} DZD
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Indice de rotation de stock</span>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl col-span-1">
                <span className="text-[11px] text-slate-400 block font-medium">Alertes de Stock</span>
                <strong className="text-lg font-mono text-slate-800 block mt-0.5">{counts.lowStock}</strong>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl col-span-1">
                <span className="text-[11px] text-slate-400 block font-medium">Articles Épuisés</span>
                <strong className="text-lg font-mono text-slate-800 block mt-0.5">{counts.outOfStock}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
