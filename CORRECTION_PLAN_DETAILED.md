# 🛠️ PLAN DE CORRECTION COMPLET - ÉLIMINER LES MOCKS

**Date:** 8 février 2026  
**Priorité:** HAUTE (Critique pour UAT)  
**Effort estimé:** 3-4 heures

---

## 📍 RÉCAPITULATIF RAPIDE

Le fichier `Front/src/pages/AdminPanel.tsx` contient **5 sources de mock data** à remplacer par des appels API.

| Ligne | Type | Impact | Complexité |
|------|------|--------|-----------|
| 40-46 | Stats globales (6 cards) | **Critique** | Facile |
| 48-70 | Calendrier ateliers | Moyen | Facile |
| 72-86 | Liste artisans | **Critique** | Facile |
| 88-101 | Liste commandes | **Critique** | Moyen |
| 334-350 | Activité récente | Moyen | Moyen |

---

## ✅ PLAN DÉTAILLÉ

### ÉTAPE 1: Remplacer les 6 STATS CARDS (Ligne 40-46)

**Objectif:** Afficher les vraies statistiques du backend au lieu de hardcodés.

**Approche:**
```tsx
// AVANT (Mock) - AdminPanel.tsx ligne 40-46
const adminStats = {
  totalProductSales: 2450000,
  totalWorkshopSales: 890000,
  totalArtisans: 23,
  totalOrders: 89,
  pendingQuotes: 7,
  activeSubscriptions: 45
};

// APRÈS (API)
const [adminStats, setAdminStats] = useState({
  totalProductSales: 0,
  totalWorkshopSales: 0,
  totalArtisans: 0,
  totalOrders: 0,
  pendingQuotes: 0,
  activeSubscriptions: 0
});

useEffect(() => {
  loadAdminStats();
}, []);

const loadAdminStats = async () => {
  try {
    // Appel API: /admin/analytics/overview
    const overview = await apiService.getAdminOverview();
    
    // Appel API: /admin/analytics/revenue
    const revenue = await apiService.getAdminRevenue();
    
    // Appel API: /admin/analytics/artisans
    const artisans = await apiService.getAdminArtisans();
    
    // Appel API: /admin/quotes/stats/overview
    const quoteStats = await apiService.getQuoteStatsOverview();
    
    // Appel API: /admin/subscriptions/overview (déjà implémenté)
    const subscriptionOverview = await apiService.getSubscriptionsOverview();
    
    setAdminStats({
      totalProductSales: revenue.total_product_revenue || 0,
      totalWorkshopSales: revenue.total_workshop_revenue || 0,
      totalArtisans: artisans.total_artisans || 0,
      totalOrders: overview.total_orders || 0,
      pendingQuotes: quoteStats.pending_count || 0,
      activeSubscriptions: subscriptionOverview.total_active || 0
    });
  } catch (error) {
    console.error('Erreur chargement stats:', error);
    setError('Impossible de charger les statistiques');
  }
};
```

**Fichiers à modifier:**
- ✏️ `Front/src/pages/AdminPanel.tsx` (lignes 40-46, + useState/useEffect)
- ✏️ `Front/src/services/api.ts` (ajouter les méthodes si manquantes)

**Endpoints utilisés:**
- `GET /admin/analytics/overview`
- `GET /admin/analytics/revenue`
- `GET /admin/analytics/artisans`
- `GET /admin/quotes/stats/overview`
- `GET /admin/subscriptions/overview` (déjà OK)

**Effort:** 45 min

---

### ÉTAPE 2: Remplacer le Calendrier Ateliers (Ligne 48-70)

**Objectif:** Afficher les vrais ateliers à venir au lieu de hardcodés.

