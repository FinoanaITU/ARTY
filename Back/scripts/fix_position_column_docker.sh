#!/bin/bash

# Script pour ajouter la colonne position à artisan_photos dans Docker PostgreSQL
# Ce script utilise docker exec pour exécuter la commande SQL dans le conteneur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration Docker
CONTAINER_NAME="arty-postgres"
DB_NAME="artizaho_db"
DB_USER="artizaho_user"

echo -e "${YELLOW}🔧 Correction de la colonne position dans artisan_photos...${NC}"

# Vérifier si le conteneur est en cours d'exécution
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}❌ Erreur: Le conteneur ${CONTAINER_NAME} n'est pas en cours d'exécution${NC}"
    echo -e "${YELLOW}💡 Astuce: Démarrez le conteneur avec: docker-compose up -d postgres${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Conteneur ${CONTAINER_NAME} trouvé${NC}"

# Exécuter la commande SQL pour ajouter la colonne
echo -e "${YELLOW}📝 Exécution de la commande SQL...${NC}"

docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} <<EOF
-- Vérifier si la colonne existe déjà avant de l'ajouter
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'artisan_photos' 
        AND column_name = 'position'
    ) THEN
        ALTER TABLE artisan_photos 
        ADD COLUMN position INTEGER NOT NULL DEFAULT 0;
        
        RAISE NOTICE 'Column position added to artisan_photos table';
    ELSE
        RAISE NOTICE 'Column position already exists in artisan_photos table';
    END IF;
END \$\$;

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'artisan_photos'
AND column_name = 'position';
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Colonne position ajoutée avec succès !${NC}"
else
    echo -e "${RED}❌ Erreur lors de l'ajout de la colonne${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Correction terminée !${NC}"

