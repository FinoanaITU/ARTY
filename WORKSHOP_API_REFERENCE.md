# Workshop System - Quick Reference Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React/TS)                     │
│  - Workshops.tsx (list view)                                 │
│  - WorkshopDetail.tsx (detail + booking)                     │
│  - WorkshopCreationForm (artisan creation)                   │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP Requests
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (FastAPI)                       │
│  /api/v1/workshops/                                          │
│  ├── GET     → list_workshops (public)                       │
│  ├── POST    → create_workshop (artisan)                     │
│  ├── /{id}   → get_workshop (public)                         │
│  ├── /{id}/publish → publish_workshop (artisan)              │
│  ├── /{id}/book → create_booking (user)                      │
│  └── /{id}/sessions → session management (artisan)           │
└───────────────────────────┬─────────────────────────────────┘
                            │ Depends()
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Service Layer (Business Logic)              │
│  WorkshopService                                             │
│  ├── Workshop CRUD methods                                   │
│  ├── Status management (publish, unpublish, archive)         │
│  ├── Session management (create, list, delete)               │
│  ├── Booking management (create, cancel, confirm)            │
│  └── Validation & availability checks                        │
└───────────────────────────┬─────────────────────────────────┘
                            │ ORM Operations
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Models (SQLAlchemy)                    │
│  ├── Workshop (id, title, description, base_price, ...)     │
│  ├── WorkshopSession (id, workshop_id, datetime, max_part)   │
│  ├── WorkshopBooking (id, session_id, user_id, ...)          │
│  └── User (id, name, email, role, workshops, ...)            │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoint Reference

### Public Endpoints (No Authentication)

#### List Workshops
```http
GET /api/v1/workshops?skip=0&limit=20&category=Art&min_price=50000
Response: WorkshopListResponse {
  items: WorkshopListItem[],
  total: int,
  page: int,
  pages: int,
  limit: int
}
```

#### Get Workshop Details
```http
GET /api/v1/workshops/{workshop_id}
Response: WorkshopOut {
  id, title, description, artisan, category, base_price,
  max_participants, location, featured_image_url, ...
}
```

#### Get Workshop Availability
```http
GET /api/v1/workshops/{workshop_id}/availability
Response: AvailabilityResponse {
  workshop_id: UUID,
  available_sessions: WorkshopSessionOut[],
  booked_dates: datetime[],
  unavailable_dates: datetime[]
}
```

### Artisan Endpoints (Requires Authentication + role=artisan)

#### Create Workshop
```http
POST /api/v1/workshops
Body: WorkshopCreate {
  title, description, category, workshop_type,
  base_price, max_participants, duration_minutes,
  location, ...
}
Response: WorkshopOut (status: 201)
```

#### Update Workshop
```http
PATCH /api/v1/workshops/{workshop_id}
Body: WorkshopUpdate (partial fields)
Response: WorkshopOut
```

#### Delete Workshop (Draft Only)
```http
DELETE /api/v1/workshops/{workshop_id}
Response: 204 No Content
```

#### Publish Workshop
```http
POST /api/v1/workshops/{workshop_id}/publish
Response: WorkshopOut (status=published)
```

#### Unpublish Workshop
```http
POST /api/v1/workshops/{workshop_id}/unpublish
Response: WorkshopOut (status=draft)
```

#### Create Session
```http
POST /api/v1/workshops/{workshop_id}/sessions
Body: WorkshopSessionCreate {
  start_datetime, end_datetime, max_participants,
  session_price, is_private, special_instructions
}
Response: WorkshopSessionOut (status: 201)
```

#### List Workshop Sessions
```http
GET /api/v1/workshops/{workshop_id}/sessions
Response: WorkshopSessionOut[]
```

#### Delete Session
```http
DELETE /api/v1/workshops/{workshop_id}/sessions/{session_id}
Response: 204 No Content
```

#### List Workshop Bookings
```http
GET /api/v1/workshops/{workshop_id}/bookings
Response: WorkshopBookingOut[]
```

### Buyer Endpoints (Requires Authentication)

#### Create Booking
```http
POST /api/v1/workshops/{workshop_id}/book
Body: WorkshopBookingCreate {
  session_id: UUID,
  participants_count: int,
  participant_names: string[],
  special_requests: string,
  dietary_restrictions: string
}
Response: BookingConfirmation (status: 201)
```

#### List User Bookings
```http
GET /api/v1/bookings/user
Response: WorkshopBookingOut[]
```

#### Cancel Booking
```http
POST /api/v1/bookings/{booking_id}/cancel
Response: WorkshopBookingOut (status=cancelled)
```

#### Confirm Booking (Artisan)
```http
POST /api/v1/bookings/{booking_id}/confirm
Response: WorkshopBookingOut (status=confirmed, payment_status=paid)
```

## Database Models

