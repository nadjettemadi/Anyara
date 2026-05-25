/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../types';
import { Settings, Save, ShieldCheck, Mail, Smartphone, Store, MapPin, BadgePercent } from 'lucide-react';

interface SettingsViewProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

export default function SettingsView({ user, onUserUpdate }: SettingsViewProps) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [supermarketName, setSupermarketName] = useState(user.supermarketName);
  const [phone, setPhone] = useState(user.phone || '+213 550 12 34 56');
  const [address, setAddress] = useState(user.address || 'Zone Industrielle Amizour, Béjaïa');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          supermarketName,
          phone,
          address,
        }),
      });

      if (!res.ok) {
        throw new Error('Impossible de mettre à jour le profil.');
      }

      const updated = await res.json();
      onUserUpdate(updated);
      setSuccess('Vos paramètres de supérette ont été synchronisés avec succès aujourd\'hui !');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto" id="settings-view-root">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
        <Settings className="w-5 h-5 text-emerald-500 animate-[spin_5s_linear_infinite]" />
        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
          Paramètres du Compte & Configuration du Magasin
        </h2>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2" id="settings-success-alert">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Section 1 : Profil Utilisateur */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            1. Informations Administrateur / Gérant
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Prénom</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Nom de Famille</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Adresse de messagerie (Non modifiable)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-300" />
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-slate-100 border border-slate-200 text-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 : Magasin Supérette */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            2. Paramètres De la Supérette
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Nom de la Supérette</label>
              <div className="relative">
                <Store className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={supermarketName}
                  onChange={(e) => setSupermarketName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Téléphone Magasin</label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Adresse Physique</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 : Localisation, Devises et Impôts */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            3. Devise et Taxes de Vente
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Devise Principale</label>
              <select
                disabled
                className="w-full bg-slate-100 border border-slate-200 text-slate-600 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed font-mono"
              >
                <option value="DZD">DZD (Dinar Algérien)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">TVA par défaut</label>
              <select
                disabled
                className="w-full bg-slate-100 border border-slate-200 text-slate-600 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed font-mono"
              >
                <option value="0">0% (Inclus / Hors taxes)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Arrondi des Prix</label>
              <select
                disabled
                className="w-full bg-slate-100 border border-slate-200 text-slate-600 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed font-mono"
              >
                <option value="1">Légal sans centimes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="border-t border-slate-100 pt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            id="settings-save-button"
            className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl transition duration-150 flex items-center gap-2 cursor-pointer disabled:opacity-55"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Enregistrement...' : 'Sauvegarder les Paramètres'}</span>
          </button>
        </div>
      </form>

    </div>
  );
}
