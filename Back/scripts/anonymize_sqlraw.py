
"""
Preview & Anonymize script using raw SQL to avoid ORM relationship issues.
Shows what data will be changed and optionally applies the changes.
"""

import sys
from pathlib import Path
import random
import os

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text, inspect
from app.core.database import SessionLocal
from app.core.config import settings
from faker import Faker

MADAGASCAR_CITIES = [
    "Antananarivo", "Antsirabe", "Fianarantsoa", "Toliara", "Mahajanga",
    "Antsiranana", "Morondava", "Andapa", "Antalaha", "Sambava"
]

MADAGASCAR_REGIONS = [
    "Analamanga", "Amoron'i Mania", "Atsinanana", "Betsiboka", "Boeny",
    "Bongolava", "Diana", "Didy", "Itasy", "Melaky", "Menabe", "Vakinankaratra"
]

PHONE_PREFIXES = ["033", "034", "032", "038", "030", "031", "037", "039"]

fake = Faker('fr_FR')

def generate_fake_phone():
    """Generate fake Madagascar phone number"""
    prefix = random.choice(PHONE_PREFIXES)
    number = "".join(str(random.randint(0, 9)) for _ in range(7))
    return f"+261{prefix}{number}"

def generate_fake_company_name():
    """Generate fake company name"""
    prefixes = ["Entreprise", "Compagnie", "Société", "Atelier"]
    suffixes = fake.words(nb=2)
    return f"{random.choice(prefixes)} {' '.join(suffixes).title()}"

def generate_fake_address():
    """Generate fake address in Madagascar"""
    street_number = random.randint(1, 500)
    street_names = [
        "Rue de l'Indépendance", "Avenue de la Liberté", "Boulevard du Commerce",
        "Rue de la Paix", "Avenue Principale"
    ]
    city = random.choice(MADAGASCAR_CITIES)
    postal_code = "".join(str(random.randint(0, 9)) for _ in range(3)) + "00"
    return f"{street_number} {random.choice(street_names)}, {postal_code} {city}"

def generate_fake_siret():
    """Generate fake SIRET number"""
    return "".join(str(random.randint(0, 9)) for _ in range(14))

def generate_fake_nif():
    """Generate fake NIF number"""
    return "".join(str(random.randint(0, 9)) for _ in range(13))

def generate_fake_stat():
    """Generate fake STAT number"""
    return f"STAT{random.randint(100000, 999999)}"

def preview_users(db):
    """Preview user data that will be anonymized"""
    try:
        result = db.execute(text("""
            SELECT id, email, phone, address, company_name, siret 
            FROM users 
            WHERE phone IS NOT NULL 
               OR address IS NOT NULL 
               OR siret IS NOT NULL 
               OR company_name IS NOT NULL
            LIMIT 5
        """))
        
        users = result.fetchall()
        
        if not users:
            print("\n✓ No user data to anonymize")
            return 0
        
        print("\n" + "="*100)
        print("USERS - BEFORE & AFTER PREVIEW (5 samples)")
        print("="*100)
        
        total_result = db.execute(text("""
            SELECT COUNT(*) FROM users 
            WHERE phone IS NOT NULL 
               OR address IS NOT NULL 
               OR siret IS NOT NULL 
               OR company_name IS NOT NULL
        """))
        total = total_result.fetchone()[0]
        
        for i, user in enumerate(users, 1):
            user_id, email, phone, address, company, siret = user
            print(f"\nUser #{i}: {email[:40]}")
            print(f"  Phone:        {str(phone or '(none)'):<40} → {generate_fake_phone()}")
            print(f"  Address:      {str((address or '(none)')[:40]):<40} → {generate_fake_address()[:40]}")
            print(f"  Company:      {str((company or '(none)')[:40]):<40} → {generate_fake_company_name()[:40]}")
            print(f"  SIRET:        {str(siret or '(none)'):<40} → {generate_fake_siret()}")
        
        print(f"\nTotal users with data to anonymize: {total}")
        return total
        
    except Exception as e:
        print(f"✗ Error previewing users: {e}")
        return 0

