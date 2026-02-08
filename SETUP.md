# Lucky Cat - Frontend/Backend Integration Setup

This guide covers setting up and running the Lucky Cat application with frontend-backend integration, including database streaks tracking.

## Architecture Overview

- **Backend**: Flask API (Python) with PostgreSQL
- **Frontend**: React Native with Expo
- **Features**: User authentication, attendance verification with codes, lecture attendance tracking, streak counter

## Prerequisites

- Python 3.10+
- Node.js 16+ and npm
- Docker & Docker Compose (for PostgreSQL)
- Poetry (Python dependency manager)
- Expo CLI

## Backend Setup

### 1. Install Dependencies with Poetry

```bash
cd backend
poetry install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Database configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lucky_cat
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=lucky_cat

# Flask configuration
FLASK_ENV=development
ATTENDANCE_SECRET_SEED=your-secret-key-here
```

### 3. Start PostgreSQL Database

```bash
cd backend
docker-compose up -d db
```

Wait for the container to be healthy. Verify with:

```bash
docker-compose ps
```

### 4. Initialize/Migrate Database

The database schema will be created automatically when the `db` container starts (via `init.sql`). To add streak columns to an existing database:

```bash
cd backend
poetry run python scripts/add_streak_columns.py
```

### 5. Populate Mock Data (Optional)

```bash
cd backend
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lucky_cat" \
poetry run python api/fake.py
```

This creates:
- 50 regular students
- 50 students for Dr. Johnson (IDs 100-150)
- 4 staff members
- 5 courses with 5 modules each
- 12 lectures per module + 840 back-to-back lectures for Dr. Johnson
- Random attendance records with streak tracking

### 6. Run Backend Server

```bash
cd backend
poetry run flask --app api run
```

The API will be available at `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd paw
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `paw` directory:

```bash
EXPO_PUBLIC_API_URL=http://localhost:5000
```

For Android emulator, use:
```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000
```

For iOS simulator, use:
```bash
EXPO_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run Frontend

```bash
cd paw
npm start
```

Then choose your platform:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web browser
- Scan QR code with Expo Go app for physical device

## API Endpoints

All endpoints (except register/login) require Bearer token authentication.

### Authentication

**Register**
```
POST /account/register
Body: {
  "username": string,
  "password": string,
  "student_id": string,
  "is_staff": boolean (optional)
}
Response: { "token": string, "message": string }
```

**Login**
```
POST /account/login
Body: {
  "username": string,
  "password": string
}
Response: { "token": string, "message": string, "user": {...} }
```

**Logout**
```
POST /account/logout
Response: { "message": string }
```

### User Data

**Get User Details**
```
GET /user/<student_id>
Headers: Authorization: Bearer <token>
Response: {
  "student_id": string,
  "username": string,
  "is_staff": boolean,
  "current_streak": number,
  "longest_streak": number
}
```

**Get User Streak**
```
GET /user/<student_id>/streak
Headers: Authorization: Bearer <token>
Response: {
  "student_id": string,
  "current_streak": number,
  "longest_streak": number,
  "streak_last_date": string (ISO date)
}
```

### Attendance

**Verify Attendance Code**
```
POST /verify
Headers: Authorization: Bearer <token>
Body: { "code": string }
Response: {
  "success": boolean,
  "message": string,
  "lecture_id": number,
  "module_name": string
}
```

## Streak Logic

A streak tracks consecutive days where **all lectures** are attended:

- When a student marks attendance for all lectures on a given day, that day's streak is incremented
- If any lecture is missed (not marked as attended) on an intervening day, the current streak resets
- `longest_streak` tracks the maximum streak ever achieved
- `streak_last_date` records the last date a full day's attendance was marked

## Testing the Integration

### 1. Register a new account
- Open the app and go to Register
- Create account with test credentials
- Token is automatically saved

### 2. Test Attendance Verification
- Go to the Attend tab
- Enter a 4-digit code
- Codes are generated based on current lectures (run `fake.py` for test data)
- On success, overlay shows and streaks are updated

### 3. Check Streak Data
- After marking attendance, navigate to Streaks tab
- View your current and longest streak
- Streaks update based on daily lecture completion

## Troubleshooting

### Database Connection Issues
```bash
# Check if database is running
docker-compose ps

# View database logs
docker-compose logs db

# Restart database
docker-compose down
docker-compose up -d db
```

### Token Expiration
Tokens expire after 7 days. Re-login when needed.

### API Not Found
Ensure backend is running on the correct port:
```bash
curl http://localhost:5000/
```

### Frontend Can't Connect to Backend
- Check `EXPO_PUBLIC_API_URL` is set correctly
- For emulator: use `http://10.0.2.2:5000` (Android) or `http://localhost:5000` (iOS)
- Check firewall rules

## Development Workflow

1. Backend changes: Update code, Flask hot-reloads
2. Frontend changes: Update code, Expo hot-reloads
3. Database schema changes: Update `init.sql` and run migrations
4. Model changes: Update both `models.py` and `init.sql`

## Project Structure

```
Lucky-Cat/
├── backend/
│   ├── db/
│   │   └── init.sql                 # Database schema
│   ├── scripts/
│   │   └── add_streak_columns.py    # Migration script
│   ├── api/
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── models.py            # SQLAlchemy models
│   │   │   ├── routes.py            # API endpoints
│   │   │   ├── controllers.py       # Business logic
│   │   │   └── utils.py
│   │   ├── fake.py                  # Mock data generator
│   │   └── run.py
│   ├── pyproject.toml               # Poetry dependencies
│   ├── docker-compose.yml
│   └── .env
├── paw/
│   ├── app/
│   │   ├── _layout.tsx              # Root layout with AuthProvider
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── (tabs)/                  # Tab screens
│   ├── services/
│   │   └── api.ts                   # API client
│   ├── context/
│   │   └── auth-context.tsx         # Auth state management
│   ├── hooks/                       # Custom React hooks
│   ├── components/                  # Reusable components
│   ├── package.json
│   └── .env.local
└── README.md
```

## Next Steps

- Implement lecturer lecture code generation endpoint
- Add WebSocket support for real-time code updates
- Implement attendance statistics dashboard
- Add admin panel for viewing all attendances
