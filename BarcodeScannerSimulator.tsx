/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { Scan, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, Play, RefreshCw } from 'lucide-react';

interface BarcodeScannerSimulatorProps {
  onAddProductToCart: (product: Product, quantity: number) => void;
  productsList: Product[];
}

export default function BarcodeScannerSimulator({ onAddProductToCart, productsList }: BarcodeScannerSimulatorProps) {
  const [skuInput, setSkuInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'success' | 'blocked_expired' | 'error' | 'out_of_stock';
    message: string;
  }>({ status: 'idle', message: '' });

  const handleScan = async (sku: string) => {
    if (!sku) return;
    setIsScanning(true);
    setScannedProduct(null);
    setScanResult({ status: 'idle', message: '' });

    // Simulate laser latency
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/scan/${sku}`);
        const data = await res.json();

        if (res.status === 403) {
          // Strictly Expired Security block
          setScanResult({
            status: 'blocked_expired',
            message: data.message
          });
          setScannedProduct(data.product);
        } else if (res.status === 404) {
          setScanResult({
            status: 'error',
            message: data.message
          });
        } else if (res.status === 400 && data.outOfStock) {
          setScanResult({
            status: 'out_of_stock',
            message: data.message
          });
          setScannedProduct(data.product);
        } else {
          setScanResult({
            status: 'success',
            message: 'Produit scanné et interrogé en temps réel avec succès !'
          });
          setScannedProduct(data.product);
          setQuantity(1);
        }
      } catch (err) {
        setScanResult({
          status: 'error',
          message: 'Erreur lors du contact avec la base de données.'
        });
      } finally {
        setIsScanning(false);
      }
    }, 600);
  };

  const handleAddToSale = () => {
    if (scannedProduct && scanResult.status === 'success') {
      onAddProductToCart(scannedProduct, quantity);
      // Reset scanner
      setSkuInput('');
      setScannedProduct(null);
      setScanResult({ status: 'idle', message: '' });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 text-white relative" id="barcode-scanner-simulator">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Scan className="w-5 h-5 text-emerald-400 animate-pulse" />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-300">
            Simulateur Lecteur Code-barres (Temps Réel)
          </h3>
        </div>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono border border-emerald-500/20">
          Sécurité ANYARA
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-2">
            Entrez le code SKU manuellement ou cliquez sur un produit de test ci-dessous :
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={skuInput}
              onChange={(e) => setSkuInput(e.target.value.toUpperCase())}
              placeholder="Ex: MILK-001, MILK-EXP, HMD-1.5, COF-ELBOUN"
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 flex-1 font-mono placeholder-slate-500"
            />
            <button
              onClick={() => handleScan(skuInput)}
              disabled={isScanning || !skuInput}
              id="barcode-scan-btn-search"
              className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 font-medium px-4 py-2 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isScanning ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              <span>Scanner</span>
            </button>
          </div>
        </div>

        {/* Dynamic scan shortcuts list */}
        <div>
          <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
            Codes-barres de test rapide (Maquettes) :
          </span>
          <div className="flex flex-wrap gap-2">
            {productsList.map((p) => {
              const isExpired = p.status === 'Expired';
              const isOut = p.status === 'Out of Stock';
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSkuInput(p.sku);
                    handleScan(p.sku);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition font-mono flex items-center gap-1.5 cursor-pointer text-left
                    ${isExpired 
                      ? 'bg-red-500/10 hover:bg-red-500/25 text-red-300 border-red-500/30' 
                      : isOut 
                      ? 'bg-orange-500/10 hover:bg-orange-500/25 text-orange-300 border-orange-500/30'
                      : p.status === 'Low Stock'
                      ? 'bg-yellow-500/10 hover:bg-yellow-500/25 text-yellow-300 border-yellow-500/30'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-red-400' : isOut ? 'bg-orange-400' : 'bg-emerald-400'}`}></span>
                  <span>{p.sku}</span>
                  <span className="text-[10px] text-slate-400">({p.name.split(' ')[0]})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SCAN INTERROGATION AND SECURITY RESPONSE BLOCK */}
        {isScanning && (
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <div className="text-center font-mono text-xs">
              <span className="text-slate-400">CONNECTING TO ANYARA DB SERVER...</span>
              <p className="text-emerald-400 mt-1">Interrogation du stock et des dates de péremption...</p>
            </div>
          </div>
        )}

        {!isScanning && scanResult.status !== 'idle' && (
          <div className={`p-4 rounded-xl border flex gap-3.5 transition-all duration-300
            ${scanResult.status === 'blocked_expired' 
              ? 'bg-red-500/10 border-red-500/40 text-red-200' 
              : scanResult.status === 'out_of_stock'
              ? 'bg-orange-500/10 border-orange-500/40 text-orange-200'
              : scanResult.status === 'error'
              ? 'bg-slate-800 border-slate-700 text-slate-300'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
            }`}
          >
            <div className="shrink-0 mt-1">
              {scanResult.status === 'blocked_expired' && (
                <ShieldAlert className="w-6 h-6 text-red-500 animate-bounce" />
              )}
              {scanResult.status === 'out_of_stock' && (
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              )}
              {scanResult.status === 'error' && (
                <AlertTriangle className="w-6 h-6 text-slate-400" />
              )}
              {scanResult.status === 'success' && (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-semibold uppercase tracking-wider
                  ${scanResult.status === 'blocked_expired' ? 'text-red-400 font-bold' : 'text-slate-400'}
                `}>
                  {scanResult.status === 'blocked_expired' && "🚨 ALERTE DE SÉCURITÉ ALIMENTAIRE - BLOQUÉ"}
                  {scanResult.status === 'success' && "✓ CONSULTATION TEMPS RÉEL REUSSIE"}
                  {scanResult.status === 'out_of_stock' && "⚠️ EN RUPTURE DE STOCK"}
                  {scanResult.status === 'error' && "⚠ RÉSULTAT RECHERCHE"}
                </span>
                {scannedProduct && (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                    ID: {scannedProduct.id}
                  </span>
                )}
              </div>

              <p className="text-sm font-medium mt-1">
                {scanResult.message}
              </p>

              {scannedProduct && (
                <div className="mt-3.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-300 space-y-1">
                  <div><strong className="text-slate-500">Nom :</strong> {scannedProduct.name}</div>
                  <div><strong className="text-slate-500">Catégorie :</strong> {scannedProduct.category}</div>
                  <div className="flex justify-between">
                    <span><strong className="text-slate-500">Stock restant :</strong> {scannedProduct.stock} unités</span>
                    <span><strong className="text-slate-500">Seuil alerte :</strong> {scannedProduct.minStockThreshold} u</span>
                  </div>
                  <div className="flex justify-between">
                    <span><strong className="text-slate-500">Prix d'achat :</strong> {scannedProduct.purchasePrice} DZD</span>
                    <span><strong className="text-slate-500">Prix de vente :</strong> {scannedProduct.salePrice} DZD</span>
                  </div>
                  {scannedProduct.expiryDate && (
                    <div className={scanResult.status === 'blocked_expired' ? 'text-red-400 font-semibold' : 'text-slate-300'}>
                      <strong className="text-slate-500">DLUO Expiration :</strong> {scannedProduct.expiryDate} 
                      {scanResult.status === 'blocked_expired' && " (ÉCHUE !)"}
                    </div>
                  )}
                  <div><strong className="text-slate-500">Marge Brute :</strong> {scannedProduct.salePrice - scannedProduct.purchasePrice} DZD</div>
                </div>
              )}

              {/* ACTION: ADD TO BASKET OR BLOCKED INSTRUCTIONS */}
              {scanResult.status === 'success' && scannedProduct && (
                <div className="mt-3.5 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
                    <span className="text-xs text-slate-400">Qté:</span>
                    <input
                      type="number"
                      min="1"
                      max={scannedProduct.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(scannedProduct.stock, Number(e.target.value))))}
                      className="w-12 bg-transparent text-center focus:outline-none text-xs font-semibold text-white font-mono"
                    />
                  </div>

                  <button
                    onClick={handleAddToSale}
                    id="barcode-scan-add-to-cart"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ajouter au Panier</span>
                  </button>
                </div>
              )}

              {scanResult.status === 'blocked_expired' && (
                <div className="mt-3 bg-red-950/40 p-2.5 rounded border border-red-500/20 text-xs text-red-300">
                  ⚠️ <strong>Alerte de Sécurité Alimentaire</strong> : ANYARA a appliqué l'injonction légale de blocage de caisse. Le produit a expiré. Retirez ce lot de l'inventaire actif pour éviter les sanctions.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
