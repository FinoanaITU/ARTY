# 📊 ANALYSE DES VALEURS STATIQUES & MOCKÉES - ADMIN PANEL

**Analyse complète effectuée le:** 8 février 2026  
**Développeur Senior:** Python/FastAPI/ReactJS  
**Fichier concerné:** `Front/src/pages/AdminPanel.tsx` (569 lignes)

---

## 🎯 RÉSUMÉ EXÉCUTIF

Le **AdminPanel.tsx** contient encore **4 sources majeures de données statiques/mockées** affectant 4 onglets:

| Onglet | Type de Mock | Statut | Impact |
|--------|-------------|--------|--------|
| **Vue d'ensemble** | Stats + Calendrier + Activité | ❌ 100% MOCKÉE | Critique |
| **Artisans** | Liste d'artisans | ❌ 100% MOCKÉE | Critique |
| **Commandes & Ateliers** | Tab 1: Commandes | ❌ 100% MOCKÉE | Critique |
| **Commandes & Ateliers** | Tab 2: Réservations | ✅ API - OK | - |

**Impact:**
- ❌ Les administrateurs voient des données fictives
- ❌ Impossible de gérer les artisans réels
- ❌ Impossible de suivre les vraies commandes
- ✅ Les subscriptions (Phase 5) sont 100% operationnelles

---

## 🔍 DÉTAIL DES DONNÉES MOCKÉES

### 1️⃣ **ONG "Vue d'ensemble" - STATS CARD (Lignes 40-46)**

**Fichier:** `Front/src/pages/AdminPanel.tsx` (lignes 40-46)

```tsx
const adminStats = {
  totalProductSales: 2450000,      // ⛔ MOCK
  totalWorkshopSales: 890000,      // ⛔ MOCK
  totalArtisans: 23,               // ⛔ MOCK
  totalOrders: 89,                 // ⛔ MOCK
  pendingQuotes: 7,                // ⛔ MOCK
  activeSubscriptions: 45          // ⛔ MOCK - MAIS utilise AdminSubscriptionManager
};
```

**Où utilisées:**
- Lignes 280-311: 6 cards statistiques dans le header du panel
- Lignes 367-369: Boutons rapides qui référent ces chiffres

**API Backend disponible:**
- ✅ `GET /admin/subscriptions/overview` - retourne les vrais chiffres pour activeSubscriptions
- ❓ Pour les autres stats: à vérifier dans `Back/app/api/v1/endpoints/admin.py`

---

### 2️⃣ **ONG "Vue d'ensemble" - Calendrier Ateliers (Lignes 48-70)**

**Fichier:** `Front/src/pages/AdminPanel.tsx` (lignes 48-70)

```tsx
const upcomingWorkshops = [
  {
    id: '1',
    title: 'Sculpture sur bois traditionnel',
    date: new Date('2024-06-15'),
    time: '14h00-17h00',
    artisan: 'Hery Rakoto',
    type: 'artizaho' as const,
    participants: 8,
    maxParticipants: 12
  },
  // ... 2 autres ateliers fictifs
];
```

**Impact:** Le calendrier `<WorkshopCalendar>` affiche des workshops fictifs

**API Backend disponible:**
- ✅ `GET /workshops` - récupère les vrais ateliers
- ✅ Types: `WorkshopOut` dans `Front/src/types/workshop.ts`

---

### 3️⃣ **ONG "Vue d'ensemble" - Activité Récente (Lignes 334-350)**

**Fichier:** `Front/src/pages/AdminPanel.tsx` (lignes 334-350)

```tsx
<div className="space-y-3">
  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
    <span className="text-sm">Atelier Artizaho réservé</span>
    <Badge variant="secondary">Il y a 1h</Badge>
  </div>
  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
    <span className="text-sm">Nouvel abonnement Premium</span>
    <Badge variant="secondary">Il y a 2h</Badge>
  </div>
  // ... 2 autres activités fictives
</div>
```

**Impact:** Activité fictive affichée aux admins

**API Backend disponible:**
- ❓ À vérifier: Endpoint pour activity/audit log

---

### 4️⃣ **ONG "Artisans" - Liste Artisans (Lignes 72-86)**

**Fichier:** `Front/src/pages/AdminPanel.tsx` (lines 72-86)

```tsx
const recentArtisans = [
  {
    id: 1,
    name: 'Naina Rasoarivelo',
    specialty: 'Poterie',
    location: 'Toliara',
    joinDate: '2024-05-20',
    status: 'pending'
  },
  {
    id: 2,
    name: 'Fidy Andrianaivoson',
    specialty: 'Bijouterie',
    location: 'Mahajanga',
    joinDate: '2024-05-18',
    status: 'approved'
  }
];
```

**Où utilisée:** Ligne 394-415 - Onglet "Artisans"

**Actions affichées:**
- "Voir profil" - n'appelle rien
- "Gérer produits" - n'appelle rien

**API Backend disponible:**
- ✅ `GET /admin/artisans` ou `GET /users?role=artisan` 
- ✅ Types: `UserOut` dans `Front/src/types/user.ts`

---

### 5️⃣ **ONG "Commandes & Ateliers" - Tab "Commandes Produits" (Lignes 88-101)**

**Fichier:** `Front/src/pages/AdminPanel.tsx` (lines 88-101)

