# 🧪 Tests d'Acceptation Utilisateur (UAT)
## Dashboard Artisan ARTY

**Date:** 7 février 2026  
**Version:** 1.0  
**Testeur:** _________________  
**Environnement:** Development (Local)

---

## ✅ Prérequis - Vérification de l'Environnement

### Backend ✅
- [x] Backend Docker démarré (`make restart`)
- [x] Swagger UI accessible: http://localhost:8000/docs
- [x] Base de données migrée

### Frontend ⏳
- [ ] Frontend démarré (`npm run dev` ou `bun dev`)
- [ ] Accessible sur: http://localhost:5173

---

## 🎯 Objectif des Tests

Valider que le dashboard artisan fonctionne **de bout en bout** avec de vraies données, pas de mock data.

---

## 📝 Scénario 1: Authentification et Navigation
**Durée estimée:** 5 minutes  
**Objectif:** Vérifier login/logout et accès au dashboard

### Étapes

1. **Ouvrir le frontend**
   ```
   URL: http://localhost:5173
   ```
   - [ ] Page d'accueil s'affiche correctement
   
2. **Aller à la page Login**
   ```
   URL: http://localhost:5173/login
   ```
   - [ ] Formulaire de login visible
   - [ ] Champs email et password présents

3. **Créer un compte artisan de test** (si nécessaire)
   
   **Option A: Via Swagger UI**
   - Aller sur http://localhost:8000/docs
   - Trouver `POST /api/v1/auth/register/artisan`
   - Cliquer "Try it out"
   - Utiliser ces données:
   ```json
   {
     "email": "test.artisan@arty.mg",
     "password": "Test123!",
     "name": "Artisan Test",
     "phone": "+261341234567",
     "region": "Analamanga",
     "city": "Antananarivo",
     "company_name": "Atelier Test",
     "main_specialty": "Vannerie",
     "activity_description": "Artisan de test pour UAT",
     "offerings": ["products", "workshops"],
     "documents_not_available": true
   }
   ```
   - [ ] Code de réponse: 201 Created
   - [ ] Réponse contient `access_token` et `user`
   
   **Option B: Via interface frontend**
   - Aller sur http://localhost:5173/signup
   - Sélectionner "Devenir Professionnel"
   - Remplir le formulaire avec les mêmes données
   - [ ] Inscription réussie

4. **Se connecter**
   - Email: `test.artisan@arty.mg`
   - Password: `Test123!`
   - Cliquer "Se connecter"
   
   **Résultats attendus:**
   - [ ] Pas d'erreur affichée
   - [ ] Redirection automatique vers `/artisan-dashboard`
   - [ ] Token sauvegardé (vérifier dans DevTools > Application > Local Storage)
   - [ ] User info visible dans navigation

5. **Navigation dans les onglets**
   - [ ] Onglet "Vue d'ensemble" s'affiche
   - [ ] Onglet "Commandes" accessible
   - [ ] Onglet "Produits" accessible
   - [ ] Onglet "Profil" accessible
   - [ ] Onglet "Ateliers" accessible
   - [ ] Onglet "Disponibilité" accessible

6. **Logout**
   - Cliquer sur le bouton de déconnexion
   - [ ] Redirection vers page login
   - [ ] Token supprimé du localStorage
   - [ ] Impossible d'accéder à `/artisan-dashboard` sans login

**✅ Critères de succès:**
- Authentification fonctionne sans erreur
- Navigation fluide entre onglets
- Logout nettoie la session correctement

---

## 📊 Scénario 2: Statistiques en Temps Réel
**Durée estimée:** 5 minutes  
**Objectif:** Vérifier que les stats affichent de vraies données

### Étapes

1. **Se reconnecter** (si déconnecté)
   - [ ] Login réussi

