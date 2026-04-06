
"""
Preview script - Shows what data will be changed without modifying the database.
This helps users verify the anonymization before applying it.
"""

import sys
import os
from pathlib import Path
import random
from faker import Faker

sys.path.insert(0, str(Path(__file__).parent.parent))

import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

from app.core.database import SessionLocal

try:
    from app.models.user import User, ArtisanProfile
    from app.models.workshop import Workshop
except Exception as e:
    print(f"Warning: Could not import all models: {e}")
    print("Attempting to use SessionLocal anyway...")
    User = None
    ArtisanProfile = None
    Workshop = None

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
    prefix = random.choice(PHONE_PREFIXES)
    number = "".join(str(random.randint(0, 9)) for _ in range(7))
    return f"+261{prefix}{number}"

def generate_fake_address():
    street_number = random.randint(1, 500)
    street_names = [
        "Rue de l'Indépendance", "Avenue de la Liberté", "Boulevard du Commerce",
        "Rue de la Paix", "Avenue Principale"
    ]
    city = random.choice(MADAGASCAR_CITIES)
    postal_code = "".join(str(random.randint(0, 9)) for _ in range(3)) + "00"
    return f"{street_number} {random.choice(street_names)}, {postal_code} {city}"

def preview_users():
    """Show users that will be anonymized"""
    db = SessionLocal()
    try:
        users = db.query(User).filter(
            (User.phone.isnot(None)) | 
            (User.address.isnot(None)) |
            (User.siret.isnot(None)) |
            (User.company_name.isnot(None))
        ).limit(5).all()
        
        if not users:
            print("\n✓ No user data to anonymize")
            return 0
        
        print("\n" + "="*100)
        print("USERS - BEFORE & AFTER PREVIEW (5 samples)")
        print("="*100)
        
        for i, user in enumerate(users, 1):
            print(f"\nUser #{i}: {user.email[:40]}")
            print(f"  Phone:        {str(user.phone or '(none)'):<40} → {generate_fake_phone()}")
            print(f"  Address:      {str((user.address or '(none)')[:40]):<40} → {generate_fake_address()[:40]}")
            print(f"  Company:      {str((user.company_name or '(none)')[:40]):<40} → Ent. {fake.word().title()}")
            fake_siret = 'SIRET' + ''.join(str(random.randint(0, 9)) for _ in range(10))
            print(f"  SIRET:        {str(user.siret or '(none)'):<40} → {fake_siret}")
        
        total = db.query(User).filter(
            (User.phone.isnot(None)) | 
            (User.address.isnot(None)) | 
            (User.siret.isnot(None)) | 
            (User.company_name.isnot(None))
        ).count()
        print(f"\nTotal users with data to anonymize: {total}")
        return total
        
    finally:
        db.close()

def preview_artisan_profiles():
    """Show artisan profiles that will be anonymized"""
    db = SessionLocal()
    try:
        profiles = db.query(ArtisanProfile).filter(
            (ArtisanProfile.nif.isnot(None)) |
            (ArtisanProfile.location_address.isnot(None)) |
            (ArtisanProfile.region.isnot(None))
        ).limit(5).all()
        
        if not profiles:
            print("\n✓ No artisan profile data to anonymize")
            return 0
        
        print("\n" + "="*100)
        print("ARTISAN PROFILES - BEFORE & AFTER PREVIEW (5 samples)")
        print("="*100)
        
        for i, profile in enumerate(profiles, 1):
            current_region = profile.region or profile.location_region or "(none)"
            print(f"\nProfile #{i}: ID {str(profile.id)[:8]}")
            print(f"  Company:      {str((profile.company_name or '(none)')[:40]):<40} → Ent. {fake.word().title()}")
            print(f"  Region:       {str(current_region[:40]):<40} → {random.choice(MADAGASCAR_REGIONS)}")
            print(f"  City:         {str((profile.location_city or '(none)')[:40]):<40} → {random.choice(MADAGASCAR_CITIES)}")
            print(f"  Address:      {str((profile.location_address or '(none)')[:40]):<40} → {generate_fake_address()[:40]}")
            fake_nif = 'NIF' + ''.join(str(random.randint(0, 9)) for _ in range(10))
            print(f"  NIF:          {str(profile.nif or '(none)'):<40} → {fake_nif}")
        
        total = db.query(ArtisanProfile).filter(
            (ArtisanProfile.nif.isnot(None)) |
            (ArtisanProfile.location_address.isnot(None)) |
            (ArtisanProfile.region.isnot(None))
        ).count()
        print(f"\nTotal artisan profiles with data to anonymize: {total}")
        return total
        
    finally:
        db.close()

def preview_workshops():
    """Show workshops that will be anonymized"""
    db = SessionLocal()
    try:
        workshops = db.query(Workshop).filter(
            (Workshop.location.isnot(None)) |
            (Workshop.address.isnot(None))
        ).limit(5).all()
        
        if not workshops:
            print("\n✓ No workshop data to anonymize")
            return 0
        
        print("\n" + "="*100)
        print("WORKSHOPS - BEFORE & AFTER PREVIEW (5 samples)")
        print("="*100)
        
        for i, workshop in enumerate(workshops, 1):
            print(f"\nWorkshop #{i}: {workshop.title[:50]}")
            print(f"  Location:     {str((workshop.location or '(none)')[:40]):<40} → {random.choice(MADAGASCAR_CITIES)}")
            print(f"  Address:      {str((workshop.address or '(none)')[:40]):<40} → {generate_fake_address()[:40]}")
            print(f"  Room Details: {str((workshop.room_details or '(none)')[:40]):<40} → Salle principale - Capacité adaptée")
        
        total = db.query(Workshop).filter(
            (Workshop.location.isnot(None)) | 
            (Workshop.address.isnot(None))
        ).count()
        print(f"\nTotal workshops with data to anonymize: {total}")
        return total
        
    finally:
        db.close()

def main():
    print("\n" + "="*100)
    print("ANONYMIZATION PREVIEW - WHAT WILL BE CHANGED")
    print("="*100)
    print("\nThis preview shows sample data transformations:")
    print("  • Users with phone numbers, addresses, company info, SIRET")
    print("  • Artisan profiles with location and tax ID data")
    print("  • Workshops with location addresses")
    print("="*100)
    
    try:
        user_count = preview_users()
        profile_count = preview_artisan_profiles()
        workshop_count = preview_workshops()
        
        print("\n" + "="*100)
        print("SUMMARY")
        print("="*100)
        print(f"Users to process:             {user_count}")
        print(f"Artisan profiles to process:  {profile_count}")
        print(f"Workshops to process:         {workshop_count}")
        print("\nTo apply these changes, run:")
        print("  python Back/scripts/anonymize_data.py")
        print("="*100 + "\n")
        
        return 0
    except Exception as e:
        print(f"\n✗ Error during preview: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
