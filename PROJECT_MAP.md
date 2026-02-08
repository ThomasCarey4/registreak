# 🗺️ Lucky Cat Project Map

Complete overview of the Lucky Cat application structure and implementation.

---

## 📱 Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (Expo)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Screens                                             │   │
│  │  ├── LoginScreen        → useAuth.login()           │   │
│  │  ├── RegisterScreen     → useAuth.register()        │   │
│  │  ├── AttendScreen       → apiService.verify()       │   │
│  │  └── StreakScreen       → User data display         │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Auth Context (auth-context.tsx)                     │   │
│  │  ├── user: User                                      │   │
│  │  ├── token: string                                   │   │
│  │  └── Functions: login, register, logout, refresh    │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Service (services/api.ts)                       │   │
│  │  ├── Token Management (AsyncStorage)                │   │
│  │  ├── Request Handler (JWT injection)                │   │
│  │  └── Endpoints (register, login, verify, streak)    │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬──────────────────────────────────────────┘
                     │ HTTP/REST
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    Flask API Backend                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Routes (routes.py)                                  │   │
│  │  ├── POST /account/register                          │   │
│  │  ├── POST /account/login                             │   │
│  │  ├── POST /account/logout                            │   │
│  │  ├── GET /user/<id>                                  │   │
│  │  ├── GET /user/<id>/streak                           │   │
│  │  └── POST /verify (attendance)                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Controllers (controllers.py)                        │   │
│  │  ├── verify_student_attendance()                     │   │
│  │  ├── get_lecturer_current_lectures()                │   │
│  │  └── _update_student_streak()                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Models (models.py)                                  │   │
│  │  ├── Users (+ streak fields)                         │   │
│  │  ├── Lecture                                         │   │
│  │  ├── LectureAttendance                               │   │
│  │  └── Module, Course                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬──────────────────────────────────────────┘
                     │ SQL
                     ↓
┌─────────────────────────────────────────────────────────────┐
│               PostgreSQL Database (Docker)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tables                                              │   │
│  │  ├── users (id, username, password, streaks)        │   │
│  │  ├── lectures (id, module_id, start, end)           │   │
│  │  ├── lecture_attendance (user_id, lecture_id, att)  │   │
│  │  ├── modules (id, name, course_code)                │   │
│  │  └── courses (code, name)                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 File Structure

```
Lucky-Cat/
│
├── 📄 Documentation (Read these first!)
│   ├── DOCS_INDEX.md              ← Navigation guide
│   ├── QUICKSTART.md              ← 5-min setup
│   ├── SETUP.md                   ← Detailed setup
│   ├── IMPLEMENTATION.md           ← Architecture
│   ├── VERIFICATION_CHECKLIST.md   ← Status check
│   ├── COMPLETION_SUMMARY.md       ← What's done
│   ├── README_INTEGRATION.md       ← Overview
│   └── STATUS.md                   ← Current status
│
├── 📁 Backend (Flask API)
│   └── backend/
│       ├── pyproject.toml          ← Python dependencies (Poetry)
│       ├── docker-compose.yml      ← PostgreSQL container
│       ├── .env.example            ← Environment template
│       │
│       ├── 📁 api/
│       │   ├── run.py              ← Server entry point
│       │   ├── fake.py             ← Mock data generator ⭐
│       │   │
│       │   └── app/
│       │       ├── __init__.py      ← Flask app creation
│       │       ├── routes.py        ← API endpoints ⭐
│       │       ├── models.py        ← SQLAlchemy models ⭐
│       │       ├── controllers.py   ← Business logic ⭐
│       │       └── utils.py         ← Helper functions
│       │
│       ├── 📁 db/
│       │   └── init.sql            ← Database schema ⭐
│       │
│       └── 📁 scripts/
│           └── add_streak_columns.py ← Migration script ⭐
│
├── 📱 Frontend (React Native + Expo)
│   └── paw/
│       ├── package.json            ← JS dependencies
│       ├── tsconfig.json           ← TypeScript config
│       ├── app.json                ← Expo config
│       ├── .env.example            ← Environment template
│       │
│       ├── 📁 app/
│       │   ├── _layout.tsx         ← Root with AuthProvider ⭐
│       │   ├── login.tsx           ← Login screen ⭐
│       │   ├── register.tsx        ← Register screen ⭐
│       │   │
│       │   └── 📁 (tabs)/
│       │       ├── index.tsx       ← Attendance verification ⭐
│       │       ├── explore.tsx     ← App explorer
│       │       └── streaks.tsx     ← Streak view
│       │
│       ├── 📁 services/
│       │   └── api.ts              ← API client ⭐ NEW
│       │
│       ├── 📁 context/
│       │   └── auth-context.tsx    ← Auth state ⭐ NEW
│       │
│       ├── 📁 components/
│       │   ├── themed-text.tsx
│       │   ├── themed-view.tsx
│       │   └── success-overlay.tsx
│       │
│       ├── 📁 hooks/
│       │   ├── use-color-scheme.ts
│       │   └── use-theme-color.ts
│       │
│       └── 📁 constants/
│           └── theme.ts
│
└── 📁 Other
    ├── app/                        ← Original admin panel
    └── .git/                       ← Git repository

⭐ = Key implementation file
```

