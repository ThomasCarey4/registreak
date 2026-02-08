# Lucky Cat 🐱

A complete attendance tracking system with streak counters built with React Native (Expo) and Flask.

## 🌟 Features

- **User Authentication**: Register and login with secure JWT tokens
- **Attendance Verification**: 4-digit codes for verifying lecture attendance
- **Streak Tracking**: Monitor your attendance streaks (current & longest)
- **Mobile-First**: Built with React Native for iOS, Android, and web
- **Real-Time Updates**: Streaks update immediately upon attendance verification
- **Secure API**: Token-based authentication for all endpoints

## 🚀 Quick Start

Get the application running in 5 minutes:

```bash
# Backend
cd backend
poetry install
docker-compose up -d db
poetry run flask --app api run

# Frontend (in a new terminal)
cd paw
npm install
npm start
```

**Test Credentials**: Username `sc0001abc`, Password `password123` (requires running `api/fake.py`)

See **[QUICKSTART.md](QUICKSTART.md)** for detailed instructions.

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[QUICKSTART.md](QUICKSTART.md)** | 5-minute setup guide |
| **[SETUP.md](SETUP.md)** | Complete configuration guide |
| **[IMPLEMENTATION.md](IMPLEMENTATION.md)** | Architecture & design |
| **[VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)** | Feature status |
| **[COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md)** | Implementation overview |
| **[DOCS_INDEX.md](DOCS_INDEX.md)** | Documentation index |

Start with **[DOCS_INDEX.md](DOCS_INDEX.md)** to find what you need.

## 🏗️ Architecture

```
Frontend (React Native)        Backend (Flask)           Database (PostgreSQL)
├── Login/Register      →     API Routes         →     Users
├── Attendance Code     →     Controllers        →     Lectures
├── Streak View         →     Services           →     Attendance
└── Auth Context        →     Models             →     Streaks
```

## 🔑 Key Technologies

- **Frontend**: React Native, Expo, TypeScript, AsyncStorage
- **Backend**: Flask, SQLAlchemy, PostgreSQL, Poetry
- **Authentication**: JWT, Bearer tokens
- **Database**: PostgreSQL 15 with Docker

## 📊 Streak Logic

A streak increments when **all lectures on a day are attended**.

- ✅ Mark attendance for all daily lectures → streak + 1
- ✅ Consecutive days of full attendance → streak increases
- ❌ Miss any lecture → streak resets
- 📈 `longest_streak` tracks your best ever

## 🔐 Security

- Passwords hashed with werkzeug
- JWT token authentication
- Bearer token in API headers
- Token expiration (7 days)
- Secure local storage with AsyncStorage

## 🛠️ Development

### Backend
```bash
cd backend
poetry install          # Install dependencies
docker-compose up -d db # Start database
poetry run python api/fake.py  # Load test data
poetry run flask --app api run # Run server
```

### Frontend
```bash
cd paw
npm install    # Install dependencies
npm start      # Start Expo
# Press 'a' for Android, 'i' for iOS, 'w' for web
```

## 📁 Project Structure

```
Lucky-Cat/
├── backend/
│   ├── api/app/         # Flask application
│   ├── db/init.sql      # Database schema
│   ├── scripts/         # Migration scripts
│   ├── fake.py          # Test data generator
│   └── pyproject.toml   # Python dependencies
├── paw/
│   ├── app/             # Expo screens
│   ├── services/        # API client
│   ├── context/         # Auth state
│   └── package.json     # JS dependencies
├── DOCS_INDEX.md        # ← Documentation guide
└── QUICKSTART.md        # ← Quick setup
```

## 🌐 API Endpoints

### Authentication
- `POST /account/register` - Create account
- `POST /account/login` - Login
- `POST /account/logout` - Logout

### User Data
- `GET /user/<id>` - Get user info with streaks
- `GET /user/<id>/streak` - Get streak data only

### Attendance
- `POST /verify` - Verify attendance code

All endpoints (except register/login) require Bearer token.

## 🧪 Testing

Mock data includes:
- 50 regular students
- 50 Dr. Johnson students
- 4 staff members
- Multiple courses and lectures
- Pre-populated attendance records

Generate test data:
```bash
cd backend
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lucky_cat" \
poetry run python api/fake.py
```

## 📝 API Response Examples

### Login Response
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "student_id": "sc0001abc",
    "username": "student1",
    "is_staff": false,
    "current_streak": 5,
    "longest_streak": 10
  }
}
```

### Attendance Verification
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "lecture_id": 123,
  "module_name": "Operating Systems"
}
```

## ⚙️ Configuration

### Frontend (.env.local)
```
EXPO_PUBLIC_API_URL=http://localhost:5000
```

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lucky_cat
FLASK_ENV=development
ATTENDANCE_SECRET_SEED=your-secret-key
```

## 🚨 Troubleshooting

**Database won't start?**
```bash
docker-compose down && docker-compose up -d db
```

**Can't connect from frontend?**
- Android Emulator: Use `http://10.0.2.2:5000`
- iOS Simulator: Use `http://localhost:5000`
- Check `EXPO_PUBLIC_API_URL` is set

**Module not found?**
```bash
cd paw && npm install --no-cache
cd ../backend && poetry install --no-cache
```

See **[SETUP.md](SETUP.md)** for more troubleshooting.

## 🚀 Deployment

The application is ready for:
- Local development with Docker Compose
- Cloud deployment with environment variables
- Docker container deployment
- Expo hosting for frontend

See **[SETUP.md](SETUP.md)** for deployment instructions.

## 📈 Future Enhancements

- Real-time code generation via WebSocket
- Attendance statistics dashboard
- Admin panel for viewing all attendances
- Email notifications for streak milestones
- Offline support with local caching
- Two-factor authentication

## 📞 Support

1. **Quick Setup?** → See [QUICKSTART.md](QUICKSTART.md)
2. **Detailed Help?** → See [SETUP.md](SETUP.md)
3. **How It Works?** → See [IMPLEMENTATION.md](IMPLEMENTATION.md)
4. **Lost?** → See [DOCS_INDEX.md](DOCS_INDEX.md)

## 📄 License

[Add your license here]

## 👥 Contributors

[Add contributors here]

---

**Ready to get started?** → [QUICKSTART.md](QUICKSTART.md)

**Want more details?** → [DOCS_INDEX.md](DOCS_INDEX.md)

**Questions?** → See [SETUP.md](SETUP.md) troubleshooting section
