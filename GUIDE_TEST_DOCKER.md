# 🐳 Guide de test avec Docker - Module Authentification

## 📋 Prérequis

- Docker et Docker Compose installés
- Ports disponibles : 8000 (backend), 3000 (frontend), 5432 (postgres), 6379 (redis)

---

## 🚀 Étape 1 : Démarrer les services

### Option A : Avec Makefile (recommandé)
```bash
# Depuis la racine du projet
make build      # Construire les images
make up         # Démarrer tous les services
```

### Option B : Avec Docker Compose directement
```bash
# Construire les images
docker-compose build

# Démarrer tous les services
docker-compose up -d
```

### Vérifier que tout est démarré
```bash
docker-compose ps
```

Vous devriez voir :
- ✅ `arty-postgres` - Running
- ✅ `arty-redis` - Running
- ✅ `arty-backend` - Running
- ✅ `arty-frontend` - Running
- ✅ `arty-celery-worker` - Running

---

## 🗄️ Étape 2 : Appliquer la migration Alembic

### Option A : Avec Makefile
```bash
make db-migrate
```

### Option B : Avec Docker Compose directement
```bash
docker-compose exec backend alembic upgrade head
```

### Vérifier que la migration a été appliquée
```bash
# Se connecter à la base de données
docker-compose exec postgres psql -U artizaho_user -d artizaho_db

# Dans psql, lister les tables
\dt

# Vérifier les tables créées
\d users
\d artisan_profiles
\d artisan_photos
\d user_sessions

# Vérifier les types enum
\dT

# Quitter psql
\q
```

Vous devriez voir les tables :
- `users`
- `artisan_profiles`
- `artisan_photos`
- `user_sessions`
- Types enum : `userrole`, `buyertype`, `nationality`, `profilestatus`

---

## 🔍 Étape 3 : Vérifier les logs

### Voir les logs du backend
```bash
# Avec Makefile
make backend-logs

# Ou directement
docker-compose logs -f backend
```

### Voir tous les logs
```bash
docker-compose logs -f
```

### Vérifier les erreurs
```bash
docker-compose logs backend | grep -i error
```

---

## ✅ Étape 4 : Tester les endpoints API

### 4.1 Vérifier que le backend répond
```bash
curl http://localhost:8000/health
```

Réponse attendue :
```json
{"status": "healthy"}
```

### 4.2 Vérifier la documentation API
Ouvrir dans le navigateur :
```
http://localhost:8000/docs
```

Vous devriez voir Swagger UI avec tous les endpoints.

### 4.3 Tester l'inscription d'un acheteur
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/buyer \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.buyer@example.com",
    "password": "test123456",
    "name": "Test Buyer",
    "phone": "+261341234567",
    "city": "Antananarivo",
    "country": "madagascar",
    "buyer_type": "particulier"
  }'
```

Réponse attendue :
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "email": "test.buyer@example.com",
    "name": "Test Buyer",
    "role": "buyer",
    ...
  }
}
```

### 4.4 Tester l'inscription d'un artisan
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/artisan \
  -F "email=test.artisan@example.com" \
  -F "password=test123456" \
  -F "name=Test Artisan" \
  -F "phone=+261341234567" \
  -F "region=Analamanga" \
  -F "city=Antananarivo" \
  -F "company_name=Artisan Test SARL" \
  -F "main_specialty=vannerie" \
  -F "activity_description=Description de mon activité" \
  -F "offerings=[\"products\",\"workshops\"]" \
  -F "documents_not_available=false"
```

### 4.5 Tester la connexion
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.buyer@example.com",
    "password": "test123456"
  }'
```

### 4.6 Tester GET /me (avec token)
```bash
# Récupérer le token de la réponse précédente
TOKEN="votre_access_token_ici"

curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 4.7 Tester le refresh token
```bash
REFRESH_TOKEN="votre_refresh_token_ici"

curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refresh_token\": \"$REFRESH_TOKEN\"
  }"
```

---

## 🌐 Étape 5 : Tester depuis le frontend

### 5.1 Vérifier que le frontend est accessible
Ouvrir dans le navigateur :
```
http://localhost:3000
```

### 5.2 Vérifier la configuration API
Le frontend doit pointer vers `http://localhost:8000/api/v1`

Si vous utilisez le frontend en développement (port 8080) :
```bash
# Démarrer le frontend dev
make dev

# Ou
docker-compose --profile dev up -d frontend-dev
```

Puis ouvrir : `http://localhost:8080`

### 5.3 Tester l'inscription depuis l'interface

1. **Inscription Acheteur**
   - Aller sur `http://localhost:3000/signup`
   - Choisir "Acheteur"
   - Remplir le formulaire
   - Cliquer sur "Créer mon compte"
   - ✅ Vérifier : Redirection vers `/products` et token dans localStorage

2. **Inscription Artisan**
   - Aller sur `http://localhost:3000/signup`
   - Choisir "Artisan"
   - Compléter les 5 étapes :
     - Étape 1 : Informations personnelles
     - Étape 2 : Compte et entreprise
     - Étape 3 : Informations artisan
     - Étape 4 : Photos (optionnel)
     - Étape 5 : Documents
   - Cliquer sur "Créer mon compte artisan"
   - ✅ Vérifier : Redirection vers `/artisan-dashboard` et token dans localStorage