---

## 🔄 Data Flow Diagrams

### 1️⃣ Authentication Flow
```
User
  ↓ Input credentials
UI Login Screen
  ↓ click "Login"
useAuth.login()
  ↓ calls
apiService.login()
  ↓ POST /account/login
Flask Backend
  ↓ verify credentials
✅ Generate JWT token
  ↓ return token
AuthContext
  ↓ store token & user
AsyncStorage
  ↓ persist token
✅ User logged in
```

### 2️⃣ Attendance Verification Flow
```
Student
  ↓ Enter 4-digit code
AttendScreen
  ↓ collect all digits
submitCode()
  ↓ calls
apiService.verifyAttendance(code)
  ↓ POST /verify (with token)
Flask Backend
  ↓ extract student_id from JWT
verify_student_attendance()
  ↓ validates code
  ↓ finds lecture
  ↓ marks is_attended = True
_update_student_streak()
  ↓ checks if day complete
  ↓ updates current_streak
  ↓ updates longest_streak
  ↓ updates streak_last_date
✅ Database updated
  ↓ return success
Frontend
  ↓ show overlay
✅ Attendance marked
```

### 3️⃣ Streak Calculation Flow
```
Daily Attendance Completion
  ↓
Check if all lectures that day attended
  ├─ NO → Return (don't update streak)
  │
  └─ YES → Check intervening days since last streak date
       ├─ Found missed day → Reset streak to 0
       │
       └─ No missed days → Increment current_streak
                              ↓
                           Update longest_streak if needed
                              ↓
                           Update streak_last_date = today
                              ↓
                           ✅ Database updated
```

---

## 🔑 Key Implementation Points

### Backend Streak Logic (`controllers.py`)
```python
def _update_student_streak(student_id, lecture_datetime):
    1. Get all lectures on that date for student
    2. Check if all are attended
    3. If yes:
       a. Check for intervening missed days
       b. If found, reset current_streak = 0
       c. Otherwise, increment current_streak += 1
    4. Update longest_streak if needed
    5. Update streak_last_date
    6. Commit to database
```

### Frontend Authentication (`auth-context.tsx`)
```typescript
AuthProvider
  ├── Manages user state
  ├── Manages token state
  ├── Persists token to AsyncStorage
  ├── Restores token on app start
  ├── Provides login/register/logout
  └── Available via useAuth() hook
```

### API Communication (`api.ts`)
```typescript
APIService
  ├── Stores token in memory
  ├── Persists token to AsyncStorage
  ├── Injects Bearer token in all requests
  ├── Handles errors consistently
  └── Type-safe with TypeScript
```

