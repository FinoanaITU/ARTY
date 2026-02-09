# 🔐 Guide Complet: Anonymisation des Données de Base de Données

Tu as créé deux scripts puissants pour nettoyer ta base de données et remplacer les données réelles par des données fictives de test.

## 📁 Fichiers Créés

### 1. **Script Principal d'Anonymisation**
- **Fichier**: `Back/scripts/anonymize_sqlraw.py`
- **Description**: Anonymise les données réelles dans la base de données et les remplace par des données fictives
- **Avantages**: Utilise SQL pur pour éviter les problèmes de relations ORM

### 2. **Documentation**
- **Fichier**: `Back/scripts/ANONYMIZATION_README.md`
- **Description**: Guide détaillé avec exemples et dépannage

---

## 🚀 Utilisation Rapide

### Étape 1: Démarrer la Base de Données

Si tu utilises Docker Compose:
```bash
cd ARTY
docker-compose up -d postgres
# Attends 10-15 secondes que la base de données démarre
```

Ou si tu as PostgreSQL local, assure-toi qu'elle tourne.

### Étape 2: Voir un Aperçu (Sans Modification)

```bash
cd Back
python scripts/anonymize_sqlraw.py
```

Cela affichera:
- 5 exemples d'utilisateurs avec données avant/après
- 5 exemples de profils artisan avec données avant/après
- 5 exemples d'ateliers avec données avant/après
- Nombre total d'enregistrements à traiter

### Étape 3: Appliquer l'Anonymisation

Relance le script et réponds `yes` quand demandé:

```bash
python scripts/anonymize_sqlraw.py

# Quand tu vois:
# "Do you want to apply anonymization to the database? (yes/no): "
# Tape: yes
```

---

## 📊 Données Transformées

### Utilisateurs (Table: `users`)
| Données | Avant | Après |
|---------|-------|-------|
| **Téléphone** | +33 1 23 45 67 89 | +261 33 234 5678 |
| **Adresse** | 123 Rue de Paris, Paris | 45 Rue de l'Indépendance, 10100 Antananarivo |
| **Ville** | Paris | Antananarivo |
| **Entreprise** | Acme Corp France | Entreprise Digital Solutions |
| **SIRET** | 12345678901234 | 98765432109876 |

### Profils Artisan (Table: `artisan_profiles`)
| Données | Avant | Après |
|---------|-------|-------|
| **Entreprise** | Art & Design Paris | Atelier Creative Innovations |
| **Région** | Île-de-France | Analamanga |
| **Ville** | Paris | Antsiranana |
| **Adresse** | 456 Boulevard Saint Germain | 234 Avenue de la Liberté, 10200 Fianarantsoa |
| **NIF** | 1234567890123 | 5678901234567 |
| **STAT** | (vide) | STAT456789 |

### Ateliers (Table: `workshops`)
| Données | Avant | Après |
|---------|-------|-------|
| **Localisation** | Paris | Mahajanga |
| **Adresse** | Studio d'Art, 8e arrondissement | 123 Boulevard du Commerce, 40100 Morondava |
| **Détails Salle** | Salle avec baies vitrées | Salle principale - Capacité adaptée |

---

## 🌍 Données Malgaches Utilisées

Les scripts génèrent des données cohérentes avec Madagascar:

### Villes (15 villes principales)
- Antananarivo, Antsirabe, Fianarantsoa, Toliara, Mahajanga
- Antsiranana, Morondava, Andapa, Antalaha, Sambava
- Et autres

### Régions (12 régions de Madagascar)
- Analamanga, Amoron'i Mania, Atsinanana, Betsiboka, Boeny
- Bongolava, Diana, Didy, Itasy, Melaky, Menabe, Vakinankaratra

### Numéros de Téléphone
- Format: `+261XX XXXXXXX` (code Madagascar + préfixe + numéro)
- Préfixes valides: 033, 034, 032, 038, 030, 031, 037, 039

---

## 🔧 Configuration Requise

### Variables d'Environnement (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/arty_db
# ou pour SQLite en test:
# DATABASE_URL=sqlite:///./test.db
```

### Vérifier la Connexion
```bash
# Teste la connexion
cd Back
python -c "from app.core.database import SessionLocal; db = SessionLocal(); print('✓ Connexion OK')"
```

---

## ⚠️ Points Importants

### ✅ À Faire
- ✓ Faire une sauvegarde avant anonymisation
- ✓ Tester d'abord en environnement de test
- ✓ Vérifier les données après anonymisation
- ✓ Garder les données anonymisées pour le testing

### ❌ À Éviter
- ✗ Ne pas anonymiser la production (ou avec EXTRÊME prudence)
- ✗ Ne pas supprimer le backup
- ✗ Ne pas ignorer les erreurs de base de données
- ✗ Ne pas modifier les scripts sans comprendre le code

---

## 🐛 Dépannage

### Erreur: "connection to server failed"
**Cause**: PostgreSQL n'est pas en cours d'exécution

**Solution**:
```bash
# Avec Docker
docker-compose up -d postgres

