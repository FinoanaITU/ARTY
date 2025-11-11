# ⚡ Correction rapide - Build Docker Frontend

## 🎯 Solution recommandée : Utiliser frontend-dev

Le frontend-dev évite les problèmes de build et est plus adapté au développement :

```bash
# 1. Démarrer backend + DB
docker-compose up -d backend postgres redis

# 2. Appliquer migration
docker-compose exec backend alembic upgrade head

# 3. Démarrer frontend-dev (avec hot-reload)
docker-compose --profile dev up -d frontend-dev

# 4. Accéder
# Frontend: http://localhost:8080
# Backend: http://localhost:8000/docs
```

## 🔧 Si vous devez absolument utiliser le frontend de production

### Option 1 : Reconstruire sans cache
```bash
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Option 2 : Tester localement d'abord
```bash
cd Front
npm install
npm run build
# Si ça fonctionne, alors reconstruire Docker
cd ..
docker-compose build --no-cache frontend
```

## ✅ Modifications apportées

1. **Dockerfile** : Ajout de `--legacy-peer-deps` et vérification de Vite
2. **Dockerfile.dev** : Utilisation de `npm install --legacy-peer-deps`
3. **docker-compose.yml** : Correction des variables d'environnement (`VITE_API_URL` au lieu de `REACT_APP_API_URL`)
4. **.dockerignore** : Créé pour exclure les fichiers inutiles

## 🚀 Pour tester l'authentification maintenant

```bash
# Démarrer en mode dev (recommandé)
docker-compose --profile dev up -d

# Appliquer migration
docker-compose exec backend alembic upgrade head

# Tester
./test-auth-docker.sh

# Ouvrir navigateur
# http://localhost:8080 pour le frontend
# http://localhost:8000/docs pour l'API
```

## 📝 Notes

- Le frontend-dev utilise Vite en mode développement (hot-reload activé)
- Les modifications de code sont reflétées automatiquement
- Plus rapide à démarrer que le build de production
- Parfait pour le développement et les tests

---

**Utilisez `frontend-dev` pour le développement ! C'est la solution la plus simple et la plus rapide.** 🎉

