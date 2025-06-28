import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { authService, User as JWTUser } from '../lib/authService';
import { User as SupabaseUser } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// Legacy interface for compatibility
interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  isCreator: boolean;
  // New JWT fields
  role?: string;
  roleId?: number;
  subscriptionTier?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, isCreator?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  // New JWT auth methods
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isPremium: () => boolean;
  authMode: 'supabase' | 'jwt' | 'demo';
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
  const [authMode, setAuthMode] = useState<'supabase' | 'jwt' | 'demo'>('supabase');

  // Demo users for testing when backends are not available
  const demoUsers = [
    { 
      email: 'sarah@example.com', 
      password: 'password123', 
      name: 'Sarah Johnson', 
      isCreator: true,
      role: 'creator',
      roleId: 2,
      subscriptionTier: 'premium',
      permissions: ['read', 'write', 'create_mentor']
    },
    { 
      email: 'admin@example.com', 
      password: 'admin123', 
      name: 'Admin User', 
      isCreator: false,
      role: 'admin',
      roleId: 1,
      subscriptionTier: 'enterprise',
      permissions: ['read', 'write', 'admin', 'manage_users']
    },
    { 
      email: 'user@example.com', 
      password: 'password123', 
      name: 'John Doe', 
      isCreator: false,
      role: 'user',
      roleId: 3,
      subscriptionTier: 'free',
      permissions: ['read']
    },
  ];

  useEffect(() => {
    console.log('AuthContext: Initializing hybrid auth...');
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setLoading(true);
    
    // First, try JWT authentication
    try {
      console.log('AuthContext: Checking JWT token...');
      const validation = await authService.validateToken();
      
      if (validation.valid && validation.user) {
        console.log('AuthContext: JWT authentication successful');
        setAuthMode('jwt');
        setUser(convertJWTUserToLegacy(validation.user));
        setLoading(false);
        return;
      }
    } catch (error) {
      console.log('AuthContext: JWT validation failed, trying Supabase...', error);
    }

    // Fallback to Supabase
    try {
      console.log('AuthContext: Checking Supabase session...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('AuthContext: Supabase session found');
        setAuthMode('supabase');
        await fetchUserProfile(session.user);
        return;
      }
    } catch (error) {
      console.error('AuthContext: Supabase check failed:', error);
    }

    // If both fail, enable demo mode
    console.log('AuthContext: No active session found, enabling demo mode');
    setAuthMode('demo');
    setLoading(false);
    console.log('Demo mode enabled - use demo credentials to test features');
  };

  const convertJWTUserToLegacy = (jwtUser: JWTUser): User => {
    return {
      id: jwtUser.id,
      email: jwtUser.email,
      name: jwtUser.name,
      avatar_url: jwtUser.avatar_url,
      isCreator: jwtUser.role === 'creator' || jwtUser.permissions.includes('create_mentor'),
      role: jwtUser.role,
      roleId: jwtUser.roleId,
      subscriptionTier: jwtUser.subscriptionTier,
      permissions: jwtUser.permissions,
    };
  };

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    console.log('AuthContext: Fetching Supabase user profile for:', supabaseUser.email);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        if (error.message?.includes('connection') || error.message?.includes('fetch')) {
          toast.error('Connection error. Using cached user data.');
        }
      }

      if (profile) {
        console.log('AuthContext: Supabase profile found:', profile.name);
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          avatar_url: profile.avatar_url,
          isCreator: profile.is_creator,
          role: profile.is_creator ? 'creator' : 'user',
          roleId: profile.is_creator ? 2 : 3,
          subscriptionTier: 'free',
          permissions: profile.is_creator ? ['read', 'write', 'create_mentor'] : ['read'],
        });
      } else {
        console.log('AuthContext: No Supabase profile found, creating basic user');
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
          avatar_url: supabaseUser.user_metadata?.avatar_url,
          isCreator: false,
          role: 'user',
          roleId: 3,
          subscriptionTier: 'free',
          permissions: ['read'],
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
        avatar_url: supabaseUser.user_metadata?.avatar_url,
        isCreator: false,
        role: 'user',
        roleId: 3,
        subscriptionTier: 'free',
        permissions: ['read'],
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('AuthContext: Login attempt for:', email, 'with mode:', authMode);
    setLoading(true);
    
    try {
      // Try JWT backend first
      try {
        console.log('AuthContext: Attempting JWT login...');
        const response = await authService.login({ email, password });
        console.log('AuthContext: JWT login successful');
        setAuthMode('jwt');
        setUser(convertJWTUserToLegacy(response.user));
        toast.success('Successfully logged in!');
        return;
      } catch (jwtError) {
        console.log('AuthContext: JWT login failed, trying Supabase...', jwtError);
      }

      // Fallback to Supabase
      try {
        console.log('AuthContext: Attempting Supabase login...');
        const loginPromise = supabase.auth.signInWithPassword({ email, password });
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Login timeout')), 10000);
        });

        const { error } = await Promise.race([loginPromise, timeoutPromise]) as any;

        if (error) {
          throw error;
        }

        console.log('AuthContext: Supabase login successful');
        setAuthMode('supabase');
        toast.success('Successfully logged in!');
        return;
      } catch (supabaseError) {
        console.log('AuthContext: Supabase login failed, trying demo mode...', supabaseError);
      }

      // Fallback to demo mode
      console.log('AuthContext: Using demo authentication');
      const mockUser = demoUsers.find(u => u.email === email && u.password === password);
      
      if (mockUser) {
        setTimeout(() => {
          setAuthMode('demo');
          setUser({
            id: mockUser.email,
            email: mockUser.email,
            name: mockUser.name,
            isCreator: mockUser.isCreator,
            role: mockUser.role,
            roleId: mockUser.roleId,
            subscriptionTier: mockUser.subscriptionTier,
            permissions: mockUser.permissions,
          });
          toast.success('Successfully logged in! (Demo Mode)');
          setLoading(false);
        }, 1000);
        return;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error: any) {
      console.error('All login methods failed:', error);
      setLoading(false);
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, isCreator = false) => {
    setLoading(true);
    
    try {
      // Try JWT backend first
      try {
        console.log('AuthContext: Attempting JWT registration...');
        const response = await authService.register({ email, password, name });
        console.log('AuthContext: JWT registration successful');
        setAuthMode('jwt');
        setUser(convertJWTUserToLegacy(response.user));
        toast.success('Account created successfully!');
        return;
      } catch (jwtError) {
        console.log('AuthContext: JWT registration failed, trying Supabase...', jwtError);
      }

      // Fallback to Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) {
        toast.error(error.message);
        throw error;
      }

      if (data.user) {
        setAuthMode('supabase');
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            name,
            is_creator: isCreator
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.success('Account created successfully! Please complete your profile.');
        } else {
          toast.success('Account created successfully!');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (authMode === 'jwt') {
        await authService.logout();
      } else if (authMode === 'supabase') {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
      setUser(null);
      setAuthMode('demo');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setAuthMode('demo');
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      if (authMode === 'supabase') {
        const { error } = await supabase
          .from('profiles')
          .update({
            name: updates.name,
            avatar_url: updates.avatar_url,
            is_creator: updates.isCreator
          })
          .eq('id', user.id);

        if (error) {
          toast.error('Error updating profile');
          throw error;
        }
      }
      // For JWT mode, we'd need to call the backend API
      // For demo mode, just update locally

      setUser({ ...user, ...updates });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  // JWT-specific methods
  const hasPermission = (permission: string): boolean => {
    if (authMode === 'jwt') {
      return authService.hasPermission(permission);
    }
    return user?.permissions?.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    if (authMode === 'jwt') {
      return authService.hasRole(role);
    }
    return user?.role === role;
  };

  const isAdmin = (): boolean => {
    if (authMode === 'jwt') {
      return authService.isAdmin();
    }
    return user?.role === 'admin' || hasPermission('admin');
  };

  const isPremium = (): boolean => {
    if (authMode === 'jwt') {
      return authService.isPremium();
    }
    return user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'enterprise';
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
    authMode,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
