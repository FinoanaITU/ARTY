# 🚀 Commandes pour tester avec Docker

## ✅ Solution Rapide : Utiliser le frontend en développement

Le frontend-dev évite les problèmes de build et permet le hot-reload :

```bash
# 1. Démarrer backend + base de données
docker-compose up -d backend postgres redis

# 2. Appliquer la migration
docker-compose exec backend alembic upgrade head

# 3. Démarrer le frontend en mode dev
docker-compose --profile dev up -d frontend-dev

# 4. Accéder aux services
# - Frontend: http://localhost:8080
# - Backend: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

## 🔧 Si vous voulez utiliser le frontend de production

### Option 1 : Reconstruire sans cache
```bash
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

### Option 2 : Nettoyer complètement
```bash
docker-compose down -v
docker system prune -a
docker-compose build
docker-compose up -d
```

## 📝 Commandes essentielles

### Démarrer tous les services (backend + frontend-dev)
```bash
docker-compose --profile dev up -d
```

### Vérifier l'état
```bash
docker-compose ps
```

### Voir les logs
```bash
# Backend
docker-compose logs -f backend

# Frontend-dev
docker-compose logs -f frontend-dev

# Tous
docker-compose logs -f
```

### Appliquer la migration
```bash
docker-compose exec backend alembic upgrade head
```

### Tester l'API
```bash
# Health check
curl http://localhost:8000/health

# Test complet
./test-auth-docker.sh
```

### Arrêter
```bash
docker-compose down
```

## 🎯 Pour tester l'authentification

1. **Démarrer les services** :
```bash
docker-compose --profile dev up -d
docker-compose exec backend alembic upgrade head
```

2. **Ouvrir le navigateur** :
   - Frontend : http://localhost:8080
   - API Docs : http://localhost:8000/docs

3. **Tester l'inscription/connexion** depuis l'interface web

4. **Vérifier les tokens** dans DevTools → Application → Local Storage

## 🐛 Dépannage

### Backend ne démarre pas
```bash
docker-compose logs backend
docker-compose restart backend
```

### Migration échoue
```bash
# Vérifier la connexion à la base
docker-compose exec postgres psql -U artizaho_user -d artizaho_db

# Vérifier les tables
docker-compose exec postgres psql -U artizaho_user -d artizaho_db -c "\dt"
```

### Frontend-dev ne démarre pas
```bash
docker-compose logs frontend-dev
docker-compose restart frontend-dev
```

---

**Recommandation** : Utilisez `frontend-dev` pour le développement, c'est plus rapide et plus flexible ! 🚀

