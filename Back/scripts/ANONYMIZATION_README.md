# Data Anonymization Tool

This tool replaces real personal data in the database with realistic test/fake data for development and testing purposes.

## 📋 What Gets Anonymized

### Users Table
- **Phone numbers** → Fake Madagascar phone numbers (✓261 format)
- **Addresses** → Fake Madagascar addresses
- **Cities** → Random Madagascar cities
- **Company names** → Fake company names
- **SIRET numbers** → Fake SIRET (14 digits)

### Artisan Profiles Table
- **NIF numbers** → Fake NIF (13 digits)
- **STAT numbers** → Fake STAT (Madagascar business registration)
- **Company names** → Fake company names
- **Regions** → Random Madagascar regions
- **Cities** → Random Madagascar cities
- **Addresses** → Fake Madagascar addresses

### Workshops Table
- **Locations** → Random Madagascar cities
- **Addresses** → Fake Madagascar addresses
- **Room details** → Generic room descriptions

## 🚀 Quick Start

### 1. Preview Changes (Without Modifying DB)
See what data will be changed before applying:

```bash
cd Back
python scripts/preview_anonymization.py
```

This shows 5 sample data transformations for each table.

### 2. Apply Anonymization
Actually replace the real data with fake data:

```bash
cd Back
python scripts/anonymize_data.py
```

You'll be prompted to confirm before changes are made:
```
Do you want to proceed with anonymization? (yes/no): yes
```

## 📊 Sample Output

### Users
```
User #1: john.doe@example.com
  Phone:        +261 34 123 4567        → +261 33 234 5678
  Address:      123 Main St, Paris      → 45 Rue de la Paix, 10100 Antananarivo
  Company:      Acme Corp              → Entreprise Digital Solutions
  SIRET:        12345678901234         → 98765432109876
```

### Artisan Profiles
```
Profile #1: ID abc12345
  Company:      Professional Crafts     → Atelier Creative Arts
  Region:       Île-de-France          → Analamanga
  City:         Paris                  → Antananarivo
  Address:      123 Rue Nouvelle       → 234 Boulevard du Commerce, 10200 Antalaha
  NIF:          1234567890123          → NIF1098765432
```

## 🔧 Technical Details

- **Language**: Madagascar/French locales (via Faker)
- **Phone Format**: `+261` (Madagascar country code) + valid prefixes (033, 034, 032, etc.)
- **Cities**: 15 major Madagascar cities for consistency
- **Regions**: 12 official Madagascar regions
- **Data Integrity**: All changes are to string fields only; no structural changes

## ⚙️ Requirements

- Python 3.8+
- SQLAlchemy
- Faker (already in requirements.txt)
- Valid database connection

## ✨ Features

✅ Non-destructive preview mode  
✅ Realistic faker-generated test data  
✅ Madagascar-localized addresses and phone numbers  
✅ User confirmation before database changes  
✅ Detailed summary report after execution  
✅ Error handling and rollback on failure  

## 🛑 Important Notes

1. **Backup First**: Always backup your database before running anonymization
2. **Test Environment**: This is primarily for development/test databases
3. **Production**: Use with extreme caution on production databases
4. **Reversible**: Changes cannot be automatically reversed; use backups to restore
5. **Admin Users**: The script respects admin and test users (skips those with "admin" or "test" in email)

## 📝 Example Workflow

```bash
# 1. Navigate to backend directory
cd Back

# 2. Preview what will change
python scripts/preview_anonymization.py

# 3. Review the sample data transformations
# (5 samples for each table type)

# 4. If satisfied, run anonymization
python scripts/anonymize_data.py

# 5. Confirm when prompted
# Do you want to proceed with anonymization? (yes/no): yes

# 6. Check the summary report
# ============================================================
# ANONYMIZATION SUMMARY
# Total Users processed:        42
# Total Artisan Profiles:       8
# Total Workshops processed:    23
# ============================================================
```

## 🐛 Troubleshooting

**Error: "No module named 'faker'"**
```bash
pip install faker
```

**Error: "Database connection failed"**
- Ensure your database is running
- Check DATABASE_URL in .env file
- Verify credentials are correct

**Error: "No data to anonymize"**
- Database might already be anonymized
- Tables might be empty

## 📚 For More Information

- See `scripts/anonymize_data.py` for the main anonymization logic
- See `scripts/preview_anonymization.py` for preview functionality
- Check `app/models/user.py`, `app/models/workshop.py` for database schema

---

Created for ARTY Platform - Data Privacy & Testing
