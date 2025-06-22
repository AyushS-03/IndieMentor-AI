import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';
import HomePage from './pages/HomePage';
import MentorsPage from './pages/MentorsPage';
import MentorDetailPage from './pages/MentorDetailPage';
import DashboardPage from './pages/DashboardPage';
import CreateMentorPage from './pages/CreateMentorPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PricingPage from './pages/PricingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/mentors" element={<MentorsPage />} />
            <Route path="/mentor/:id" element={
              <ProtectedRoute>
                <MentorDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute requireCreator>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/create-mentor" element={
              <ProtectedRoute requireCreator>
                <CreateMentorPage />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/pricing" element={<PricingPage />} />
          </Routes>
          <Toast />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;