**Approche:**
```tsx
// AVANT (Mock)
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
  // ...
];

// APRÈS (API)
const [upcomingWorkshops, setUpcomingWorkshops] = useState<any[]>([]);

const loadUpcomingWorkshops = async () => {
  try {
    // Appel API with filters
    const response = await apiService.getWorkshops({
      skip: 0,
      limit: 10,
      status: 'published',
      upcoming: true // Filter only future workshops
    });
    
    // Transform backend format to component format
    const workshops = response.workshops.map(ws => ({
      id: ws.id,
      title: ws.title,
      date: new Date(ws.start_date),
      time: `${ws.start_date.split('T')[1]}-${ws.end_date.split('T')[1]}`,
      artisan: ws.artisan_name,
      type: 'artizaho' as const,
      participants: ws.current_bookings || 0,
      maxParticipants: ws.max_participants
    }));
    
    setUpcomingWorkshops(workshops.slice(0, 3)); // Top 3 upcoming
  } catch (error) {
    console.error('Erreur ateliers:', error);
  }
};
```

**Fichiers à modifier:**
- ✏️ `Front/src/pages/AdminPanel.tsx` (lignes 48-70)
- ✏️ `Front/src/services/api.ts` si méthode manquante

**Endpoint utilisé:**
- `GET /workshops` (avec filtres)

**Effort:** 30 min

---

### ÉTAPE 3: Remplacer la Liste ARTISANS (Ligne 72-86)

**Objectif:** Afficher la vraie liste des artisans du backend avec actions fonctionnelles.

**Approche:**
```tsx
// AVANT (Mock)
const recentArtisans = [
  {
    id: 1,
    name: 'Naina Rasoarivelo',
    specialty: 'Poterie',
    location: 'Toliara',
    joinDate: '2024-05-20',
    status: 'pending'
  },
  // ...
];

// APRÈS (API)
const [recentArtisans, setRecentArtisans] = useState<any[]>([]);
const [artisansLoading, setArtisansLoading] = useState(false);

const loadArtisans = async () => {
  try {
    setArtisansLoading(true);
    const response = await apiService.getArtisans({
      skip: 0,
      limit: 10,
      sort_by: 'created_at',
      order: 'desc'
    });
    
    const artisans = response.users.map(user => ({
      id: user.id,
      name: user.full_name,
      specialty: user.artisan_profile?.main_specialty || 'Non spécifié',
      location: user.artisan_profile?.region || user.city || 'Madagascar',
      joinDate: user.created_at?.split('T')[0],
      status: user.artisan_profile?.status.value || 'unknown',
      // Add new fields for actions
      email: user.email,
      avatar: user.avatar
    }));
    
    setRecentArtisans(artisans);
  } catch (error) {
    console.error('Erreur chargement artisans:', error);
  } finally {
    setArtisansLoading(false);
  }
};

// Actions handlers
const handleViewProfile = (artisanId: string) => {
  navigate(`/artisans/${artisanId}`);
};

const handleManageProducts = (artisanId: string) => {
  navigate(`/admin/products?artisan=${artisanId}`);
};
```

**Modification du JSX (ligne 394-415):**
```tsx
// AVANT
<Button size="sm" variant="outline">Voir profil</Button>
<Button size="sm" variant="outline">Gérer produits</Button>

// APRÈS
<Button 
  size="sm" 
  variant="outline"
  onClick={() => handleViewProfile(artisan.id)}
>
  Voir profil
</Button>
<Button 
  size="sm" 
  variant="outline"
  onClick={() => handleManageProducts(artisan.id)}
>
  Gérer produits
</Button>
```

**Fichiers à modifier:**
- ✏️ `Front/src/pages/AdminPanel.tsx` (lignes 72-86, 394-415)
- ✏️ `Front/src/services/api.ts` - ajouter `getArtisans()` si manquante

**Endpoint utilisé:**
- `GET /users` avec filtre `role=artisan`

**Effort:** 40 min

---

### ÉTAPE 4: Remplacer la Liste COMMANDES (Ligne 88-101)

**Objectif:** Afficher les vraies commandes avec pagination et filtres.

