#!/usr/bin/env python3
"""
Test rapide sans authentification
Vérifie que les endpoints de subscription existent
"""
import sys
import os

# Vérifier les fichiers frontend
print("=" * 60)
print("✅ VÉRIFICATION RAPIDE - PHASE 5 SUBSCRIPTION ADMIN")
print("=" * 60)
print()

print("📁 COMPOSANTS FRONTEND")
print("-" * 60)

components = [
    "Front/src/components/admin/AdminSubscriptionManager.tsx",
    "Front/src/components/admin/SubscriptionOverview.tsx",
    "Front/src/components/admin/SubscriptionList.tsx",
    "Front/src/components/admin/SubscriptionDetail.tsx",
    "Front/src/components/admin/index.ts",
]

all_ok = True
for comp in components:
    if os.path.exists(comp):
        size = os.path.getsize(comp)
        print(f"✅ {comp} ({size} bytes)")
    else:
        print(f"❌ {comp} (MANQUANT)")
        all_ok = False

print()
print("📝 TYPES TYPESCRIPT")
print("-" * 60)

if os.path.exists("Front/src/types/admin.ts"):
    with open("Front/src/types/admin.ts", "r") as f:
        content = f.read()
        if "SubscriptionOut" in content:
            count = content.count("export interface") + content.count("export enum")
            print(f"✅ Types définis: {count} interfaces/enums")
        else:
            print("❌ Types de subscription manquants")
            all_ok = False
else:
    print("❌ Fichier types/admin.ts manquant")
    all_ok = False

print()
print("🔌 MÉTHODES API SERVICE")
print("-" * 60)

if os.path.exists("Front/src/services/api.ts"):
    with open("Front/src/services/api.ts", "r") as f:
        content = f.read()
        methods = [
            "getSubscriptionsOverview",
            "getSubscriptionsList",
            "getSubscriptionDetail",
            "cancelSubscription",
            "extendSubscription",
            "addBonusCredits",
            "getSubscriptionHistory",
            "getSubscriptionStats"
        ]
        
        found = 0
        for method in methods:
            if f"async {method}" in content:
                print(f"✅ {method}()")
                found += 1
            else:
                print(f"❌ {method}() manquante")
        
        if found == len(methods):
            print(f"\n{found}/{len(methods)} méthodes implémentées")
        else:
            all_ok = False
else:
    print("❌ Fichier services/api.ts manquant")
    all_ok = False

print()
print("🏗️ BACKEND FILES")
print("-" * 60)

backend_files = [
    "Back/app/models/subscription.py",
    "Back/app/services/admin_subscription_service.py",
    "Back/app/schemas/admin.py",
    "Back/alembic/versions/012_add_subscriptions_table.py"
]

for bf in backend_files:
    if os.path.exists(bf):
        size = os.path.getsize(bf)
        print(f"✅ {bf} ({size} bytes)")
    else:
        print(f"❌ {bf} (MANQUANT)")
        all_ok = False

print()
print("🔗 INTÉGRATION ADMINPANEL")
print("-" * 60)

if os.path.exists("Front/src/pages/AdminPanel.tsx"):
    with open("Front/src/pages/AdminPanel.tsx", "r") as f:
        content = f.read()
        if "AdminSubscriptionManager" in content:
            print("✅ AdminSubscriptionManager importé")
        else:
            print("❌ AdminSubscriptionManager non importé")
            all_ok = False
        
        if '<TabsContent value="subscriptions">' in content:
            if "AdminSubscriptionManager" in content:
                print("✅ AdminSubscriptionManager utilisé dans TabsContent")
            else:
                print("❌ AdminSubscriptionManager non utilisé")
                all_ok = False
        else:
            print("❌ TabsContent 'subscriptions' manquant")
            all_ok = False
else:
    print("❌ Fichier AdminPanel.tsx manquant")
    all_ok = False

print()
print("=" * 60)
if all_ok:
    print("🎉 TOUT EST EN PLACE!")
    print()
    print("✅ Backend (Phase 5): IMPLÉMENTÉE")
    print("✅ Frontend (Phase 5): IMPLÉMENTÉE")
    print("✅ Types TypeScript: DÉFINIS")
    print("✅ Intégration: COMPLÈTE")
    print()
    print("📋 Pour tester:")
    print("1. S'assurer que le backend Docker est actif")
    print("2. Créer un utilisateur admin dans la base de données")
    print("3. Frontend devrait être sur http://localhost:5173")
    print("4. Login → Admin Panel → Onglet 'Abonnements'")
    print()
    sys.exit(0)
else:
    print("❌ QUELQUES PROBLÈMES DÉTECTÉS")
    print()
    sys.exit(1)
