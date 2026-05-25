# Supermarché ANYARA - Système de Gestion d'Inventaire et de Caisse Intégrée (SGI-C)

Un système moderne, fluide et performant conçu pour la gestion opérationnelle complète des supermargets et supérettes de proximité en Algérie.

---

## 📋 DESCRIPTION DU PROJET

### 1. Concept Général
Le projet **Supermarché ANYARA** est un système de gestion d'inventaire et de caisse (SGI-C) connecté, conçu spécifiquement pour simplifier le quotidien des supérettes et commerces de détail. Il résout les problèmes de ruptures de stock imprévues, d'erreurs de caisse manuelles, de produits périmés non surveillés, et offre un outil d'aide à la décision grâce à des rapports analytiques professionnels.

### 2. Fonctionnalités Principales
*   **Tableau de Bord Holistique (Dashboard) :** Indicateurs clés de performance en temps réel (chiffre d'affaires journalier, marge de profit, alertes de stocks bas et produits presque périmés).
*   **Terminal de Caisse Interactif (Point de Vente - POS) :** Saisie rapide, gestion de panier fluide, encaissement rapide avec calcul automatique de la monnaie à rendre en Dinars Algériens (DZD) et mise à jour instantanée du stock.
*   **Lecteur de Code-Barres Virtuel / Simulateur Intelligent :** Permet d'émuler l'utilisation d'une douchette de caisse pour ajouter ou chercher instantanément des produits par SKU (ex: `COF-ELBOUN`, `MILK-001`, `DET-ARIEL`).
*   **Gestion Complete de l'Inventaire :** Ajout, modification, alerte automatique de seuil critique ("Low Stock"), et suivi rigoureux des dates de péremption ("Produits périmés ou proches de péremption").
*   **Analyse Prédictive par Intelligence Artificielle (Gemini) :** Module d'assistance intégré permettant d'analyser la dynamique d'écoulement pour générer des suggestions d'achat optimales, des prévisions de chiffre d'affaires et des rapports d'audit de marge.
*   **Historique des Ventes et Transactions :** Suivi chronologique de toutes les opérations de caisse avec possibilité de filtrer par caissier, par date ou par statut de paiement.

### 3. Utilisateurs du Système
Le système définit deux rôles clés avec une interface parfaitement adaptée à leurs privilèges :
*   **Le Gérant (Admin) :** Accès total. Modification des prix d'achat/vente, gestion des comptes utilisateurs, suivi exhaustif des marges bénéficiaires brutes et accès aux analyses poussées de l'IA.
*   **Le Caissier :** Accès focalisé sur les ventes. Enregistrement rapide des transactions clients, saisie du panier et lecteur de code-barres. Toute modification d'inventaire lui est restreinte pour des raisons évidentes de sécurité.

---

## 🛠️ TECHNOLOGIES UTILISÉES

### 1. Architecture Fichiers & Langages (De A à Z)
L'application utilise une architecture **Full-Stack robuste avec couplage lâche** :

*   **Front-End :**
    *   **TypeScript / React 18 :** Structuration en composants réutilisables, typage statique strict assurant zéro bug d'interface à la compilation.
    *   **Vite :** Bundleur ultra-rapide servant de serveur de développement de pointe.
    *   **Tailwind CSS :** Framework utilitaire moderne garantissant un design soigné, fluide et responsive (adapté aux tablettes d'encaissement et moniteurs de bureau).
    *   **Lucide React :** Set d'icônes vectorielles épurées de qualité professionnelle.

*   **Back-End :**
    *   **Node.js & Express :** Serveur d'API REST robuste gérant les routes d'authentification, de gestion d'inventaire, d'enregistrement des ventes et de communication avec l'IA.
    *   **Persistance des Données (Base de Données) :** Données stockées de manière persistante sur la session active du serveur (Active Memory State) permettant des temps de réponse ultra-courts (< 10ms) et simplifiant le déploiement. Idéal pour une utilisation continue sans latence réseau à la caisse.

*   **Intégration de l'IA (Google Gemini API) :**
    *   API de langage naturel de Google intégrée de manière sécurisée côté serveur (`server.ts`). La clé d'accès reste confidentielle et protégée des navigateurs clients.
    *   L'IA reçoit en entrée la configuration actuelle de l'inventaire et de l'historique des transactions pour formuler des résumés décisionnels précis et des alertes d'approvisionnement personnalisées.

---

## 📂 STRUCTURE DU PROJET

Voici le rôle exact de chaque fichier clé du projet :

```bash
├── server.ts               # Serveur Back-End Node.js / Express. Gère l'API REST, l'état persistant de la base de données en mémoire et l'intégration de la clé Gemini.
├── index.html              # Point d'entrée principal HTML de l'application cliente.
├── package.json            # Déclaration de toutes les dépendances NPM (Express, React, Vite, Tailwind, etc.) et scripts système.
├── tsconfig.json           # Configuration du compilateur TypeScript (règles de typage strictes).
├── vite.config.ts          # Configuration du bundleur de build Vite et de Tailwind CSS.
├── .env.example            # Fichier de modèle documentant les variables d'environnement requises (GEMINI_API_KEY, APP_URL).
│
└── src/                    # Répertoire contenant le Code Source Front-End
    ├── main.tsx            # Point d'entrée de l'application React qui monte le composant racine dans le DOM.
    ├── index.css           # Feuille de style globale intégrant l'importation de Google Fonts (Inter, JetBrains Mono) et l'initialisation de Tailwind.
    ├── App.tsx             # Dispatcher principal et noyau logique de l'interface utilisateur. Gère l'authentification active (Gérant / Caissier) et le rendu des vues.
    │
    └── components/         # Composants d'interface spécialisés
        ├── DashboardView.tsx           # Tableau de bord principal présentant les KPIs majeurs, graphiques d'activité et raccourcis.
        ├── InventoryView.tsx           # Panneau administratif de gestion des produits (ajout, modification de prix/stocks, filtres par catégories d'alimentation).
        ├── PointOfSaleView.tsx         # Terminal dynamique de saisie des ventes (panier d'achat en temps réel, calcul automatique de monnaie).
        ├── BarcodeScannerSimulator.tsx # Simulateur intelligent émulant une douchette laser pour scanner les articles par leur SKU (SKU-scanner).
        ├── SalesHistoryView.tsx        # Journal chronologique centralisant toutes les transactions complétées, en attente ou annulées.
        ├── AnalyticsView.tsx           # Centre d'analyse décisionnelle fournissant les graphes de marges, les tops ventes et intégrant l'IA prédictive.
        └── QuickTour.tsx               # Guide interactif d'initiation rapide au système pour accompagner les nouveaux utilisateurs.
```

---

## 💻 EXIGENCES DU SYSTÈME

### 1. Exigences Fonctionnelles
*   **Authentification sécurisée :** Distinction formelle entre sessions Gérant (`admin@anyara.dz`) et Caissier (`caisse@anyara.dz`).
*   **Flux d'Inventaire en Temps Réel :** Déduction automatique et immédiate du volume en stock à chaque encaissement de transaction.
*   **Générateur d'Alerte intelligent :** Mise en évidence visuelle immédiate des produits dont le stock descend en dessous du seuil spécifié par le gérant.
*   **Export de Statistiques :** Capacité à compiler instantanément les marges brutes bénéficiaires.

### 2. Exigences Non-Fonctionnelles
*   **Performance Exceptionnelle :** Chargement instantané des listes d'articles grâce à l'architecture SPA (Single Page Application).
*   **Haute Disponibilité :** Le code est conçu pour fonctionner localement en continu en ligne ou en réseau interne de supérette.
*   **Protection des Secrets d'API :** L'accès à l'IA Gemini est encapsulé derrière une passerelle côté serveur, éliminant tout risque de piratage de jeton d'authentification.

---

## 🚀 INSTALLATION ET LANCEMENT EN LOCAL

Pour exécuter le projet sur votre propre machine de développement (VS Code, etc.) :

1.  **Cloner le dépôt du projet** ou extraire l'archive ZIP.
2.  **Installer les dépendances système** via votre terminal :
    ```bash
    npm install
    ```
3.  **Configurer la clé d'IA** dans un fichier `.env` à la racine (dupliquez le modèle `.env.example`) :
    ```env
    GEMINI_API_KEY="VotreCleGeminiReelle"
    ```
4.  **Lancer l'application en mode développement** :
    ```bash
    npm run dev
    ```
5.  **Ouvrir l'application** à l'adresse suivante : [http://localhost:3000](http://localhost:3000)

---

### 🔑 COMPTES DE TEST COMPATIBLES
*   **Compte Gérant (Accès complet) :**
    *   **Email :** `admin@anyara.dz`
    *   **Mot de passe :** `admin`
*   **Compte Caissier (Ventes seules) :**
    *   **Email :** `caisse@anyara.dz`
    *   **Mot de passe :** `caisse`
