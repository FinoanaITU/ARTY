#!/usr/bin/env python3
"""
Script to anonymize/sanitize real data in the database and replace with test data.
Replaces addresses, phone numbers, SIRET, NIF, company names, etc. with fake data.
"""

import sys
from pathlib import Path
import random
from faker import Faker

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models.user import User, ArtisanProfile
from app.models.workshop import Workshop
from sqlalchemy import text


# Initialize Faker for Madagascar/French locales
fake_fr = Faker('fr_FR')
fake_mg = Faker('mg_MG') if 'mg_MG' in Faker.locales else Faker('fr_FR')
fake_generic = Faker()

# Madagascan cities for realistic location data
MADAGASCAR_CITIES = [
    "Antananarivo", "Antsirabe", "Fianarantsoa", "Toliara", "Mahajanga",
    "Toliara", "Antsiranana", "Morondava", "Ambatomainty", "Andapa",
    "Antalaha", "Sambava", "Vohemar", "Soanierana Ivongo", "Maroantsetra"
]

# Regions in Madagascar
MADAGASCAR_REGIONS = [
    "Analamanga", "Amoron'i Mania", "Asinhanaka", "Atsinanana", "Betsiboka",
    "Boeny", "Bongolava", "Diana", "Didy", "Highalandy", "Itasy", "Melaky",
    "Menabe", "Sambirano", "Vakinankaratra", "Vatovavy Fitovinany"
]

# Phone number prefixes for Madagascar
PHONE_PREFIXES = ["033", "034", "032", "038", "030", "031", "037", "039"]


def generate_fake_phone():
    """Generate fake Madagascar phone number"""
    prefix = random.choice(PHONE_PREFIXES)
    number = "".join(str(random.randint(0, 9)) for _ in range(7))
    return f"+261{prefix}{number}"


def generate_fake_siret():
    """Generate fake SIRET number (14 digits)"""
    return "".join(str(random.randint(0, 9)) for _ in range(14))


def generate_fake_nif():
    """Generate fake NIF number (French tax ID format)"""
    return "".join(str(random.randint(0, 9)) for _ in range(13))


def generate_fake_stat():
    """Generate fake STAT number (Madagascar business registration)"""
    return f"STAT{random.randint(100000, 999999)}"


def generate_fake_company_name():
    """Generate fake company name"""
    prefixes = ["Entreprise", "Compagnie", "Société", "Atelier"]
    suffixes = fake_fr.words(nb=2)
    return f"{random.choice(prefixes)} {' '.join(suffixes).title()}"


def generate_fake_address():
    """Generate fake address in Madagascar"""
    street_number = random.randint(1, 500)
    street_names = [
        "Rue de l'Indépendance", "Avenue de la Liberté", "Boulevard du Commerce",
        "Rue de la Paix", "Avenue Principale", "Rue Nouvelle", "Boulevard Central"
    ]
    city = random.choice(MADAGASCAR_CITIES)
    postal_code = "".join(str(random.randint(0, 9)) for _ in range(3)) + "00"
    
    return f"{street_number} {random.choice(street_names)}, {postal_code} {city}"


def anonymize_users():
    """Anonymize user personal data"""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Found {len(users)} users to anonymize...")
        
        for user in users:
            # Skip admin/test users if needed
            if "admin" not in user.email and "test" not in user.email:
                original_email = user.email
                
                # Replace sensitive data
                user.phone = generate_fake_phone() if user.phone else None
                user.address = generate_fake_address() if user.address else None
                user.city = random.choice(MADAGASCAR_CITIES) if user.city else None
                user.country = "madagascar"
                
                # For company info, replace with fake data
                if user.company_name:
                    user.company_name = generate_fake_company_name()
                
                if user.siret:
                    user.siret = generate_fake_siret()
                
                print(f"✓ Anonymized user: {original_email[:30]}")
        
        db.commit()
        print(f"✓ Successfully anonymized {len(users)} users")
    except Exception as e:
        db.rollback()
        print(f"✗ Error anonymizing users: {e}")
        raise
    finally:
        db.close()


