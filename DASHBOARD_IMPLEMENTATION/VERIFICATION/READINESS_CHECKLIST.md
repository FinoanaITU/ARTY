# ✅ PRE-SPRINT READINESS CHECKLIST

**Project:** ARTY Artisan Dashboard Backend Implementation  
**Sprint:** 1 (Week of Feb 10, 2026)  
**Prepared by:** Scrum Master  
**Last Updated:** February 7, 2026

---

## 🛠️ INFRASTRUCTURE & SETUP

### Database Environment

- [ ] **PostreSQL Dev Instance**
  - [ ] Running locally OR accessible remotely
  - [ ] Connection string in `.env` file
  - [ ] Test database created and accessible
  - [ ] Current migrations applied (`alembic upgrade head`)
  - Status: ☐ Working / ☐ Not Working / ☐ Unknown

- [ ] **SQLite Test Database**
  - [ ] Configured for tests
  - [ ] Migration path verified
  - [ ] In-memory mode for fast testing
  - Status: ☐ Working / ☐ Not Working / ☐ Unknown

### Python Environment

- [ ] **Virtual Environment**
  - [ ] Activated (`source Back/env/bin/activate`)
  - [ ] Python version: Python 3.9+ required
  - [ ] `pip install -r requirements-dev.txt` runs without errors
  - Status: ☐ Working / ☐ Not Working / ☐ Unknown

- [ ] **Dependencies**
  - [ ] FastAPI installed
  - [ ] SQLAlchemy installed
  - [ ] Alembic installed
  - [ ] pytest installed
  - [ ] python-multipart installed (for file uploads)
  - Status: ☐ All Good / ☐ Missing packages

### Development Server

- [ ] **Backend Server Runs**
  - [ ] `cd Back && uvicorn app.main:app --reload` starts without errors
  - [ ] Server accessible at `http://localhost:8000`
  - [ ] Swagger docs at `http://localhost:8000/docs`
  - [ ] Health check: `GET /health` returns 200
  - Status: ☐ Working / ☐ Not Working / ☐ Unknown

- [ ] **Frontend Server Runs**
  - [ ] `cd Front && npm run dev` (or yarn/bun)
  - [ ] Accessible at `http://localhost:5173` (or configured port)
  - [ ] Can navigate to /artisan-dashboard without errors
  - Status: ☐ Working / ☐ Not Working / ☐ Unknown

### Git & Branching

- [ ] **Repository Setup**
  - [ ] Main branch is `main` or `develop` (documented)
  - [ ] All developers have push access
  - [ ] Protected branch rules defined (require PR, require review)
  - Status: ☐ Configured / ☐ Needs Setup

- [ ] **Branching Strategy**
  - [ ] Naming convention defined (e.g., `feature/artisan-profile`)
  - [ ] PR process documented
  - [ ] Code review step defined
  - [ ] Merge strategy decided (squash/rebase/merge commit)
  - Status: ☐ Documented / ☐ Needs Discussion

---

## 📚 KNOWLEDGE REQUIREMENTS

### Backend Team

Each developer should understand:

- [ ] **Project Structure**
  - [ ] Know where models are: `Back/app/models/`
  - [ ] Know where services go: `Back/app/services/`
  - [ ] Know where endpoints go: `Back/app/api/v1/endpoints/`
  - [ ] Know where schemas are: `Back/app/schemas/`
  - Verification: Ask each dev "Where do I put a new service?" → Should answer `app/services/`

- [ ] **Authentication/Authorization**
  - [ ] How `get_current_user` dependency works
  - [ ] Difference between roles: BUYER, ARTISAN, ADMIN
  - [ ] How to check permissions in endpoints
  - Verification: Ask "How do I ensure only artisans can update their profile?"

- [ ] **Database Operations**
  - [ ] How to write SQLAlchemy models
  - [ ] How to create migrations (`alembic revision --autogenerate`)
  - [ ] When to apply migrations (`alembic upgrade head`)
  - Verification: Ask "How do you add a new field to a model?"