def preview_artisan_profiles(db):
    """Preview artisan profile data that will be anonymized"""
    try:
        result = db.execute(text("""
            SELECT id, company_name, region, location_region, location_city, location_address, nif, stat
            FROM artisan_profiles 
            WHERE nif IS NOT NULL 
               OR location_address IS NOT NULL 
               OR region IS NOT NULL
            LIMIT 5
        """))
        
        profiles = result.fetchall()
        
        if not profiles:
            print("\n✓ No artisan profile data to anonymize")
            return 0
        
        print("\n" + "="*100)
        print("ARTISAN PROFILES - BEFORE & AFTER PREVIEW (5 samples)")
        print("="*100)
        
        total_result = db.execute(text("""
            SELECT COUNT(*) FROM artisan_profiles 
            WHERE nif IS NOT NULL 
               OR location_address IS NOT NULL 
               OR region IS NOT NULL
        """))
        total = total_result.fetchone()[0]
        
        for i, profile in enumerate(profiles, 1):
            prof_id, company, region, loc_region, city, address, nif, stat = profile
            current_region = region or loc_region or "(none)"
            print(f"\nProfile #{i}: ID {str(prof_id)[:8]}")
            print(f"  Company:      {str((company or '(none)')[:40]):<40} → {generate_fake_company_name()[:40]}")
            print(f"  Region:       {str(current_region[:40]):<40} → {random.choice(MADAGASCAR_REGIONS)}")
            print(f"  City:         {str((city or '(none)')[:40]):<40} → {random.choice(MADAGASCAR_CITIES)}")
            print(f"  Address:      {str((address or '(none)')[:40]):<40} → {generate_fake_address()[:40]}")
            print(f"  NIF:          {str(nif or '(none)'):<40} → {generate_fake_nif()}")
        
        print(f"\nTotal artisan profiles with data to anonymize: {total}")
        return total
        
    except Exception as e:
        print(f"✗ Error previewing artisan profiles: {e}")
        return 0

def preview_workshops(db):
    """Preview workshop data that will be anonymized"""
    try:
        result = db.execute(text("""
            SELECT id, title, location, address, room_details
            FROM workshops 
            WHERE location IS NOT NULL 
               OR address IS NOT NULL
            LIMIT 5
        """))
        
        workshops = result.fetchall()
        
        if not workshops:
            print("\n✓ No workshop data to anonymize")
            return 0
        
        print("\n" + "="*100)
        print("WORKSHOPS - BEFORE & AFTER PREVIEW (5 samples)")
        print("="*100)
        
        total_result = db.execute(text("""
            SELECT COUNT(*) FROM workshops 
            WHERE location IS NOT NULL 
               OR address IS NOT NULL
        """))
        total = total_result.fetchone()[0]
        
        for i, workshop in enumerate(workshops, 1):
            ws_id, title, location, address, room_details = workshop
            print(f"\nWorkshop #{i}: {title[:50]}")
            print(f"  Location:     {str((location or '(none)')[:40]):<40} → {random.choice(MADAGASCAR_CITIES)}")
            print(f"  Address:      {str((address or '(none)')[:40]):<40} → {generate_fake_address()[:40]}")
            print(f"  Room Details: {str((room_details or '(none)')[:40]):<40} → Salle principale - Capacité adaptée")
        
        print(f"\nTotal workshops with data to anonymize: {total}")
        return total
        
    except Exception as e:
        print(f"✗ Error previewing workshops: {e}")
        return 0

