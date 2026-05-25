/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sale } from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Calculator, 
  X, 
  Printer, 
  Search,
  CheckCircle,
  AlertOctagon,
  ChevronDown
} from 'lucide-react';

interface SalesViewProps {
  sales: Sale[];
  refreshData: () => Promise<void>;
}

export default function SalesView({ sales, refreshData }: SalesViewProps) {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Financial KPI calculations
  const completedSales = sales.filter(s => s.status === 'Completed');
  const totalRevenue = completedSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalProfit = completedSales.reduce((acc, s) => acc + s.totalProfit, 0);
  const totalOrders = completedSales.length;
  const averageValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  // Filter and search handling
  const filteredSales = sales.filter(s => {
    const matchesStatus = filterStatus === 'All' || s.status === filterStatus;
    const matchesSearch = 
      s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = async (saleId: string, targetStatus: 'Completed' | 'Pending' | 'Cancelled') => {
    setLoadingAction(saleId);
    try {
      const res = await fetch(`/api/sales/${saleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (!res.ok) {
        throw new Error('Échec du changement de statut de la facture.');
      }

      await refreshData();
      
      // Update local detailed bill modal if open
      if (selectedSale && selectedSale.id === saleId) {
        const updatedSale = await res.json();
        setSelectedSale(updatedSale);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6" id="sales-view-root">
      {/* 4 KPIs Headers (Page 4 specifications) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="sales-kpis-grid">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Revenu</span>
            <span className="text-xl font-bold text-slate-800 font-mono block">
              {totalRevenue.toLocaleString()} DZD
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Bénéfice</span>
            <span className="text-xl font-bold text-slate-800 font-mono block">
              {totalProfit.toLocaleString()} DZD
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Commandes Totales</span>
            <span className="text-xl font-bold text-slate-800 font-mono block">
              {sales.length} <span className="text-xs font-sans text-slate-400 font-normal">({totalOrders} Complétées)</span>
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Valeur Moyenne</span>
            <span className="text-xl font-bold text-slate-800 font-mono block">
              {Math.round(averageValue).toLocaleString()} DZD
            </span>
          </div>
        </div>
      </div>

      {/* Sales Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Filter and Search Bar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher facture, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {['All', 'Completed', 'Pending', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex-1 sm:flex-none py-1.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wide transition border cursor-pointer
                  ${filterStatus === status 
                    ? 'bg-slate-800 border-slate-800 text-white' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
              >
                {status === 'All' ? 'Tous' : status === 'Completed' ? 'Complétée' : status === 'Cancelled' ? 'Annulée' : 'En Attente'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="sales-transactions-table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs font-semibold uppercase">
                <th className="px-6 py-3.5">Numéro Facture</th>
                <th className="px-6 py-3.5">Nom Client</th>
                <th className="px-6 py-3.5">Articles</th>
                <th className="px-6 py-3.5">Montant Total</th>
                <th className="px-6 py-3.5 text-center">Statut</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition duration-150">
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">
                    {sale.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {sale.clientName}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-[13px] text-slate-500">
                    {sale.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-slate-800">
                    {sale.totalAmount.toLocaleString()} DZD
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase
                      ${sale.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : ''}
                      ${sale.status === 'Pending' ? 'bg-yellow-105 bg-yellow-101 bg-yellow-100 text-yellow-800' : ''}
                      ${sale.status === 'Cancelled' ? 'bg-red-105 bg-red-100 text-red-800' : ''}
                    `}>
                      {sale.status === 'Completed' ? 'Complétée' : sale.status === 'Cancelled' ? 'Annulée' : 'En Attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        id={`btn-view-invoice-${sale.id}`}
                        className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
                      >
                        Voir Facture
                      </button>
                      
                      {sale.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleUpdateStatus(sale.id, 'Cancelled')}
                          disabled={loadingAction === sale.id}
                          className="py-1 px-2 bg-red-50 hover:bg-red-150 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition disabled:opacity-50"
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            Aucune transaction ne correspond à vos filtres.
          </div>
        )}
      </div>

      {/* DETAILED MOCK INVOICE MODAL (Page 4 Popup layout) */}
      {selectedSale && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs" id="invoice-modal-overlay">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150 bg-slate-50">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Facture de Vente — ANYARA</span>
              <button 
                onClick={() => setSelectedSale(null)} 
                className="p-1.5 hover:bg-slate-200 text-slate-400 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Receipt Sheet */}
            <div className="p-6 space-y-4" id="invoice-bill-sheet">
              <div className="text-center pb-4 border-b border-dashed border-slate-200">
                <h3 className="text-xl font-bold uppercase tracking-tight text-slate-800">ANYARA SUPERETTE</h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">ZONE INDUSTRIELLE AMIZOUR, BÉJAÏA</p>
                <p className="text-[11px] text-slate-400 font-mono">TEL : +213 550 12 34 56</p>
              </div>

              {/* Invoice Metadata */}
              <div className="grid grid-cols-2 text-xs font-mono text-slate-600 gap-y-1">
                <div><span className="text-slate-400">FACTURE :</span> <span className="font-bold text-slate-800">{selectedSale.invoiceNumber}</span></div>
                <div className="text-right"><span className="text-slate-400">DATE :</span> {new Date(selectedSale.date).toLocaleDateString()}</div>
                <div><span className="text-slate-400">CLIENT :</span> {selectedSale.clientName}</div>
                <div className="text-right"><span className="text-slate-400">HEURE :</span> {new Date(selectedSale.date).toLocaleTimeString()}</div>
              </div>

              {/* Products items bill table */}
              <div className="border-t border-b border-slate-100 py-3 mt-4 space-y-2.5">
                <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-slate-400 font-mono">
                  <div className="col-span-6">DÉSIGNATION</div>
                  <div className="col-span-2 text-center">QTÉ</div>
                  <div className="col-span-4 text-right">MONTANT</div>
                </div>

                {selectedSale.items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 text-xs font-mono text-slate-700 items-start">
                    <div className="col-span-6">
                      <div className="truncate font-medium text-slate-800">{it.name}</div>
                      <div className="text-[10px] text-slate-400">P.U: {it.salePrice} DZD</div>
                    </div>
                    <div className="col-span-2 text-center font-bold">{it.quantity}</div>
                    <div className="col-span-4 text-right">{(it.quantity * it.salePrice).toLocaleString()} DZD</div>
                  </div>
                ))}
              </div>

              {/* Total calculations */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-mono text-slate-600">
                  <span>H.T. Total</span>
                  <span>{selectedSale.totalAmount} DZD</span>
                </div>
                <div className="flex justify-between text-xs font-mono text-slate-600">
                  <span>Taxes / TVA (0%)</span>
                  <span>0 DZD</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold border-t border-dashed border-slate-200 pt-2 font-mono">
                  <span className="text-slate-800">NET À PAYER (DZD)</span>
                  <span className="text-lg text-emerald-600 font-bold">{selectedSale.totalAmount.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1">
                  <span>Bénéfice estimé</span>
                  <span>+{selectedSale.totalProfit.toLocaleString()} DZD</span>
                </div>
              </div>

              {/* Security validation signature details */}
              <div className="pt-4 border-t border-slate-100 text-center text-[10px] font-mono text-slate-400 space-y-1">
                <p>--- MERCI DE VOTRE CONFIANCE EN ANYARA ---</p>
                <div className="flex items-center justify-center gap-1">
                  <span>Vente validée par l'algorithme de contrôle antisécurité</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2.5 p-4 border-t border-slate-100 bg-slate-50 justify-end">
              {selectedSale.status !== 'Cancelled' && (
                <button
                  onClick={() => handleUpdateStatus(selectedSale.id, 'Cancelled')}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-medium text-xs px-4 py-2 rounded-lg transition cursor-pointer"
                >
                  Annuler cette Facture
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="bg-slate-850 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer Reçu</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
