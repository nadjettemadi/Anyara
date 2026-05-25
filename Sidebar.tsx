/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Notification } from '../types';
import { 
  LayoutDashboard, 
  Receipt, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut, 
  Bell, 
  Store,
  ShieldCheck,
  AlertTriangle,
  X,
  Volume2
} from 'lucide-react';

interface SidebarProps {
  user: User;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  notifications: Notification[];
  onMarkNotificationsRead: () => Promise<void>;
  onClearNotifications: () => Promise<void>;
  onLogout: () => void;
}

export default function Sidebar({
  user,
  currentTab,
  setCurrentTab,
  notifications,
  onMarkNotificationsRead,
  onClearNotifications,
  onLogout
}: SidebarProps) {
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleToggleNotifications = () => {
    setShowNotificationsDropdown(!showNotificationsDropdown);
    if (!showNotificationsDropdown && unreadCount > 0) {
      onMarkNotificationsRead();
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'sales', label: 'Gestion des Ventes', icon: Receipt },
    { id: 'inventory', label: "Gestion de l'Inventaire", icon: Package },
    { id: 'analytics', label: 'Analytics Financiers', icon: BarChart3 },
    { id: 'settings', label: 'Paramètres du compte', icon: Settings },
  ];

  return (
    <nav className="bg-slate-900 border-r border-slate-800 w-full md:w-64 shrink-0 flex flex-col justify-between text-slate-300 min-h-screen relative" id="sidebar-navigation">
      <div>
        {/* Brand Banner */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-emerald-400">SUPÉRETTE</span>
              <h2 className="text-lg font-bold text-white tracking-widest leading-none mt-0.5">ANYARA</h2>
            </div>
          </div>
        </div>

        {/* User Info Capsule */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/40 relative">
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">Gérant connecté</span>
          <h3 className="text-white text-sm font-bold mt-1.5 truncate">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 font-sans italic">
            {user.supermarketName || "TechHub DZ"}
          </p>

          {/* Real-time notification Bell */}
          <div className="absolute top-5 right-5">
            <button
              onClick={handleToggleNotifications}
              id="sidebar-bell-btn"
              className="p-1.5 hover:bg-slate-805 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg relative cursor-pointer border border-slate-700/55 shadow transition"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notification Dropdown Pane */}
            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 text-slate-705" id="notifications-box">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Alertes & Notifications ({notifications.length})</span>
                  <button
                    onClick={onClearNotifications}
                    className="text-[10px] text-red-500 hover:underline cursor-pointer"
                  >
                    Effacer tout
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-3 text-xs flex gap-2.5 transition ${n.read ? 'bg-white' : 'bg-slate-50'}`}>
                      <div className="shrink-0 mt-0.5">
                        {n.type === 'success' && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                        {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                        {n.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        {n.type === 'info' && <Bell className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-700 font-medium leading-normal">{n.message}</p>
                        <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                          {new Date(n.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs">Aucune notification pour le moment.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs Menu */}
        <div className="p-4 space-y-1.5">
          <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2.5">Navigation</span>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setShowNotificationsDropdown(false);
                }}
                id={`sidebar-link-${item.id}`}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer
                  ${isActive 
                    ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/10' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Disconnection Footer */}
      <div className="p-4 border-t border-slate-850 bg-slate-950/20">
        <button
          onClick={onLogout}
          id="sidebar-logout-btn"
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion Sécurisée</span>
        </button>
      </div>
    </nav>
  );
}