def anonymize_data():
    """Anonymize data in the database"""
    db = SessionLocal()
    try:
        print("\n" + "="*100)
        print("ANONYMIZING DATA IN DATABASE...")
        print("="*100)
        

        try:
            db.execute(text("""
                UPDATE users 
                SET 
                    phone = CASE WHEN phone IS NOT NULL THEN :fake_phone ELSE phone END,
                    address = CASE WHEN address IS NOT NULL THEN :fake_address ELSE address END,
                    city = CASE WHEN city IS NOT NULL THEN :fake_city ELSE city END,
                    company_name = CASE WHEN company_name IS NOT NULL THEN :fake_company ELSE company_name END,
                    siret = CASE WHEN siret IS NOT NULL THEN :fake_siret ELSE siret END
                WHERE phone IS NOT NULL 
                   OR address IS NOT NULL 
                   OR siret IS NOT NULL 
                   OR company_name IS NOT NULL
            """), {
                "fake_phone": generate_fake_phone(),
                "fake_address": generate_fake_address(),
                "fake_city": random.choice(MADAGASCAR_CITIES),
                "fake_company": generate_fake_company_name(),
                "fake_siret": generate_fake_siret()
            })
            db.commit()
            print("✓ Users anonymized")
        except Exception as e:
            print(f"✗ Error anonymizing users: {e}")
            db.rollback()
        

        try:
            db.execute(text("""
                UPDATE artisan_profiles 
                SET 
                    region = CASE WHEN region IS NOT NULL THEN :fake_region ELSE region END,
                    location_region = CASE WHEN location_region IS NOT NULL THEN :fake_region ELSE location_region END,
                    location_city = CASE WHEN location_city IS NOT NULL THEN :fake_city ELSE location_city END,
                    location_address = CASE WHEN location_address IS NOT NULL THEN :fake_address ELSE location_address END,
                    nif = CASE WHEN nif IS NOT NULL THEN :fake_nif ELSE nif END,
                    stat = CASE WHEN stat IS NOT NULL THEN :fake_stat ELSE stat END
                WHERE nif IS NOT NULL 
                   OR location_address IS NOT NULL 
                   OR region IS NOT NULL
            """), {
                "fake_region": random.choice(MADAGASCAR_REGIONS),
                "fake_city": random.choice(MADAGASCAR_CITIES),
                "fake_address": generate_fake_address(),
                "fake_nif": generate_fake_nif(),
                "fake_stat": generate_fake_stat()
            })
            db.commit()
            print("✓ Artisan profiles anonymized")
        except Exception as e:
            print(f"✗ Error anonymizing artisan profiles: {e}")
            db.rollback()
        

        try:
            db.execute(text("""
                UPDATE workshops 
                SET 
                    location = CASE WHEN location IS NOT NULL THEN :fake_city ELSE location END,
                    address = CASE WHEN address IS NOT NULL THEN :fake_address ELSE address END,
                    room_details = CASE WHEN room_details IS NOT NULL THEN 'Salle principale - Capacité adaptée' ELSE room_details END
                WHERE location IS NOT NULL 
                   OR address IS NOT NULL
            """), {
                "fake_city": random.choice(MADAGASCAR_CITIES),
                "fake_address": generate_fake_address()
            })
            db.commit()
            print("✓ Workshops anonymized")
        except Exception as e:
            print(f"✗ Error anonymizing workshops: {e}")
            db.rollback()
        
        print("\n✓ Anonymization completed successfully!")
        
    except Exception as e:
        print(f"✗ Error during anonymization: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    print("\n" + "="*100)
    print("DATABASE ANONYMIZATION TOOL")
    print("="*100)
    print("\nThis tool will replace real personal data with test data:")
    print("  • Phone numbers → Fake Madagascar phone numbers")
    print("  • Addresses → Fake Madagascar addresses")
    print("  • Companies → Fake company names")
    print("  • SIRET/NIF → Fake business IDs")
    print("  • Locations → Random Madagascar cities")
    print("="*100)
    
    db = SessionLocal()
    try:

        print("\n" + "="*100)
        print("PREVIEW - SAMPLE DATA TRANSFORMATIONS")
        print("="*100)
        
        user_count = preview_users(db)
        profile_count = preview_artisan_profiles(db)
        workshop_count = preview_workshops(db)
        
        print("\n" + "="*100)
        print("SUMMARY")
        print("="*100)
        print(f"Users to process:             {user_count}")
        print(f"Artisan profiles to process:  {profile_count}")
        print(f"Workshops to process:         {workshop_count}")
        print("="*100 + "\n")
        
        if user_count + profile_count + workshop_count == 0:
            print("✓ Database has no real data to anonymize. All good!")
            return 0
        

        response = input("Do you want to apply anonymization to the database? (yes/no): ").strip().lower()
        
        if response in ["yes", "y"]:
            anonymize_data()
            return 0
        else:
            print("\n✓ Anonymization cancelled.")
            return 0
    
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        db.close()

if __name__ == "__main__":
    sys.exit(main())