**Approche:**
```tsx
// AVANT (Mock)
const recentOrders = [
  {
    id: 1,
    buyer: 'Marie Dubois',
    artisan: 'Hery Rakoto',
    amount: 45000,
    date: '2024-05-25',
    status: 'completed'
  },
  // ...
];

// APRÈS (API)
const [ordersData, setOrdersData] = useState<OrderOut[]>([]);
const [ordersLoading, setOrdersLoading] = useState(false);
const [orderStats, setOrderStats] = useState({
  total: 0,
  page: 0,
  limit: 20
});

const loadOrders = async (page: number = 0) => {
  try {
    setOrdersLoading(true);
    const response = await apiService.getOrders({
      skip: page * 20,
      limit: 20,
      sort_by: 'created_at',
      order: 'desc'
    });
    
    setOrdersData(response.orders);
    setOrderStats({
      total: response.total,
      page,
      limit: 20
    });
  } catch (error) {
    console.error('Erreur chargement commandes:', error);
  } finally {
    setOrdersLoading(false);
  }
};
```

**Modification du JSX (ligne 460-481):**
```tsx
// AVANT
{recentOrders.map((order) => (...))}

// APRÈS
{ordersLoading ? (
  <div>Chargement...</div>
) : ordersData.length === 0 ? (
  <div>Aucune commande</div>
) : (
  ordersData.map((order) => (
    <div key={order.id}>
      <h3>Commande #{order.order_number || order.id.slice(0, 8)}</h3>
      <p>{order.user_name} → Artisan ID: {order.artisan_id}</p>
      <p>{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
      <div className="font-medium text-orange-600">
        {formatCurrency(order.total_amount, language)}
      </div>
      <span>{order.status}</span>
    </div>
  ))
)}
```

**Fichiers à modifier:**
- ✏️ `Front/src/pages/AdminPanel.tsx` (lignes 88-101, 460-481)
- ✏️ `Front/src/services/api.ts` - ajouter `getOrders()` si manquante

**Endpoint utilisé:**
- `GET /orders`

**Effort:** 50 min

---

### ÉTAPE 5: Remplacer ACTIVITÉ RÉCENTE (Ligne 334-350)

**Objectif:** Afficher un vrai log d'activités au lieu de hardcoder.

**Approche - Option A (Rapide): Hideractivity section temporairement**
```tsx
// Commenté jusqu'à ce qu'un endpoint d'audit log existe
{/* <Card>
  <CardHeader>
    <CardTitle>Activité récente</CardTitle>
  </CardHeader>
  <CardContent>
    {recentActivity.map((activity) => (...))}
  </CardContent>
</Card> */}
```

**Approche - Option B (Recommandée): Implémenter un endpoint d'audit log**

Backend: Créer endpoint `GET /admin/activity-log` qui log:
- Validations d'artisans
- Créations de commandes
- Ajouts de produits
- Réservations d'ateliers
- Créations d'abonnements

```python
# Back/app/api/v1/endpoints/admin.py
@router.get("/activity-log")
async def get_activity_log(
    skip: int = Query(0),
    limit: int = Query(10),
    db: Session = Depends(get_db)
):
    """Récupère le log d'activité de la plateforme"""
    # À implémenter
    pass
```

Frontend:
```tsx
const [recentActivity, setRecentActivity] = useState([]);

const loadActivityLog = async () => {
  const response = await apiService.getAdminActivityLog(0, 10);
  setRecentActivity(response.activities);
};
```

**Effort:** 45 min (Option B) ou 5 min (Option A)

---

## 🔧 MODIFICATIONS FICHIER: Front/src/services/api.ts

Ajouter ces méthodes si manquantes:

```typescript
// Admin Stats & Analytics
async getAdminOverview(): Promise<any> {
  return this.get('/admin/analytics/overview');
}

async getAdminRevenue(): Promise<any> {
  return this.get('/admin/analytics/revenue');
}

async getAdminArtisans(): Promise<any> {
  return this.get('/admin/analytics/artisans');
}

async getQuoteStatsOverview(): Promise<any> {
  return this.get('/admin/quotes/stats/overview');
}

// Users/Artisans
async getArtisans(filters?: any): Promise<any> {
  const params = new URLSearchParams({
    role: 'artisan',
    ...filters
  });
  return this.get(`/users?${params.toString()}`);
}

// Orders
async getOrders(filters?: any): Promise<any> {
  const params = new URLSearchParams(filters);
  return this.get(`/orders?${params.toString()}`);
}

// Workshops
async getWorkshopsUpcoming(limit: number = 10): Promise<any> {
  return this.get(`/workshops?status=published&upcoming=true&limit=${limit}`);
}

// Activity Log (si endpoint existe)
async getAdminActivityLog(skip: number = 0, limit: number = 10): Promise<any> {
  return this.get(`/admin/activity-log?skip=${skip}&limit=${limit}`);
}
```

