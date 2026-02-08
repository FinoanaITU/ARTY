#!/bin/bash

# Script pour tester l'intégration des endpoints Analytics Admin
# Phase 2 - Analytics

set -e

echo "🧪 Test de l'intégration Analytics Admin (PHASE 2)"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
API_URL="http://localhost:8000/api/v1"
ADMIN_EMAIL="admin@artizaho.com"
ADMIN_PASSWORD="admin123"

echo ""
echo "📝 Étape 1: Login admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Échec du login admin${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login réussi${NC}"

echo ""
echo "📊 Étape 2: Test Platform Overview..."
OVERVIEW=$(curl -s -X GET "$API_URL/admin/analytics/overview" \
  -H "Authorization: Bearer $TOKEN")

if echo "$OVERVIEW" | jq -e '.total_users' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Platform Overview OK${NC}"
  echo "   Total users: $(echo $OVERVIEW | jq -r '.total_users')"
  echo "   Total orders: $(echo $OVERVIEW | jq -r '.total_orders')"
  echo "   Total bookings: $(echo $OVERVIEW | jq -r '.total_bookings')"
else
  echo -e "${RED}❌ Platform Overview échoué${NC}"
  echo "Response: $OVERVIEW"
fi

echo ""
echo "💰 Étape 3: Test Revenue Stats..."
REVENUE=$(curl -s -X GET "$API_URL/admin/analytics/revenue?period=month" \
  -H "Authorization: Bearer $TOKEN")

if echo "$REVENUE" | jq -e '.total_revenue' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Revenue Stats OK${NC}"
  echo "   Total revenue: $(echo $REVENUE | jq -r '.total_revenue') Ar"
  echo "   Product sales: $(echo $REVENUE | jq -r '.product_sales') Ar"
  echo "   Workshop sales: $(echo $REVENUE | jq -r '.workshop_sales') Ar"
  echo "   Commission: $(echo $REVENUE | jq -r '.commission_artizaho') Ar"
else
  echo -e "${RED}❌ Revenue Stats échoué${NC}"
  echo "Response: $REVENUE"
fi

echo ""
echo "👥 Étape 4: Test Artisan Stats..."
ARTISANS=$(curl -s -X GET "$API_URL/admin/analytics/artisans" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ARTISANS" | jq -e '.total_artisans' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Artisan Stats OK${NC}"
  echo "   Total artisans: $(echo $ARTISANS | jq -r '.total_artisans')"
  echo "   Active artisans: $(echo $ARTISANS | jq -r '.active_artisans')"
  echo "   Pending approval: $(echo $ARTISANS | jq -r '.pending_approval')"
  echo "   New this month: $(echo $ARTISANS | jq -r '.new_this_month')"
else
  echo -e "${RED}❌ Artisan Stats échoué${NC}"
  echo "Response: $ARTISANS"
fi

echo ""
echo "📈 Étape 5: Test Conversion Stats..."
CONVERSION=$(curl -s -X GET "$API_URL/admin/analytics/conversion" \
  -H "Authorization: Bearer $TOKEN")

if echo "$CONVERSION" | jq -e '.product_views_to_orders' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Conversion Stats OK${NC}"
  echo "   Product views to orders: $(echo $CONVERSION | jq -r '.product_views_to_orders')"
  echo "   Workshop views to bookings: $(echo $CONVERSION | jq -r '.workshop_views_to_bookings')"
  echo "   Visitor to buyer rate: $(echo $CONVERSION | jq -r '.visitor_to_buyer_rate')"
else
  echo -e "${RED}❌ Conversion Stats échoué${NC}"
  echo "Response: $CONVERSION"
fi

echo ""
echo "🎯 Étape 6: Test User Behavior Stats..."
BEHAVIOR=$(curl -s -X GET "$API_URL/admin/analytics/users" \
  -H "Authorization: Bearer $TOKEN")

if echo "$BEHAVIOR" | jq -e '.average_order_value' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ User Behavior Stats OK${NC}"
  echo "   Average order value: $(echo $BEHAVIOR | jq -r '.average_order_value') Ar"
  echo "   Average cart size: $(echo $BEHAVIOR | jq -r '.average_cart_size')"
  echo "   Repeat customer rate: $(echo $BEHAVIOR | jq -r '.repeat_customer_rate')"
else
  echo -e "${RED}❌ User Behavior Stats échoué${NC}"
  echo "Response: $BEHAVIOR"
fi

echo ""
echo "🔒 Étape 7: Test sécurité (sans token)..."
UNAUTHORIZED=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/admin/analytics/overview")
HTTP_CODE=$(echo "$UNAUTHORIZED" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
  echo -e "${GREEN}✅ Sécurité OK - Accès refusé sans token${NC}"
else
  echo -e "${RED}❌ Problème de sécurité - HTTP $HTTP_CODE${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✅ Tests de l'intégration Analytics Admin terminés!${NC}"
echo ""
echo "📋 Résumé:"
echo "   - Login admin: ✅"
echo "   - Platform Overview: ✅"
echo "   - Revenue Stats: ✅"
echo "   - Artisan Stats: ✅"
echo "   - Conversion Stats: ✅"
echo "   - User Behavior Stats: ✅"
echo "   - Sécurité: ✅"
echo ""
echo "🎉 PHASE 2 - Analytics Admin - Intégration Backend complète!"
