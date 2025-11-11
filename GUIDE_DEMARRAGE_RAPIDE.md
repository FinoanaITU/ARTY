# 🚀 Guide de démarrage rapide - Module Authentification

## Étape 1 : Installation dépendances

### Frontend
```bash
cd Front
npm install
```

### Backend
```bash
cd Back
# Si vous avez un environnement virtuel
source env/bin/activate
# Les dépendances sont déjà dans requirements.txt
```

## Étape 2 : Configuration

### Frontend - Créer `.env`
```bash
cd Front
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
```

### Backend - Variables d'environnement
Vérifiez que `Back/.env` ou `docker-compose.yml` contient :
- `DATABASE_URL=postgresql://...`
- `SECRET_KEY=...`
- `ACCESS_TOKEN_EXPIRE_MINUTES=30`
- `REFRESH_TOKEN_EXPIRE_DAYS=7`

## Étape 3 : Base de données

### Appliquer la migration
```bash
cd Back
alembic upgrade head
```

Ou avec Docker :
```bash
docker-compose exec backend alembic upgrade head
```

Cela créera les tables :
- `users`
- `artisan_profiles`
- `artisan_photos`
- `user_sessions`
- Les enums PostgreSQL nécessaires

## Étape 4 : Démarrer les services

### Option A : Docker Compose (recommandé)
```bash
# Depuis la racine du projet
docker-compose up backend frontend
```

### Option B : Manuelle
```bash
# Terminal 1 - Backend
cd Back
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd Front
npm run dev
```

## Étape 5 : Tester

1. **Ouvrir** http://localhost:3000 (ou le port configuré)

2. **Inscription Acheteur**
   - Aller sur `/signup`
   - Choisir "Acheteur"
   - Remplir le formulaire
   - Vérifier que la connexion est automatique

3. **Inscription Artisan**
   - Aller sur `/signup`
   - Choisir "Artisan"
   - Compléter les 5 étapes
   - Upload photos (optionnel)
   - Vérifier création compte

4. **Connexion**
   - Aller sur `/login`
   - Se connecter
   - Vérifier redirection selon rôle

5. **Vérifier tokens**
   - Ouvrir DevTools → Application → Local Storage
   - Vérifier `access_token` et `refresh_token`

## 🐛 Dépannage

### Erreur "Module not found: alembic"
```bash
cd Back
pip install alembic
# ou
pip install -r requirements.txt
```

### Erreur "Cannot connect to database"
- Vérifier que PostgreSQL tourne
- Vérifier `DATABASE_URL` dans `.env` ou `docker-compose.yml`

### Erreur CORS
- Vérifier `ALLOWED_ORIGINS` dans `Back/app/core/config.py`
- Ajouter `http://localhost:3000` si manquant

### Photos ne s'uploadent pas
- Vérifier que le dossier `Back/static/uploads/artisans` existe
- Vérifier permissions d'écriture

## ✅ Checklist de vérification

- [ ] Migration Alembic appliquée (`alembic upgrade head`)
- [ ] Backend démarré sur port 8000
- [ ] Frontend démarré sur port 3000 (ou autre)
- [ ] Fichier `.env` frontend créé avec `VITE_API_URL`
- [ ] Base de données PostgreSQL accessible
- [ ] Tables créées (vérifier avec `\dt` dans psql)

## 📊 Vérifier les tables créées

```bash
# Se connecter à PostgreSQL
psql -U artizaho_user -d artizaho_db

# Lister les tables
\dt

# Vérifier structure users
\d users

# Vérifier structure artisan_profiles
\d artisan_profiles
```

Vous devriez voir :
- `users`
- `artisan_profiles`
- `artisan_photos`
- `user_sessions`
- Les types enum : `userrole`, `buyertype`, `nationality`, `profilestatus`

---

**Tout est prêt ! Vous pouvez maintenant tester l'authentification end-to-end ! 🎉**