---

## 📊 Database Schema

```sql
CREATE TABLE users (
    student_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    "isStaff" BOOLEAN DEFAULT FALSE,
    current_streak INTEGER DEFAULT 0,        ⭐ NEW
    longest_streak INTEGER DEFAULT 0,        ⭐ NEW
    streak_last_date DATE                    ⭐ NEW
);

CREATE TABLE lectures (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL,
    lecturer_id TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE
);

CREATE TABLE lecture_attendance (
    user_id TEXT NOT NULL,
    lecture_id INTEGER NOT NULL,
    is_attended BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (user_id, lecture_id)
);

CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    course_code TEXT
);

CREATE TABLE courses (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL
);
```

---

## 🛣️ API Routes Map

```
Authentication (No token required)
├── POST /account/register
│   └── Body: {username, password, student_id, is_staff}
│       Response: {token, message}
│
└── POST /account/login
    └── Body: {username, password}
        Response: {token, message, user}

Protected Routes (Require Bearer token)
├── POST /account/logout
│   └── Response: {message}
│
├── GET /user/<student_id>
│   └── Response: {student_id, username, is_staff, current_streak, longest_streak}
│
├── GET /user/<student_id>/streak
│   └── Response: {current_streak, longest_streak, streak_last_date}
│
├── GET /code
│   └── Response: {code}
│
└── POST /verify
    └── Body: {code}
        Response: {success, message, lecture_id, module_name}
```

---

## 🧪 Testing Scenarios

### Mock Data Includes
- 50 regular students (sc0001abc - sc0050abc)
- 50 Dr. Johnson students (IDs 100-150)
- 4 staff members
- 5 courses with 25 modules
- 12 lectures per module (past)
- 840 lectures for Dr. Johnson (future)
- Pre-populated attendance (70-90% attended)

### Test Cases
1. Register new user
2. Login with credentials
3. Verify attendance code
4. Check streak updates
5. Test token persistence
6. Test logout
7. Test API errors
8. Test attendance edge cases

---

## 🚀 Deployment Checklist

- [ ] Copy `.env.example` to `.env`
- [ ] Set DATABASE_URL
- [ ] Set ATTENDANCE_SECRET_SEED
- [ ] Run docker-compose up -d db
- [ ] Run database migrations
- [ ] Populate initial data (fake.py)
- [ ] Start Flask server
- [ ] Copy `paw/.env.example` to `paw/.env.local`
- [ ] Set EXPO_PUBLIC_API_URL
- [ ] Run npm install
- [ ] Start Expo dev server
- [ ] Test all features

---

## 📞 Navigation Guide

| Want to... | See... |
|-----------|--------|
| Get running ASAP | QUICKSTART.md |
| Understand setup | SETUP.md |
| See architecture | IMPLEMENTATION.md + this file |
| Verify status | VERIFICATION_CHECKLIST.md |
| Find docs | DOCS_INDEX.md |
| Understand code | IMPLEMENTATION.md |
| Check current status | STATUS.md |

---

## ✨ Key Features Map

```
User Registration/Login
    ↓
Authentication Token (JWT)
    ↓
Authenticated API Access
    ↓
Lecture Attendance Marking
    ↓
Streak Calculation
    ├── Increment if all daily lectures attended
    ├── Reset if any daily lecture missed
    └── Track current & longest streaks
```

---

## 🎯 Next Steps

1. Read DOCS_INDEX.md to understand docs structure
2. Follow QUICKSTART.md to run the app
3. Explore the code with this map as guide
4. Refer to IMPLEMENTATION.md for deeper understanding
5. Check VERIFICATION_CHECKLIST.md for status
6. Deploy using SETUP.md guidelines

---

**This map shows the complete structure of the Lucky Cat application.**

For details, see the documentation files in order above.
