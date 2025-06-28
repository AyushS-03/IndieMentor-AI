# IndieMentor AI

A revolutionary platform that allows creators, educators, and professionals to clone themselves into AI-powered mentors using voice, video, and document training. Users can monetize their expertise by creating personalized AI mentors that provide 24/7 guidance and support.

## 🚀 Features

### For Creators
- **AI Mentor Creation**: Upload videos, audio, and documents to train your AI mentor
- **Voice & Video Cloning**: Advanced AI captures your unique voice and appearance
- **Monetization**: Set subscription prices and earn passive income
- **Dashboard**: Track subscribers, revenue, and conversations
- **Real-time Analytics**: Monitor mentor performance and engagement

### For Users
- **AI Conversations**: Chat with AI mentors via text, voice, and video
- **Subscription Management**: Access premium mentors with monthly subscriptions
- **Personalized Learning**: Get tailored advice based on mentor expertise
- **24/7 Availability**: Learn from your favorite creators anytime

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Real-time)
- **UI Components**: Lucide React icons
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM
- **Build Tool**: Vite

## 🏗 Architecture

### Database Schema
- **profiles**: User accounts and creator information
- **mentors**: AI mentor configurations and metadata
- **subscriptions**: User subscriptions to mentors
- **conversations**: Chat history and messages

### Key Components
- **AuthContext**: Authentication and user management
- **ProtectedRoute**: Route protection for authenticated users
- **useMentors**: Hook for mentor CRUD operations
- **useConversations**: Hook for chat functionality

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd indiementor-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure Supabase:
   - Create a new Supabase project
   - Run the migration file in the Supabase SQL editor
   - Update `.env` with your Supabase URL and anon key

5. Start the development server:
```bash
npm run dev
```

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the migration file: `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key to the `.env` file

## 📱 Usage

### Creating an AI Mentor

1. Sign up as a creator
2. Navigate to "Create Mentor"
3. Fill in basic information (name, title, description, expertise)
4. Upload training content (videos, audio, documents)
5. Launch your AI mentor

### Subscribing to Mentors

1. Browse available mentors
2. View mentor profiles and expertise
3. Subscribe to access chat functionality
4. Start conversations with AI mentors

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- User authentication via Supabase Auth
- Protected routes for sensitive operations
- Secure API endpoints with proper authorization

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (#6366F1 to #5B21B6)
- **Secondary**: Green (#10B981)
- **Accent**: Orange (#F59E0B)

### Components
- Responsive design with mobile-first approach
- Consistent spacing using 8px grid system
- Smooth animations and micro-interactions
- Accessible color contrasts and typography

## 📈 Monetization

- Subscription-based model for mentor access
- Revenue sharing between platform and creators
- Built-in payment processing
- Analytics for tracking earnings

## 🔮 Future Enhancements

- **Voice Conversations**: Real-time voice chat with AI mentors
- **Video Calls**: Face-to-face conversations with AI avatars
- **Group Sessions**: Multiple users learning together
- **Advanced Analytics**: Detailed performance metrics
- **Mobile App**: Native iOS and Android applications
- **API Integration**: Third-party integrations and webhooks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@indiementor.ai or join our Discord community.

---

Built with ❤️ by the IndieMentor AI team