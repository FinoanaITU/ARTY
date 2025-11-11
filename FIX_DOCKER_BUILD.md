# 🔧 Correction du problème de build Docker Frontend

## Problème
Erreur lors du build : `Cannot find module '/app/node_modules/vite/dist/node/chunks/dep-C6uTJdX2.js'`

## Solutions appliquées

### 1. Modifications du Dockerfile
- Ajout de `--legacy-peer-deps` pour résoudre les conflits de dépendances
- Nettoyage du cache npm avant le build
- Fallback sur `npm install` si `npm ci` échoue

### 2. Création du .dockerignore
- Exclusion des fichiers inutiles du contexte Docker

## Commandes pour résoudre

### Option 1 : Reconstruire sans cache
```bash
docker-compose build --no-cache frontend
docker-compose up -d
```

### Option 2 : Nettoyer et reconstruire
```bash
# Arrêter les services
docker-compose down

# Supprimer les images
docker rmi arty-frontend arty-backend arty-celery-worker arty-celery-flower

# Reconstruire
docker-compose build frontend
docker-compose up -d
```

### Option 3 : Nettoyer complètement Docker
```bash
# Arrêter tout
docker-compose down -v

# Nettoyer les images et volumes
docker system prune -a --volumes

# Reconstruire
docker-compose build
docker-compose up -d
```

### Option 4 : Tester localement d'abord
```bash
cd Front
npm install
npm run build
# Si ça fonctionne, alors c'est un problème Docker
```

## Vérification

Après reconstruction, vérifier :
```bash
# Voir les logs du build
docker-compose logs frontend

# Vérifier que le frontend tourne
curl http://localhost:3000

# Voir les services
docker-compose ps
```

## Alternative : Utiliser le frontend en développement

Si le build de production pose problème, vous pouvez utiliser le frontend-dev :

```bash
# Démarrer en mode dev
docker-compose --profile dev up -d frontend-dev

# Accéder sur
http://localhost:8080
```

## Si le problème persiste

1. Vérifier la version de Node.js dans le Dockerfile (actuellement 18)
2. Essayer avec Node.js 20
3. Vérifier que package-lock.json est à jour
4. Supprimer node_modules local et package-lock.json, puis regénérer

```bash
cd Front
rm -rf node_modules package-lock.json
npm install
npm run build
```

