# 🚀 QUICK START - TOMORROW MORNING

**For:** All team members  
**Print this** and bring to Monday standup  
**Time to read:** 5 minutes

---

## ☀️ WHAT'S HAPPENING

Your Artisan Dashboard is **85% done Frontend, 0% done Backend**.

We're building the backend in **3 weeks, 3 sprints**.

**This week:** Profil + Panier  
**Next week:** Commandes + Stats  
**Week after:** Indisponibilités + Avis

---

## 📅 TIMELINE (Print This)

```
WEEK 1 (Feb 10-14): FOUNDATIONS
├─ Monday: Start Profil + Cart
├─ Wed: Profil done + tested
├─ Wed: Cart done + tested  
├─ Fri: Demo to team ✅

WEEK 2 (Feb 17-21): TRANSACTIONS
├─ Mon: Start Orders + Stats
├─ Wed: Orders done + tested
├─ Wed: Stats done + tested
├─ Fri: Demo + stats working ✅

WEEK 3 (Feb 24-28): POLISH
├─ Mon: Start Indisponibilités + Avis
├─ Wed: Indisponibilités done + tested ✅
├─ Wed: Avis done + tested ✅
└─ Fri: FULL DASHBOARD COMPLETE 🎉
```

---

## 👥 YOUR ROLE THIS WEEK

**Developer 1:**  
→ User Profile Edit API  
→ `PUT /api/users/me`  
→ Start Monday

**Developer 2:**  
→ Shopping Cart Backend  
→ `POST/GET/DELETE /api/carts/items`  
→ Start Monday

**Developer 3:**  
→ Support + Testing  
→ Help with blockers  
→ Write tests

**Frontend Dev:**  
→ Watch for backend APIs  
→ Replace mock data with real calls  
→ Start integrating Wednesday

**Scrum Master:**  
→ Remove blockers  
→ Run standups  
→ Track progress

---

## 🎯 SPRINT 1 SUCCESS CRITERIA

**By Friday 5pm, you'll know you won)** if:

- ✅ Artisans can edit their profile (name, email, bio, specialty)
- ✅ Cart saves to database (not just localStorage)
- ✅ Added items persist when user logs back in
- ✅ Both features tested with 80%+ coverage
- ✅ Frontend shows real data, not mock

---

## 📚 DOCUMENTS YOU NEED

**Read this week:**

1. **DASHBOARD_EXECUTIVE_SUMMARY.md** (5 min)  
   → Understand why this matters
   
2. **Your specific user story** in SPRINT_PLAN (20 min)  
   → Know what to build
   
3. **When stuck:** Jump to ARTISAN_DASHBOARD_ANALYSIS.md  
   → Find exact API specs

**Full index:** DOCUMENT_INDEX.md

---

## ✅ BEFORE YOU START CODING

- [ ] Backend starts at `http://localhost:8000`
- [ ] Database is accessible
- [ ] Can run tests: `pytest Back/tests/`
- [ ] Can make git branches
- [ ] Understand your User Story

**Any of these NOT working?** Tell Scrum Master NOW.

---

## 🔥 WHAT STOPS YOU = TELL SCRUM MASTER IMMEDIATELY

Don't wait for standup if:
- Database won't connect
- Backend won't start
- Can't push to git
- Don't understand the specs
- Need a dependency installed

**Scrum Master removes blockers** so you can stay productive.

---

## 💡 CODE Template (Copy-Paste)

**Service file location:**
`Back/app/services/profile_service.py`

```python
# Copy this structure for your service
class ProfileService:
    async def update_user(self, user_id: UUID, updates: dict):
        # 1. Get user from database
        # 2. Validate inputs
        # 3. Update fields
        # 4. Save to database
        # 5. Return updated user

# See SPRINT_PLAN.md for full code!
```

**Endpoint template:**
`Back/app/api/v1/endpoints/users.py`

```python
from fastapi import APIRouter
from fastapi.security import Depends

router = APIRouter()

@router.put("/me")
async def update_profile(
    updates: UserUpdate,
    current_user = Depends(get_current_user)
):
    # 1. Verify user is authenticated (done by Depends)
    # 2. Call service to update
    # 3. Return updated user
```

**Test template:**
`Back/tests/test_users.py`

```python
def test_update_profile():
    # GIVEN a user and an update payload
    # WHEN user sends PUT request
    # THEN database is updated
    # AND response contains new data
```

---

## 📊 PROGRESS TRACKING

**Share this daily in standup:**

```
STANDUP UPDATE:
What I did today:
- Implemented X endpoint
- Fixed Y bug

What I'm doing tomorrow:
- Start Z feature
- Write tests for X

Blockers:
- Database connection issue (RESOLVED) ✅
- Need docker setup (PENDING - for Scrum Master)
```

---

## 🎓 WHERE TO GET HELP

**"I don't understand what to build"**  
→ Read your User Story in SPRINT_PLAN.md

**"I don't understand the code structure"**  
→ Look at `Back/app/api/v1/endpoints/products.py` (it's well done!)

**"My code isn't working"**  
→ Check SPRINT_PLAN for test examples

**"I need a database schema"**  
→ Look at `Back/app/models/` for similar models

**"What's the status code?"**  
→ Check SPRINT_PLAN code examples

**"I'm blocked"**  
→ Tell Scrum Master, don't wait

---

## ⏰ DAILY SCHEDULE (Proposed)

```
9:00 AM   - Daily Standup (15 min)
9:15 AM   - Focus time (2.5 hours)
11:45 AM  - Break
12:00 PM  - Lunch (1 hour)
1:00 PM   - Focus time (2.5 hours)
3:30 PM   - Code review / Help teammate
4:30 PM   - Wrap up for day
5:00 PM   - Done!
```

**Standup is NOT status update in Slack** - it's 15 min voice/video meeting where you say:
- ✅ What I did
- 📋 What I'm doing next
- 🚧 What's blocking me

---

## 📱 KEEP THIS HANDY

Screenshot or print this section - it answers 90% of questions:

| Need | File |
|------|------|
| Understand feature | ANALYSIS.md |
| See code example | SPRINT_PLAN.md |
| Know timeline | This page ⬆️ |
| Know what's due | Your User Story section |
| See tests | SPRINT_PLAN.md test section |
| Track progress | This checklist |
| Need help | Scrum Master |

---

## 🎉 YOU'VE GOT THIS

**Week 1 goal:** Profil + Cart (should feel achievable)  
**Week 2 goal:** Orders + Stats (builds on Week 1)  
**Week 3 goal:** Polish features (refinement)

---

## 📞 QUICK REFERENCE

**Start coding Here:**

**Dev 1:**
```bash
cd Back/app/services
touch user_service.py  # Create this
# See SPRINT_PLAN.md Week 1 US#1.1
```

**Dev 2:**
```bash
cd Back/app/services
touch cart_service.py  # Create this
# See SPRINT_PLAN.md Week 1 US#1.2
```

**Frontend:**
```bash
cd Front
# Wait for Dev 1 + Dev 2 APIs
# Then replace localStorage with API calls
# See ARTISAN_DASHBOARD_ANALYSIS.md for API specs
```

---

## ✨ REMEMBER

✅ You have a complete plan  
✅ You know exactly what to build  
✅ You have code examples  
✅ You have test examples  
✅ You're not alone (team + Scrum Master)  

**One week. Three developers. Total focus.**

**Let's make this happen.** 🚀

---

**Questions before Monday? Drop them in Slack or with Scrum Master.**

**See you at standup Monday 9 AM!**

