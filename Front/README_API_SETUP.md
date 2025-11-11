# Configuration API Frontend

## Installation

```bash
cd Front
npm install
```

## Variables d'environnement

Créer un fichier `.env` à la racine de `Front/` :

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Pour la production, utiliser l'URL de votre backend déployé.

## Utilisation

Le service API est maintenant intégré dans :
- `Login.tsx` - Connexion réelle via `/api/v1/auth/login`
- `Signup.tsx` - Inscription réelle via `/api/v1/auth/register/buyer` ou `/register/artisan`
- `UserContext.tsx` - Gestion automatique des tokens JWT

Les tokens sont automatiquement ajoutés aux requêtes via les intercepteurs axios.

