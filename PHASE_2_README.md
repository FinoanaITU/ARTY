# PHASE 2 - Analytics Admin 📊

## Vue d'ensemble

La PHASE 2 fournit des statistiques complètes et des analytics pour le dashboard administrateur de la plateforme Artizaho.

**Status:** ✅ Complété (8 février 2026)

---

## 🚀 Quick Start

### 1. Démarrer le backend

```bash
# Avec Docker
cd /Users/finoanaandriatsilavo/Documents/ARTY
make restart

# Ou manuellement
cd Back
uvicorn app.main:app --reload
```

### 2. Tester les endpoints

```bash
# Exécuter le script de test
./test-analytics-endpoints.sh

# Ou tester manuellement
# 1. Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@artizaho.com","password":"admin123"}' | jq

# 2. Copier le token et tester
export TOKEN="<votre-token>"

curl http://localhost:8000/api/v1/admin/analytics/overview \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 📡 Endpoints disponibles

### 1. Vue d'ensemble plateforme
```bash
GET /api/v1/admin/analytics/overview
```

**Réponse:**
```json
{
  "total_users": 150,
  "users_by_role": {"buyers": 100, "artisans": 45, "admins": 5},
  "total_artisans": {"active": 30, "pending": 10, "total": 45},
  "total_products": {"published": 200, "pending": 15, "total": 220},
  "total_workshops": {"published": 50, "pending": 5, "total": 55},
  "total_orders": 350,
  "total_bookings": 120,
  "pending_validations": 30
}
```

### 2. Statistiques revenus
```bash
GET /api/v1/admin/analytics/revenue?period=month
GET /api/v1/admin/analytics/revenue?start_date=2026-01-01&end_date=2026-02-01
```

**Query params:**
- `period`: `day`, `week`, `month`, `year`, `all`
- `start_date`: Date de début (format: YYYY-MM-DD)
- `end_date`: Date de fin (format: YYYY-MM-DD)

**Réponse:**
```json
{
  "total_revenue": 5000000.00,
  "product_sales": 3500000.00,
  "workshop_sales": 1500000.00,
  "commission_artizaho": 750000.00,
  "commission_rate": 0.15,
  "period": "month",
  "daily_breakdown": [...]
}
```

### 3. Statistiques artisans
```bash
GET /api/v1/admin/analytics/artisans
```

**Réponse:**
```json
{
  "total_artisans": 45,
  "active_artisans": 30,
  "pending_approval": 10,
  "by_specialty": [{"specialty": "Sculpture", "count": 12}],
  "by_region": [{"region": "Analamanga", "count": 20}],
  "new_this_month": 5,
  "top_performers": [
    {
      "artisan_id": "uuid",
      "artisan_name": "Jean Artisan",
      "total_revenue": 500000.00
    }
  ]
}
```

### 4. Taux de conversion
```bash
GET /api/v1/admin/analytics/conversion
```

**Réponse:**
```json
{
  "product_view_to_sale_rate": 12.5,
  "workshop_to_booking_rate": 25.0,
  "visitor_to_buyer_conversion": 8.5,
  "products_with_sales": 150,
  "products_with_views": 1200,
  "workshops_with_bookings": 40,
  "users_with_orders": 85
}
```

### 5. Comportement utilisateurs
```bash
GET /api/v1/admin/analytics/users
```

**Réponse:**
```json
{
  "avg_order_value": 142500.00,
  "avg_cart_size": 2.5,
  "repeat_customers_rate": 35.5,
  "total_customers": 100,
  "repeat_customers": 35,
  "payment_method_stats": {
    "paid": 80,
    "pending": 20
  }
}
```

---

## 🧪 Tests

### Exécuter les tests

```bash
cd Back

# Tous les tests analytics
pytest tests/test_admin_analytics.py -v

# Test spécifique
pytest tests/test_admin_analytics.py::TestAdminAnalytics::test_get_platform_overview_with_data -v

