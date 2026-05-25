/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Sale, User, Notification } from '../types';
import BarcodeScannerSimulator from './BarcodeScannerSimulator';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt,
  CheckCircle,
  Clock,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface DashboardViewProps {
  user: User;
  products: Product[];
  sales: Sale[];
  notifications: Notification[];
  refreshData: () => Promise<void>;
}

export default function DashboardView({ user, products, sales, notifications, refreshData }: DashboardViewProps) {
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [clientName, setClientName] = useState('');
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);
  const [saleSuccessMessage, setSaleSuccessMessage] = useState<string | null>(null);
  const [saleErrorMessage, setSaleErrorMessage] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [sales, products]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProductToCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        // cap at stock
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
    setSaleSuccessMessage(null);
    setSaleErrorMessage(null);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: Math.max(1, Math.min(item.product.stock, newQty)) };
          }
          return item;
        })
    );
  };

  // Checkouts the sale
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmittingSale(true);
    setSaleSuccessMessage(null);
    setSaleErrorMessage(null);

    const checkBody = {
      clientName: clientName || 'Client Comptant',
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkBody),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'La transaction a échoué.');
      }

      setSaleSuccessMessage(`Vente facturée avec succès : ${data.invoiceNumber} (${data.totalAmount} DZD)`);
      setCart([]);
      setClientName('');
      await refreshData();
    } catch (err: any) {
      setSaleErrorMessage(err.message || 'Une erreur est survenue lors de la facture.');
    } finally {
      setIsSubmittingSale(false);
    }
  };

  // KPIs default Fallback calculation if analytics endpoint isn't loaded yet
  const kpis = analytics?.kpis || {
    totalRevenue: sales.filter(s => s.status === 'Completed').reduce((acc, s) => acc + s.totalAmount, 0),
    totalProfit: sales.filter(s => s.status === 'Completed').reduce((acc, s) => acc + s.totalProfit, 0),
    averageMargin: 15,
    inventoryValue: products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0),
    totalSalesCount: sales.length
  };

  const counts = analytics?.counts || {
    totalProducts: products.length,
    lowStock: products.filter(p => p.status === 'Low Stock').length,
    outOfStock: products.filter(p => p.status === 'Out of Stock').length,
    expired: products.filter(p => p.status === 'Expired').length
  };

  const monthlyHistory = analytics?.monthlyHistory || [];

  return (
    <div className="space-y-6" id="dashboard-view-root">
      {/* Top Welcome Title Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 font-sans">
            ANYARA — {user.supermarketName || "TechHub DZ"}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {user.role === 'CAISSIER' 
              ? <>Interface de scan active — Connecté en tant que <strong className="text-slate-700">{user.firstName} {user.lastName} (Caissier)</strong></>
              : <>Bienvenue, <strong className="text-slate-700">{user.firstName} {user.lastName}</strong>. Voici l\'état récapitulatif de votre commerce aujourd\'hui.</>
            }
          </p>
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 font-mono text-xs px-3 py-1.5 rounded-xl border border-emerald-200">
          <Clock className="w-4 h-4 text-emerald-500" />
          <span>Simulation active : UTC May 2026</span>
        </div>
      </div>

      {/* KPI Overviews (Page 2 Requirement) */}
      {user.role !== 'CAISSIER' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-kpis-grid">
        {/* KPI 1 : Total Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Revenu Global</span>
            <span className="text-2xl font-bold text-slate-800 font-mono block">
              {kpis.totalRevenue.toLocaleString()} <span className="text-sm font-sans text-slate-500">DZD</span>
            </span>
          </div>
        </div>

        {/* KPI 2 : Average Margin (Bénéfice Moyen / Marges) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Bénéfice Net</span>
            <span className="text-2xl font-bold text-slate-800 font-mono block">
              {kpis.totalProfit.toLocaleString()} <span className="text-sm font-sans text-slate-500">DZD</span>
            </span>
          </div>
        </div>

        {/* KPI 3 : Total Completed Sales (Ventes Totales) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Commandes Payées</span>
            <span className="text-2xl font-bold text-slate-800 font-mono block">
              {kpis.totalSalesCount} <span className="text-sm font-sans text-slate-500">ventes</span>
            </span>
          </div>
        </div>

        {/* KPI 4 : Inventory Value */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-155 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Valeur Inventaire</span>
            <span className="text-2xl font-bold text-slate-800 font-mono block">
              {kpis.inventoryValue.toLocaleString()} <span className="text-sm font-sans text-slate-500">DZD</span>
            </span>
          </div>
        </div>
      </div>
      )}

      {/* CORE WORKFLOW AREA : BARCODE SCANNING & CHECKOUT ENGINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-checkout-workspace">
        {/* Left Column (Scan Barcode & Cart Basket Summary) [6 cols or 12 cols if CAISSIER] */}
        <div className={`${user.role === 'CAISSIER' ? 'lg:col-span-12' : 'lg:col-span-6'} space-y-6`}>
          <BarcodeScannerSimulator 
            onAddProductToCart={handleAddProductToCart} 
            productsList={products} 
          />

          {/* Checkout Basket Cart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-500" />
                Panier de Vente Actif
              </h3>
              <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded text-slate-600">
                {cart.length} articles
              </span>
            </div>

            {saleSuccessMessage && (
              <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{saleSuccessMessage}</span>
              </div>
            )}

            {saleErrorMessage && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                <Trash2 className="w-4 h-4 shrink-0 text-red-600" />
                <span>{saleErrorMessage}</span>
              </div>
            )}

            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ShoppingCart className="w-10 h-10 mx-auto stroke-1 mb-2.5 text-slate-300" />
                <p className="text-sm">Votre panier est vide.</p>
                <p className="text-xs text-slate-400 mt-1">Scannez un code-barres ci-dessus pour ajouter des articles.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition">
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="text-xs font-mono text-slate-400 block">{item.product.sku}</span>
                        <h4 className="text-sm font-medium text-slate-800 truncate">{item.product.name}</h4>
                        <span className="text-xs font-mono font-semibold text-emerald-600">{item.product.salePrice.toLocaleString()} DZD</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm">
                          <button
                            onClick={() => updateCartQty(item.product.id, -1)}
                            className="p-1.5 hover:bg-slate-50 text-slate-500 transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-semibold font-mono text-slate-800">{item.quantity}</span>
                          <button
                            onClick={() => {
                              if (item.quantity < item.product.stock) {
                                updateCartQty(item.product.id, 1);
                              }
                            }}
                            disabled={item.quantity >= item.product.stock}
                            className="p-1.5 hover:bg-slate-50 text-slate-500 transition disabled:opacity-40"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Nombre de produits différents :</span>
                    <span className="font-semibold">{cart.length}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Total Quantité d'articles :</span>
                    <span className="font-semibold">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between items-end border-t border-slate-100 pt-2.5">
                    <span className="text-sm font-bold text-slate-800">Total à payer :</span>
                    <span className="text-xl font-mono font-bold text-emerald-600">
                      {cart.reduce((acc, item) => acc + (item.product.salePrice * item.quantity), 0).toLocaleString()} DZD
                    </span>
                  </div>
                </div>

                {/* Billing Details (Client Name) */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest block">Nom du client (Optionnel) :</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Mourad Bouzidi ou Client Comptant"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-700 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isSubmittingSale}
                  id="dashboard-cart-checkout-btn"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Receipt className="w-4 h-4" />
                  <span>{isSubmittingSale ? 'Validation de la vente...' : 'Valider & Ajuster les Stocks'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Sales trends Chart 6 months & Recent Table) [6 cols] */}
        {user.role !== 'CAISSIER' && (
        <div className="lg:col-span-6 space-y-6">
          {/* Sales chart 6 months (Page 2 Requirement) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-4">
              Aperçu des Ventes sur 6 Mois
            </h3>
            {monthlyHistory.length > 0 ? (
              <div className="space-y-4">
                {/* Stunning Custom SVG / HTML Graph for reliable presentation */}
                <div className="h-44 flex items-end justify-between pt-4 border-b border-slate-100 gap-2">
                  {monthlyHistory.map((month: any, i: number) => {
                    const maxRevenue = Math.max(...monthlyHistory.map((m: any) => m.revenue));
                    const percentage = (month.revenue / maxRevenue) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="w-full bg-slate-100 hover:bg-slate-200 rounded-t-lg relative h-36 flex items-end overflow-hidden transition-all">
                          {/* Inner color filled bar */}
                          <div 
                            style={{ height: `${percentage}%` }}
                            className="bg-emerald-500/85 hover:bg-emerald-500 w-full transition-all duration-500 rounded-t-sm"
                          ></div>
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-800 text-white text-[9px] font-mono py-1 px-1.5 rounded shadow-lg whitespace-nowrap z-10">
                            Rev: {month.revenue.toLocaleString()} DZD
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium font-sans truncate w-full text-center">
                          {month.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span>
                    <span>Revenu Mensuel (DZD)</span>
                  </div>
                  <span>Total Semestre</span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">Pas d'historique de ventes disponible.</div>
            )}
          </div>

          {/* Recent sales table (Page 2 Requirement) */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                Factures et Ventes Récentes
              </h3>
              <span className="text-xs text-slate-500">
                Aujourd'hui
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Facture</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Montant</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.slice(0, 5).map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/55 transition">
                      <td className="px-6 py-3 font-mono text-xs font-semibold text-slate-800">
                        {sale.invoiceNumber}
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-600 font-medium">
                        {sale.clientName}
                      </td>
                      <td className="px-6 py-3 font-mono text-xs font-bold text-slate-700">
                        {sale.totalAmount.toLocaleString()} DZD
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase
                          ${sale.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : ''}
                          ${sale.status === 'Pending' ? 'bg-yellow-105 bg-yellow-100 text-yellow-800' : ''}
                          ${sale.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {sale.status === 'Completed' ? 'Complétée' : sale.status === 'Cancelled' ? 'Annulée' : 'En Attente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sales.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400">Aucune vente enregistrée.</div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
