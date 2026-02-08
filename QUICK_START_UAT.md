# 🚀 Guide Rapide - Tests d'Acceptation Utilisateur

**Durée totale:** 30-40 minutes  
**Difficulté:** Facile  
**Prérequis:** Backend démarré ✅

---

## 📝 Ce que vous allez faire

Vous allez **tester le dashboard artisan de bout en bout** pour vérifier que :
1. L'authentification fonctionne
2. Les données sont **réelles** (pas de mock)
3. Les modifications **persistent** en base de données
4. Toutes les fonctionnalités principales marchent

---

## 🎯 Démarrage en 2 Étapes

### Étape 1: Démarrer le Frontend

Dans un nouveau terminal:
```bash
cd /Users/finoanaandriatsilavo/Documents/ARTY
./start-uat.sh
```

Le script va :
- ✅ Vérifier que le backend est accessible
- ✅ Installer les dépendances si nécessaire
- ✅ Créer le fichier `.env` si absent
- ✅ Démarrer le serveur frontend sur http://localhost:5173

**Attendez le message:**
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://xxx.xxx.xxx.xxx:5173/
```

### Étape 2: Ouvrir le Guide de Tests

Ouvrez le fichier:
```
/Users/finoanaandriatsilavo/Documents/ARTY/USER_ACCEPTANCE_TESTS.md
```

Ce document contient **6 scénarios de test détaillés** avec des checkboxes pour suivre votre progression.

---

## 📋 Liste des Tests (Vue d'ensemble)

### ✅ Scénario 1: Authentification (5 min)
- Créer un compte artisan de test
- Se connecter
- Naviguer entre les onglets
- Se déconnecter

### ✅ Scénario 2: Statistiques (5 min)
- Vérifier que stats = 0 (nouveau compte)
- Créer un produit
- Créer une commande
- Voir les stats se mettre à jour

### ✅ Scénario 3: Indisponibilités (5 min)
- Ajouter une indisponibilité
- Vérifier la persistance
- Supprimer une indisponibilité

### ✅ Scénario 4: Profil (5 min)
- Modifier bio, spécialité, expérience
- Sauvegarder
- Vérifier la persistance

### ✅ Scénario 5: Panier (5 min - Bonus)
- Ajouter un produit au panier
- Modifier la quantité
- Vérifier la persistance

### ✅ Scénario 6: Commandes (5 min)
- Voir la liste des commandes
- Changer un statut
- Vérifier les détails

---

## 🎮 Comment Tester

Pour chaque scénario:

1. **Lisez les étapes** dans `USER_ACCEPTANCE_TESTS.md`
2. **Exécutez les actions** dans le navigateur
3. **Cochez les checkboxes** [ ] → [x] au fur et à mesure
4. **Notez les bugs** si vous en trouvez

---

## 🔍 Points Critiques à Vérifier

### ⚠️ CRITIQUE #1: Pas de Mock Data

**Vérifiez que vous NE voyez PAS:**
- ❌ Chiffre d'affaires: 450,000 Ar (c'était le mock)
- ❌ Commandes d'un client "Marie L." ou "Jean P."
- ❌ 24 produits actifs (si compte neuf)

**Vous DEVEZ voir:**
- ✅ Statistiques à 0 pour un nouveau compte
- ✅ Vos propres produits créés
- ✅ Vos propres commandes

### ⚠️ CRITIQUE #2: Persistance des Données

**Après chaque modification, faites:**
```
1. Modifier une donnée (ex: ajouter indisponibilité)
2. Rafraîchir la page (F5)
3. Vérifier que la modification EST TOUJOURS LÀ
```

Si les données **disparaissent** après F5 → **BUG CRITIQUE** 🐛

### ⚠️ CRITIQUE #3: Erreurs Console

Ouvrez la console navigateur (F12) :
- ✅ Warnings = OK
- ⚠️ Errors = Noter dans le rapport
- ❌ Errors 500 = BUG CRITIQUE

---

## 🐛 Que Faire si Vous Trouvez un Bug ?

1. **Ne paniquez pas** - C'est justement le but des UAT !

2. **Notez-le** dans la section "Bugs Trouvés" de `USER_ACCEPTANCE_TESTS.md`:
   ```markdown
   ### Bug #1
   **Titre:** Les indisponibilités disparaissent après F5
   **Scénario:** 3 - Indisponibilités
   **Sévérité:** Critique
   ```

3. **Prenez une capture d'écran** (si possible)

4. **Copiez l'erreur console** (F12 > Console)

5. **Continuez les autres tests** si le bug n'est pas bloquant

---

## ✅ Critères de Succès

Le dashboard est **ACCEPTÉ** si:
- ✅ Scénarios 1-4 passent tous
- ✅ Données persistent après F5
- ✅ Aucun bug critique
- ✅ Performance acceptable (<3s chargement)

Le dashboard est **REJETÉ** si:
- ❌ Mock data encore visible
- ❌ Données ne persistent pas
- ❌ Impossible de se connecter
- ❌ Erreurs 500 fréquentes

---

## 📊 Rapport Final

À la fin des tests, remplissez le tableau dans `USER_ACCEPTANCE_TESTS.md`:

| Scénario | Status | Notes |
|----------|--------|-------|
| 1. Authentification | ✅ | Tout fonctionne |
| 2. Statistiques | ✅ | Stats correctes |
| 3. Indisponibilités | ❌ | Bug: disparaissent après F5 |
| 4. Profil | ✅ | Sauvegarde OK |
| 5. Panier | ⬜ | Non testé |
| 6. Commandes | ✅ | Affichage correct |

---

## 🆘 Aide Rapide

### Le frontend ne démarre pas
```bash
cd Front
rm -rf node_modules
npm install  # ou: bun install
npm run dev  # ou: bun dev
```

### Le backend ne répond pas
```bash
cd /Users/finoanaandriatsilavo/Documents/ARTY
make restart
```

### Erreur "CORS"
Vérifiez que le backend autorise `localhost:5173`:
```bash
# Vérifier les logs backend
docker logs arty-backend --tail 50
```

### Impossible de créer un compte
Utilisez Swagger UI:
1. Ouvrir http://localhost:8000/docs
2. Chercher `POST /api/v1/auth/register/artisan`
3. Utiliser les données fournies dans le scénario 1

---

## 📞 Contacts

**Questions techniques:** Vérifier `FRONTEND_BACKEND_INTEGRATION.md`  
**Documentation backend:** http://localhost:8000/docs  
**Documentation planning:** `DASHBOARD_IMPLEMENTATION/PLANNING/SPRINT_PLAN_ARTISAN_DASHBOARD.md`

---

## 🎉 Après les Tests

Une fois les tests terminés:

1. **Arrêtez le frontend:** Ctrl+C dans le terminal
2. **Gardez le backend** tournant (pour review)
3. **Partagez le rapport:** `USER_ACCEPTANCE_TESTS.md`
4. **Décision Go/No-Go:** Selon les critères de succès

---

**Bonne chance avec les tests ! 🚀**

*Rappelez-vous: Trouver des bugs MAINTENANT, c'est éviter des problèmes en PRODUCTION.* 💡
