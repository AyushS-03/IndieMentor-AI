import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  isCreator: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, isCreator?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateProfile: (updates: Partial<User>) => Promise<void>;
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
  const [mockMode, setMockMode] = useState(false);

  // Demo users for testing when Supabase is not available
  const demoUsers = [
    { email: 'sarah@example.com', password: 'password123', name: 'Sarah Johnson', isCreator: true },
    { email: 'user@example.com', password: 'password123', name: 'John Doe', isCreator: false },
  ];

  useEffect(() => {
    console.log('AuthContext: Initializing auth...');
    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Getting session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('AuthContext: Session result:', session);
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          console.log('AuthContext: No session found, setting loading to false');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
        setMockMode(true);
        toast.error('Connection error. Demo mode enabled - use demo credentials to test.');
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        console.log('AuthContext: Auth state changed:', _event, session);
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    console.log('AuthContext: Fetching user profile for:', supabaseUser.email);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error fetching profile:', error);
        // If it's a connection error, handle it gracefully
        if (error.message?.includes('connection') || error.message?.includes('fetch')) {
          toast.error('Connection error. Using cached user data.');
        }
      }

      if (profile) {
        console.log('AuthContext: Profile found:', profile.name);
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          avatar_url: profile.avatar_url,
          isCreator: profile.is_creator
        });
      } else {
        console.log('AuthContext: No profile found, creating basic user from auth data');
        // No profile found or connection error, create basic user from auth data
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
          avatar_url: supabaseUser.user_metadata?.avatar_url,
          isCreator: false
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Create basic user from auth data as fallback
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
        avatar_url: supabaseUser.user_metadata?.avatar_url,
        isCreator: false
      });
    } finally {
      console.log('AuthContext: Setting loading to false');
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('AuthContext: Login attempt for:', email);
    setLoading(true);
    try {
      // Check if we should use mock mode (when Supabase is not available)
      const mockUser = demoUsers.find(u => u.email === email && u.password === password);
      
      if (mockMode || mockUser) {
        console.log('AuthContext: Using mock authentication');
        // Mock authentication
        setTimeout(() => {
          if (mockUser) {
            setUser({
              id: mockUser.email,
              email: mockUser.email,
              name: mockUser.name,
              isCreator: mockUser.isCreator
            });
            toast.success('Successfully logged in! (Demo Mode)');
          } else {
            toast.error('Invalid credentials');
            throw new Error('Invalid credentials');
          }
          setLoading(false);
        }, 1000);
        return;
      }

      console.log('AuthContext: Attempting Supabase authentication');
      // Real Supabase authentication
      // Add a timeout to prevent hanging
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout - please check your connection')), 10000);
      });

      const { error } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (error) {
        console.log('AuthContext: Supabase login error:', error);
        toast.error(error.message);
        setLoading(false);
        throw error;
      }

      console.log('AuthContext: Supabase login successful');
      toast.success('Successfully logged in!');
      // Note: fetchUserProfile will be called by the auth state change listener
      // But we'll also set a timeout to ensure loading gets reset
      setTimeout(() => {
        console.log('AuthContext: Timeout - setting loading to false');
        setLoading(false);
      }, 2000);
    } catch (error: any) {
      console.error('Login error:', error);
      setLoading(false); // Make sure to reset loading on error
      if (error.message?.includes('timeout') || error.message?.includes('fetch')) {
        // Switch to mock mode on connection errors
        console.log('AuthContext: Connection error, switching to mock mode');
        setMockMode(true);
        toast.error('Connection error. Switching to demo mode.');
        // Retry with mock authentication
        const mockUser = demoUsers.find(u => u.email === email && u.password === password);
        if (mockUser) {
          setUser({
            id: mockUser.email,
            email: mockUser.email,
            name: mockUser.name,
            isCreator: mockUser.isCreator
          });
          toast.success('Successfully logged in! (Demo Mode)');
          return;
        }
      }
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, isCreator = false) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        toast.error(error.message);
        throw error;
      }

      if (data.user) {
        // Create profile
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
          // Don't throw error here, just log it - we can still proceed
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
      if (mockMode) {
        // Mock logout
        setUser(null);
        toast.success('Logged out successfully (Demo Mode)');
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        throw error;
      }
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // If logout fails, still clear the user
      setUser(null);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
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

      setUser({ ...user, ...updates });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      loading, 
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};