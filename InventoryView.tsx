/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { 
  Package, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  Search, 
  Edit3, 
  Briefcase, 
  Coins, 
  Calendar,
  X,
  PlusCircle,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  refreshData: () => Promise<void>;
}

export default function InventoryView({ products, refreshData }: InventoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Create / Edit modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Alimentation-Générale');
  const [formStock, setFormStock] = useState(10);
  const [formMinStock, setFormMinStock] = useState(5);
  const [formPurchasePrice, setFormPurchasePrice] = useState(100);
  const [formSalePrice, setFormSalePrice] = useState(130);
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Categories extracted automatically + custom presets
  const categoriesList = ['All', 'Alimentation-Générale', 'Boissons', 'Produits-Frais', 'Entretien-Hygiène'];

  // KPIs
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.status === 'Low Stock').length;
  const outOfStockProducts = products.filter(p => p.status === 'Out of Stock').length;
  const expiredProducts = products.filter(p => p.status === 'Expired').length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0);

  // Filtering products
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormSku(`SKU-${Date.now().toString().slice(-6)}`);
    setFormName('');
    setFormCategory('Alimentation-Générale');
    setFormStock(15);
    setFormMinStock(5);
    setFormPurchasePrice(100);
    setFormSalePrice(130);
    setFormExpiryDate('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormSku(p.sku);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormStock(p.stock);
    setFormMinStock(p.minStockThreshold);
    setFormPurchasePrice(p.purchasePrice);
    setFormSalePrice(p.salePrice);
    setFormExpiryDate(p.expiryDate || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce produit de l\'inventaire ?')) return;

    try {
      const res = await fetch(`/api/products/${prodId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Impossible de supprimer le produit.');
      }

      await refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    if (formSalePrice < formPurchasePrice) {
      setFormError("ERREUR DE MARGE : Le prix de vente doit impérativement être supérieur au prix d'achat.");
      setSubmitting(false);
      return;
    }

    const payload = {
      sku: formSku,
      name: formName,
      category: formCategory,
      stock: Number(formStock),
      minStockThreshold: Number(formMinStock),
      purchasePrice: Number(formPurchasePrice),
      salePrice: Number(formSalePrice),
      expiryDate: formExpiryDate || undefined
    };

    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de l’enregistrement.');
      }

      setIsModalOpen(false);
      await refreshData();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" id="inventory-view-root">
      {/* 4 KPIs Headers (Page 5 Requirements) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="inventory-kpis-grid">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Produits</span>
            <span className="text-xl font-bold text-slate-800 font-mono block">
              {totalProducts} Références
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-650 text-red-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Périmés / Alertes</span>
            <span className="text-xl font-bold text-red-600 font-mono block">
              {expiredProducts} <span className="text-xs text-slate-400 font-sans">({lowStockProducts} stock bas)</span>
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Rupture de Stock</span>
            <span className="text-xl font-bold text-orange-600 font-mono block">
              {outOfStockProducts} épuisés
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block font-sans">Valeur Financière</span>
            <span className="text-xl font-bold text-emerald-600 font-mono block">
              {totalInventoryValue.toLocaleString()} DZD
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Search, Filter Category and Quick Add */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Scanner, rechercher un SKU, nom..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-auto bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none"
            >
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'Toutes les catégories' : cat}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenCreateModal}
            id="inventory-add-product-btn"
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nouveau Produit</span>
          </button>
        </div>

        {/* Product Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="inventory-products-table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs font-semibold uppercase">
                <th className="px-6 py-3.5">SKU / Code-barres</th>
                <th className="px-6 py-3.5">Désignation</th>
                <th className="px-6 py-3.5">Catégorie</th>
                <th className="px-6 py-3.5 font-mono text-center">Stock Actuel</th>
                <th className="px-6 py-3.5 font-mono text-right">Prix d'Achat</th>
                <th className="px-6 py-3.5 font-mono text-right">Prix de Vente</th>
                <th className="px-6 py-3.5 text-center">Expiration / DLUO</th>
                <th className="px-6 py-3.5 text-center">Statut</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {filteredProducts.map((p) => {
                const isExpired = p.status === 'Expired';
                return (
                  <tr key={p.id} className={`hover:bg-slate-50/50 transition duration-150 ${isExpired ? 'bg-red-500/5' : ''}`}>
                    <td className="px-6 py-4 font-mono font-bold text-xs text-slate-800">
                      {p.sku}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{p.name}</div>
                      {p.stock <= p.minStockThreshold && p.stock > 0 && (
                        <div className="text-[10px] text-yellow-600 flex items-center gap-1 mt-0.5">
                          <span>Seuil de sécurité atteint ({p.minStockThreshold} unités)</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {p.category}
                    </td>
                    <td className="px-6 py-4 font-mono text-center font-bold">
                      <span className={p.stock <= p.minStockThreshold ? 'text-red-500' : 'text-slate-800'}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-right text-xs">
                      {p.purchasePrice.toLocaleString()} DZD
                    </td>
                    <td className="px-6 py-4 font-mono text-right text-xs font-semibold text-emerald-600">
                      {p.salePrice.toLocaleString()} DZD
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs text-slate-500">
                      {p.expiryDate ? (
                        <span className={isExpired ? 'text-red-500 font-bold' : ''}>
                          {p.expiryDate}
                        </span>
                      ) : (
                        <span className="text-slate-300">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                        ${p.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : ''}
                        ${p.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${p.status === 'Out of Stock' ? 'bg-orange-100 text-orange-850 text-orange-800' : ''}
                        ${p.status === 'Expired' ? 'bg-red-100 text-red-800 animate-pulse' : ''}
                      `}>
                        {p.status === 'Active' ? 'Actif' : p.status === 'Low Stock' ? 'Stock Bas' : p.status === 'Expired' ? 'PÉRIMÉ' : 'Épuisé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          id={`btn-edit-product-${p.id}`}
                          className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs rounded-lg transition"
                        >
                          Suppr.
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            Aucun article trouvé dans l'inventaire actuel.
          </div>
        )}
      </div>

      {/* CREATE / EDIT DOCK DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs" id="inventory-form-modal">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                {editingProduct ? 'Modifier la Fiche Produit' : 'Ajouter un Nouveau Produit de Caisse'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 hover:bg-slate-200 text-slate-400 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4">
              {formError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Code SKU / Barcode</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-mono focus:outline-none focus:border-emerald-500"
                    placeholder="Ex: MILK-001"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Catégorie</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Alimentation-Générale">Alimentation-Générale</option>
                    <option value="Boissons">Boissons</option>
                    <option value="Produits-Frais">Produits-Frais</option>
                    <option value="Entretien-Hygiène">Entretien-Hygiène</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Désignation Produit</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-emerald-500"
                  placeholder="Ex: Semoule Extra Fine Amor Benamor 5kg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Quantité en Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Alerte Stock Bas</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Prix d'Achat (DZD)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formPurchasePrice}
                    onChange={(e) => setFormPurchasePrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Prix de Vente (DZD)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formSalePrice}
                    onChange={(e) => setFormSalePrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Date Limite de Consommation / DLUO (Optionnel)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-700 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Recommandé pour les articles d'alimentation. Un blocage strict de vente sera appliqué par l'algorithme ANYARA si cette date est dépassée.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2.5 pt-4 border-t border-slate-100 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs px-4 py-2 rounded-lg transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  id="inventory-submit-form-btn"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs px-4 py-2 rounded-lg transition cursor-pointer"
                >
                  {submitting ? 'Sauvegarde...' : 'Ajuster & Enregistrer'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