- [ ] **API Development**
  - [ ] Request/Response schemas (Pydantic)
  - [ ] Status codes (201, 400, 404, etc.)
  - [ ] Error handling patterns
  - Verification: Ask "What status code for 'resource not found'?"

### Frontend Team

- [ ] **API Integration**
  - [ ] How to use `apiService` from `/src/services/api.ts`
  - [ ] How to handle loading/error states
  - [ ] How tokens are stored locally (localStorage/sessionStorage)
  - Verification: Ask "How do you call a new API endpoint?"

- [ ] **State Management**
  - [ ] UserContext for authentication
  - [ ] How to access current user info
  - Verification: Ask "How do you know the current user's artisan_id?"

---

## 🧪 TESTING FRAMEWORK

- [ ] **pytest Configuration**
  - [ ] `pytest.ini` exists and is configured
  - [ ] Test discovery works: `pytest --collect-only` shows tests
  - [ ] Can run simple test: `pytest Back/tests/test_example.py -v`
  - Status: ☐ Working / ☐ Needs Setup

- [ ] **Test Database**
  - [ ] SQLite in-memory database configured for tests
  - [ ] Migrations run automatically for tests
  - [ ] Database is cleaned between tests
  - Status: ☐ Working / ☐ Needs Setup

- [ ] **Test Fixtures**
  - [ ] Understand how fixtures work (in `tests/conftest.py`)
  - [ ] Know how to create a test user/product
  - Verification: Check `Back/tests/conftest.py` exists

- [ ] **Coverage Tool**
  - [ ] `pytest-cov` installed
  - [ ] Can generate coverage: `pytest --cov=app --cov-report=html`
  - [ ] Coverage reports accessible
  - Status: ☐ Working / ☐ Needs Setup

---

## 📝 DOCUMENTATION

- [ ] **API Documentation**
  - [ ] Swagger docs at `/docs` show all existing endpoints
  - [ ] New endpoints will automatically appear after restart
  - Status: ☐ Accessible / ☐ Not Working

- [ ] **Code Examples**
  - [ ] Developer can find examples of:
    - [ ] Creating an endpoint
    - [ ] Using a service
    - [ ] Writing a test
  - Location: Look in `Back/app/api/v1/endpoints/products.py` (well-implemented)

- [ ] **Architecture Documentation**
  - [ ] Team understands the flow: API → Service → Database
  - [ ] Code organization is clear
  - Status: ☐ Clear / ☐ Confusing

---

## 🔐 AUTHENTICATION & PERMISSIONS

- [ ] **JWT Configuration**
  - [ ] Secret key is in `.env` (not hardcoded)
  - [ ] Token expiration is set
  - [ ] Refresh token mechanism works
  - Status: ☐ Configured / ☐ Needs Check

- [ ] **User Roles**
  - [ ] All users have role: BUYER or ARTISAN or ADMIN
  - [ ] New user registration assigns correct role
  - [ ] Endpoints check user role appropriately
  - Status: ☐ Working / ☐ Needs Check

- [ ] **Seed Data**
  - [ ] Test database can be seeded with sample users
  - [ ] Can login with test user credentials
  - [ ] Can obtain JWT token for testing
  - Status: ☐ Working / ☐ Needs Setup

---

## 💾 FILE UPLOAD SYSTEM

- [ ] **Storage Service**
  - [ ] `Back/app/services/storage.py` is functional
  - [ ] Can upload images for products (working already)
  - [ ] Upload directory configured in `.env`
  - [ ] Can reuse for artisan profile photos
  - Status: ☐ Working / ☐ Needs Check

- [ ] **Image Validation**
  - [ ] File type validation (jpg, png, webp only)
  - [ ] File size limits (10MB max)
  - [ ] Proper error messages for invalid files
  - Status: ☐ Implemented / ☐ Exists

---

