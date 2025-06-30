# IndieMentor AI - Complete Mentorship Platform

🚀 **A comprehensive AI-powered mentorship platform with 10 diverse expert mentors**

## ✨ Features

### 🤖 **10 AI Mentors with Unique Personalities**
- **Dr. Sarah Chen** - Senior Software Engineer & Tech Lead
- **Marcus Johnson** - Startup Founder & Business Strategist  
- **Elena Rodriguez** - UX Design Director & Product Innovation Expert
- **Dr. Michael Thompson** - AI/ML Research Scientist & Data Science Expert
- **Jessica Kim** - Digital Marketing Strategist & Growth Hacker
- **David Park** - DevOps Engineer & Cloud Architecture Specialist
- **Dr. Priya Patel** - Product Manager & Innovation Consultant
- **Robert Williams** - Financial Advisor & Investment Strategist
- **Lisa Anderson** - Career Coach & Leadership Development Expert
- **Carlos Martinez** - E-commerce & Online Business Expert

### 🔐 **Authentication & Security**
- JWT-based authentication system
- Secure user registration and login
- Protected routes and API endpoints
- Role-based access control

### 💬 **AI Chat System**
- Groq AI integration for intelligent responses
- Unique personality traits for each mentor
- Context-aware conversations
- Real-time chat interface

### 🎨 **Modern UI/UX**
- React + TypeScript frontend
- Tailwind CSS for responsive design
- Hot toast notifications
- Clean, intuitive interface

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hot Toast** for notifications

### Backend
- **FastAPI** (Python 3.11+)
- **JWT** authentication
- **Groq AI** integration
- **Uvicorn** ASGI server
- **SQLite** for development

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.11+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/AyushS-03/IndieMentor-AI.git
cd IndieMentor-AI
```

### 2. Setup Frontend
```bash
npm install
npm run dev
```
Frontend runs on `http://localhost:5174`

### 3. Setup Backend
```bash
cd mentor_agent
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```
Backend runs on `http://localhost:8001`

### 4. Environment Variables
Create `.env.local` in root:
```env
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_jwt_secret_key_here
```

## 📁 Project Structure
```
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/             # Application pages
│   ├── lib/               # Utilities and services
│   └── contexts/          # React contexts
├── mentor_agent/          # FastAPI backend
│   ├── routes/            # API endpoints
│   ├── models/            # Data models
│   ├── services/          # Business logic
│   └── agents/            # AI agent implementations
└── public/                # Static assets
```

## 🎯 Usage

1. **Register/Login** - Create account or use demo credentials
2. **Browse Mentors** - Explore 10 expert AI mentors
3. **Start Chat** - Select a mentor and begin conversation
4. **Get Guidance** - Receive personalized advice and insights

### Demo Credentials
- **Email**: demo@example.com
- **Password**: demo123

## 📡 API Endpoints

### Authentication
- `POST /IndieMentor/api/v1/auth/register` - Register new user
- `POST /IndieMentor/api/v1/auth/login` - User login
- `GET /IndieMentor/api/v1/auth/me` - Get current user info

### Mentors
- `GET /IndieMentor/api/v1/mentors/` - Get all mentors
- `GET /IndieMentor/api/v1/mentors/{id}` - Get specific mentor
- `POST /IndieMentor/api/v1/mentors/` - Create new mentor

### Chat
- `POST /IndieMentor/api/v1/chat/send` - Send message to AI mentor

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Demo**: [Coming Soon]
- **Documentation**: [Wiki](https://github.com/AyushS-03/IndieMentor-AI/wiki)
- **Issues**: [Bug Reports](https://github.com/AyushS-03/IndieMentor-AI/issues)

## 💡 Features in Development

- [ ] Voice chat with mentors
- [ ] Mentor creation marketplace
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Payment integration
- [ ] Multi-language support

---

**Built with ❤️ by the IndieMentor AI Team**