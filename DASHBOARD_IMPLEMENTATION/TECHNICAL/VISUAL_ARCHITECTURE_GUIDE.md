# 📊 VISUAL ARCHITECTURE GUIDE

**Understanding the ARTY Backend Structure**

---

## 🏗️ Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React/Vite)                   │
│                   /artisan-dashboard                        │
│          (6 tabs - all UI built, no real data)             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ API Calls (HTTP)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND                           │
│           http://localhost:8000/api/v1/                    │
├─────────────────────────────────────────────────────────────┤
│  ENDPOINTS                                                  │
│  ├─ GET/PUT    /users/me                                   │
│  ├─ GET/POST   /carts/items          ← BUILD THIS WEEK     │
│  ├─ POST       /orders/              ← BUILD THIS WEEK     │
│  ├─ GET        /artisans/{id}/stats   ← BUILD THIS WEEK    │
│  ├─ GET        /workshops            (EXISTS ✅)           │
│  └─ GET        /products             (EXISTS ✅)           │
├─────────────────────────────────────────────────────────────┤
│  SERVICES (Business Logic)                                  │
│  ├─ user_service.py                  ← CREATE             │
│  ├─ cart_service.py                  ← CREATE             │
│  ├─ order_service.py                 ← CREATE             │
│  ├─ product_service.py               (EXISTS ✅)          │
│  └─ workshop_service.py              (EXISTS ✅)          │
├─────────────────────────────────────────────────────────────┤
│  SCHEMAS (Validation)                                       │
│  ├─ UserUpdate                       ← CREATE             │
│  ├─ CartItemCreate                   ← CREATE             │
│  ├─ OrderCreate                      ← CREATE             │
│  └─ ...others already exist                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ SQL Queries
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL / SQLite)                 │
│  ├─ users table          (Exists ✅)                       │
│  ├─ products table       (Exists ✅)                       │
│  ├─ orders table         (Exists - No data)                │
│  ├─ cart_items table     (Exists - No data)                │
│  ├─ artisan_stats table  (Exists - No data)                │
│  └─ ... 15+ more tables                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Example

**User wants to update their profile:**

```
1. USER ACTION (Frontend)
   ↓
   User clicks "Save Profile"
   Fills in name="Ahmed", bio="Expert Designer"
   
2. FRONTEND CODE
   ↓
   UserUpdate {
     name: "Ahmed",
     bio: "Expert Designer",
     specialty: "Sculpture"
   }
   
3. HTTP REQUEST
   ↓
   PUT /api/v1/users/me
   Authorization: Bearer jwt_token_here
   Content-Type: application/json
   Body: { "name": "Ahmed", "bio": "Expert Designer", ... }
   
4. BACKEND RECEIVES REQUEST
   ↓
   FastAPI router matches: PUT /users/{user_id}
   Verifies JWT token → gets current_user
   Validates UserUpdate schema
   
5. SERVICE LAYER PROCESSES
   ↓
   UserService.update_profile(user_id, updates)
   ├─ Validate email is unique (if changed)
   ├─ Query User from database
   ├─ Update fields
   ├─ db.commit() to save
   └─ Return updated user
   
6. DATABASE UPDATE
   ↓
   UPDATE users
   SET name='Ahmed', bio='Expert Designer'
   WHERE id={user_id}
   
7. RESPONSE TO FRONTEND
   ↓
   {
     "id": "uuid-here",
     "name": "Ahmed",
     "email": "ahmed@example.com",
     "bio": "Expert Designer",
     "role": "artisan",
     "updated_at": "2026-02-07T10:00:00Z"
   }
   
8. FRONTEND DISPLAY
   ↓
   Profile card updates with new data ✅
   Toast notification: "Profile saved successfully"
```

---

## 🎯 This Week's Build Plan (Visual)