---

## 📋 CHECKLIST D'IMPLÉMENTATION

### Phase 1: Stats & Analytics (30 min)
- [ ] Ajouter `useState` pour `adminStats` 
- [ ] Ajouter `useEffect` pour `loadAdminStats()`
- [ ] Implémenter appels parallèles aux 4 endpoints
- [ ] Ajouter gestion d'erreur + loading state
- [ ] Tester l'affichage des 6 cards

### Phase 2: Ateliers (20 min)
- [ ] Remplacer `upcomingWorkshops` mock
- [ ] Ajouter `useState` pour workshops
- [ ] Implémenter `loadUpcomingWorkshops()`
- [ ] Tester le calendrier

### Phase 3: Artisans (30 min)
- [ ] Remplacer `recentArtisans` mock
- [ ] Ajouter `useState` pour artisans
- [ ] Implémenter `loadArtisans()`
- [ ] Implémenter actions "Voir profil" et "Gérer produits"
- [ ] Tester navigation

### Phase 4: Commandes (30 min)
- [ ] Remplacer `recentOrders` mock
- [ ] Ajouter `useState` pour orders
- [ ] Implémenter `loadOrders()` avec pagination
- [ ] Ajouter loading state
- [ ] Tester pagination

### Phase 5: Activité (15 min)
- [ ] Option A (recommandée pour MVP): Commenter la section
- [ ] Option B (futur): Créer endpoint `/admin/activity-log`

**Temps total estimé:** 2-3 heures (45 min chaque étape + tests)

---

## 🧪 TESTS À EFFECTUER

```bash
# 1. Vérifier que les endpoints backend retournent des données
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/v1/admin/analytics/overview

# 2. Vérifier les types de réponse
# Valider que chaque endpoint retourne le format attendu

# 3. Tester le chargement en parallèle
# Vérifier que Promise.all() fonctionne

# 4. Tester error handling
# Tester avec API inactive

# 5. Vérifier la performance
# Les carrés de stats se chargent-elles en moins de 2s?

# 6. Vérifier l'affichage
# Les valeurs Real Data s'affichent-elles correctement?
```

---

## 🎯 BÉNÉFICES APRÈS CORRECTION

✅ **Admins voient les vraies données** de la plateforme  
✅ **Onglet "Artisans" fonctionnel** pour éditer/voir les artisans  
✅ **Onglet "Commandes" fonctionnel** pour suivre les commissions  
✅ **Stats en temps réel** mises à jour depuis le backend  
✅ **Actions boutons réelles** (navigation vers détails)  
✅ **Prêt pour UAT** avec données réelles

---

## 📌 NOTES IMPORTANTES

### Sur apiService
- Vérifier que vous utilisez `apiService.get()` et non `fetch()` direct
- Les méthodes API doivent être cohérentes avec les types TypeScript
- Types doivent être dans `Front/src/types/admin.ts`

### Sur le loading state
- Ajouter spinner pendant le chargement des stats
- Ajouter messages d'erreur clairs
- Retry button en cas d'erreur

### Sur la pagination
- Implémenter pour les artisans et commandes
- Garder les filtres actifs lors du pagination
- Afficher le nombre total d'items

---

## 🚀 NEXT STEPS

1. **Lire les réponses API actuelles** des endpoints existants
2. **Ajouter les types TypeScript** manquants dans `admin.ts`
3. **Implémenter les méthodes** dans `api.ts`
4. **Remplacer les mocks** une étape à la fois
5. **Tester chaque étape** avant de passer à la suivante
6. **Faire une PR avec les changements**
