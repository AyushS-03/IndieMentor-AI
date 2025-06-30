import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../lib/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isPremium: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Initializing JWT auth...');
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setLoading(true);
    
    try {
      console.log('AuthContext: Checking JWT token...');
      const validation = await authService.validateToken();
      
      if (validation.valid && validation.user) {
        console.log('AuthContext: JWT authentication successful');
        setUser(validation.user);
      } else {
        console.log('AuthContext: No valid session found');
        setUser(null);
      }
    } catch (error) {
      console.log('AuthContext: JWT validation failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('AuthContext: Login attempt for:', email);
    setLoading(true);
    
    try {
      const response = await authService.login({ email, password });
      console.log('AuthContext: Login successful');
      setUser(response.user);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    
    try {
      console.log('AuthContext: Registration attempt...');
      const response = await authService.register({ email, password, name });
      console.log('AuthContext: Registration successful');
      setUser(response.user);
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      // For now, just update locally
      // In a real implementation, we'd call the backend API
      setUser({ ...user, ...updates });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  // JWT-specific methods
  const hasPermission = (permission: string): boolean => {
    return authService.hasPermission(permission);
  };

  const hasRole = (role: string): boolean => {
    return authService.hasRole(role);
  };

  const isAdmin = (): boolean => {
    return authService.isAdmin();
  };

  const isPremium = (): boolean => {
    return authService.isPremium();
  };

  const contextValue: AuthContextType = {
    user,
    login,
    signup,
    logout,
    loading,
    updateProfile,
    isAuthenticated: !!user,
    hasPermission,
    hasRole,
    isAdmin,
    isPremium,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