## 🧐 CODE QUALITY

- [ ] **Linting**
  - [ ] eslint configured for Frontend
  - [ ] Can run: `npm run lint`
  - Status: ☐ Working / ☐ Not Configured

- [ ] **Type Checking (Frontend)**
  - [ ] TypeScript compiled without errors
  - [ ] No `any` types used casually
  - Status: ☐ Strict / ☐ Loose

- [ ] **Code Style**
  - [ ] Backend: PEP 8 style (Black formatter acceptable)
  - [ ] Frontend: Consistent formatting
  - [ ] Both teams agree on style guide
  - Status: ☐ Agreed upon / ☐ Needs Discussion

---

## 📊 MONITORING & LOGGING

- [ ] **Backend Logging**
  - [ ] Can see request logs in terminal during dev
  - [ ] Errors are logged with context
  - [ ] No sensitive info in logs (passwords, tokens)
  - Status: ☐ Good / ☐ Needs Improvement

- [ ] **Frontend Error Handling**
  - [ ] Network errors show user-friendly messages
  - [ ] API errors are logged for debugging
  - [ ] No console spam from warnings
  - Status: ☐ Good / ☐ Needs Improvement

---

## 🚀 DEPLOYMENT READINESS

- [ ] **Build Process**
  - [ ] Backend can be packaged for production
  - [ ] Frontend: `npm run build` produces optimized bundle
  - [ ] No hardcoded localhost URLs
  - Status: ☐ Ready / ☐ Needs Work

- [ ] **Environment Variables**
  - [ ] `.env.example` has all required variables documented
  - [ ] Sensitive keys never committed to git
  - [ ] Different `.env` for dev/test/prod
  - Status: ☐ Configured / ☐ Needs Setup

- [ ] **Docker (Optional)**
  - [ ] Dockerfile exists and works
  - [ ] Can build image: `docker build -t arty-backend .`
  - [ ] Can run in container for consistency
  - Status: ☐ Working / ☐ Not Used

---

## 👥 TEAM READINESS

### Developer 1 (Profile + Orders)
- [ ] Assigned and available full-time
- [ ] Has access to all repositories
- [ ] Can run dev environment locally
- [ ] Understands Sprint 1 User Stories
- **Assignment confirmed by:** _________ (Name)
- **Start date:** _________ (Date)

### Developer 2 (Cart + Stats)
- [ ] Assigned and available full-time
- [ ] Has access to all repositories
- [ ] Can run dev environment locally
- [ ] Understands Sprint 1 User Stories
- **Assignment confirmed by:** _________ (Name)
- **Start date:** _________ (Date)

### Developer 3 (Support/Testing)
- [ ] Assigned and available
- [ ] Understands testing framework
- [ ] Can write tests independently
- **Assignment confirmed by:** _________ (Name)
- **Start date:** _________ (Date)

### Frontend Developer
- [ ] Aware of backend changes coming
- [ ] Ready to integrate new API endpoints
- [ ] Will test against localhost during dev
- **Assignment confirmed by:** _________ (Name)
- **Start date:** _________ (Date)

### Scrum Master (You)
- [ ] Read all 3 implementation documents
- [ ] Can explain project scope to team
- [ ] Have blockers list ready
- [ ] Daily standup time scheduled
- **Status:** ☐ Ready / ☐ In Progress

---

## 📅 SPRINT LOGISTICS

- [ ] **Daily Standup**
  - [ ] Time scheduled: _________ (e.g., 9:00 AM)
  - [ ] Duration: _________ (e.g., 15 min)
  - [ ] Format: Video call / In-person / Async
  - [ ] Location/Link: _________

- [ ] **Sprint Planning**
  - [ ] Date/time scheduled: _________ (usually Day 1)
  - [ ] Duration blocked: 2-3 hours
  - [ ] All developers invited: ☐ Yes / ☐ No

