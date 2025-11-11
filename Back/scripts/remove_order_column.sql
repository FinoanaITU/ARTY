-- Script SQL pour supprimer la colonne 'order' de la table artisan_photos
-- Ce script peut être exécuté directement sur la base de données PostgreSQL

-- Vérifier si la colonne order existe avant de la supprimer
DO $$
BEGIN
    -- Copier les valeurs de order vers position si nécessaire
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'artisan_photos' 
        AND column_name = 'order'
    ) THEN
        -- Copier les valeurs de order vers position si position est 0
        UPDATE artisan_photos 
        SET position = COALESCE("order", 0)
        WHERE position = 0 AND "order" IS NOT NULL;
        
        -- Supprimer la colonne order
        ALTER TABLE artisan_photos DROP COLUMN "order";
        
        RAISE NOTICE 'Column "order" removed from artisan_photos table';
    ELSE
        RAISE NOTICE 'Column "order" does not exist in artisan_photos table';
    END IF;
END $$;