```
MONDAY - WEDNESDAY (Day 1-3)
┌────────────────────────────────────────────────────────────┐
│ USER STORY #1: PROFILE EDITING                             │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Back/app/schemas/user.py                                  │
│ ├─ class UserUpdate                                       │
│ │   ├─ name: str (optional)                              │
│ │   ├─ email: str (optional)                             │
│ │   ├─ bio: str (optional)                               │
│ │   └─ specialty: str (optional)                         │
│ └─ (Put request/response models here)                    │
│                                                            │
│ Back/app/services/user_service.py (NEW)                  │
│ └─ class UserService                                      │
│    ├─ async update_user(user_id, updates)                │
│    │  ├─ Query user from db                              │
│    │  ├─ Validate email uniqueness                       │
│    │  ├─ Update fields                                   │
│    │  └─ Return updated user                             │
│    └─ async update_artisan(artisan_id, updates)          │
│                                                            │
│ Back/app/api/v1/endpoints/users.py (FIX STUBS)          │
│ ├─ @PUT /me                                              │
│ │  └─ Call UserService.update_user()                    │
│ └─ @PUT /me/artisan                                      │
│    └─ Call UserService.update_artisan()                 │
│                                                            │
│ Back/tests/test_users.py (NEW)                           │
│ ├─ test_update_user_profile()                            │
│ ├─ test_update_artisan_specialty()                       │
│ ├─ test_email_uniqueness_validation()                    │
│ └─ test_permission_checks()                              │
│                                                            │
└────────────────────────────────────────────────────────────┘

WEDNESDAY - FRIDAY (Day 3-5)
┌────────────────────────────────────────────────────────────┐
│ USER STORY #2: SHOPPING CART                               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Back/app/schemas/cart.py                                 │
│ ├─ class CartItemCreate                                  │
│ │   ├─ product_id: UUID                                 │
│ │   ├─ quantity: int                                    │
│ │   └─ customization_notes: str                         │
│ ├─ class CartItemOut                                     │
│ │   ├─ id, product_id, quantity                        │
│ │   ├─ unit_price, total_price                         │
│ │   └─ customization_notes                             │
│ └─ class CartOut                                        │
│    ├─ id, items[]                                      │
│    ├─ subtotal, discount, total                       │
│    └─ currency                                        │
│                                                            │
│ Back/app/services/cart_service.py (NEW)                 │
│ └─ class CartService                                    │
│    ├─ async get_or_create_cart(user_id)               │
│    ├─ async add_item(user_id, product_id, qty)        │
│    ├─ async remove_item(user_id, item_id)             │
│    ├─ async update_quantity(user_id, item_id, qty)   │
│    ├─ async get_cart(user_id)                         │
│    └─ _calculate_totals()                             │
│                                                            │
│ Back/app/api/v1/endpoints/carts.py (FIX STUBS)         │
│ ├─ @GET /me                  → get_current_cart()     │
│ ├─ @POST /items              → add_to_cart()          │
│ ├─ @PATCH /items/{item_id}   → update_item()         │
│ └─ @DELETE /items/{item_id}  → remove_from_cart()    │
│                                                            │
│ Back/tests/test_carts.py (NEW)                          │
│ ├─ test_add_item_to_cart()                              │
│ ├─ test_cart_totals_calculation()                       │
│ ├─ test_stock_validation()                              │
│ ├─ test_cart_persistence()                              │
│ └─ test_clear_cart()                                    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure (What You're Building)

```
Back/app/
├── models/               (DATABASE SCHEMAS)
│   ├── user.py          ✅ Exists
│   ├── product.py       ✅ Exists
│   ├── order.py         ✅ Exists
│   └── cart.py          ✅ Exists
│
├── schemas/             (REQUEST/RESPONSE VALIDATION)
│   ├── user.py          (Add UserUpdate, ArtisanUpdate)
│   ├── cart.py          (ADD - CartItemCreate, CartOut)
│   ├── order.py         (Empty - will add later)
│   └── ...
│
├── services/            (BUSINESS LOGIC)
│   ├── auth.py          ✅ Exists
│   ├── product_service.py ✅ Exists
│   ├── user_service.py  ← CREATE THIS WEEK
│   ├── cart_service.py  ← CREATE THIS WEEK
│   ├── order_service.py ← CREATE NEXT WEEK
│   └── ...
│
├── api/v1/endpoints/    (HTTP ROUTES)
│   ├── auth.py          ✅ Works
│   ├── products.py      ✅ Works
│   ├── users.py         (STUBS → Replace with real code)
│   ├── carts.py         (STUBS → Replace with real code)
│   ├── orders.py        (STUBS → Replace next week)
│   └── ...
│
├── core/
│   ├── config.py        ✅ Settings & env variables
│   ├── database.py      ✅ Database connection
│   ├── security.py      ✅ JWT tokens
│   └── ...
│
└── main.py              ✅ FastAPI app entry point
```

---

## 🔄 Data Relationships (Entity Diagram)

```
USER (customer/artisan)
├─ id (UUID)
├─ email
├─ role (buyer, artisan, admin)
├─ first_name, last_name
├─ specialty (for artisans)
└─ ... other fields

    ↓ 1-to-many

CART
├─ id (UUID)
├─ user_id (FK)  ← Links to USER
├─ total_amount
└─ items[]

    ↓ 1-to-many

CART_ITEM
├─ id (UUID)
├─ cart_id (FK) ← Links to CART
├─ product_id (FK) ← Links to PRODUCT
├─ quantity
└─ unit_price

    ↓ becomes (when checkout)

ORDER
├─ id (UUID)
├─ user_id (FK) ← Links to USER
├─ order_number
├─ status (pending, shipped, etc.)
└─ items[]

    ↓ 1-to-many

ORDER_ITEM
├─ id (UUID)
├─ order_id (FK) ← Links to ORDER
├─ product_id (FK) ← Links to PRODUCT
├─ artisan_id (FK) ← Links to USER (artisan)
├─ quantity
├─ unit_price
└─ commission_amount


PRODUCT
├─ id (UUID)
├─ artisan_id (FK) ← Links to USER
├─ name
├─ price
└─ stock


