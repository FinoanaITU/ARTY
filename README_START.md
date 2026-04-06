# 🚀 Guide de Démarrage Rapide - Projet ARTY

Ce guide vous explique comment démarrer rapidement le projet ARTY avec toutes les données nécessaires.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Docker** (version 20.10 ou supérieure)
- **Docker Compose** (version 2.0 ou supérieure)
- **Git** (pour cloner le projet)

### Vérifier les installations

```bash
docker --version
docker-compose --version
```

## 🎯 Démarrage Rapide

### Option 1 : Démarrage Standard

Pour démarrer le projet avec toutes les données de démonstration :

```bash
./start.sh
```

Cette commande va :
1. ✅ Vérifier les prérequis (Docker, docker-compose)
2. ✅ Démarrer tous les services Docker (PostgreSQL, Redis, Backend, Frontend)
3. ✅ Attendre que les services soient prêts
4. ✅ Exécuter les migrations de base de données
5. ✅ Créer les données initiales (catégories, admin)
6. ✅ Créer les données de démonstration (produits, ateliers, utilisateurs)
7. ✅ Vérifier la santé des services
8. ✅ Afficher les informations de connexion

**Durée estimée :** 2-3 minutes

### Option 2 : Démarrage avec Nettoyage

Si vous voulez repartir de zéro (supprime toutes les données existantes) :

```bash
./start.sh --clean
```

⚠️ **Attention :** Cette commande supprime tous les volumes Docker et toutes les données !

### Option 3 : Démarrage sans Données de Démo

Si vous voulez uniquement les données de base (catégories et admin) :

```bash
./start.sh --no-seed
```

## 🌐 Accès aux Services

Une fois le démarrage terminé, vous pouvez accéder à :

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Interface utilisateur React |
| **Backend API** | http://localhost:8000 | API FastAPI |
| **Documentation API** | http://localhost:8000/docs | Swagger UI interactif |
| **PostgreSQL** | localhost:5432 | Base de données |
| **Redis** | localhost:6379 | Cache et sessions |

## 👤 Comptes de Test

Le script crée automatiquement 4 comptes utilisateurs :

### 1. Compte Administrateur
```
Email    : admin@artizaho.com
Password : admin123
Rôle     : Administration complète de la plateforme
```

### 2. Compte Artisan
```
Email    : artisan@artizaho.com
Password : artisan123
Rôle     : Vente de produits et création d'ateliers
```

### 3. Compte Acheteur Particulier
```
Email    : acheteur@artizaho.com
Password : acheteur123
Rôle     : Achat de produits et inscription aux ateliers
```

### 4. Compte Acheteur Entreprise
```
Email    : entreprise@artizaho.com
Password : entreprise123
Rôle     : Achats en gros et commandes personnalisées
```

⚠️ **IMPORTANT :** Ces mots de passe sont pour le développement uniquement. Changez-les en production !

## 📊 Données Créées

Le script crée automatiquement :

- **12 catégories principales** avec ~50 sous-catégories
  - Sculpture et Bois
  - Textile et Tissage
  - Poterie et Céramique
  - Bijouterie artisanale
  - Vannerie
  - Maroquinerie
  - Broderie et Couture
  - Instruments de musique
  - Peinture et Art
  - Cuisine et Gastronomie
  - Décoration intérieure
  - Autres

- **~6 produits artisanaux** variés
  - Répartis dans différentes catégories
  - Prix en EUR (15€ - 150€)
  - Images Unsplash
  - Descriptions détaillées en français
  - Stock disponible

- **~2 ateliers** avec sessions programmées
  - Différents types (groupe, privé)
  - Sessions dans le futur
  - Prix adaptés (20€ - 100€)
  - Descriptions complètes

- **Données complémentaires**
  - Profil artisan complet avec photos
  - Avis sur les produits
  - Photos d'atelier

## 🛠️ Commandes Utiles

### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Backend uniquement
docker-compose logs -f backend

# Frontend uniquement
docker-compose logs -f frontend

# PostgreSQL uniquement
docker-compose logs -f postgres
```

### Gérer les services

```bash
# Arrêter tous les services
docker-compose down

# Redémarrer tous les services
docker-compose restart

# Redémarrer un service spécifique
docker-compose restart backend

# Voir l'état des services
docker-compose ps
```

### Accéder aux conteneurs

```bash
# Shell dans le backend
docker-compose exec backend bash

# Shell dans le frontend
docker-compose exec frontend sh

# Accéder à PostgreSQL
docker-compose exec postgres psql -U artizaho_user -d artizaho_db
```

### Migrations de base de données

```bash
# Exécuter les migrations
docker-compose exec backend alembic upgrade head

