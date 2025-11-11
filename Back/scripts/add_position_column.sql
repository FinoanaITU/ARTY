-- Script SQL pour ajouter la colonne position à la table artisan_photos
-- Ce script peut être exécuté directement sur la base de données PostgreSQL

-- Vérifier si la colonne existe déjà avant de l'ajouter
DO $$
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
END $$;

