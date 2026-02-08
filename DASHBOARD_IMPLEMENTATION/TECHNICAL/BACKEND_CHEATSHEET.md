# 🛠️ BACKEND DEVELOPMENT CHEATSHEET

**Quick reference for common tasks**  
**Keep this open while coding**

---

## 🚀 GETTING STARTED

### First Time Setup
```bash
# Navigate to backend
cd Back

# Create/activate virtual environment
python3 -m venv env
source env/bin/activate  # macOS/Linux
env\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements-dev.txt

# Create .env file (copy from .env.example)
cp env.example .env

# Apply migrations
alembic upgrade head

# Run server
uvicorn app.main:app --reload
```

### Daily Startup
```bash
# Activate virtual env
cd Back
source env/bin/activate

# Start server
uvicorn app.main:app --reload

# Server runs at: http://localhost:8000
# Swagger docs at: http://localhost:8000/docs
# ReDoc at: http://localhost:8000/redoc
```

---

## 💾 DATABASE OPERATIONS

### Create a New Model
```bash
# 1. Create model file
touch Back/app/models/my_feature.py

# 2. Write model in that file
# (see existing models as templates)

# 3. Import it in Back/app/models/__init__.py
from app.models.my_feature import MyModel

# 4. Generate migration
cd Back
alembic revision --autogenerate -m "Add MyModel table"

# 5. Review the generated migration file
# Location: Back/alembic/versions/xxxx_add_mymodel_table.py

# 6. Apply migration
alembic upgrade head

# 7. Test it worked
pytest Back/tests/test_my_feature.py
```

### Common Database Queries
```python
# In your service file:
from sqlalchemy import func
from app.core.database import get_db

# Get one record
user = db.query(User).filter(User.id == user_id).first()

# Get all records
users = db.query(User).all()

# Filter with condition
orders = db.query(Order).filter(Order.artisan_id == artisan_id).all()

# Count records
count = db.query(Order).filter(Order.artisan_id == artisan_id).count()

# Sum values
total = db.query(func.sum(Order.total_amount)).scalar()

# Average
avg_rating = db.query(func.avg(Review.rating)).scalar()

# Join tables
items = db.query(OrderItem).join(Order).filter(Order.user_id == user_id).all()

# Pagination
page = 1
limit = 20
items = db.query(Item).offset((page-1)*limit).limit(limit).all()
```

---

## 📝 CREATING ENDPOINTS

### Step-by-Step Template

**1. Create Pydantic Schema** (`Back/app/schemas/my_feature.py`)
```python
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class MyItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    value: int

class MyItemOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    value: int
    created_at: datetime
    
    class Config:
        from_attributes = True  # ORM mode
```

**2. Create Service** (`Back/app/services/my_service.py`)
```python
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.my_feature import MyItem
from app.schemas.my_feature import MyItemCreate, MyItemOut

class MyService:
    async def create_item(self, item: MyItemCreate, db: Session) -> MyItemOut:
        db_item = MyItem(**item.dict())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item
    
    async def get_item(self, item_id: UUID, db: Session) -> MyItemOut:
        return db.query(MyItem).filter(MyItem.id == item_id).first()
    
    async def list_items(self, db: Session, skip: int = 0, limit: int = 20):
        return db.query(MyItem).offset(skip).limit(limit).all()
    
    async def update_item(self, item_id: UUID, updates: dict, db: Session) -> MyItemOut:
        db.query(MyItem).filter(MyItem.id == item_id).update(updates)
        db.commit()
        return self.get_item(item_id, db)
    
    async def delete_item(self, item_id: UUID, db: Session):
        db.query(MyItem).filter(MyItem.id == item_id).delete()
        db.commit()
```

**3. Create Endpoint** (`Back/app/api/v1/endpoints/my_feature.py`)
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.my_service import MyService
from app.schemas.my_feature import MyItemCreate, MyItemOut

router = APIRouter(prefix="/items", tags=["items"])
service = MyService()

