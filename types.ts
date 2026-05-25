/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  supermarketName: string;
  phone?: string;
  address?: string;
  currency: string; // Default: DZD
  role: 'GERANT' | 'CAISSIER';
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStockThreshold: number; // Alerts when stock <= minStockThreshold
  purchasePrice: number; // in DZD
  salePrice: number; // in DZD
  expiryDate?: string; // ISO Date String (YYYY-MM-DD)
  status: 'Active' | 'Low Stock' | 'Out of Stock' | 'Expired';
}

export interface SaleItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  clientName: string;
  items: SaleItem[];
  totalAmount: number;
  totalProfit: number;
  status: 'Completed' | 'Pending' | 'Cancelled';
  date: string; // ISO timestamp
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  read: boolean;
}

export interface DashboardKPIs {
  totalRevenue: number;
  totalProfit: number;
  averageMargin: number; // in %
  totalSalesCount: number;
  inventoryValue: number; // calculated as sum(stock * purchasePrice)
  recentSales: Sale[];
}
