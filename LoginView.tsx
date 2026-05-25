/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../types';
import { Store, UserCheck, ShieldAlert, KeyRound, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [firstName, setFirstName] = useState('Amine');
  const [lastName, setLastName] = useState('Mansouri');
  const [email, setEmail] = useState('admin@anyara.dz');
  const [password, setPassword] = useState('admin');
  const [supermarketName, setSupermarketName] = useState('TechHub DZ');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body = isRegister 
      ? { firstName, lastName, email, password, supermarketName }
      : { email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Une erreur est survenue.');
      }

      const user = await res.json();
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Impossible de se connecter au serveur backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden" id="login-container">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-800/95 border border-slate-700 p-8 rounded-2xl shadow-2xl relative z-10 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-emerald-500/10 rounded-xl mb-4 border border-emerald-500/20 text-emerald-400">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white font-sans uppercase">
            ANYARA
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Système Intelligent de Gestion de Supérette
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-sm text-red-200" id="login-error-alert">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Prénom
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Amine"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Nom
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Mansouri"
                />
              </div>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Nom de la Supérette
              </label>
              <div className="relative">
                <Store className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={supermarketName}
                  onChange={(e) => setSupermarketName(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Ex: TechHub DZ"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                La devise par défaut sera configurée en <strong>Dinar Algérien (DZD)</strong>.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Adresse Email (Identifiant d'accès)
            </label>
            <div className="relative">
              <UserCheck className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="Ex: amine@anyara.dz"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            id="login-btn-submit"
            className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-55"
          >
            {loading ? (
              <span>Vérification en cours...</span>
            ) : (
              <>
                <span>{isRegister ? "Créer mon Compte Administrateur" : "Se Connecter de manière Sécurisée"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-700/55">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            id="login-toggle-mode"
            className="text-sm text-emerald-400 hover:underline transition uppercase tracking-wide text-xs font-semibold block mx-auto"
          >
            {isRegister 
              ? "Vous possédez déjà un compte ? Se connecter" 
              : "Nouveau gérant ? Créer et configurer votre supérette"}
          </button>

          {!isRegister && (
            <div className="mt-4 text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-700/45 text-left space-y-1 font-mono">
              <p className="text-emerald-400 font-sans font-semibold text-xs mb-1">Comptes d'essai disponibles :</p>
              <div>• <strong>Gérant :</strong> admin@anyara.dz / <span className="text-slate-200 bg-slate-700 px-1 py-0.5 rounded">admin</span></div>
              <div>• <strong>Caissier :</strong> caisse@anyara.dz / <span className="text-slate-200 bg-slate-700 px-1 py-0.5 rounded">caisse</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