@router.post("/", response_model=MyItemOut, status_code=status.HTTP_201_CREATED)
async def create_item(
    item: MyItemCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new item"""
    return await service.create_item(item, db)

@router.get("/{item_id}", response_model=MyItemOut)
async def get_item(item_id: UUID, db: Session = Depends(get_db)):
    """Get a single item"""
    item = await service.get_item(item_id, db)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.get("/", response_model=list[MyItemOut])
async def list_items(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """List all items"""
    return await service.list_items(db, skip, limit)

@router.put("/{item_id}", response_model=MyItemOut)
async def update_item(
    item_id: UUID,
    updates: MyItemCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an item"""
    return await service.update_item(item_id, updates.dict(exclude_unset=True), db)

@router.delete("/{item_id}", status_code=204)
async def delete_item(
    item_id: UUID,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an item"""
    await service.delete_item(item_id, db)
```

**4. Register Endpoint** (`Back/app/api/v1/__init__.py` or `main.py`)
```python
from app.api.v1.endpoints import my_feature

app.include_router(my_feature.router, prefix="/api/v1")
```

---

## 🧪 TESTING

### Run Tests
```bash
# All tests
pytest Back/tests/ -v

# Specific test file
pytest Back/tests/test_my_feature.py -v

# Specific test function
pytest Back/tests/test_my_feature.py::test_create_item -v

# With coverage
pytest Back/tests/ --cov=app --cov-report=html
# View: htmlcov/index.html

# Run with print output
pytest Back/tests/ -v -s
```

### Test Template
```python
# Back/tests/test_my_feature.py
import pytest
from uuid import uuid4
from sqlalchemy.orm import Session
from app.models.my_feature import MyItem
from app.services.my_service import MyService
from app.schemas.my_feature import MyItemCreate

@pytest.fixture
def my_service():
    return MyService()

def test_create_item(my_service, db: Session):
    # Arrange
    item_data = MyItemCreate(name="Test", value=100)
    
    # Act
    created = await my_service.create_item(item_data, db)
    
    # Assert
    assert created.name == "Test"
    assert created.value == 100
    assert created.id is not None

def test_get_item_not_found(my_service, db: Session):
    # Arrange
    fake_id = uuid4()
    
    # Act & Assert
    item = await my_service.get_item(fake_id, db)
    assert item is None

def test_list_items(my_service, db: Session):
    # Arrange
    await my_service.create_item(MyItemCreate(name="Item1", value=1), db)
    await my_service.create_item(MyItemCreate(name="Item2", value=2), db)
    
    # Act
    items = await my_service.list_items(db)
    
    # Assert
    assert len(items) >= 2
```

---

## 🔒 AUTHENTICATION & PERMISSIONS

### Check Current User
```python
from fastapi import Depends
from app.core.security import get_current_user

@router.get("/me")
async def get_profile(current_user = Depends(get_current_user)):
    return current_user  # User object
```

### Check User Role
```python
from fastapi import HTTPException, status

@router.post("/admin-only")
async def admin_endpoint(current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return {"message": "Admin stuff"}
```

### Verify Resource Ownership
```python
@router.put("/items/{item_id}")
async def update_item(
    item_id: UUID,
    updates: ItemUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    
    if item.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Proceed with update
```

---

## 📤 FILE UPLOADS

### Upload Handler
```python
from fastapi import File, UploadFile
from app.services.storage import StorageService

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    storage = StorageService()
    
    # Upload file
    file_path = await storage.upload_file(
        file=file,
        folder="profile-images"
    )
    
    # Save path to database
    user.profile_image = file_path
    db.commit()
    
    return {"file_path": file_path}
```

---

## 🐛 DEBUGGING

### Print Debug Info
```python
# In your code
import logging

logger = logging.getLogger(__name__)

logger.info(f"Creating order for user: {user_id}")
logger.debug(f"Order data: {order_data}")
logger.error(f"Failed to create order: {str(e)}")

# Will show in console when running with --reload
```

### Test Endpoint with curl
```bash
# GET
curl http://localhost:8000/api/v1/items/123

# POST with JSON
curl -X POST http://localhost:8000/api/v1/items/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","value":100}'

# With auth token
curl http://localhost:8000/api/v1/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Use Swagger Interactively
```
1. Open http://localhost:8000/docs
2. All endpoints listed with schema
3. Click "Try it out"
4. Fill in request body
5. Send request and see response
```

---

## 📋 COMMON PATTERNS

### Error Handling
```python
try:
    result = await service.do_something(data, db)
except ValueError as e:
    raise HTTPException(
        status_code=400,
        detail=str(e)
    )
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    raise HTTPException(status_code=500, detail="Internal server error")
```

### Pagination Response
```python
@router.get("/items")
async def list_items(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    items = db.query(Item).offset(skip).limit(limit).all()
    total = db.query(Item).count()
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }
```

### Timestamp Handling
```python
from datetime import datetime
from sqlalchemy import Column, DateTime, func

class MyModel(Base):
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### Soft Delete
```python
class MyModel(Base):
    deleted_at = Column(DateTime, nullable=True)

# Soft delete
item.deleted_at = datetime.utcnow()
db.commit()

# Query active items only
active = db.query(MyModel).filter(MyModel.deleted_at == None).all()
```

---

## 🎯 GIT WORKFLOW

### Create Feature Branch
```bash
# Create and switch to new branch
git checkout -b feature/artisan-profile

# Make changes...

# Stage changes
git add Back/app/services/user_service.py
git add Back/app/api/v1/endpoints/users.py
git add Back/app/schemas/user.py
git add Back/tests/test_users.py

# Commit
git commit -m "feat: Add artisan profile update endpoint

- Add UserUpdateSchema
- Add UserService.update_profile() method
- Add PUT /api/v1/users/me endpoint
- Add comprehensive tests for profile update"

# Push
git push origin feature/artisan-profile
```

### Create Pull Request
```bash
# After pushing, go to GitHub/GitLab
# Create PR from feature/artisan-profile → develop
# Add description from commit message
# Request code review
# Once approved, merge
```

---

## ⚡ QUICK FIXES

### Server won't start?
```bash
# Make sure nothing is running on port 8000
lsof -i :8000  # Find what's using it
kill -9 <PID>  # Kill it

# Then restart
uvicorn app.main:app --reload
```

### Database errors?
```bash
# Reset database (development only!)
# Be CAREFUL - this deletes all data

# Option 1: Drop and recreate
alembic downgrade base  # Undo all migrations
alembic upgrade head    # Redo all migrations

# Option 2: Fresh start
rm Back/env/sqlite.db  # If using SQLite
alembic upgrade head   # Recreate schema
```

### Import errors?
```bash
# Make sure you're in Back directory
cd Back

# Make sure env is activated
source env/bin/activate

# Reinstall requirements
pip install -r requirements-dev.txt

# Check __init__.py files exist in directories
touch app/__init__.py
touch app/models/__init__.py
touch app/schemas/__init__.py
touch app/services/__init__.py
touch app/api/__init__.py
touch app/api/v1/__init__.py
touch app/api/v1/endpoints/__init__.py
```

---

## 📊 STATUS CHECKS

### Is server running?
```bash
curl http://localhost:8000/health
# Should return 200 OK
```

### What endpoints exist?
```bash
# Open in browser:
http://localhost:8000/docs

# Or use curl to list
curl http://localhost:8000/openapi.json | grep "path"
```

### How many tests?
```bash
pytest --collect-only | grep "test session" | tail -1
```

### What's my coverage?
```bash
pytest --cov=app | grep "TOTAL"
```

---

## 🎯 THIS WEEK'S KEY COMMANDS

**Monday morning:**
```bash
cd Back && source env/bin/activate && uvicorn app.main:app --reload
```

**Before committing:**
```bash
pytest Back/tests/ -v  # Make sure tests pass
alembic current        # Check migrations
```

**Daily:**
```bash
git fetch origin
git pull origin develop  # Stay in sync
```

**Before PR:**
```bash
pytest Back/tests/ --cov=app --cov-report=term-missing  # Check coverage
```

---

## 📞 NEED HELP?

| Problem | Command |
|---------|---------|
| Tests failing | `pytest -vv -s` to see details |
| Can't find test | `pytest --collect-only \| grep test_name` |
| Database broken | `alembic downgrade base && alembic upgrade head` |
| Git confused | `git status` then `git log --oneline` |
| Need to understand model | `cat app/models/order.py` |
| Check API signature | Open http://localhost:8000/docs |

---

**Bookmark this page. You'll use it all week!**