2. **Observer l'onglet "Vue d'ensemble"**
   
   **Éléments à vérifier:**
   - [ ] **Chiffre d'affaires:** Affiche un montant en Ar (peut être 0 pour nouveau compte)
   - [ ] **Commandes ce mois:** Affiche un nombre (peut être 0)
   - [ ] **Note moyenne:** Affiche une note /5 (peut être 0)
   - [ ] **Produits actifs:** Affiche un nombre (peut être 0)
   
   ⚠️ **IMPORTANT:** Si c'est un nouveau compte, tous les chiffres devraient être **0** ou **vides**.
   Ce n'est **PAS** les mock data (450,000 Ar, 12 commandes, 4.8 étoiles).

3. **Créer un produit de test**
   - Aller sur onglet "Produits"
   - Cliquer "Créer un produit"
   - Remplir les champs minimum:
     - Nom: "Panier Test UAT"
     - Description: "Produit pour tester les statistiques"
     - Catégorie: "Vannerie"
     - Prix: 15000
     - Stock: 10
     - Temps de production: 2 jours
   - [ ] Sauvegarder
   - [ ] Produit apparaît dans la liste

4. **Retourner sur "Vue d'ensemble"**
   - [ ] **Produits actifs** est maintenant **1** (ou +1 si déjà des produits)
   
5. **Créer une commande de test** (via Swagger)
   
   **Étapes dans Swagger UI:**
   
   a. **Créer un panier** (`POST /api/v1/carts/items`)
   - Récupérer l'ID du produit créé
   - Body:
   ```json
   {
     "product_id": "VOTRE_PRODUCT_ID",
     "quantity": 1
   }
   ```
   
   b. **Créer la commande** (`POST /api/v1/orders/`)
   - Récupérer le `cart_id` de la réponse précédente
   - Body:
   ```json
   {
     "cart_id": "VOTRE_CART_ID",
     "shipping_address": {
       "street": "Rue Test",
       "city": "Antananarivo",
       "postal_code": "101",
       "country": "Madagascar"
     }
   }
   ```
   - [ ] Code réponse: 201 Created

6. **Rafraîchir la page dashboard**
   - [ ] **Commandes ce mois:** Maintenant = 1
   - [ ] **Chiffre d'affaires:** = Prix du produit (15,000 Ar)

**✅ Critères de succès:**
- Stats affichent **0** pour nouveau compte (pas mock data)
- Stats se **mettent à jour** quand on crée produit/commande
- Données viennent de la **vraie DB**, pas hardcodées

---

## 🗓️ Scénario 3: Gestion des Indisponibilités
**Durée estimée:** 5 minutes  
**Objectif:** Vérifier CRUD complet des indisponibilités

### Étapes

1. **Aller sur onglet "Disponibilité"**
   - [ ] Calendrier s'affiche
   - [ ] Formulaire d'ajout visible

2. **Ajouter une indisponibilité (jour unique)**
   - Sélectionner Type: "Jour unique"
   - Date début: Choisir une date future (ex: 15 février 2026)
   - Raison: "Test UAT - Congé"
   - Cliquer "Ajouter"
   
   **Résultats attendus:**
   - [ ] Toast de confirmation "Indisponibilité ajoutée"
   - [ ] Période apparaît dans la liste
   - [ ] Calendrier met en surbrillance la date

3. **Ajouter une plage de dates**
   - Sélectionner Type: "Plage de dates"
   - Date début: 20 février 2026
   - Date fin: 25 février 2026
   - Raison: "Formation professionnelle UAT"
   - [ ] Plage ajoutée et visible

4. **Vérifier la persistance**
   - **Rafraîchir la page (F5)**
   - [ ] ⚠️ **CRITIQUE:** Les 2 indisponibilités sont **toujours visibles**
   - Ceci prouve que les données sont en **base de données**, pas en mémoire

5. **Ouvrir le navigateur en mode incognito**
   - Se reconnecter avec le même compte
   - Aller sur "Disponibilité"
   - [ ] Les indisponibilités sont **toujours là**