3. **Connexion**
   - Aller sur `http://localhost:3000/login`
   - Entrer email et mot de passe
   - Cliquer sur "Se connecter"
   - ✅ Vérifier : Redirection selon rôle et token dans localStorage

### 5.4 Vérifier les tokens dans le navigateur

1. Ouvrir DevTools (F12)
2. Aller dans l'onglet **Application** (Chrome) ou **Storage** (Firefox)
3. Cliquer sur **Local Storage** → `http://localhost:3000`
4. Vérifier :
   - ✅ `access_token` présent
   - ✅ `refresh_token` présent
   - ✅ `user` présent (JSON avec les données utilisateur)

---

## 🧪 Étape 6 : Tests automatisés (optionnel)

### Créer un script de test
```bash
# Créer test-auth.sh
cat > test-auth.sh << 'EOF'
#!/bin/bash

API_URL="http://localhost:8000/api/v1"

echo "🧪 Test 1: Health check"
curl -s $API_URL/../health | jq .

echo -e "\n🧪 Test 2: Inscription acheteur"
BUYER_RESPONSE=$(curl -s -X POST $API_URL/auth/register/buyer \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.buyer@example.com",
    "password": "test123456",
    "name": "Test Buyer",
    "city": "Antananarivo",
    "country": "madagascar",
    "buyer_type": "particulier"
  }')

echo $BUYER_RESPONSE | jq .

ACCESS_TOKEN=$(echo $BUYER_RESPONSE | jq -r '.access_token')

echo -e "\n🧪 Test 3: GET /me avec token"
curl -s -X GET $API_URL/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .

echo -e "\n✅ Tests terminés"
EOF

chmod +x test-auth.sh
./test-auth.sh
```

---

## 🐛 Dépannage

### Problème : "alembic: command not found"
**Solution** : Exécuter dans le container Docker
```bash
docker-compose exec backend alembic upgrade head
```

### Problème : "Cannot connect to database"
**Vérifier** :
```bash
# Vérifier que postgres tourne
docker-compose ps postgres

# Vérifier les logs
docker-compose logs postgres

# Tester la connexion
docker-compose exec postgres psql -U artizaho_user -d artizaho_db -c "SELECT 1;"
```

### Problème : "CORS error" dans le navigateur
**Vérifier** : `ALLOWED_ORIGINS` dans `docker-compose.yml` contient `http://localhost:3000`

### Problème : Frontend ne se connecte pas au backend
**Vérifier** :
1. Backend accessible : `curl http://localhost:8000/health`
2. Variable d'environnement frontend : `VITE_API_URL=http://localhost:8000/api/v1`
3. Si frontend dans Docker, utiliser `http://backend:8000` au lieu de `localhost`

### Problème : Photos ne s'uploadent pas
**Vérifier** :
```bash
# Vérifier que le volume existe
docker-compose exec backend ls -la /app/static/uploads/artisans

# Vérifier les permissions
docker-compose exec backend ls -ld /app/static/uploads
```

### Voir les logs en temps réel
```bash
# Backend uniquement
docker-compose logs -f backend

# Tous les services
docker-compose logs -f

# Frontend uniquement
docker-compose logs -f frontend
```

### Redémarrer un service spécifique
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Reconstruire après modification du code
```bash
# Reconstruire et redémarrer
docker-compose up -d --build backend
```

---

## 📊 Checklist de vérification

- [ ] Tous les services Docker sont en cours d'exécution (`docker-compose ps`)
- [ ] Migration Alembic appliquée (`alembic upgrade head`)
- [ ] Tables créées dans PostgreSQL (vérifier avec `\dt`)
- [ ] Backend répond sur `http://localhost:8000/health`
- [ ] Documentation API accessible sur `http://localhost:8000/docs`
- [ ] Frontend accessible sur `http://localhost:3000`
- [ ] Inscription acheteur fonctionne (test API + interface)
- [ ] Inscription artisan fonctionne (test API + interface)
- [ ] Connexion fonctionne (test API + interface)
- [ ] Tokens JWT présents dans localStorage
- [ ] GET /me retourne les bonnes données utilisateur

---

## 🎯 Commandes utiles

```bash
# Voir l'état des services
docker-compose ps

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v

# Accéder au shell du backend
docker-compose exec backend bash

# Accéder à PostgreSQL
docker-compose exec postgres psql -U artizaho_user -d artizaho_db

# Voir les logs du backend
docker-compose logs -f backend

# Reconstruire après modification
docker-compose up -d --build

# Appliquer migration
make db-migrate
# ou
docker-compose exec backend alembic upgrade head
```

---

## ✅ Résultat attendu

Après avoir suivi ce guide, vous devriez avoir :

1. ✅ Backend fonctionnel sur `http://localhost:8000`
2. ✅ Frontend fonctionnel sur `http://localhost:3000`
3. ✅ Base de données avec toutes les tables créées
4. ✅ Inscription/connexion fonctionnelles
5. ✅ Tokens JWT générés et stockés
6. ✅ API documentée sur `/docs`

**Tout est prêt pour continuer le développement ! 🚀**

