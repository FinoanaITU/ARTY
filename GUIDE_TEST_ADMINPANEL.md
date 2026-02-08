# 🚀 GUIDE DE TEST RAPIDE - ADMIN PANEL

**Objectif:** Tester l'intégration frontend complétée  
**Durée:** 10 minutes  
**Prérequis:** Backend running, compte admin créé

---

## 📋 CHECKLIST DE TEST

### ✅ Étape 1: Démarrer l'environnement (2 min)

```bash
# Terminal 1: Backend (si pas déjà démarré)
cd /Users/finoanaandriatsilavo/Documents/ARTY
make restart

# Terminal 2: Frontend
cd /Users/finoanaandriatsilavo/Documents/ARTY/Front
npm run dev

# Attendre que le frontend démarre sur http://localhost:5173
```

---

### ✅ Étape 2: Connexion Admin (1 min)

1. Ouvrir: http://localhost:5173
2. Se connecter avec compte admin
3. Naviguer vers: http://localhost:5173/admin

**✓ Attendu:** La page AdminPanel s'affiche

---

### ✅ Étape 3: Tester les Stats Cards (2 min)

**Ce que vous devez voir:**

```
┌─────────────────┬─────────────────┬─────────────────┐
│ Ventes Produits │ Ventes Ateliers │   Artisans      │
│   XX,XXX Ar     │   XX,XXX Ar     │      XX         │
└─────────────────┴─────────────────┴─────────────────┘

┌─────────────────┬─────────────────┬─────────────────┐
│   Commandes     │ Devis en attente│  Abonnements    │
│      XX         │       XX        │      XX         │
└─────────────────┴─────────────────┴─────────────────┘
```

**✅ Vérifications:**
- [ ] Les 6 cards s'affichent
- [ ] Les valeurs sont des VRAIS chiffres (pas 2450000, 890000, 23, etc.)
- [ ] Pendant le chargement: message "Chargement des statistiques..."
- [ ] Si erreur: message d'erreur + bouton "Réessayer"

**⚠️ Si les valeurs sont à 0:** Normal si la base de données est vide

---

### ✅ Étape 4: Tester l'Onglet "Artisans" (2 min)

1. Cliquer sur l'onglet **"Artisans"**

**✅ Vérifications:**
- [ ] Liste des artisans s'affiche (si base non-vide)
- [ ] Informations affichées: Nom, Spécialité, Localisation, Date d'inscription
- [ ] Pendant le chargement: "Chargement des artisans..."
- [ ] Si base vide: "Aucun artisan trouvé"

