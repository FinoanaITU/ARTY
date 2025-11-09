# 🔧 Solution au problème de build Docker Frontend

## Problème identifié
Erreur : `Cannot find module '/app/node_modules/vite/dist/node/chunks/dep-C6uTJdX2.js'`

Cela indique que Vite n'est pas correctement installé ou que ses dépendances sont corrompues.

## Solutions

### Solution 1 : Reconstruire sans cache (RECOMMANDÉ)
```bash
# Arrêter les services
docker-compose down

# Reconstruire le frontend sans cache
docker-compose build --no-cache frontend

# Démarrer
docker-compose up -d
```

### Solution 2 : Utiliser le frontend en développement (PLUS RAPIDE)
Le frontend-dev ne nécessite pas de build de production et utilise Vite en mode dev :

```bash
# Démarrer en mode développement
docker-compose --profile dev up -d frontend-dev

# Le frontend sera accessible sur http://localhost:8080
# Avec hot-reload activé !
```

### Solution 3 : Nettoyer et régénérer package-lock.json
```bash
cd Front

# Supprimer les fichiers de lock
rm -f package-lock.json

# Réinstaller les dépendances
npm install

# Vérifier que le build fonctionne localement
npm run build

# Si ça fonctionne, reconstruire Docker
cd ..
docker-compose build --no-cache frontend
docker-compose up -d
```

### Solution 4 : Mettre à jour Node.js dans le Dockerfile
Si les solutions précédentes ne fonctionnent pas, essayez Node.js 20 :

```dockerfile
FROM node:20-alpine AS base
```

Puis reconstruire :
```bash
docker-compose build --no-cache frontend
```

## Vérification

Après reconstruction, vérifier :
```bash
# Voir les logs
docker-compose logs frontend

# Vérifier que le service tourne
docker-compose ps

# Tester l'accès
curl http://localhost:3000
```

## Pour tester rapidement l'authentification

Même si le frontend de production ne build pas, vous pouvez tester l'authentification avec :

1. **Backend uniquement** (déjà fonctionnel)
```bash
docker-compose up -d backend postgres redis
curl http://localhost:8000/docs
```

2. **Frontend en dev** (plus flexible)
```bash
docker-compose --profile dev up -d frontend-dev
# Accéder sur http://localhost:8080
```

3. **Tests API directement**
```bash
./test-auth-docker.sh
```

## Recommandation

Pour le développement, utilisez **frontend-dev** qui est plus rapide et permet le hot-reload :
```bash
docker-compose --profile dev up -d
```

Cela démarre :
- Backend sur http://localhost:8000
- Frontend-dev sur http://localhost:8080 (avec hot-reload)
- PostgreSQL, Redis, etc.

