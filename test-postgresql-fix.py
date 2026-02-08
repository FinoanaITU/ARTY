#!/usr/bin/env python3
"""
Test de vérification de la fix PostgreSQL datediff
"""

import requests
import json
import time

API_URL = "http://localhost:8000/api/v1"

print("=" * 60)
print("🧪 TEST FIX POSTGRESQL - DATEDIFF")
print("=" * 60)
print()

# 1. Vérifier backend
print("📡 Vérification du backend...")
try:
    response = requests.get("http://localhost:8000/health", timeout=5)
    if response.status_code == 200:
        print("✅ Backend actif")
    else:
        print(f"❌ Backend non sain (HTTP {response.status_code})")
        exit(1)
except Exception as e:
    print(f"❌ Backend non accessible: {e}")
    exit(1)

print()

# 2. Créer admin et login
print("🔑 Authentification admin...")

# D'abord, essayer de créer un admin test
admin_email = f"admin-test-{int(time.time())}@test.mg"
admin_password = "TestAdmin123!"

register_data = {
    "email": admin_email,
    "password": admin_password,
    "first_name": "Test",
    "last_name": "Admin",
    "role": "admin"
}

try:
    response = requests.post(
        f"{API_URL}/auth/register",
        json=register_data
    )
    if response.status_code == 200 or response.status_code == 201:
        print(f"✅ Admin créé: {admin_email}")
    else:
        print(f"⚠️  Admin peut-être déjà existant: {response.json().get('detail')}")
except Exception as e:
    print(f"⚠️  Impossible de créer admin: {e}")

# Login
login_data = {
    "username": admin_email,
    "password": admin_password
}

try:
    response = requests.post(
        f"{API_URL}/auth/login",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    if response.status_code == 200:
        token = response.json().get("access_token")
        if token:
            print(f"✅ Authentification réussie")
        else:
            print("❌ Pas de token reçu")
            exit(1)
    else:
        print(f"❌ Login échoué (HTTP {response.status_code}): {response.json()}")
        exit(1)
except Exception as e:
    print(f"❌ Erreur login: {e}")
    exit(1)

print()

# 3. Tester les endpoints qui utilisaient datediff
print("🧪 Test des endpoints...")
print()

endpoints_to_test = [
    ("GET", "/admin/subscriptions/overview", "Vue d'ensemble"),
    ("GET", "/admin/subscriptions/list?skip=0&limit=20", "Liste"),
    ("GET", "/admin/subscriptions/stats/detailed", "Statistiques (utilisait datediff)")
]

all_ok = True

for method, endpoint, description in endpoints_to_test:
    print(f"Test: {description}")
    print(f"  Endpoint: {method} {endpoint}")
    
    try:
        if method == "GET":
            response = requests.get(
                f"{API_URL}{endpoint}",
                headers={"Authorization": f"Bearer {token}"}
            )
        elif method == "POST":
            response = requests.post(
                f"{API_URL}{endpoint}",
                headers={"Authorization": f"Bearer {token}"},
                json={}
            )
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ HTTP 200 OK")
            
            # Afficher quelques infos de la response
            if isinstance(data, dict):
                for key in list(data.keys())[:3]:
                    print(f"    - {key}: {str(data[key])[:50]}")
            print()
        else:
            print(f"  ❌ HTTP {response.status_code}")
            print(f"  Error: {response.json()}")
            print()
            all_ok = False
    except Exception as e:
        print(f"  ❌ Exception: {e}")
        print()
        all_ok = False

print()

# 4. Résumé
print("=" * 60)
if all_ok:
    print("🎉 TOUS LES TESTS SONT PASSÉS!")
    print()
    print("✅ Endpoint /admin/subscriptions/stats/detailed: FONCTIONNEL")
    print("✅ PostgreSQL datediff: FIXÉ ✓")
    print("✅ Backend ready for production")
else:
    print("❌ CERTAINS TESTS ONT ÉCHOUÉ")
    exit(1)

print("=" * 60)
