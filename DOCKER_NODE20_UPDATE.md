# Mise à jour Docker vers Node.js v20

## ✅ Problème résolu

**Problème initial :** Écran vide sur le frontend car Node.js v12.22.12 était trop ancien pour Vite (nécessite v14.18+)

**Solution :** Mise à jour de tous les Dockerfiles pour utiliser Node.js v20 Alpine

## 📝 Fichiers modifiés

### 1. Front/Dockerfile
- Changé `FROM node:18-alpine` → `FROM node:20-alpine`

### 2. Front/Dockerfile.dev  
- Changé `FROM node:18-alpine` → `FROM node:20-alpine`

## 🚀 Services disponibles

### Frontend (Production)
- **URL:** http://localhost:3000
- **Container:** arty-frontend
- **Status:** ✅ Healthy
- **Build:** Réussi avec Node.js v20

### Frontend (Développement)
- **URL:** http://localhost:8080
- **Container:** art-frontend-dev
- **Status:** ✅ Running
- **Hot reload:** Activé

### Backend
- **URL:** http://localhost:8000
- **Container:** arty-backend
- **Status:** ✅ Healthy

### Base de données
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

## 🔧 Commandes utiles

### Démarrer tous les services
```bash
docker-compose -f docker-compose.yml up -d
```

### Démarrer le frontend en mode développement
```bash
cd Front
docker-compose --profile dev up art-frontend-dev -d
```

### Reconstruire le frontend
```bash
# Production
docker-compose -f docker-compose.yml build --no-cache frontend

# Développement
cd Front
docker-compose build --no-cache art-frontend-dev
```

### Voir les logs
```bash
# Frontend production
docker logs arty-frontend

# Frontend développement
docker logs art-frontend-dev

# Backend
docker logs arty-backend
```

### Arrêter les services
```bash
# Tous les services
docker-compose -f docker-compose.yml down

# Frontend dev uniquement
cd Front
docker-compose --profile dev down
```

## 🎯 Prochaines étapes

1. **Tester l'application** sur http://localhost:8080 (dev) ou http://localhost:3000 (prod)
2. **Vérifier la page d'inscription** : http://localhost:8080/signup
3. **Tester l'authentification** et les fonctionnalités

## 📊 Vérification du build

Le build Vite a réussi avec les assets suivants :
- ✅ index.html (1.41 kB)
- ✅ CSS (93.16 kB)
- ✅ JavaScript bundles (total ~1.1 MB)
- ✅ Images (baobab-hero, workshop-artisan, cloud-divider)

## 🔍 Notes importantes

- Node.js v20 est maintenant utilisé dans tous les conteneurs Docker
- Le serveur Vite démarre en ~314ms
- Hot reload fonctionne en mode développement
- Les dépendances sont installées avec `--legacy-peer-deps` pour compatibilité