ARTISAN_STATS
├─ artisan_id (FK) ← Links to USER
├─ total_sales
├─ total_revenue
└─ average_rating
```

---

## 🧪 Testing Pyramid (What to Test)

```
                    ╱╲
                   ╱  ╲  Integration Tests
                  ╱────╲ (Frontend + Backend)
                 ╱      ╲
                ╱────────╲
               ╱  Unit    ╲  API Tests
              ╱   Tests   ╲ (Endpoints)
             ╱────────────╲
            ╱ Static Tests ╲ Type Checks
           ╱________________╲ Linting

IMPLEMENTATION ORDER:
1. Write Unit Tests (service methods)
2. Write API Tests (endpoints)
3. Manual Testing (Swagger docs)
4. Integration Testing (with Frontend)
```

---

## 🚀 HTTP Methods Cheat Sheet

```
GET    /api/v1/carts/me
       → Retrieve my cart
       ✅ Safe to call multiple times
       Status: 200 OK

POST   /api/v1/carts/items
       → Add item to cart
       ❌ Creates changes
       Status: 201 Created

PATCH  /api/v1/carts/items/{item_id}
       → Update quantity of item
       ❌ Partial update
       Status: 200 OK

DELETE /api/v1/carts/items/{item_id}
       → Remove item from cart
       ❌ Deletes data
       Status: 204 No Content

PUT    /api/v1/users/me
       → Replace entire profile
       ❌ Full replacement
       Status: 200 OK
```

---

## ⚡ Performance Patterns

```
✅ GOOD (Fast)
├─ db.query(User).filter(User.id == id).first()  [Uses index]
├─ Join when needed (avoid N+1 queries)
└─ Add pagination (limit 20, offset 100)

❌ BAD (Slow)
├─ db.query(User).all()  [Loads all users!]
├─ Loop and fetch one-by-one (N+1 problem)
└─ No pagination on large result sets

🎯 SOLUTION FOR THIS WEEK: Keep it simple!
├─ Write simple, readable queries
├─ Add indexes once you see slowness
└─ Use Swagger to test manually first
```

---

## 🔐 Authentication Flow

```
1. USER LOGS IN
   └─ POST /api/v1/auth/login
      → Backend returns JWT token
      → Frontend stores token in localStorage

2. USER MAKES REQUEST
   └─ PUT /api/v1/users/me
      Authorization: Bearer {jwt_token}
      → Backend verifies token
      → Extracts user_id from token
      → Processes request
      → Returns response

3. TOKEN EXPIRES
   └─ POST /api/v1/auth/refresh
      → Frontend uses refresh_token
      → Backend returns new access_token
      → Frontend continues

IMPORTANT:
- Token is stored in localStorage (Frontend)
- Token is verified on every request (Backend)
- Role (buyer/artisan/admin) is in token
```

---

## 📊 Status Codes You'll Use

```
200 OK
└─ Successful GET, PUT, PATCH, DELETE

201 CREATED
└─ Successful POST that created a resource

204 NO CONTENT
└─ Successful DELETE (no body in response)

400 BAD REQUEST
└─ Invalid input (validation failed)
   Example: quantity=-5 (invalid)

401 UNAUTHORIZED
└─ Missing or invalid JWT token

403 FORBIDDEN
└─ Authenticated but not allowed
   Example: Buyer trying to delete another's cart
   
404 NOT FOUND
└─ Resource doesn't exist
   Example: GET /items/999 (item doesn't exist)

409 CONFLICT
└─ Request conflicts with current state
   Example: Trying to buy product that's out of stock
   
500 INTERNAL SERVER ERROR
└─ Your bug! Unhandled exception
```

---

## 🎨 Response Format Standard

```
✅ SUCCESS
{
  "id": "uuid-here",
  "name": "Product Name",
  "price": 1000.50,
  "created_at": "2026-02-07T10:00:00Z"
}

❌ ERROR
{
  "detail": "Email already exists",
  "status_code": 400
}

or

{
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "age",
      "message": "Must be 18 or older"
    }
  ]
}

📋 PAGINATION
{
  "items": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "pages": 5
}
```

---

## 🎯 Success Checklist (End of Week)

```
Profile Feature
□ User can change name ✓
□ User can change bio ✓
□ User can change email ✓
□ Artisan can change specialty ✓
□ All validated ✓
□ Tests passing ✓
□ Frontend integration working ✓

Shopping Cart Feature
□ Add item to cart ✓
□ Cart persists in database ✓
□ Can remove items ✓
□ Can update quantity ✓
□ Totals calculated correctly ✓
□ Stock validation works ✓
□ Tests passing ✓
□ Frontend shows real cart ✓

Overall
□ All tests pass (pytest) ✓
□ No linting errors ✓
□ Code reviewed and merged ✓
□ Swagger docs work ✓
□ Team ready for next sprint ✓
```

---

**This visual guide should help you understand the big picture!**

**Keep it open while coding this week.** 📖

