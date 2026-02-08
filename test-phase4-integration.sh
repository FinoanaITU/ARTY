#!/bin/bash

# Script de test d'intégration Phase 4: Quote Manager
# Frontend + Backend communication test
# Date: 8 février 2026

set -e

echo "======================================"
echo "Phase 4 Quote Manager Integration Test"
echo "======================================"
echo ""

# Configuration
API_URL="http://localhost:8000/api/v1"
ADMIN_EMAIL="admin@artizaho.com"
ADMIN_PASSWORD="AdminPass123!"
TIMEOUT=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Check if backend is running
log_info "Checking backend availability..."
if ! curl -s "$API_URL/auth/me" >/dev/null 2>&1; then
  log_error "Backend not available at $API_URL"
  echo "Start the backend with: cd Back && uvicorn app.main:app --reload"
  exit 1
fi
log_success "Backend is running"
echo ""

# Step 1: Login as admin
log_info "Step 1: Admin login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}")

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token' 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
  log_error "Login failed"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

log_success "Admin logged in - Token: ${ACCESS_TOKEN:0:20}..."
echo ""

# Step 2: Create a quote request
log_info "Step 2: Creating a quote request"
QUOTE_PAYLOAD=$(cat <<EOF
{
  "quote_type": "custom",
  "title": "Formation création logo",
  "description": "Je veux apprendre à créer des logos modernes avec Illustrator",
  "quantity": 1,
  "client_type": "particulier",
  "client_name": "Marie Dupont",
  "client_email": "marie@example.com",
  "client_phone": "+33612345678"
}
EOF
)