2. **Tester les boutons:**
   - Cliquer sur **"Voir profil"** d'un artisan
   
   **✅ Attendu:** Navigation vers `/artisans/{id}` (profil de l'artisan)
   
   - Cliquer sur **"Gérer produits"** d'un artisan
   
   **✅ Attendu:** Toast affiché "Fonction à venir"

---

### ✅ Étape 5: Tester l'Onglet "Commandes & Ateliers" (2 min)

1. Cliquer sur l'onglet **"Commandes & Ateliers"**
2. Cliquer sur le sous-onglet **"Commandes Produits"**

**✅ Vérifications:**
- [ ] Liste des commandes s'affiche (si base non-vide)
- [ ] Informations: Numéro commande, Acheteur → Artisan, Date, Montant, Statut
- [ ] Pendant le chargement: "Chargement des commandes..."
- [ ] Si base vide: "Aucune commande trouvée"
- [ ] Les montants sont en Ar (Ariary)
- [ ] Les statuts ont des couleurs (Terminé = vert, En cours = orange)

3. Cliquer sur le sous-onglet **"Réservations Ateliers"**

**✅ Attendu:** Tableau des paiements d'ateliers (déjà fonctionnel)

---

### ✅ Étape 6: Tester la Vue d'Ensemble (1 min)

1. Retourner à l'onglet **"Vue d'ensemble"**

**✅ Vérifications:**

**Section "Actions rapides":**
- [ ] 4 boutons affichés avec les vrais chiffres entre parenthèses
- [ ] Cliquer "Traiter les devis en attente (X)" → Change vers onglet "Devis manuels"
- [ ] Cliquer "Suivre les commandes (X)" → Change vers onglet "Commandes & Ateliers"
- [ ] Cliquer "Gérer les artisans (X)" → Change vers onglet "Artisans"
- [ ] Cliquer "Gérer les abonnements (X)" → Change vers onglet "Abonnements"

**Section "Calendrier des ateliers à venir":**
- [ ] Si ateliers publiés futurs: 3 ateliers affichés
- [ ] Si pas d'ateliers: Calendrier vide
- [ ] Chaque atelier affiche: Titre, Date, Horaire, Artisan, Participants

---

### ✅ Étape 7: Test de Gestion d'Erreurs (2 min)

**Test 1: Backend offline**

```bash
# Dans un terminal
docker-compose down
```

1. Rafraîchir la page admin (F5)

**✅ Attendu:**
- Message d'erreur: "Impossible de charger les statistiques"
- Bouton "Réessayer" s'affiche
- Les autres onglets peuvent aussi montrer des erreurs

2. Redémarrer le backend:
```bash
docker-compose up -d
```

3. Cliquer sur "Réessayer"

**✅ Attendu:** Les données se rechargent

---

## 🔍 DEBUGGING

### Console du Navigateur (F12)

**Ouvrir la console pour voir:**

```javascript
// Pas d'erreurs rouges attendues
// Peut avoir des warnings oranges (normaux)

// Pour débugger:
// 1. Aller dans l'onglet "Network"
// 2. Filtrer par "Fetch/XHR"
// 3. Vérifier les requêtes API:
//    - GET /admin/analytics/overview
//    - GET /admin/analytics/revenue
//    - GET /admin/analytics/artisans
//    - GET /admin/quotes/stats/overview
//    - GET /admin/subscriptions/overview
//    - GET /workshops
//    - GET /users (ou /admin/users)
//    - GET /orders
```

**Codes de statut attendus:**
- ✅ **200:** Succès
- ✅ **401:** Non authentifié (se reconnecter)
- ⚠️ **404:** Endpoint non trouvé (vérifier routing backend)
- ⚠️ **500:** Erreur serveur (vérifier logs backend)

---

### Vérifier les Logs Backend

```bash
# Voir les logs du backend
docker logs arty-backend --tail 100 -f

# Chercher les erreurs
docker logs arty-backend 2>&1 | grep -i "error\|exception"
```

---

## 📊 RÉSULTATS ATTENDUS

### Scénario 1: Base de données vide
```
Stats Cards: Toutes à 0
Artisans: "Aucun artisan trouvé"
Commandes: "Aucune commande trouvée"
Calendrier: Vide
Actions rapides: Boutons avec (0)
```

**✅ Normal!** C'est le comportement attendu.

---

### Scénario 2: Base avec données de test
```
Stats Cards: Valeurs réelles (ex: 150000 Ar, 5 artisans, etc.)
Artisans: Liste de 1-10 artisans
Commandes: Liste de 1-10 commandes
Calendrier: 0-3 ateliers futurs
Actions rapides: Boutons avec vrais chiffres
```

**✅ Parfait!** L'intégration fonctionne.

---

### Scénario 3: Endpoint backend manquant (ex: /users retourne 404)
```
Stats Cards: Certaines valeurs à 0
Artisans: "Aucun artisan trouvé" (même si artisans existent)
Console: Erreur 404 pour GET /api/v1/users
```

**⚠️ À corriger:**

```typescript
// Dans Front/src/services/api.ts
// Modifier le chemin de l'endpoint

// Option 1: Utiliser /admin/users
const response = await this.api.get(`/admin/users?${searchParams}`);

// Option 2: Utiliser les données de l'analytics
async getUsers(params) {
  if (params.role === 'artisan') {
    const artisans = await this.getAdminArtisanStats();
    // Transformer les stats en liste d'utilisateurs
  }
}
```

---

## ✅ CHECKLIST FINALE

**Avant de valider l'intégration:**

- [ ] Les 6 stats cards affichent des vraies données
- [ ] L'onglet Artisans fonctionne (liste + boutons)
- [ ] L'onglet Commandes fonctionne (liste)
- [ ] Les actions rapides redirigent vers les bons onglets
- [ ] Le calendrier affiche les ateliers futurs (si applicable)
- [ ] Les loading states s'affichent pendant le chargement
- [ ] Les erreurs sont gérées gracieusement
- [ ] Le bouton "Réessayer" fonctionne
- [ ] Aucune erreur console (404/500) non résolue
- [ ] La navigation vers profil artisan fonctionne

**Si tous les items sont cochés:** ✅ **INTÉGRATION VALIDÉE!**

---

## 🎉 SUCCÈS!

Si tous les tests passent, félicitations! 🎊

**Prochaines étapes:**
1. Tester avec de vraies données de production
2. Faire une démo aux stakeholders
3. Préparer l'UAT (User Acceptance Testing)
4. Déployer en production

---

## 🆘 EN CAS DE PROBLÈME

**Problème:** Stats à 0 alors que données existent  
**Solution:** Vérifier logs backend, vérifier endpoints API dans /docs

**Problème:** Erreur 404 sur certains endpoints  
**Solution:** Vérifier le routing dans `Back/app/api/v1/router.py`

**Problème:** Erreur authentication  
**Solution:** Se déconnecter et reconnecter, vérifier le token JWT

**Problème:** Frontend ne démarre pas  
**Solution:** `cd Front && rm -rf node_modules && npm install && npm run dev`

**Problème:** Backend ne répond pas  
**Solution:** `docker-compose down && docker-compose up -d --build`

---

**Guide créé par:** Senior Python/FastAPI/ReactJS Developer  
**Date:** 9 février 2026  
**Version:** 1.0.0
