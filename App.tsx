/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Product, Sale, Notification } from './types';
import Sidebar from './components/Sidebar';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import SalesView from './components/SalesView';
import InventoryView from './components/InventoryView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Radio, Volume2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Authenticate & preload data on initial startup
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        await refreshAllData();
      } else {
        // Fallback: Autologin default user for instant lovely experience
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@anyara.dz', password: 'admin' })
        });
        if (loginRes.ok) {
          const user = await loginRes.json();
          setCurrentUser(user);
          await refreshAllData();
        }
      }
    } catch (err) {
      console.error('Session check failed', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshAllData = async () => {
    try {
      const [prodRes, saleRes, notifRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/sales'),
        fetch('/api/notifications')
      ]);

      if (prodRes.ok) setProducts(await prodRes.json());
      if (saleRes.ok) setSales(await saleRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());
    } catch (err) {
      console.error('Failed to load data from backend server API. Retry in progress...', err);
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      // update local
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await fetch('/api/notifications', { method: 'DELETE' });
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    await refreshAllData();
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setCurrentTab('dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans text-white gap-4">
        <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-550/20 text-emerald-400 animate-pulse">
          <Activity className="w-8 h-8 animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold uppercase tracking-widest font-mono">ANYARA SYSTEMS</h2>
          <p className="text-xs text-slate-400 mt-1">Lancement de la base de données & Caisse Caissier d'Algerie...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800" id="main-app-shell">
      
      {/* Sidebar Navigation - Hidden for Caissier */}
      {currentUser.role !== 'CAISSIER' && (
        <Sidebar 
          user={currentUser} 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          notifications={notifications}
          onMarkNotificationsRead={handleMarkNotificationsRead}
          onClearNotifications={handleClearNotifications}
          onLogout={handleAdminLogout}
        />
      )}

      {/* Main Content Workspace Layout with Motion transitions */}
      <main className="flex-1 p-4 md:p-8 max-h-screen overflow-y-auto" id="main-content-area">
        {/* Dedicated Cashier Top Bar with Logout */}
        {currentUser.role === 'CAISSIER' && (
          <div className="w-full max-w-7xl mx-auto mb-6 flex justify-between items-center bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 text-white p-2.5 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">LOGICIEL DE CAISSE ANYARA</span>
                <span className="text-sm font-semibold text-slate-700">Comptabilité & Scanner DZ</span>
              </div>
            </div>
            <button
              onClick={handleAdminLogout}
              className="bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer border border-transparent hover:border-red-200"
            >
              Déconnexion
            </button>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="w-full max-w-7xl mx-auto"
          >
            {currentTab === 'dashboard' && (
              <DashboardView 
                user={currentUser} 
                products={products}
                sales={sales}
                notifications={notifications}
                refreshData={refreshAllData}
              />
            )}

            {currentUser.role !== 'CAISSIER' && currentTab === 'sales' && (
              <SalesView 
                sales={sales} 
                refreshData={refreshAllData} 
              />
            )}

            {currentUser.role !== 'CAISSIER' && currentTab === 'inventory' && (
              <InventoryView 
                products={products} 
                refreshData={refreshAllData} 
              />
            )}

            {currentUser.role !== 'CAISSIER' && currentTab === 'analytics' && (
              <AnalyticsView 
                products={products} 
                sales={sales} 
              />
            )}

            {currentUser.role !== 'CAISSIER' && currentTab === 'settings' && (
              <SettingsView 
                user={currentUser} 
                onUserUpdate={(updated) => setCurrentUser(updated)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