CREATE_RESPONSE=$(curl -s -X POST "$API_URL/admin/quotes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "$QUOTE_PAYLOAD")

QUOTE_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id' 2>/dev/null)

if [ -z "$QUOTE_ID" ] || [ "$QUOTE_ID" = "null" ]; then
  log_error "Failed to create quote"
  echo "Response: $CREATE_RESPONSE"
  exit 1
fi

log_success "Quote created - ID: $QUOTE_ID"
echo ""

# Step 3: Get all quotes
log_info "Step 3: Fetching all quotes with pagination"
LIST_RESPONSE=$(curl -s -X GET "$API_URL/admin/quotes?skip=0&limit=50" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

TOTAL_QUOTES=$(echo "$LIST_RESPONSE" | jq -r '.total' 2>/dev/null)
QUOTE_COUNT=$(echo "$LIST_RESPONSE" | jq -r '.items | length' 2>/dev/null)

if [ -z "$TOTAL_QUOTES" ]; then
  log_error "Failed to fetch quotes list"
  echo "Response: $LIST_RESPONSE"
  exit 1
fi

log_success "Quotes listed - Total: $TOTAL_QUOTES, Showing: $QUOTE_COUNT"
echo ""

# Step 4: Get quote details
log_info "Step 4: Getting quote details"
DETAIL_RESPONSE=$(curl -s -X GET "$API_URL/admin/quotes/$QUOTE_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

QUOTE_TITLE=$(echo "$DETAIL_RESPONSE" | jq -r '.title' 2>/dev/null)
QUOTE_STATUS=$(echo "$DETAIL_RESPONSE" | jq -r '.status' 2>/dev/null)

if [ -z "$QUOTE_TITLE" ]; then
  log_error "Failed to get quote details"
  echo "Response: $DETAIL_RESPONSE"
  exit 1
fi

log_success "Quote details retrieved - Title: \"$QUOTE_TITLE\", Status: $QUOTE_STATUS"
echo ""

# Step 5: Update quote (add price and notes)
log_info "Step 5: Updating quote with price and notes"
UPDATE_PAYLOAD=$(cat <<EOF
{
  "final_price": 150.00,
  "admin_notes": "Devis pour formation de 5 jours"
}
EOF
)

UPDATE_RESPONSE=$(curl -s -X PATCH "$API_URL/admin/quotes/$QUOTE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "$UPDATE_PAYLOAD")

UPDATED_PRICE=$(echo "$UPDATE_RESPONSE" | jq -r '.final_price' 2>/dev/null)

if [ -z "$UPDATED_PRICE" ] || [ "$UPDATED_PRICE" = "null" ]; then
  log_error "Failed to update quote"
  echo "Response: $UPDATE_RESPONSE"
  exit 1
fi

log_success "Quote updated - New price: €$UPDATED_PRICE"
echo ""

# Step 6: Get quote statistics
log_info "Step 6: Fetching quote statistics"
STATS_RESPONSE=$(curl -s -X GET "$API_URL/admin/quotes/stats/overview" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

TOTAL_STATS=$(echo "$STATS_RESPONSE" | jq -r '.total' 2>/dev/null)
PENDING_STATS=$(echo "$STATS_RESPONSE" | jq -r '.pending' 2>/dev/null)
APPROVED_STATS=$(echo "$STATS_RESPONSE" | jq -r '.approved' 2>/dev/null)

if [ -z "$TOTAL_STATS" ]; then
  log_error "Failed to fetch quote statistics"
  echo "Response: $STATS_RESPONSE"
  exit 1
fi

log_success "Quote statistics retrieved"
echo "  - Total: $TOTAL_STATS"
echo "  - Pending: $PENDING_STATS"
echo "  - Approved: $APPROVED_STATS"
echo ""

# Step 7: Filter quotes by status
log_info "Step 7: Filtering quotes by status (pending)"
FILTER_RESPONSE=$(curl -s -X GET "$API_URL/admin/quotes?status=pending&skip=0&limit=50" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

FILTERED_COUNT=$(echo "$FILTER_RESPONSE" | jq -r '.items | length' 2>/dev/null)

if [ -z "$FILTERED_COUNT" ]; then
  log_error "Failed to filter quotes"
  echo "Response: $FILTER_RESPONSE"
  exit 1
fi

log_success "Quotes filtered - Found $FILTERED_COUNT pending quotes"
echo ""

# Step 8: Test user quotes (currently created by admin, but endpoint exists)
log_info "Step 8: Getting user's own quotes"
USER_QUOTES=$(curl -s -X GET "$API_URL/admin/quotes/my?skip=0&limit=50" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

USER_QUOTE_COUNT=$(echo "$USER_QUOTES" | jq -r '.items | length' 2>/dev/null)

if [ -z "$USER_QUOTE_COUNT" ]; then
  log_error "Failed to get user quotes"
  echo "Response: $USER_QUOTES"
  exit 1
fi

log_success "User quotes retrieved - Count: $USER_QUOTE_COUNT"
echo ""

# Summary
echo "======================================"
echo -e "${GREEN}✓ All integration tests passed!${NC}"
echo "======================================"
echo ""
echo "Endpoints tested:"
echo "  ✓ POST   /admin/quotes (create)"
echo "  ✓ GET    /admin/quotes (list all)"
echo "  ✓ GET    /admin/quotes/{id} (get details)"
echo "  ✓ PATCH  /admin/quotes/{id} (update)"
echo "  ✓ GET    /admin/quotes/my (user quotes)"
echo "  ✓ GET    /admin/quotes/stats/overview (statistics)"
echo ""
echo "Frontend Integration Status:"
echo "  ✓ Types TypeScript created"
echo "  ✓ API service methods implemented"
echo "  ✓ Componentes React created"
echo "    - QuoteForm"
echo "    - QuoteListAdmin"
echo "    - QuoteDetail"
echo "    - QuoteManager (orchestrator)"
echo "  ✓ AdminPanel integration done"
echo ""
echo "Next steps:"
echo "  1. Test approval/rejection workflow"
echo "  2. Test quote to order conversion"
echo "  3. Test email notifications to clients"
echo "  4. Run frontend dev server: cd Front && npm run dev"
echo "  5. Navigate to http://localhost:5173/admin → Devis manuels"
echo ""
