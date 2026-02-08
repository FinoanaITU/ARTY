#!/bin/bash

# QUICK START PHASE 4 - TESTING GUIDE
# Phase 4: Quote Manager Frontend Integration
# Date: 8 février 2026

cat << 'EOF'

╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   🚀 PHASE 4: QUOTE MANAGER - FRONTEND INTEGRATION                         ║
║   Quick Start Guide pour Testing                                           ║
║                                                                              ║
║   Status: ✅ PRÊTE POUR TESTING                                            ║
║   Date: 8 février 2026                                                     ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

📋 PRÉREQUIS:
═════════════════════════════════════════════════════════════════════════════
✓ Backend Phase 4 complètement implémenté
✓ Frontend avec React 18 + TypeScript
✓ Node.js 16+ et Python 3.9+
✓ PostgreSQL ou SQLite (pour tests)


🚀 SETUP INITIAL:
═════════════════════════════════════════════════════════════════════════════

1️⃣  BACKEND (Terminal 1):
    ────────────────────
    cd Back
    
    # Si première fois:
    pip install -r requirements-dev.txt
    alembic upgrade head
    
    # Lancer le serveur:
    uvicorn app.main:app --reload
    
    Output: INFO:     Application startup complete
    Port: http://localhost:8000


2️⃣  FRONTEND (Terminal 2):
    ─────────────────────
    cd Front
    
    # Si première fois:
    npm install
    
    # Lancer le serveur:
    npm run dev
    
    Output: http://localhost:5173
    Port: 5173