6. **Supprimer une indisponibilité**
   - Cliquer sur le bouton "Supprimer" d'une période
   - [ ] Toast de confirmation "Indisponibilité supprimée"
   - [ ] Période disparaît de la liste
   - Rafraîchir la page
   - [ ] Période **reste supprimée** (pas réapparue)

7. **Vérification dans la base de données** (optionnel)
   
   Exécuter dans le terminal:
   ```bash
   docker exec -it arty-backend python -c "
   from app.core.database import SessionLocal
   from app.models.workshop import Unavailability
   db = SessionLocal()
   count = db.query(Unavailability).count()
   print(f'Indisponibilités en DB: {count}')
   db.close()
   "
   ```
   - [ ] Le nombre correspond à ce qui est affiché dans l'interface

**✅ Critères de succès:**
- Création fonctionne (jour unique + plage)
- **Persistance** après rechargement
- Suppression fonctionne
- Données cohérentes entre interface et DB

---

## 👤 Scénario 4: Modification du Profil
**Durée estimée:** 5 minutes  
**Objectif:** Vérifier l'édition et la sauvegarde du profil

### Étapes

1. **Aller sur onglet "Profil"**
   - [ ] Formulaire pré-rempli avec les données actuelles
   - [ ] Nom: "Artisan Test"
   - [ ] Email: "test.artisan@arty.mg"

2. **Modifier les informations**
   - Changer:
     - Bio/À propos: "Artisan passionné par la vannerie traditionnelle malgache. Test UAT réussi !"
     - Spécialité: "Vannerie et tissage"
     - Expérience: "5 ans"
   - [ ] Champs modifiables sans erreur

3. **Sauvegarder**
   - Cliquer "Enregistrer" ou "Sauvegarder"
   
   **Résultats attendus:**
   - [ ] Toast de confirmation "Profil sauvegardé"
   - [ ] Pas d'erreur dans la console (F12 > Console)
   - [ ] Spinner ou indication de chargement pendant la requête

4. **Vérifier la persistance**
   - **Rafraîchir la page (F5)**
   - Retourner sur onglet "Profil"
   - [ ] ⚠️ **CRITIQUE:** Les modifications sont **toujours là**
   - Bio contient "Test UAT réussi !"
   - Spécialité = "Vannerie et tissage"

5. **Vérifier l'affichage ailleurs**
   - Aller sur onglet "Vue d'ensemble"
   - Si le nom de l'artisan s'affiche quelque part:
     - [ ] Les nouvelles infos sont visibles

6. **Logout et Login**
   - Se déconnecter
   - Se reconnecter
   - Aller sur "Profil"
   - [ ] Modifications **toujours présentes**

7. **Vérification dans la base** (optionnel)
   ```bash
   docker exec -it arty-backend python -c "
   from app.core.database import SessionLocal
   from app.models.user import User
   db = SessionLocal()
   user = db.query(User).filter(User.email=='test.artisan@arty.mg').first()
   if user:
       print(f'Bio: {user.bio}')
       print(f'Specialty: {user.specialty}')
   db.close()
   "
   ```
   - [ ] Bio correspond à ce qui a été saisi

**✅ Critères de succès:**
- Formulaire pré-rempli correctement
- Modifications sauvegardées en DB
- Persistance après logout/login
- Toast de confirmation affiché

---

## 🛒 Scénario 5: Gestion du Panier (Bonus)
**Durée estimée:** 5 minutes  
**Objectif:** Vérifier le panier client-side

### Étapes

1. **Aller sur la page produits** (client)
   ```
   URL: http://localhost:5173/products
   ```

2. **Ajouter un produit au panier**
   - Cliquer sur un produit
   - Cliquer "Ajouter au panier"
   - [ ] Toast de confirmation
   - [ ] Icône panier affiche le nombre (1)

3. **Vérifier le panier**
   - Cliquer sur l'icône panier (navigation)
   - [ ] Produit apparaît dans le panier
   - [ ] Prix correct
   - [ ] Quantité: 1

4. **Modifier la quantité**
   - Augmenter la quantité à 3
   - [ ] Total se recalcule automatiquement