```tsx
const recentOrders = [
  {
    id: 1,
    buyer: 'Marie Dubois',
    artisan: 'Hery Rakoto',
    amount: 45000,
    date: '2024-05-25',
    status: 'completed'
  },
  {
    id: 2,
    buyer: 'Jean Martin',
    artisan: 'Voahangy Razafy',
    amount: 65000,
    date: '2024-05-24',
    status: 'processing'
  }
];
```

**Où utilisée:** Lignes 457-481 - Tab "Commandes Produits"

**Impact:** Affiche 2 commandes fictives au lieu des vraies

**API Backend disponible:**
- ✅ `GET /admin/orders` ou `GET /orders?role=admin`
- ✅ Types: `OrderOut` dans `Front/src/types/order.ts`

---

## 📋 TABLEAU DE COMPARAISON: MOCK vs RÉEL

| Donnée | Source Actuelle | Endpoint Disponible | Status |
|--------|-----------------|-------------------|--------|
| Ventes Produits | `adminStats.totalProductSales` | ❓ À vérifier | À implémenter |
| Ventes Ateliers | `adminStats.totalWorkshopSales` | ✅ `GET /admin/analytics/revenue` | À implémenter |
| Nbr Artisans | `adminStats.totalArtisans` | ✅ `GET /admin/analytics/artisans` | À implémenter |
| Nbr Commandes | `adminStats.totalOrders` | ✅ `GET /admin/analytics/overview` | À implémenter |
| Devis Attente | `adminStats.pendingQuotes` | ✅ `GET /admin/quotes/stats/overview` | À implémenter |
| Abonnements Actifs | `adminStats.activeSubscriptions` | ✅ `GET /admin/subscriptions/overview` | ✅ OK |
| Ateliers à Venir | `upcomingWorkshops` | ✅ `GET /workshops?status=published` | À implémenter |
| Artisans | `recentArtisans` | ✅ `GET /users?role=artisan` | À implémenter |
| Commandes | `recentOrders` | ✅ `GET /orders` | À implémenter |
| Activité Récente | Hardcodée | ❓ Audit log API | À concevoir |

---

## 🛠️ PLAN DE ACTION

### Phase 1: Verification Backend (Priorité 1)
```bash
1. Vérifier endpoints disponibles dans Back/app/api/v1/endpoints/admin.py
2. Vérifier quels DTO/schemas existent pour retourner les stats globales
3. Identifier les endpoints manquants pour analytics
```

### Phase 2: Implémentation Frontend (Priorité 2)

**Tab "Vue d'ensemble":**
1. Remplacer `adminStats` statiques par appel API
2. Remplacer `upcomingWorkshops` par appel `GET /workshops?upcoming=true`
3. Implémenter "Activité Récente" via audit log

**Tab "Artisans":**
1. Remplacer `recentArtisans` par appel `GET /users?role=artisan`
2. Implémenter actions: "Voir profil" → navigation vers détails
3. Implémenter "Gérer produits" → lister produits de l'artisan

**Tab "Commandes & Ateliers":**
1. Remplacer `recentOrders` par appel `GET /orders`
2. Implémenter filtres, pagination, recherche

### Phase 3: Optimisations (Priorité 3)
1. Ajouter caching des stats (mise à jour chaque 5min)
2. Implémenter real-time updates avec WebSocket
3. Ajouter filtres temporels aux stats

---

## 📁 FICHIERS AFFECTÉS

```
Front/src/
├── pages/
│   └── AdminPanel.tsx                    ⛔ Contient TOUS les mocks
├── services/
│   └── api.ts                            ← À étendre avec nouvelles méthodes
├── types/
│   └── admin.ts                          ← Pour les nouveaux DTOs
└── components/
    └── admin/
        └── AdminSubscriptionManager.tsx  ✅ Déjà 100% API
```

---

## 🚨 NOTES IMPORTANTES

### ✅ Ce qui marche déjà:
- ✅ Tab "Abonnements" (Phase 5) - 100% API
- ✅ Tab "Validation" - utilise `ValidationManager.tsx` (100% API)
- ✅ Tab "Devis manuels" - utilise `QuoteManager.tsx` (100% API)
- ✅ Tab "Analytiques" - utilise `AnalyticsDashboard.tsx` (100% API)
- ✅ Tab "Payouts" - récupère via `loadPayouts()`
- ✅ Tab "Réservations Ateliers" - récupère via `loadPayments()`

### ❌ Ce qui ne marche pas:
- ❌ Vue d'ensemble (6 stats) - 100% mockée
- ❌ Calendrier ateliers - 100% mockée
- ❌ Activité récente - hardcodée
- ❌ Onglet Artisans - 100% mockée
- ❌ Commandes produits - 100% mockée

### 📌 Actions "Boutons" qui ne font rien:
- Ligne 404: `onClick={() => setActiveTab('workshops')}` - onglet n'existe pas (workshop vs workshops)
- Ligne 411-415: Buttons "Voir profil" et "Gérer produits" - n'ont pas d'`onClick`

---

## 📊 MATRICE DE PRIORITÉS

```
Impact élevé + Complexité faible:
  → Tab "Artisans" + List filter + Actions
  → Stats header (6 cards)

Impact élevé + Complexité moyenne:
  → Tab "Commandes Produits" + pagination
  → Calendrier ateliers

Impact moyen + Complexité moyenne:
  → Activité récente
  → Intégration audit log
```

---

**Prochaine étape:** Lancer l'implémentation backend → frontend