# Ou locale
brew services start postgresql  # macOS
# ou
sudo systemctl start postgresql  # Linux
```

### Erreur: "password authentication failed"
**Cause**: Credentials incorrects dans `.env`

**Solution**:
1. Vérifie DATABASE_URL dans `.env`
2. Assure-toi que l'user/password sont corrects
3. Redémarre PostgreSQL

### Erreur: "relation does not exist"
**Cause**: Tables n'existent pas (migrations pas exécutées)

**Solution**:
```bash
cd Back
alembic upgrade head
```

### Script très lent
**Cause**: Tables très grandes

**Solution**:
- C'est limité à 5 exemples en preview (OK)
- Pour l'anonymisation réelle, cela peut prendre du temps
- Laisse tourner, c'est normal

---

## 📈 Cas d'Utilisation

### 1. **Préparation au Testing**
```bash
# Anonymise les données réelles
python scripts/anonymize_sqlraw.py
# Réponds: yes

# Lance les tests
pytest -v
```

### 2. **Demo Publique**
```bash
# Anonymise avant une démo
python scripts/anonymize_sqlraw.py

# Partage la DB avec données fictives
```

### 3. **Développement de Nouvelles Fonctionnalités**
```bash
# Anonymise les données utilisateurs sensibles
python scripts/anonymize_sqlraw.py

# Bâtis sur des données de test sûres
```

---

## 🔄 Logique du Script

### Comment fonctionne l'anonymisation:

1. **Connexion à la DB**
   ```python
   db = SessionLocal()
   ```

2. **Sélection des données à anon**
   ```python
   SELECT * FROM users WHERE phone IS NOT NULL OR address IS NOT NULL
   ```

3. **Génération de données fictives**
   ```python
   fake_phone = "+261" + "33" + "234" + "5678"  # Format Madagascar
   fake_address = "45 Rue de la Paix, 10100 Antananarivo"
   ```

4. **Mise à jour avec SQL**
   ```sql
   UPDATE users SET phone = :fake_phone WHERE phone IS NOT NULL
   ```

5. **Commit/Rollback**
   - Succès → Commit
   - Erreur → Rollback (données non modifiées)

---

## 📝 Exemples de Sorties

### Avant anonymisation:

```
User #1: jean.dupont@example.com
  Phone:        +33 1 23 45 67 89         → +261 33 234 5678
  Address:      123 Rue de Paris, 75001   → 67 Avenue Principale, 10100 Antananarivo
  Company:      Acme Corporation France   → Entreprise Tech Solutions
  SIRET:        10987654321234           → 12345678901234
```

### Après anonymisation (en DB):
```
email | phone          | address                              | company_name          | siret
------|----------------|--------------------------------------|-----------------------|----------------
jean@...|+261 33 234 5678|67 Avenue Principale, 10100 Anta...|Entreprise Tech Solut...|12345678901234
```

---

## 🎯 Prochaines Étapes

1. **Fais tourner le script**
   ```bash
   python Back/scripts/anonymize_sqlraw.py
   ```

2. **Vérifie les enregistrements anonymisés**
   ```bash
   # En psql ou DBeaver
   SELECT email, phone, address FROM users LIMIT 5;
   ```

3. **Teste l'application** avec les données anonymisées
   ```bash
   cd Back && uvicorn app.main:app --reload
   ```

4. **Assure-toi que tout fonctionne** - les données fictives devraient suffire pour les tests

---

## ✨ Résumé

Tu as maintenant:

✅ **Script d'anonymisation** robuste qui:
- Utilise SQL pur (pas de problèmes ORM)
- Génère des données réalistes malgaches
- Montre un aperçu avant d'appliquer
- Gère les erreurs gracieusement
- Peut être relancé sans problème

✅ **Données transformées**:
- Téléphones → Numéros malgaches fictifs
- Adresses → Adresses malgaches fictives
- Identifiants → Numéros fictifs
- Localisations → Villes malgaches

✅ **Sécurité**:
- Confirmation requise avant modification
- Pas de suppression, juste modification
- Peut toujours utiliser backup si besoin
- SQLAlchemy rollback sur erreur

---

**C'est prêt! Bonne anonymisation! 🎉**
