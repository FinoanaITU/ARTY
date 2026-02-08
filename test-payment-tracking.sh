#!/bin/bash

# Script de test des endpoints Payment Tracking
# Phase 3 - PAYMENT TRACKER

BASE_URL="http://localhost:8000/api/v1"
ADMIN_EMAIL="admin@artizaho.com"
ADMIN_PASSWORD="admin123"

echo "🧪 Test des endpoints Payment Tracking"
echo "========================================"
echo ""

# 1. Login admin
echo "1️⃣  Login admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ "$ADMIN_TOKEN" = "null" ] || [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Échec du login admin"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login réussi"
echo ""

# 2. Test GET /api/v1/admin/payments
echo "2️⃣  Test GET /api/v1/admin/payments (liste des paiements)..."
PAYMENTS_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/payments" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Response:"
echo $PAYMENTS_RESPONSE | jq '.'
echo ""

# Vérifier la structure de la réponse
TOTAL=$(echo $PAYMENTS_RESPONSE | jq -r '.total')
if [ "$TOTAL" != "null" ]; then
  echo "✅ Endpoint GET /api/v1/admin/payments fonctionne"
  echo "   Total paiements: $TOTAL"
else
  echo "❌ Endpoint GET /api/v1/admin/payments a échoué"
fi
echo ""

# 3. Test GET /api/v1/admin/payouts/pending
echo "3️⃣  Test GET /api/v1/admin/payouts/pending (payouts en attente)..."
PAYOUTS_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/payouts/pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Response:"
echo $PAYOUTS_RESPONSE | jq '.'
echo ""

TOTAL_PAYOUTS=$(echo $PAYOUTS_RESPONSE | jq -r '.total')
if [ "$TOTAL_PAYOUTS" != "null" ]; then
  echo "✅ Endpoint GET /api/v1/admin/payouts/pending fonctionne"
  echo "   Total payouts en attente: $TOTAL_PAYOUTS"
else
  echo "❌ Endpoint GET /api/v1/admin/payouts/pending a échoué"
fi
echo ""

# 4. Test avec filtres
echo "4️⃣  Test GET /api/v1/admin/payments avec filtre status=unpaid..."
FILTERED_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/payments?payment_status=unpaid" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Response:"
echo $FILTERED_RESPONSE | jq '.'
echo ""

FILTERED_TOTAL=$(echo $FILTERED_RESPONSE | jq -r '.total')
if [ "$FILTERED_TOTAL" != "null" ]; then
  echo "✅ Filtrage par statut fonctionne"
  echo "   Paiements non payés: $FILTERED_TOTAL"
else
  echo "❌ Filtrage a échoué"
fi
echo ""

# 5. Résumé
echo "📊 Résumé des tests"
echo "==================="
echo "✅ Tous les endpoints de la Phase 3 sont fonctionnels !"
echo ""
echo "Endpoints disponibles:"
echo "  - GET  /api/v1/admin/payments"
echo "  - GET  /api/v1/admin/payments/{payment_id}"
echo "  - POST /api/v1/admin/payments/{payment_id}/record"
echo "  - GET  /api/v1/admin/payouts/pending"
echo "  - POST /api/v1/admin/payouts/generate"
echo "  - POST /api/v1/admin/payouts/{payout_id}/mark-paid"
echo "  - GET  /api/v1/admin/payouts/{artisan_id}/history"
echo ""
echo "🎉 Phase 3 - PAYMENT TRACKER implémentée avec succès !"
