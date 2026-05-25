/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Product, Sale, User, Notification, SaleItem } from './src/types';

interface DbUser extends User {
  password?: string;
}

// Let's create an in-memory database with pre-populated, realistic data
let users: DbUser[] = [
  {
    id: 'user-gerant',
    firstName: 'Amine',
    lastName: 'Mansouri',
    email: 'admin@anyara.dz',
    password: 'admin',
    role: 'GERANT',
    supermarketName: 'Supermarché ANYARA',
    phone: '+213 550 12 34 56',
    address: 'Zone Industrielle Amizour, Béjaïa',
    currency: 'DZD' // Algerian Dinar
  },
  {
    id: 'user-caissier',
    firstName: 'Fodil',
    lastName: 'Kaci',
    email: 'caisse@anyara.dz',
    password: 'caisse',
    role: 'CAISSIER',
    supermarketName: 'Supermarché ANYARA',
    phone: '+213 550 99 88 77',
    address: 'Zone Industrielle Amizour, Béjaïa',
    currency: 'DZD'
  }
];

let currentUser: User | null = users[0]; // Logged in by default to make preview instant and delightful!

let products: Product[] = [
  {
    id: 'prod-1',
    sku: 'MILK-001',
    name: 'Lait Soummam UHT 1L',
    category: 'Alimentation-Générale',
    stock: 45,
    minStockThreshold: 10,
    purchasePrice: 95,
    salePrice: 110,
    expiryDate: '2026-09-15',
    status: 'Active'
  },
  {
    id: 'prod-2',
    sku: 'MILK-EXP',
    name: 'Lait Candia Silhouette 1L (PÉRIMÉ)',
    category: 'Alimentation-Générale',
    stock: 8,
    minStockThreshold: 5,
    purchasePrice: 105,
    salePrice: 130,
    expiryDate: '2026-04-10', // Expiration date in the past (Mock Today is May 2026)
    status: 'Expired'
  },
  {
    id: 'prod-3',
    sku: 'SEM-5KG',
    name: 'Semoule Extra Fine Amor Benamor 5kg',
    category: 'Alimentation-Générale',
    stock: 35,
    minStockThreshold: 8,
    purchasePrice: 420,
    salePrice: 550,
    expiryDate: '2027-01-20',
    status: 'Active'
  },
  {
    id: 'prod-4',
    sku: 'HMD-1.5',
    name: 'Hamoud Boualem Selecto 1.5L',
    category: 'Boissons',
    stock: 4, // Trigger stock warning threshold of 10
    minStockThreshold: 10,
    purchasePrice: 90,
    salePrice: 120,
    expiryDate: '2026-12-05',
    status: 'Low Stock'
  },
  {
    id: 'prod-5',
    sku: 'COF-ELBOUN',
    name: 'Café Moulu El Boun 250g',
    category: 'Alimentation-Générale',
    stock: 80,
    minStockThreshold: 15,
    purchasePrice: 190,
    salePrice: 240,
    status: 'Active'
  },
  {
    id: 'prod-6',
    sku: 'CHZ-LVQR32',
    name: 'Fromage Portion La Vache Qui Rit 32P',
    category: 'Produits-Frais',
    stock: 60,
    minStockThreshold: 10,
    purchasePrice: 380,
    salePrice: 450,
    expiryDate: '2026-11-20',
    status: 'Active'
  },
  {
    id: 'prod-7',
    sku: 'DGL-1KG',
    name: 'Dattes Deglet Nour Supérieure 1kg',
    category: 'Alimentation-Générale',
    stock: 0, // Rupture de stock!
    minStockThreshold: 5,
    purchasePrice: 450,
    salePrice: 650,
    expiryDate: '2026-10-18',
    status: 'Out of Stock'
  },
  {
    id: 'prod-8',
    sku: 'OIL-5L',
    name: 'Huile de Tournesol Elio 5L',
    category: 'Alimentation-Générale',
    stock: 22,
    minStockThreshold: 8,
    purchasePrice: 600,
    salePrice: 750,
    expiryDate: '2027-03-10',
    status: 'Active'
  },
  {
    id: 'prod-9',
    sku: 'DET-ARIEL',
    name: 'Lessive Liquide Ariel 3L',
    category: 'Entretien-Hygiène',
    stock: 25,
    minStockThreshold: 5,
    purchasePrice: 1100,
    salePrice: 1350,
    status: 'Active'
  },
  {
    id: 'prod-10',
    sku: 'PAT-BENAMOR',
    name: 'Pâtes Spaghettis extra Benamor 500g',
    category: 'Alimentation-Générale',
    stock: 2, // Low stock threshold 30
    minStockThreshold: 30,
    purchasePrice: 75,
    salePrice: 95,
    expiryDate: '2027-02-15',
    status: 'Low Stock'
  }
];

