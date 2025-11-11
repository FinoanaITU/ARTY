# Fix: Ajouter la colonne position à artisan_photos (Docker)

## Problème

La table `artisan_photos` dans PostgreSQL (sous Docker) n'a pas la colonne `position`, ce qui cause l'erreur :
```
column "position" of relation "artisan_photos" does not exist
```

## Solutions pour Docker

### Solution 1: Script Shell (Recommandé - Le plus simple)

```bash
# Rendre le script exécutable
chmod +x Back/scripts/fix_position_column_docker.sh

# Exécuter le script
./Back/scripts/fix_position_column_docker.sh
```

Le script :
- ✅ Vérifie si le conteneur Docker est en cours d'exécution
- ✅ Se connecte au conteneur PostgreSQL
- ✅ Ajoute la colonne si elle n'existe pas
- ✅ Vérifie que la colonne a été ajoutée

### Solution 2: Commande Docker Exec Directe

```bash
# Exécuter la commande SQL directement dans le conteneur
docker exec -i arty-postgres psql -U artizaho_user -d artizaho_db <<EOF
ALTER TABLE artisan_photos 
ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;
EOF
```

### Solution 3: Script Python (Depuis l'hôte ou le conteneur backend)

#### Depuis l'hôte (si Python est installé) :
```bash
cd Back
source env/bin/activate
python scripts/fix_position_column_python.py
```

#### Depuis le conteneur backend :
```bash
# Se connecter au conteneur backend
docker exec -it arty-backend bash

# Exécuter le script
python scripts/fix_position_column_python.py
```

### Solution 4: Utiliser Alembic depuis le conteneur backend

```bash
# Se connecter au conteneur backend
docker exec -it arty-backend bash

# Exécuter la migration Alembic
alembic upgrade head

# Ou exécuter directement la migration spécifique
alembic upgrade 002
```

### Solution 5: Copier le script SQL dans le conteneur

```bash
# Copier le script SQL dans le conteneur
docker cp Back/scripts/add_position_column.sql arty-postgres:/tmp/

# Exécuter le script
docker exec -i arty-postgres psql -U artizaho_user -d artizaho_db -f /tmp/add_position_column.sql
```

## Vérification

Pour vérifier que la colonne a été ajoutée :

```bash
# Via docker exec
docker exec -i arty-postgres psql -U artizaho_user -d artizaho_db -c "\d artisan_photos"

# Ou avec une requête SQL
docker exec -i arty-postgres psql -U artizaho_user -d artizaho_db <<EOF
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'artisan_photos'
AND column_name = 'position';
EOF
```

## Configuration Docker

Selon votre `docker-compose.yml`, les informations de connexion sont :
- **Container name**: `arty-postgres`
- **Database**: `artizaho_db`
- **User**: `artizaho_user`
- **Password**: `artizaho_password`
- **Port**: `5432` (mappé sur l'hôte)

## Dépannage

### Le conteneur n'est pas en cours d'exécution

```bash
# Vérifier les conteneurs en cours d'exécution
docker ps

# Démarrer le conteneur PostgreSQL
docker-compose up -d postgres

# Ou démarrer tous les services
docker-compose up -d
```

### Erreur de connexion

```bash
# Vérifier que le conteneur est accessible
docker exec arty-postgres pg_isready -U artizaho_user -d artizaho_db

# Vérifier les logs du conteneur
docker logs arty-postgres
```

### La colonne existe déjà

Si la colonne existe déjà, vous verrez un message :
```
Column position already exists in artisan_photos table
```

C'est normal et le script est idempotent (peut être exécuté plusieurs fois sans problème).

## Prochaines étapes

1. Exécuter une des solutions ci-dessus
2. Redémarrer le serveur backend (si nécessaire)
3. Tester à nouveau l'inscription artisan depuis le frontend

## Notes

- Tous les scripts sont **idempotents** : ils peuvent être exécutés plusieurs fois sans problème
- La colonne `position` aura une valeur par défaut de `0` pour tous les enregistrements existants
- La colonne est `NOT NULL`, donc tous les nouveaux enregistrements doivent avoir une valeur

