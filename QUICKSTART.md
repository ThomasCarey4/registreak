# Quick Start Guide - Lucky Cat

Get the application running in under 10 minutes.

## Prerequisites Check

```bash
# Python 3.10+
python3 --version

# Node.js 16+
node --version

# Docker
docker --version
docker-compose --version

# Poetry (install if needed)
curl -sSL https://install.python-poetry.org | python3 -
```

## 1. Setup Backend (3 minutes)

```bash
cd backend

# Install dependencies
poetry install

# Start database
docker-compose up -d db
```

Wait for database to be healthy:
```bash
# Should show: db is healthy
docker-compose ps
```

## 2. Initialize Database (1 minute)

The database schema is automatically created when the container starts. Optionally add streak columns to existing database:

```bash
cd backend
poetry run python scripts/add_streak_columns.py
```

## 3. Populate Mock Data (2 minutes)

```bash
cd backend
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lucky_cat" \
poetry run python api/fake.py
```

Creates test users:
- Students: `sc0001abc` through `sc0050abc` (password: `password123`)
- Dr. Johnson students: IDs `100` through `150`
- Lecturers: `69`, `staff001`, `staff002`, `staff003`

## 4. Run Backend

```bash
cd backend
poetry run flask --app api run
```

Expected output:
```
* Running on http://127.0.0.1:5000
```

Keep this terminal running.

## 5. Setup Frontend (2 minutes)

In a new terminal:

```bash
cd paw

# Install dependencies
npm install
```

## 6. Run Frontend

```bash
cd paw
npm start
```

Choose your platform:
- Press `a` for Android emulator
- Press `i` for iOS simulator  
- Press `w` for web
- Scan QR code with Expo Go for physical device

## 7. Test the App

### Login
1. Open app
2. Click "Sign in" tab
3. Username: `sc0001abc`
4. Password: `password123`
5. Tap "Sign in"

### Verify Attendance
1. Go to the main Attend tab
2. Enter test code: `1234` (4 digits)
3. See success overlay
4. Streaks update in Streaks tab

### View Streaks
1. Go to Streaks tab
2. See current and longest streak
3. Check streak date

## File Locations

| Component | Location |
|-----------|----------|
| API Routes | `backend/api/app/routes.py` |
| API Client | `paw/services/api.ts` |
| Auth Context | `paw/context/auth-context.tsx` |
| Mock Data | `backend/api/fake.py` |
| Database Schema | `backend/db/init.sql` |
| Setup Guide | `SETUP.md` |

## Useful Commands

```bash
# Backend - restart database
cd backend
docker-compose down
docker-compose up -d db

# Backend - view database logs
docker-compose logs db

# Frontend - clear cache
cd paw
npm start -- --clear

# Backend - reset mock data
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lucky_cat" \
poetry run python api/fake.py
```

## Troubleshooting

**Database won't start**
```bash
docker-compose logs db
docker volume rm backend_db_data  # Warning: deletes data
docker-compose up -d db
```

**Backend port in use**
```bash
# Kill process on port 5000
lsof -ti :5000 | xargs kill -9
poetry run flask --app api run --port 5001
```

**Frontend can't connect**
- Check `EXPO_PUBLIC_API_URL` is set
- Ensure backend is running
- For emulator: use `http://10.0.2.2:5000` (Android)

**Import errors**
```bash
# Reinstall dependencies
poetry install --no-cache
npm install --no-cache
```

## Next Steps

1. Read `/SETUP.md` for detailed configuration
2. Check `/IMPLEMENTATION.md` for architecture overview
3. Review `/VERIFICATION_CHECKLIST.md` for component status
4. Explore the codebase:
   - Backend business logic: `backend/api/app/controllers.py`
   - Frontend authentication: `paw/context/auth-context.tsx`
   - API integration: `paw/services/api.ts`

## Support

For detailed information:
- **Setup & Installation**: See `SETUP.md`
- **Architecture**: See `IMPLEMENTATION.md`  
- **Verification**: See `VERIFICATION_CHECKLIST.md`
- **API Docs**: See `SETUP.md` → API Endpoints section

---

**Estimated Time**: 8-10 minutes
**Difficulty**: Easy
**Prerequisites**: Docker, Node.js, Python 3.10+