5. **Rafraîchir la page**
   - F5
   - [ ] ⚠️ Panier **conserve les 3 items** (persistance DB)

6. **Supprimer un item**
   - Cliquer "Supprimer"
   - [ ] Item disparaît
   - Rafraîchir
   - [ ] Item **reste supprimé**

**✅ Critères de succès:**
- Panier persiste en DB (pas localStorage seul)
- Modifications se reflètent immédiatement
- Calculs de totaux corrects

---

## 📋 Scénario 6: Commandes (Vue Artisan)
**Durée estimée:** 5 minutes  
**Objectif:** Voir et gérer les commandes

### Étapes

1. **Aller sur onglet "Commandes"**
   - [ ] Liste des commandes s'affiche
   - Si commande créée en Scénario 2:
     - [ ] Commande visible avec produit "Panier Test UAT"
     - [ ] Statut: "Pending" ou équivalent
     - [ ] Montant: 15,000 Ar

2. **Filtrer par statut** (si disponible)
   - [ ] Filtres fonctionnent

3. **Voir les détails d'une commande**
   - Cliquer sur une commande
   - [ ] Détails complets visibles:
     - Nom du client
     - Adresse de livraison
     - Items commandés
     - Total

4. **Changer le statut** (si disponible)
   - Changer de "Pending" → "In Production"
   - [ ] Statut mis à jour
   - Rafraîchir
   - [ ] Statut **reste "In Production"**

**✅ Critères de succès:**
- Commandes affichées avec vraies données
- Statuts modifiables et persistants
- Détails complets et corrects

---

## 🎨 Tests Visuels et UX

### Responsive Design
- [ ] Dashboard fonctionne sur mobile (DevTools > Toggle Device)
- [ ] Onglets accessibles sur petit écran
- [ ] Formulaires utilisables

### Performance
- [ ] Temps de chargement initial < 3 secondes
- [ ] Pas de lag lors de navigation entre onglets
- [ ] Images se chargent correctement

### Erreurs
- [ ] Messages d'erreur clairs si API échoue
- [ ] Toast notifications visibles et lisibles
- [ ] Pas d'erreurs JavaScript dans la console

---

## 📊 Résumé des Tests

| Scénario | Status | Notes |
|----------|--------|-------|
| 1. Authentification | ⬜ | |
| 2. Statistiques | ⬜ | |
| 3. Indisponibilités | ⬜ | |
| 4. Profil | ⬜ | |
| 5. Panier | ⬜ | |
| 6. Commandes | ⬜ | |

**Légende:**
- ✅ Passé
- ❌ Échoué
- ⚠️ Passé avec réserves
- ⬜ Non testé

---

## 🐛 Bugs Trouvés

### Bug #1
**Titre:** _________________  
**Scénario:** _________________  
**Étapes pour reproduire:**
1. 
2. 
3. 

**Résultat attendu:** _________________  
**Résultat obtenu:** _________________  
**Sévérité:** [ ] Critique [ ] Majeure [ ] Mineure  
**Navigateur:** _________________

---

## ✅ Critères de Validation Globale

Le dashboard est **accepté** si:
- [ ] Tous les scénarios 1-4 passent ✅
- [ ] Aucun bug critique
- [ ] Données persistent après rechargement
- [ ] Pas d'erreurs console bloquantes
- [ ] Performance acceptable

Le dashboard est **rejeté** si:
- [ ] Mock data encore visible (450,000 Ar, Marie L., etc.)
- [ ] Données ne persistent pas
- [ ] Erreurs 500 fréquentes
- [ ] Impossible de créer/modifier des données

---

## 📝 Notes du Testeur

_________________  
_________________  
_________________  

---

## 👥 Signatures

**Testeur:** _________________ **Date:** _________________  
**Scrum Master:** _________________ **Date:** _________________  
**Product Owner:** _________________ **Date:** _________________

---

**Version:** 1.0  
**Dernière mise à jour:** 7 février 2026