- [ ] **Sprint Review**
  - [ ] Date/time scheduled: _________ (Friday)
  - [ ] Demo environment set up: ☐ Ready / ☐ Needs Setup
  - [ ] Demo script prepared: ☐ Yes / ☐ Not yet

- [ ] **Sprint Retrospective**
  - [ ] Date/time scheduled: _________ (Right after review)
  - [ ] Retro format decided: ☐ Liked/Learned/Lacked / ☐ Other

- [ ] **Communication Channel**
  - [ ] Team uses: _________ (Slack, Teams, Discord, etc.)
  - [ ] Critical updates go to: _________ (Channel name)
  - [ ] PR discussions happen in: _________ (GitHub/GitLab)

---

## 🎯 SUCCESS CRITERIA FOR THIS CHECKLIST

**MINIMUM (Must Have):**
- ✅ Dev environment working (Backend + Frontend)
- ✅ Developers assigned and available
- ✅ Git/branching strategy defined
- ✅ Testing framework operational
- ✅ Team understands architecture
- ✅ Daily standup scheduled

**IF ANY OF ABOVE IS FALSE:** ⚠️ **DO NOT START SPRINT 1** — Fix blockers first

**IDEAL (Nice to Have):**
- ✅ Code quality tools configured
- ✅ Docker setup working
- ✅ CI/CD pipeline running
- ✅ Comprehensive documentation
- ✅ Seed data for testing
- ✅ Performance monitoring in place

---

## 📋 HANDOFF CHECKLIST

Before first standup on Day 1:

- [ ] **Tech Lead:**
  - [ ] Reviewed all code examples in planning documents
  - [ ] Confirmed database schema is OK
  - [ ] Identified any architecture concerns
  - Signature: _________ Date: _________

- [ ] **Scrum Master:**
  - [ ] All developers understand their tasks
  - [ ] No blockers are preventing start
  - [ ] Team async agreement on communication
  - Signature: _________ Date: _________

- [ ] **Team Lead:**
  - [ ] All developers confirmed available
  - [ ] Calendar blocked for 3 weeks
  - [ ] Vacation/time-off conflicts resolved
  - Signature: _________ Date: _________

---

## 🆘 EMERGENCY CONTACTS

| Role | Name | Email | Phone |
|------|------|-------|-------|
| Scrum Master | _________ | _________ | _________ |
| Tech Lead | _________ | _________ | _________ |
| Backend Lead | _________ | _________ | _________ |
| Frontend Lead | _________ | _________ | _________ |
| Product Owner | _________ | _________ | _________ |

---

## 📞 ESCALATION PROCEDURE

If blocker is found:
1. Developer reports to Tech Lead immediately (not waiting for standup)
2. Tech Lead attempts fix (max 30 min)
3. If unfixed, escalate to Scrum Master
4. Scrum Master removes blocker or finds workaround
5. If critical blocker: discuss with Product Owner ASAP

**Example Critical Blockers:**
- Database won't start
- Can't push to git
- Tests fail in CI/CD
- Security issues found

---

## ✨ FINAL SIGN-OFF

**This checklist is COMPLETE and team is READY when:**

All checkboxes are checked (green), OR  
All blockers have documented owners and deadlines, OR  
All team members have signed off below

**Scrum Master Sign-Off:**  
Signature: _________________________ Date: _________  
Confirm: ☐ All systems GO ☐ Have blockers to fix first

**Tech Lead Sign-Off:**  
Signature: _________________________ Date: _________  
Confirm: ☐ Architecture is sound ☐ Needs review

**Team Lead Sign-Off:**  
Signature: _________________________ Date: _________  
Confirm: ☐ Team ready to start ☐ Needs more prep

---

**Once all three signatures are in place:**

## 🚀 YOU ARE OFFICIALLY CLEARED FOR LAUNCH

Start Date: _________  
Target Completion: 3 weeks (Friday, Feb 28, 2026)

*"The journey of a thousand miles begins with a single standup." — Ancient Scrum Proverb* 🎯