def anonymize_artisan_profiles():
    """Anonymize artisan profile data"""
    db = SessionLocal()
    try:
        profiles = db.query(ArtisanProfile).all()
        print(f"Found {len(profiles)} artisan profiles to anonymize...")
        
        for profile in profiles:
            # Replace location data
            profile.region = random.choice(MADAGASCAR_REGIONS) if profile.region else None
            profile.location_region = random.choice(MADAGASCAR_REGIONS) if profile.location_region else None
            profile.location_city = random.choice(MADAGASCAR_CITIES) if profile.location_city else None
            profile.location_address = generate_fake_address() if profile.location_address else None
            
            # Replace business identification numbers
            if profile.nif:
                profile.nif = generate_fake_nif()
            
            if profile.stat:
                profile.stat = generate_fake_stat()
            
            # Replace company name if different from user's
            if profile.company_name and "test" not in profile.company_name.lower():
                profile.company_name = generate_fake_company_name()
            
            print(f"✓ Anonymized artisan profile: {profile.id}")
        
        db.commit()
        print(f"✓ Successfully anonymized {len(profiles)} artisan profiles")
    except Exception as e:
        db.rollback()
        print(f"✗ Error anonymizing artisan profiles: {e}")
        raise
    finally:
        db.close()


def anonymize_workshops():
    """Anonymize workshop location data"""
    db = SessionLocal()
    try:
        workshops = db.query(Workshop).all()
        print(f"Found {len(workshops)} workshops to anonymize...")
        
        for workshop in workshops:
            # Replace location information
            if workshop.location:
                workshop.location = random.choice(MADAGASCAR_CITIES)
            
            if workshop.address:
                workshop.address = generate_fake_address()
            
            if workshop.room_details:
                room_types = ["Salle principale", "Studio d'Art", "Atelier", "Salle de formation"]
                workshop.room_details = f"{random.choice(room_types)} - Capacité adaptée"
            
            print(f"✓ Anonymized workshop: {workshop.title[:30]}")
        
        db.commit()
        print(f"✓ Successfully anonymized {len(workshops)} workshops")
    except Exception as e:
        db.rollback()
        print(f"✗ Error anonymizing workshops: {e}")
        raise
    finally:
        db.close()


def print_summary():
    """Print summary of anonymization"""
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        profile_count = db.query(ArtisanProfile).count()
        workshop_count = db.query(Workshop).count()
        
        print("\n" + "="*60)
        print("ANONYMIZATION SUMMARY")
        print("="*60)
        print(f"Total Users processed:        {user_count}")
        print(f"Total Artisan Profiles:       {profile_count}")
        print(f"Total Workshops processed:    {workshop_count}")
        print("\nData anonymized:")
        print("  • Phone numbers → Fake Madagascar phone numbers")
        print("  • Addresses → Fake Madagascar addresses")
        print("  • Cities → Random Madagascar cities")
        print("  • Company names → Fake company names")
        print("  • SIRET → Fake SIRET numbers")
        print("  • NIF → Fake NIF numbers")
        print("  • STAT → Fake STAT numbers")
        print("  • Workshop locations → Random Madagascar cities")
        print("="*60)
    finally:
        db.close()


def main():
    """Run the anonymization process"""
    print("\n" + "="*60)
    print("DATABASE ANONYMIZATION TOOL")
    print("="*60)
    print("\nThis script will replace real personal data with test data:")
    print("  • Real phone numbers")
    print("  • Real addresses")
    print("  • Real SIRET/NIF numbers")
    print("  • Real location information")
    print("\nReplacement data will be:")
    print("  • Realistic but completely fictional")
    print("  • Valid format for testing")
    print("  • Madagascar-based for consistency")
    print("\n" + "="*60 + "\n")
    
    response = input("Do you want to proceed with anonymization? (yes/no): ").strip().lower()
    
    if response not in ["yes", "y"]:
        print("Anonymization cancelled.")
        return 1
    
    try:
        anonymize_users()
        anonymize_artisan_profiles()
        anonymize_workshops()
        print_summary()
        print("\n✓ Anonymization completed successfully!")
        return 0
    except Exception as e:
        print(f"\n✗ Anonymization failed: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
