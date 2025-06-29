# FastAPI JWT Authentication with Supabase Integration

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Copy environment template
copy .env.example .env

# Edit .env with your Supabase credentials
```

### 2. Setup Supabase
1. Go to your Supabase project dashboard
2. Go to SQL Editor
3. Run the SQL script from `supabase_schema.sql`
4. Get your Supabase URL and Anon Key from Settings → API

### 3. Start the Server
```bash
# Run the startup script
start.bat

# Or manually:
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

## 📋 Features

- ✅ **JWT Authentication** with 7-day expiration
- ✅ **User Registration** with Supabase integration
- ✅ **User Login** with JWT token generation
- ✅ **Token Validation** 
- ✅ **CORS** configured for frontend (ports 5173, 5174)
- ✅ **Automatic API Documentation** at `/docs`

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root endpoint |
| GET | `/health` | Health check |
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/auth/me` | Get current user info |
| POST | `/auth/validate` | Validate JWT token |

## 🔑 Demo Credentials

- **Demo User**: `demo@example.com` / `demo123`
- **Admin User**: `admin@example.com` / `admin123`

## 🔐 JWT Secret Key

```
your_super_secret_jwt_key_for_development_12345
```

## 📝 Usage Examples

### Register User
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

### Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}'
```

### Access Protected Route
```bash
curl -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔗 Integration with Frontend

Update your frontend's `authService.ts` API base URL:
```typescript
const API_BASE_URL = 'http://localhost:8000';
```

## 📊 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🗄️ Database Integration

When users register:
1. **Local Storage**: User is added to in-memory storage for immediate use
2. **Supabase**: User data is automatically saved to your Supabase `users` table

This ensures you have both immediate functionality and persistent storage in Supabase.