let sales: Sale[] = [
  {
    id: 'sale-1',
    invoiceNumber: 'FAC-2026-001',
    clientName: 'Mourad Bouzidi',
    items: [
      {
        productId: 'prod-5',
        sku: 'COF-ELBOUN',
        name: 'Café Moulu El Boun 250g',
        quantity: 3,
        purchasePrice: 190,
        salePrice: 240
      },
      {
        productId: 'prod-1',
        sku: 'MILK-001',
        name: 'Lait Soummam UHT 1L',
        quantity: 5,
        purchasePrice: 95,
        salePrice: 110
      }
    ],
    totalAmount: 1270,
    totalProfit: 225,
    status: 'Completed',
    date: '2026-05-20T10:15:30Z'
  },
  {
    id: 'sale-2',
    invoiceNumber: 'FAC-2026-002',
    clientName: 'Kahina Ait Ali',
    items: [
      {
        productId: 'prod-6',
        sku: 'CHZ-LVQR32',
        name: 'Fromage Portion La Vache Qui Rit 32P',
        quantity: 2,
        purchasePrice: 380,
        salePrice: 450
      }
    ],
    totalAmount: 900,
    totalProfit: 140,
    status: 'Completed',
    date: '2026-05-21T14:30:10Z'
  },
  {
    id: 'sale-3',
    invoiceNumber: 'FAC-2026-003',
    clientName: 'Ryad Mahrez',
    items: [
      {
        productId: 'prod-3',
        sku: 'SEM-5KG',
        name: 'Semoule Extra Fine Amor Benamor 5kg',
        quantity: 4,
        purchasePrice: 420,
        salePrice: 550
      },
      {
        productId: 'prod-8',
        sku: 'OIL-5L',
        name: 'Huile de Tournesol Elio 5L',
        quantity: 2,
        purchasePrice: 600,
        salePrice: 750
      }
    ],
    totalAmount: 3700,
    totalProfit: 820,
    status: 'Completed',
    date: '2026-05-22T09:12:45Z'
  },
  {
    id: 'sale-4',
    invoiceNumber: 'FAC-2026-004',
    clientName: 'Farid Belkaid',
    items: [
      {
        productId: 'prod-10',
        sku: 'PAT-BENAMOR',
        name: 'Pâtes Spaghettis extra Benamor 500g',
        quantity: 20,
        purchasePrice: 75,
        salePrice: 95
      }
    ],
    totalAmount: 1900,
    totalProfit: 400,
    status: 'Pending',
    date: '2026-05-23T11:00:00Z'
  },
  {
    id: 'sale-5',
    invoiceNumber: 'FAC-2026-005',
    clientName: 'Chérif Bensmaïl',
    items: [
      {
        productId: 'prod-9',
        sku: 'DET-ARIEL',
        name: 'Lessive Liquide Ariel 3L',
        quantity: 2,
        purchasePrice: 1100,
        salePrice: 1350
      }
    ],
    totalAmount: 2700,
    totalProfit: 500,
    status: 'Cancelled',
    date: '2026-05-23T13:45:00Z'
  }
];

let notifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'warning',
    message: 'Stock faible pour : Hamoud Boualem Selecto 1.5L (Seulement 4 restants).',
    timestamp: '2026-05-23T08:00:00Z',
    read: false
  },
  {
    id: 'notif-2',
    type: 'error',
    message: 'Rupture de stock totale pour le produit : Dattes Deglet Nour Supérieure 1kg.',
    timestamp: '2026-05-22T16:40:00Z',
    read: false
  },
  {
    id: 'notif-3',
    type: 'error',
    message: 'Supression bloquée : Le Lait Candia Silhouette 1L (SKU: MILK-EXP) est PÉRIMÉ !',
    timestamp: '2026-05-23T10:05:00Z',
    read: false
  }
];

// Re-evaluate product status based on properties
function evaluateProductStatuses() {
  const nowStr = '2026-05-23'; // Mock environment current date

  products.forEach(p => {
    if (p.expiryDate && p.expiryDate < nowStr) {
      p.status = 'Expired';
    } else if (p.stock === 0) {
      p.status = 'Out of Stock';
    } else if (p.stock <= p.minStockThreshold) {
      p.status = 'Low Stock';
    } else {
      p.status = 'Active';
    }
  });
}

// Ensure first evaluation
evaluateProductStatuses();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body-parsing
  app.use(express.json());

  // Middleware to restrict access to Gérants only
  const requireGerant = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!currentUser) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    if (currentUser.role === 'CAISSIER') {
      return res.status(403).json({ message: 'Accès interdit : Réservé aux gérants.' });
    }
    next();
  };

  // --- API BACKEND ROUTES ---

  // Auth: Session Check
  app.get('/api/auth/me', (req, res) => {
    if (currentUser) {
      res.json(currentUser);
    } else {
      res.status(401).json({ message: 'Non authentifié' });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Direct mock validation of email and password
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
      currentUser = foundUser;
      const { password: _, ...userWithoutPassword } = foundUser;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ message: 'Identifiants incorrects. Veuillez utiliser admin@anyara.dz/admin ou caisse@anyara.dz/caisse' });
    }
  });

  // Auth: Register
  app.post('/api/auth/register', (req, res) => {
    const { firstName, lastName, email, password, supermarketName } = req.body;
    if (!firstName || !lastName || !email || !password || !supermarketName) {
      return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires' });
    }

    const newUser: DbUser = {
      id: 'user-' + Date.now(),
      firstName,
      lastName,
      email,
      password,
      role: 'GERANT',
      supermarketName,
      currency: 'DZD'
    };
    users.push(newUser);
    currentUser = newUser;

    // Push congrats notification
    notifications.unshift({
      id: 'notif-' + Date.now(),
      type: 'success',
      message: `Bienvenue chez ANYARA ! Le magasin "${supermarketName}" est maintenant initialisé.`,
      timestamp: new Date().toISOString(),
      read: false
    });

    res.status(201).json(newUser);
  });

  // Auth: Logout
  app.post('/api/auth/logout', (req, res) => {
    currentUser = null;
    res.json({ success: true });
  });

  // Profile update
  app.post('/api/profile/update', (req, res) => {
    if (!currentUser) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    const { firstName, lastName, supermarketName, phone, address } = req.body;
    currentUser.firstName = firstName || currentUser.firstName;
    currentUser.lastName = lastName || currentUser.lastName;
    currentUser.supermarketName = supermarketName || currentUser.supermarketName;
    currentUser.phone = phone || currentUser.phone;
    currentUser.address = address || currentUser.address;

    res.json(currentUser);
  });

  // -- PRODUCTS ENDPOINTS --

  // List products
  app.get('/api/products', (req, res) => {
    evaluateProductStatuses();
    res.json(products);
  });

  // Add Product
  app.post('/api/products', requireGerant, (req, res) => {
    const { sku, name, category, stock, minStockThreshold, purchasePrice, salePrice, expiryDate } = req.body;
    if (!sku || !name || !category || stock === undefined || !purchasePrice || !salePrice) {
      return res.status(400).json({ message: 'Champs obligatoires manquants pour la création du produit.' });
    }

    // Check unique SKU
    if (products.some(p => p.sku === sku)) {
      return res.status(400).json({ message: `Un produit avec le code SKU "${sku}" existe déjà.` });
    }

    const newProduct: Product = {
      id: 'prod-' + Date.now(),
      sku,
      name,
      category,
      stock: Number(stock),
      minStockThreshold: Number(minStockThreshold || 5),
      purchasePrice: Number(purchasePrice),
      salePrice: Number(salePrice),
      expiryDate: expiryDate || undefined,
      status: 'Active'
    };

    products.unshift(newProduct);
    evaluateProductStatuses();

    // Check low stock trigger instantly on creation
    if (newProduct.stock <= newProduct.minStockThreshold) {
      notifications.unshift({
        id: 'notif-' + Date.now(),
        type: 'warning',
        message: `Alerte stock bas lors de l'ajout de: ${newProduct.name} (Stock: ${newProduct.stock}).`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    res.status(201).json(newProduct);
  });

  // Edit Product
  app.put('/api/products/:id', requireGerant, (req, res) => {
    const { id } = req.params;
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Produit introuvable.' });
    }

    const updated = { ...products[index], ...req.body };
    updated.stock = Number(updated.stock);
    updated.minStockThreshold = Number(updated.minStockThreshold);
    updated.purchasePrice = Number(updated.purchasePrice);
    updated.salePrice = Number(updated.salePrice);

    products[index] = updated;
    evaluateProductStatuses();

    // Check warnings
    if (updated.stock <= updated.minStockThreshold && updated.stock > 0) {
      notifications.unshift({
        id: 'notif-' + Date.now(),
        type: 'warning',
        message: `Stock faible pour : ${updated.name} (${updated.stock} restants).`,
        timestamp: new Date().toISOString(),
        read: false
      });
    } else if (updated.stock === 0) {
      notifications.unshift({
        id: 'notif-' + Date.now(),
        type: 'error',
        message: `Rupture de stock totale pour le produit: ${updated.name}.`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    res.json(updated);
  });

  // Delete Product
  app.delete('/api/products/:id', requireGerant, (req, res) => {
    const { id } = req.params;
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Produit introuvable.' });
    }

    const prod = products[index];

    // Delete allowed but check if they want to clear
    products.splice(index, 1);
    res.json({ success: true, message: `Prouit "${prod.name}" supprimé avec succès.` });
  });

  // Scan Code-barres (Real-time Consultation) & STRICT EXPIRED SECURITY BLOCK
  app.get('/api/products/scan/:sku', (req, res) => {
    const { sku } = req.params;
    const product = products.find(p => p.sku === sku);

    if (!product) {
      return res.status(404).json({ message: `Produit introuvable pour le code-barres "${sku}".` });
    }

    // Safety checks!
    const nowStr = '2026-05-23'; // Static environment date
    const isExpired = product.expiryDate && product.expiryDate < nowStr;

    if (isExpired) {
      // STRICT SAFETY BLOCK Triggered on Scan!
      return res.status(403).json({
        securityBlocked: true,
        product,
        message: `SÉCURITÉ STRICTE : La vente de "${product.name}" (SKU: ${product.sku}) est COMPLÈTEMENT BLOQUÉE car le produit est périmé depuis le ${product.expiryDate} !`
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        outOfStock: true,
        product,
        message: `RUPTURE DE STOCK : Le produit "${product.name}" est en rupture de stock.`
      });
    }

    res.json({
      securityBlocked: false,
      product
    });
  });

  // -- SALES TRANSACTION ENDPOINTS & STOCK ADJUSTMENTS --

  // Get sales list
  app.get('/api/sales', requireGerant, (req, res) => {
    res.json(sales);
  });

  // New Sale transaction
  app.post('/api/sales', (req, res) => {
    const { clientName, items } = req.body as { clientName?: string; items: { productId: string; quantity: number }[] };

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Une transaction doit contenir au moins un produit.' });
    }

    const saleItems: SaleItem[] = [];
    let totalAmount = 0;
    let totalProfit = 0;
    const nowStr = '2026-05-23'; // Static date

    // Validate and check each product
    for (const item of items) {
      const dbProduct = products.find(p => p.id === item.productId);
      if (!dbProduct) {
        return res.status(404).json({ message: `Produit ID "${item.productId}" inexistant.` });
      }

      // Check Expiry State to prevent transaction
      const isExpired = dbProduct.expiryDate && dbProduct.expiryDate < nowStr;
      if (isExpired) {
        // Log notification of breach attempt
        notifications.unshift({
          id: 'notif-' + Date.now(),
          type: 'error',
          message: `SÉCURITÉ BLOQUÉE : Tentative de vente du produit périmé "${dbProduct.name}" ! Transaction annulée pour la sécurité des consommateurs.`,
          timestamp: new Date().toISOString(),
          read: false
        });

        return res.status(400).json({
          securityError: true,
          message: `SÉCURITÉ CRITIQUE : Cette vente a été bloquée. Le produit "${dbProduct.name}" est PÉRIMÉ (Date d'expiration: ${dbProduct.expiryDate}). Retirez-le du rayon immédiatement.`
        });
      }

      // Check stock
      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({
          message: `Stock insuffisant pour "${dbProduct.name}". Demandé: ${item.quantity}, Disponible: ${dbProduct.stock}`
        });
      }

      const itemTotal = dbProduct.salePrice * item.quantity;
      const itemCost = dbProduct.purchasePrice * item.quantity;
      const itemProfit = itemTotal - itemCost;

      saleItems.push({
        productId: dbProduct.id,
        sku: dbProduct.sku,
        name: dbProduct.name,
        quantity: item.quantity,
        purchasePrice: dbProduct.purchasePrice,
        salePrice: dbProduct.salePrice
      });

      totalAmount += itemTotal;
      totalProfit += itemProfit;
    }

    // Since validation succeeded, we deduct stock (Auto stock adjustment!)
    for (const item of items) {
      const dbProduct = products.find(p => p.id === item.productId)!;
      dbProduct.stock -= item.quantity;

      // Check for low stock or out of stock warnings and insert notifications automatically
      if (dbProduct.stock === 0) {
        notifications.unshift({
          id: 'notif-' + Date.now(),
          type: 'error',
          message: `RUPTURE DE STOCK : Le produit "${dbProduct.name}" est maintenant épuisé !`,
          timestamp: new Date().toISOString(),
          read: false
        });
      } else if (dbProduct.stock <= dbProduct.minStockThreshold) {
        notifications.unshift({
          id: 'notif-' + Date.now(),
          type: 'warning',
          message: `Ajustement automatique : Stock faible pour "${dbProduct.name}" (${dbProduct.stock} restants). Veuillez réapprovisionner.`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }
    }

    const newInvoiceNum = `FAC-2026-${String(sales.length + 1).padStart(3, '0')}`;
    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      invoiceNumber: newInvoiceNum,
      clientName: clientName || 'Client Comptant',
      items: saleItems,
      totalAmount,
      totalProfit,
      status: 'Completed',
      date: new Date().toISOString()
    };

    sales.unshift(newSale);
    evaluateProductStatuses();

    // Push helpful success log
    notifications.unshift({
      id: 'notif-' + Date.now(),
      type: 'success',
      message: `Vente effectuée avec succès ! Facture ${newInvoiceNum} générée (${totalAmount} DZD).`,
      timestamp: new Date().toISOString(),
      read: false
    });

    res.status(201).json(newSale);
  });

  // Cancel / Update transaction status
  app.put('/api/sales/:id', requireGerant, (req, res) => {
    const { id } = req.params;
    const { status } = req.body as { status: 'Completed' | 'Pending' | 'Cancelled' };
    const saleIndex = sales.findIndex(s => s.id === id);

    if (saleIndex === -1) {
      return res.status(404).json({ message: 'Transaction introuvable.' });
    }

    const oldStatus = sales[saleIndex].status;
    sales[saleIndex].status = status;

    // If a sale is cancelled, restore stock!
    if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      sales[saleIndex].items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          prod.stock += item.quantity;
        }
      });
      evaluateProductStatuses();
      notifications.unshift({
        id: 'notif-' + Date.now(),
        type: 'info',
        message: `Facture ${sales[saleIndex].invoiceNumber} ANNULÉE. Les stocks correspondants ont été réajustés.`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    res.json(sales[saleIndex]);
  });

  // -- NOTIFICATIONS ENDPOINTS --
  app.get('/api/notifications', (req, res) => {
    res.json(notifications);
  });

  // Mark all as read
  app.post('/api/notifications/read-all', (req, res) => {
    notifications.forEach(n => n.read = true);
    res.json({ success: true });
  });

  // Clear notifications
  app.delete('/api/notifications', (req, res) => {
    notifications = [];
    res.json({ success: true });
  });

  // -- ANALYTICS FINANCIAL ENDPOINTS (KPIs & Categories) --
  app.get('/api/analytics', requireGerant, (req, res) => {
    evaluateProductStatuses();

    // Filter completed transactions for financial totals
    const completedSales = sales.filter(s => s.status === 'Completed');

    const totalRevenue = completedSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalProfit = completedSales.reduce((acc, s) => acc + s.totalProfit, 0);
    const totalTransactionsCount = completedSales.length;

    // Average Profit Margin (%)
    const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Calculate current Inventory Value
    const inventoryValue = products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0);

    // Categories Breakdown
    const categoryTotals: Record<string, { revenue: number; cost: number; profit: number }> = {};
    const defaultCategories = ['Alimentation-Générale', 'Boissons', 'Produits-Frais', 'Entretien-Hygiène'];

    defaultCategories.forEach(cat => {
      categoryTotals[cat] = { revenue: 0, cost: 0, profit: 0 };
    });

    completedSales.forEach(sale => {
      sale.items.forEach(item => {
        const cat = products.find(p => p.id === item.productId)?.category || 'Autres';
        if (!categoryTotals[cat]) {
          categoryTotals[cat] = { revenue: 0, cost: 0, profit: 0 };
        }
        categoryTotals[cat].revenue += item.salePrice * item.quantity;
        categoryTotals[cat].cost += item.purchasePrice * item.quantity;
        categoryTotals[cat].profit += (item.salePrice - item.purchasePrice) * item.quantity;
      });
    });

    const categoryBreakdownList = Object.keys(categoryTotals).map(catName => ({
      category: catName,
      revenue: categoryTotals[catName].revenue,
      profit: categoryTotals[catName].profit,
      margin: categoryTotals[catName].revenue > 0 ? (categoryTotals[catName].profit / categoryTotals[catName].revenue) * 100 : 0
    }));

    // Historical 6 Months Sales Chart data (Mocked dynamic data for May 2026 backwards)
    // 2025-12, 2026-01, 2026-02, 2026-03, 2026-04, 2026-05
    const monthlyData = [
      { name: 'Décembre', revenue: 380000, profit: 62000 },
      { name: 'Janvier', revenue: 470000, profit: 78000 },
      { name: 'Février', revenue: 420000, profit: 69000 },
      { name: 'Mars', revenue: 590000, profit: 102000 },
      { name: 'Avril', revenue: 640000, profit: 112000 },
      { name: 'Mai', revenue: totalRevenue + 120000, profit: totalProfit + 25000 } // include current sales + standard mock
    ];

    res.json({
      kpis: {
        totalRevenue,
        totalProfit,
        averageMargin,
        totalSalesCount: sales.length, // total orders
        inventoryValue
      },
      categoryBreakdown: categoryBreakdownList,
      monthlyHistory: monthlyData,
      counts: {
        totalProducts: products.length,
        lowStock: products.filter(p => p.status === 'Low Stock').length,
        outOfStock: products.filter(p => p.status === 'Out of Stock').length,
        expired: products.filter(p => p.status === 'Expired').length
      }
    });
  });

  // Vite development or production middleware handler
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ANYARA API] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[ANYARA App Boot Failure]:', err);
});
