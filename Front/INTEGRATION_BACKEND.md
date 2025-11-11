# Intégration Frontend-Backend - Module Authentification

## ✅ Modifications apportées

### 1. **Service API** (`Front/src/services/api.ts`)

Service centralisé pour tous les appels API avec :
- Configuration axios avec base URL
- Intercepteurs pour ajouter le token JWT automatiquement
- Gestion automatique du refresh token
- Méthodes pour l'authentification :
  - `registerBuyer()` - Inscription acheteur
  - `registerArtisan()` - Inscription artisan (multipart/form-data)
  - `login()` - Connexion
  - `getCurrentUser()` - Récupérer l'utilisateur connecté
  - `refreshToken()` - Rafraîchir le token
  - `logout()` - Déconnexion

### 2. **UserContext** (`Front/src/contexts/UserContext.tsx`)

- ✅ Gestion des tokens JWT (storage localStorage)
- ✅ Chargement automatique de l'utilisateur au démarrage
- ✅ Méthode `login()` pour se connecter via l'API
- ✅ Méthode `logout()` pour se déconnecter
- ✅ Méthode `refreshUser()` pour rafraîchir les données utilisateur
- ✅ Compatibilité avec l'ancien format de données

### 3. **Page Login** (`Front/src/pages/Login.tsx`)

- ✅ Appel API réel au lieu de données mockées
- ✅ Gestion des erreurs avec toast
- ✅ État de chargement
- ✅ Redirection automatique selon le rôle

### 4. **Page Signup** (`Front/src/pages/Signup.tsx`)

- ✅ Appel API pour inscription acheteur
- ✅ Appel API pour inscription artisan (avec upload photos)
- ✅ Gestion du multipart/form-data
- ✅ État de chargement sur les boutons
- ✅ Gestion des erreurs

### 5. **Migration Alembic** (`Back/alembic/versions/001_add_user_auth_tables.py`)

Migration créée pour :
- Table `users` avec tous les champs nécessaires
- Table `artisan_profiles` avec workflow de validation
- Table `artisan_photos` pour les photos (max 5)
- Table `user_sessions` pour les refresh tokens
- Enums PostgreSQL pour les types et statuts

### 6. **Configuration Alembic** (`Back/alembic/env.py`)

- Configuration mise à jour pour détecter tous les modèles
- Utilise les settings du projet

## 🔧 Configuration nécessaire

### Frontend

1. **Installer axios** :
```bash
cd Front
npm install axios
```

2. **Créer un fichier `.env`** :
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### Backend

1. **Appliquer la migration** :
```bash
cd Back
# Si environnement virtuel activé
alembic upgrade head

# Ou avec docker
docker-compose exec backend alembic upgrade head
```

## 🔄 Flux d'authentification

### Inscription Acheteur
1. Formulaire rempli → `apiService.registerBuyer()`
2. Backend crée l'utilisateur → Retourne tokens + user
3. Frontend sauvegarde tokens + user dans localStorage
4. Redirection vers `/products`

### Inscription Artisan
1. Formulaire multi-étapes rempli → `apiService.registerArtisan()`
2. Backend crée utilisateur + profil artisan (statut `pending_approval`)
3. Upload photos (max 5)
4. Frontend sauvegarde tokens + user
5. Redirection vers `/artisan-dashboard`

### Connexion
1. Formulaire email/password → `apiService.login()`
2. Backend authentifie → Retourne tokens + user
3. Frontend sauvegarde tokens + user
4. Redirection selon rôle

### Requêtes authentifiées
1. Token ajouté automatiquement via intercepteur axios
2. Si token expiré → Refresh automatique
3. Si refresh échoue → Déconnexion et redirection `/login`

## 📝 Notes importantes

- Les tokens sont stockés dans `localStorage`
- Le refresh token est géré automatiquement
- L'utilisateur est chargé automatiquement au démarrage si token valide
- Compatibilité maintenue avec l'ancien format de données

## 🚀 Prochaines étapes

1. Tester l'inscription/connexion end-to-end
2. Vérifier le refresh token automatique
3. Implémenter la gestion des erreurs réseau
4. Ajouter des tests unitaires