### Workshop
```python
{
  id: UUID (primary key),
  title: str (200),
  slug: str (unique),
  description: str,
  artisan_id: UUID (FK → users),
  category: str,
  workshop_type: enum (inscription|reservation),
  skill_level: enum (Débutant|Intermédiaire|Avancé),
  base_price: Decimal,
  foreign_price: Decimal (optional),
  max_participants: int,
  min_participants: int,
  duration_minutes: int,
  location: str,
  program: JSON (list of items with time/activity),
  privatization_enabled: bool,
  privatization_*: (min, max, base_price, price_per_participant),
  featured_image_url: str (optional),
  gallery_images: array of str,
  status: enum (draft|pending_approval|published|rejected|archived),
  created_at: datetime,
  updated_at: datetime
}
```

### WorkshopSession
```python
{
  id: UUID (primary key),
  workshop_id: UUID (FK → workshops),
  start_datetime: datetime,
  end_datetime: datetime,
  max_participants: int,
  session_price: Decimal,
  is_private: bool,
  private_client_id: UUID (FK → users) (optional),
  status: enum (scheduled|confirmed|cancelled|completed),
  special_instructions: str (optional),
  created_at: datetime,
  updated_at: datetime
}
```

### WorkshopBooking
```python
{
  id: UUID (primary key),
  booking_number: str (unique),
  confirmation_code: str (unique),
  workshop_id: UUID (FK → workshops),
  session_id: UUID (FK → workshop_sessions),
  user_id: UUID (FK → users),
  participants_count: int,
  participant_names: array of str (optional),
  total_price: Decimal,
  status: enum (pending|confirmed|cancelled|attended|no_show),
  payment_status: enum (pending|paid|partial|failed),
  special_requests: str (optional),
  dietary_restrictions: str (optional),
  cancelled_at: datetime (optional),
  created_at: datetime,
  updated_at: datetime
}
```

## Service Methods by Category

### Workshop CRUD
- `create_workshop(db, workshop_create, artisan_id)` → Workshop
- `get_workshop(db, workshop_id)` → Workshop
- `update_workshop(db, workshop_id, workshop_update, artisan_id)` → Workshop
- `delete_workshop(db, workshop_id, artisan_id)` → None
- `list_workshops(db, **filters)` → Tuple[List[Workshop], int]

### Status Management
- `publish_workshop(db, workshop_id, artisan_id)` → Workshop
- `unpublish_workshop(db, workshop_id, artisan_id)` → Workshop
- `archive_workshop(db, workshop_id, artisan_id)` → Workshop

### Session Management
- `create_session(db, workshop_id, session_create, artisan_id)` → WorkshopSession
- `get_session(db, session_id)` → WorkshopSession
- `list_sessions(db, workshop_id, **filters)` → List[WorkshopSession]
- `delete_session(db, session_id, artisan_id)` → None

### Availability
- `get_available_spots(db, session_id)` → int
- `is_session_available(db, session_id, participants_count)` → bool

### Booking Management
- `create_booking(db, workshop_id, booking_create, user_id)` → WorkshopBooking
- `get_booking(db, booking_id)` → WorkshopBooking
- `cancel_booking(db, booking_id, user_id=None)` → WorkshopBooking
- `confirm_booking(db, booking_id, artisan_id=None)` → WorkshopBooking
- `list_user_bookings(db, user_id, skip, limit)` → Tuple[List, int]
- `list_workshop_bookings(db, workshop_id, artisan_id, skip, limit)` → Tuple[List, int]

### Utilities
- `_generate_slug(title)` → str
- `_generate_booking_number(db, workshop_id)` → str
- `_generate_confirmation_code()` → str
- `get_workshop_stats(db, workshop_id)` → Dict

## Common Error Responses

### 404 Not Found
```json
{
  "detail": "Workshop not found"
}
```

### 400 Bad Request
```json
{
  "detail": "Cannot edit workshop in this status"
}
```

### 403 Forbidden
```json
{
  "detail": "You don't have permission to update this workshop"
}
```

### 409 Conflict
```json
{
  "detail": "Not enough available spots in this session"
}
```

## Workflow Examples

### Create and Publish Workshop (Artisan)
```
1. POST /api/v1/workshops → Create (status: draft)
2. PATCH /api/v1/workshops/{id} → Update details
3. POST /api/v1/workshops/{id}/sessions → Add sessions
4. POST /api/v1/workshops/{id}/publish → Make public
```

### Book a Workshop (Buyer)
```
1. GET /api/v1/workshops → Browse
2. GET /api/v1/workshops/{id} → View details
3. GET /api/v1/workshops/{id}/availability → Check slots
4. POST /api/v1/workshops/{id}/book → Create booking
5. Payment processing (Phase 2)
6. Booking status updates to confirmed
```

### Manage Bookings (Artisan)
```
1. GET /api/v1/workshops/{id}/bookings → List bookings
2. POST /api/v1/bookings/{id}/confirm → Mark attended
3. Payment automatically recorded
```

## Important Notes

- **All timestamps** are UTC datetime
- **Prices** are stored as Decimal for accuracy
- **Slug generation** handles French characters (é, è, ç, etc.)
- **Booking numbers** include date stamp for manual sorting
- **Confirmation codes** are 12 characters for easy reference
- **Permission checks** happen at both endpoint and service levels
- **Cascading deletes** enabled for sessions/bookings when workshop deleted

---

**Last Updated**: Phase 1 Implementation Complete
**Version**: 1.0