3️⃣  VÉRIFIER LA CONNEXION:
    ──────────────────────
    curl -s http://localhost:8000/api/v1/admin/quotes \
      -H "Authorization: Bearer test" \
    
    Expected: {"detail":"Not authenticated"} (c'est bon!)


🧪 SCÉNARIOS DE TEST:
═════════════════════════════════════════════════════════════════════════════

TEST 1: Authentification Admin
───────────────────────────────

Step 1: Aller sur http://localhost:5173/admin
Step 2: Login avec:
        Email: admin@artizaho.com
        Password: AdminPass123!
Step 3: Voir AdminPanel (back office)

Expected: Vue d'ensemble avec stats


TEST 2: Créer une demande de devis
───────────────────────────────────

Step 1: Admin Panel → "Devis manuels" tab
Step 2: Cliquer "Créer un devis"
Step 3: Remplir formulaire:

        Type: "Sur mesure"
        Titre: "Logo personnalisé pour mon entreprise"
        Description: "J'ai besoin d'un nouveau logo moderne et professionnel"
        Quantité: 1
        
        Type client: "Particulier"
        Nom: "Jean Dupont"
        Email: jean.dupont@example.com
        Téléphone: +33 6 12 34 56 78

Step 4: Cliquer "Créer le devis"

Expected:
  ✓ Toast vert "Devis créé avec succès"
  ✓ Redirection vers liste
  ✓ Nouveau devis visible avec status "En attente"


TEST 3: Lister et filtrer les devis
────────────────────────────────────

Step 1: Admin Panel → "Devis manuels" → "Lister les devis"
Step 2: Voir tableau avec tous les devis
Step 3: Tester filtres:

        Sélectionner: "En attente"
        → Voir seulement les devis pending
        
        Sélectionner: "Devis envoyé"
        → Voir seulement les devis quoted
        
        Sélectionner: "Tous les statuts"
        → Voir tous

Step 4: Tester pagination:
        
        Si > 10 devis:
        → Voir buttons [◄ Précédent] [Suivant ►]
        → Cliquer suivant
        → Voir page 2
        
Expected:
  ✓ Tableau affiche bien les données
  ✓ Filtres fonctionnent (items changent)
  ✓ Pagination fonctionne


TEST 4: Voir détails et éditer un devis
─────────────────────────────────────────

Step 1: Dans la liste, cliquer "Détails" sur un devis pending
Step 2: Voir page détail avec:
        - Titre et description du devis
        - Type et quantité
        - Infos client (nom, email, téléphone)
        - Dates (demandé le)
        - Statut badge

Step 3: Cliquer "✏️ Éditer prix/notes"
Step 4: Remplir:
        Prix final: 150
        Notes: "Accord sur timeline de 5 jours"

Step 5: Cliquer "Enregistrer"

Expected:
  ✓ Panel devient bleu (edit mode)
  ✓ Après sauvegarde: toast success
  ✓ Prix et notes sauvegardés
  ✓ Montant s'affiche: €150.00


TEST 5: Approuver un devis
──────────────────────────

Step 1: Dans détail d'un devis pending, cliquer "✓ Approuver"
Step 2: Confirmer dans popup (si présent)

Expected:
  ✓ Status change immédiatement: "Approuvé"
  ✓ Badge passe au vert
  ✓ Buttons changent: "+Approuver/Rejeter" → "+ → Commande"


TEST 6: Rejeter un devis
────────────────────────

Step 1: Dans liste ou détail, cliquer "✗ Rejeter"
Step 2: Confirmer

Expected:
  ✓ Status change: "Rejeté"
  ✓ Badge passe au rouge
  ✓ Plus d'actions possibles


TEST 7: Convertir en commande
──────────────────────────────

Step 1: Avoir un devis avec status "Approuvé"
Step 2: Voir button "→ Convertir en commande"
Step 3: Cliquer

Expected:
  ✓ Toast success "Devis converti en commande"
  ✓ Status change: "Complété"
  ✓ Order ID retourné


TEST 8: Pagination complète
────────────────────────────

Créer 15+ devis, puis:
Step 1: Aller liste
Step 2: Voir 10 devis max par page
Step 3: Cliquer [Suivant ►]
Step 4: Voir page 2 avec devis 11-15
Step 5: Voir "Page 2 sur 2"
Step 6: Cliquer [◄ Précédent]
Step 7: Retour page 1

Expected:
  ✓ Pagination fonctionne
  ✓ Navigation prev/next OK
  ✓ Page count correct


🔍 TESTS EDGE CASES:
═════════════════════════════════════════════════════════════════════════════

TEST: Validation des formulaires
─────────────────────────────────

Step 1: Créer devis
Step 2: Laisser titre vide → Soumettre
→ Expected: Error "Le titre est requis"

Step 3: Email invalide (pas de @)
→ Expected: Error "Email invalide"

Step 4: Téléphone vide
→ Expected: Error "Le téléphone est requis"


TEST: Erreur réseau
────────────────────

Step 1: Arrêter le backend
Step 2: Essayer créer devis
→ Expected: Error message "Erreur lors de la création"

Step 3: Relancer backend
Step 4: Retry → Devrait fonctionner


TEST: Concurrent access
────────────────────────

Step 1: Deux navigateurs, même devis
Step 2: Edit dans navigateur 1
Step 3: Refresh dans navigateur 2
→ Expected: Voir les changements


📊 VÉRIFIER LES LOGS:
═════════════════════════════════════════════════════════════════════════════

Backend Logs (Terminal 1):
─────────────────────────
Chercher "POST /admin/quotes" → Créer
Chercher "GET /admin/quotes" → Lister
Chercher "PATCH /admin/quotes" → Update
Chercher "POST /admin/quotes/approve" → Approve

Frontend Console (F12):
──────────────────────
Pas d'errors en rouge (sauf CORS warnings OK)
Network tab: Voir les API calls


🐛 DEBUG TIPS:
═════════════════════════════════════════════════════════════════════════════

Frontend Console (F12):
  - Network tab → Voir les requêtes API
  - Console → Voir les logs/erreurs
  - Storage → Voir le token JWT

Backend Logs:
  - Watching file /Users/.../app/...
  - POST /api/v1/admin/quotes → Check request body
  - Erro messages détaillés

Database:
  - psql -U user -d database
  - SELECT * FROM quotes;
  - SELECT * FROM users WHERE role='admin';


✅ CHECKLIST DE TESTING:
═════════════════════════════════════════════════════════════════════════════

□ Login admin fonctionne
□ Page "Devis manuels" accessible
□ Créer devis:
  □ Formulaire accepte données
  □ Validation fonctionne
  □ API call réussit
  □ Toast apparaît
  □ Nouveau devis en liste
□ Lister devis:
  □ Tous visibles initialement
  □ Pagination OK
  □ Filtres par statut OK
□ Détails devis:
  □ Toutes infos affichées
  □ Dates formatées correctement
  □ Montants formatés €
  □ Edit mode accessible
  □ Prix sauvegardé
□ Actions:
  □ Approuver change status
  □ Rejeter change status
  □ Convertir crée order
□ Pas d'erreurs console
□ Pas d'erreurs backend
□ Responsive design OK (mobile/tablet)


📝 NOTES:
═════════════════════════════════════════════════════════════════════════════

1. Toasts:
   - Succès = Toast vert
   - Erreur = Toast rouge
   - Vérifier qu'ils disparaissent après 3s

2. Loading states:
   - Boutons disabled pendant traitement
   - "Création en cours..." text
   - Spinner si présent

3. Erreurs courantes:
   - "Token expired" → Re-login
   - "404 not found" → Backend down?
   - "Network error" → Check localhost:8000

4. Performance:
   - Liste doit changer rapidement (< 1s)
   - Détails doit charger vite
   - Pas de lag lors du scroll


📞 SUPPORT:
═════════════════════════════════════════════════════════════════════════════

Backend startup:
  cd Back && uvicorn app.main:app --reload

Frontend startup:
  cd Front && npm run dev

Tests automatisés:
  ./test-phase4-integration.sh

Logs:
  Backend: STDOUT du terminal uvicorn
  Frontend: Console du navigateur (F12)


🎉 ON SUCCESS:
═════════════════════════════════════════════════════════════════════════════

Si tous les tests passent:

1. Documenter les résultats
2. Tester sur plusieurs navigateurs (Chrome, Safari, Firefox)
3. Tester responsive design (DevTools F12)
4. Commencer Phase 5 (Subscription Admin)


═════════════════════════════════════════════════════════════════════════════
Status: ✅ Phase 4 Frontend Integration Ready for QA
═════════════════════════════════════════════════════════════════════════════

EOF
