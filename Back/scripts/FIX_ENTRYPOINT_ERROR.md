# 🔧 Fix: Entrypoint Script Not Found Error

## ❌ Erreur

```
Error response from daemon: failed to create task for container: failed to create shim task: OCI runtime create failed: runc create failed: unable to start container process: error during container init: exec: "/app/docker-entrypoint.sh": stat /app/docker-entrypoint.sh: no such file or directory: unknown
```

## 🔍 Cause

Le problème était causé par le volume mount dans `docker-compose.yml` :
```yaml
volumes:
  - ./Back:/app
```

Ce volume mount remplace le contenu de `/app` dans le conteneur par le contenu du répertoire local. Si le script d'entrypoint était seulement dans `/app/scripts/docker-entrypoint.sh`, il serait remplacé ou masqué par le volume mount.

## ✅ Solution

Les scripts d'entrypoint sont maintenant copiés dans `/docker-entrypoint.d/`, qui n'est **pas** monté par un volume. Ainsi, les scripts sont toujours disponibles même lorsque le volume `./Back:/app` est monté.

### Modifications du Dockerfile

1. **Création du répertoire `/docker-entrypoint.d/`** :
   ```dockerfile
   RUN mkdir -p /docker-entrypoint.d
   ```

2. **Copie des scripts dans `/docker-entrypoint.d/`** :
   ```dockerfile
   COPY scripts/docker-entrypoint.sh /docker-entrypoint.d/docker-entrypoint.sh
   COPY scripts/check_db_connection.py /docker-entrypoint.d/check_db_connection.py
   ```

3. **Configuration de l'ENTRYPOINT** :
   ```dockerfile
   ENTRYPOINT ["/docker-entrypoint.d/docker-entrypoint.sh"]
   ```

### Modification du script d'entrypoint

Le script d'entrypoint cherche maintenant le script `check_db_connection.py` dans deux emplacements :
1. `/docker-entrypoint.d/check_db_connection.py` (priorité, toujours disponible)
2. `/app/scripts/check_db_connection.py` (fallback, depuis le volume monté)

## 🚀 Utilisation

### Rebuild

```bash
# Rebuild l'image
docker-compose build backend

# Démarrer les services
docker-compose up -d backend

# Vérifier les logs
docker-compose logs -f backend
```

## 📋 Structure

```
Conteneur Docker
├── /app/                          (monté depuis ./Back via volume)
│   ├── scripts/
│   │   ├── docker-entrypoint.sh  (disponible depuis le volume)
│   │   └── check_db_connection.py (disponible depuis le volume)
│   └── ...
└── /docker-entrypoint.d/          (dans l'image, pas monté)
    ├── docker-entrypoint.sh       (toujours disponible)
    └── check_db_connection.py     (toujours disponible)
```

## ✅ Avantages

1. ✅ Les scripts d'entrypoint sont **toujours disponibles** même avec le volume mount
2. ✅ Les scripts peuvent être **modifiés localement** dans `Back/scripts/` pour le développement
3. ✅ Les scripts dans `/docker-entrypoint.d/` sont **garantis** d'exister dans l'image
4. ✅ **Fallback** vers les scripts dans `/app/scripts/` si nécessaire

## 🔍 Vérification

```bash
# Vérifier que les scripts existent dans le conteneur
docker exec -it arty-backend ls -la /docker-entrypoint.d/

# Vérifier que le script d'entrypoint est exécutable
docker exec -it arty-backend ls -la /docker-entrypoint.d/docker-entrypoint.sh

# Voir les logs du démarrage
docker-compose logs backend | head -20
```

## 📖 Références

- Dockerfile : `Back/Dockerfile`
- Script d'entrypoint : `Back/scripts/docker-entrypoint.sh`
- Script de connexion : `Back/scripts/check_db_connection.py`

