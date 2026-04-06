
"""
Script Python pour ajouter la colonne position à artisan_photos
Ce script peut être exécuté depuis l'hôte ou depuis le conteneur backend
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError, ProgrammingError

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings

def add_position_column():
    """Ajoute la colonne position à la table artisan_photos si elle n'existe pas"""
    
    print("🔧 Correction de la colonne position dans artisan_photos...")
    print(f"📊 Connexion à la base de données: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'N/A'}")
    
    try:

        engine = create_engine(settings.DATABASE_URL)
        
        with engine.connect() as conn:

            check_query = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'artisan_photos' 
                AND column_name = 'position'
            """)
            
            result = conn.execute(check_query)
            column_exists = result.fetchone() is not None
            
            if column_exists:
                print("✅ La colonne 'position' existe déjà dans artisan_photos")
            else:
                print("📝 Ajout de la colonne 'position'...")
                

                alter_query = text("""
                    ALTER TABLE artisan_photos 
                    ADD COLUMN position INTEGER NOT NULL DEFAULT 0
                """)
                
                conn.execute(alter_query)
                conn.commit()
                
                print("✅ Colonne 'position' ajoutée avec succès !")
            

            verify_query = text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'artisan_photos'
                AND column_name = 'position'
            """)
            
            result = conn.execute(verify_query)
            row = result.fetchone()
            
            if row:
                print(f"\n📋 Informations sur la colonne:")
                print(f"   - Nom: {row[0]}")
                print(f"   - Type: {row[1]}")
                print(f"   - Nullable: {row[2]}")
                print(f"   - Défaut: {row[3]}")
            
        print("\n🎉 Correction terminée !")
        return True
        
    except OperationalError as e:
        print(f"❌ Erreur de connexion à la base de données: {e}")
        print("💡 Vérifiez que:")
        print("   - PostgreSQL est en cours d'exécution")
        print("   - Les variables d'environnement DATABASE_URL sont correctes")
        print("   - Le conteneur Docker est démarré (si applicable)")
        return False
        
    except ProgrammingError as e:
        print(f"❌ Erreur SQL: {e}")
        return False
        
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = add_position_column()
    sys.exit(0 if success else 1)

