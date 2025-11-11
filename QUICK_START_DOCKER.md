# 🚀 Démarrage rapide avec Docker

## ⚡ Commandes essentielles

### 1. Démarrer tous les services
```bash
# Depuis la racine du projet
docker-compose up -d
```

### 2. Appliquer la migration
```bash
docker-compose exec backend alembic upgrade head
```

### 3. Vérifier que tout fonctionne
```bash
# Vérifier les services
docker-compose ps

# Tester le backend
curl http://localhost:8000/health

# Tester avec le script
./test-auth-docker.sh
```

### 4. Accéder aux interfaces
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **Documentation API** : http://localhost:8000/docs
- **Celery Flower** : http://localhost:5555

---

## 📝 Checklist rapide

```bash
# 1. Démarrer
docker-compose up -d

# 2. Vérifier les services
docker-compose ps

# 3. Appliquer migration
docker-compose exec backend alembic upgrade head

# 4. Tester
curl http://localhost:8000/health
./test-auth-docker.sh

# 5. Ouvrir le navigateur
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

---

## 🐛 Si ça ne marche pas

### Vérifier les logs
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Redémarrer un service
```bash
docker-compose restart backend
```

### Reconstruire après modification
```bash
docker-compose up -d --build backend
```

---

**C'est tout ! 🎉**