# Revenir en arrière d'une migration
docker-compose exec backend alembic downgrade -1

# Créer une nouvelle migration
docker-compose exec backend alembic revision --autogenerate -m "Description"
```

### Réinitialiser la base de données

```bash
# Méthode 1 : Avec le script
./start.sh --clean

# Méthode 2 : Manuellement
docker-compose down -v
docker-compose up -d
docker-compose exec backend alembic upgrade head
docker-compose exec backend python scripts/seed_initial_data.py
docker-compose exec backend python scripts/seed_demo_data.py
```

## 🐛 Dépannage

### Le script ne démarre pas

**Problème :** `Permission denied`
```bash
# Solution : Rendre le script exécutable
chmod +x start.sh
```

**Problème :** Docker n'est pas en cours d'exécution
```bash
# Solution : Démarrer Docker Desktop ou le daemon Docker
# Sur macOS : Ouvrir Docker Desktop
# Sur Linux : sudo systemctl start docker
```

### Les services ne démarrent pas

**Problème :** Ports déjà utilisés
```bash
# Vérifier les ports utilisés
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :8000  # Backend
lsof -i :3000  # Frontend

# Solution : Arrêter les services qui utilisent ces ports
# ou modifier les ports dans docker-compose.yml
```

**Problème :** Erreur de migration
```bash
# Voir les logs détaillés
docker-compose logs backend

# Réinitialiser complètement
./start.sh --clean
```

### Le frontend ne s'affiche pas

**Problème :** Le frontend prend du temps à démarrer
```bash
# Solution : Attendre 30-60 secondes et rafraîchir
# Vérifier les logs
docker-compose logs -f frontend
```

**Problème :** Erreur de connexion à l'API
```bash
# Vérifier que le backend est accessible
curl http://localhost:8000/health

# Vérifier les variables d'environnement
docker-compose exec frontend env | grep VITE_API_URL
```

### Erreurs de base de données

**Problème :** "relation does not exist"
```bash
# Solution : Exécuter les migrations
docker-compose exec backend alembic upgrade head
```

**Problème :** "duplicate key value"
```bash
# Solution : Les données existent déjà, c'est normal
# Pour réinitialiser : ./start.sh --clean
```

## 📚 Documentation Supplémentaire

- **Backend API :** http://localhost:8000/docs (Swagger UI)
- **Alembic :** Documentation des migrations dans `Back/alembic/`
- **Docker Compose :** Configuration dans `docker-compose.yml`
- **Makefile :** Commandes utiles dans `Makefile`

## 🔄 Workflow de Développement

### 1. Démarrage quotidien

```bash
# Si les services sont arrêtés
docker-compose up -d

# Si vous voulez voir les logs
docker-compose up
```

### 2. Développement Backend

```bash
# Le code est monté en volume, les changements sont automatiques
# Redémarrer si nécessaire
docker-compose restart backend
```

### 3. Développement Frontend

```bash
# Le code est monté en volume avec hot-reload
# Les changements sont automatiques
```

### 4. Ajout de dépendances

**Backend :**
```bash
# Ajouter dans Back/requirements.txt
# Puis reconstruire
docker-compose build backend
docker-compose up -d backend
```

**Frontend :**
```bash
# Ajouter dans Front/package.json
# Puis reconstruire
docker-compose build frontend
docker-compose up -d frontend
```

### 5. Fin de journée

```bash
# Arrêter les services (garde les données)
docker-compose down

# Ou laisser tourner en arrière-plan
# Les services redémarreront automatiquement
```

## 🎓 Prochaines Étapes

1. **Explorer l'interface :** http://localhost:3000
2. **Tester l'API :** http://localhost:8000/docs
3. **Se connecter avec les comptes de test**
4. **Créer vos propres produits et ateliers**
5. **Personnaliser les données de démonstration**

## 💡 Conseils

- **Utilisez `--clean`** uniquement quand vous voulez repartir de zéro
- **Les logs sont vos amis** : `docker-compose logs -f` pour déboguer
- **Sauvegardez vos données** avant de faire `--clean`
- **Les migrations sont automatiques** au démarrage du backend
- **Le hot-reload fonctionne** pour le frontend et le backend

## 🆘 Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. Vérifiez les logs : `docker-compose logs -f`
2. Vérifiez l'état des services : `docker-compose ps`
3. Essayez de redémarrer : `docker-compose restart`
4. En dernier recours : `./start.sh --clean`

## 📝 Notes

- Les données de démonstration sont en **français**
- Les prix sont en **EUR** (avec conversion MGA pour les locaux)
- Les images proviennent de **Unsplash**
- Les sessions d'ateliers sont programmées **dans le futur**

---

**Bon développement ! 🚀**