# Avec coverage
pytest tests/test_admin_analytics.py --cov=app/services/admin_analytics_service --cov-report=html
```

### Tests inclus (17 au total)

- ✅ Tests de sécurité (unauthorized, non-admin)
- ✅ Tests avec base vide
- ✅ Tests avec données
- ✅ Tests périodes multiples
- ✅ Tests clients récurrents
- ✅ Tests conversion
- ✅ Tests comportement utilisateurs

---

## 📁 Structure du code

```
Back/
├── app/
│   ├── services/
│   │   └── admin_analytics_service.py    ← Service principal (567 lignes)
│   ├── schemas/
│   │   └── admin.py                      ← Schemas analytics (+133 lignes)
│   └── api/v1/endpoints/
│       └── admin.py                      ← Endpoints (+148 lignes)
└── tests/
    └── test_admin_analytics.py            ← Tests (507 lignes)
```

---

## 🔐 Sécurité

Tous les endpoints nécessitent:
- ✅ Authentication (JWT token)
- ✅ Role ADMIN (via `get_current_admin` dependency)

```python
@router.get("/analytics/overview")
async def get_platform_overview(
    current_admin: User = Depends(get_current_admin),  # ← Protection admin
    db: Session = Depends(get_db)
):
    # ...
```

---

## 💾 Compatibilité DB

Le code est compatible avec:
- ✅ **PostgreSQL** (production)
- ✅ **SQLite** (tests)

Gestion automatique des différences via `_is_sqlite()`:
```python
if self._is_sqlite():
    # Requête SQLite
    daily_revenue = func.date(Order.created_at) == current
else:
    # Requête PostgreSQL
    daily_revenue = cast(Order.created_at, Date) == current
```

---

## 📊 Données de test

Pour générer des données de test:

```bash
# Via les seeds (si implémenté)
cd Back
python scripts/seed_database.py

# Ou créer manuellement via l'API
# Créer des artisans, produits, commandes...
```

---

## 🐛 Debugging

### Logs

```bash
# Voir les logs backend
docker logs -f arty-backend

# Ou en local
tail -f Back/logs/app.log
```

### Vérifier la DB

```bash
# PostgreSQL
docker exec -it arty-db psql -U artizaho -d artizaho_db

# Vérifier les données
SELECT COUNT(*) FROM users WHERE role = 'artisan';
SELECT COUNT(*) FROM orders WHERE payment_status = 'paid';
SELECT COUNT(*) FROM workshop_bookings WHERE payment_status = 'paid';
```

---

## 🚀 Améliorations futures

- [ ] Endpoint export CSV/Excel
- [ ] Cache Redis pour performances
- [ ] Graphiques/visualisations
- [ ] Filtres avancés (catégorie, région)
- [ ] Alertes automatiques
- [ ] Comparaison périodes (mois dernier vs ce mois)
- [ ] Prédictions (ML)

---

## 📚 Documentation complète

- [PHASE_2_ANALYTICS_IMPLEMENTATION.md](./PHASE_2_ANALYTICS_IMPLEMENTATION.md) - Documentation détaillée
- [ADMIN_BACKEND_TODO.md](./ADMIN_BACKEND_TODO.md) - Planning général
- [test-analytics-endpoints.sh](./test-analytics-endpoints.sh) - Script de test

---

## 🆘 Support

En cas de problème:

1. Vérifier que le backend est démarré
2. Vérifier le token admin
3. Consulter les logs
4. Exécuter les tests
5. Vérifier la DB

---

## ✅ Checklist validation

Avant de passer à la PHASE 3:

- [x] Service analytics créé et fonctionnel
- [x] Tous les endpoints répondent correctement
- [x] Tests passent (17/17)
- [x] Documentation à jour
- [x] Script de test fonctionne
- [x] Compatible PostgreSQL/SQLite
- [x] Protection admin activée
- [x] Code validé syntaxiquement

---

**PHASE 2 ✅ COMPLÉTÉE - Prêt pour PHASE 3 (Payment Tracker)**
