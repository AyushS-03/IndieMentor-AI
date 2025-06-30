import { jwtDecode, JwtPayload } from 'jwt-decode';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';
const TOKEN_KEY = 'authToken';

// JWT payload interface based on backend implementation
export interface CustomJwtPayload extends JwtPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  roleId: number;
  subscriptionTier: string;
  permissions: string[];
  isActive: boolean;
}

// User interface from backend
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: string;
  roleId: number;
  subscriptionTier: string;
  permissions: string[];
  lastLogin?: string;
}

// Auth response interfaces
export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface ValidationResponse {
  valid: boolean;
  payload?: CustomJwtPayload & {
    issuedAt: string;
    expiresAt: string;
  };
  user?: User;
  expired?: boolean;
  message?: string;
  expiredAt?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeAuth();
  }

  // Initialize auth from localStorage
  private initializeAuth(): void {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      try {
        const tokenData = JSON.parse(stored);
        this.token = tokenData.token;
        this.user = tokenData.user;
        this.scheduleTokenRefresh();
      } catch (error) {
        console.error('Failed to parse stored auth data:', error);
        this.clearAuth();
      }
    }
  }

  // Store auth data
  private storeAuth(token: string, user: User): void {
    this.token = token;
    this.user = user;
    localStorage.setItem(TOKEN_KEY, JSON.stringify({ token, user }));
    this.scheduleTokenRefresh();
  }

  // Clear auth data
  private clearAuth(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem(TOKEN_KEY);
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Schedule automatic token refresh
  private scheduleTokenRefresh(): void {
    if (!this.token) return;

    try {
      const decoded = jwtDecode<CustomJwtPayload>(this.token);
      const expiresAt = decoded.exp! * 1000;
      const now = Date.now();
      const refreshAt = expiresAt - (30 * 60 * 1000); // Refresh 30 minutes before expiry

      if (refreshAt > now) {
        this.refreshTimer = setTimeout(() => {
          this.refreshToken();
        }, refreshAt - now);
      }
    } catch (error) {
      console.error('Failed to schedule token refresh:', error);
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'Registration failed');
    }

    const result: LoginResponse = await response.json();
    this.storeAuth(result.token, result.user);
    return result;
  }

  // Login user
  async login(data: LoginData): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'Login failed');
    }

    const result: LoginResponse = await response.json();
    this.storeAuth(result.token, result.user);
    return result;
  }

  // Logout user
  async logout(): Promise<void> {
    if (this.token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }
    this.clearAuth();
  }

  // Validate current token
  async validateToken(): Promise<ValidationResponse> {
    if (!this.token) {
      return { valid: false, message: 'No token found' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: this.token }),
      });

      const result: ValidationResponse = await response.json();

      if (!result.valid) {
        if (result.expired) {
          this.clearAuth();
        }
        return result;
      }

      // Update user data if validation successful
      if (result.user) {
        this.user = result.user;
        this.storeAuth(this.token, result.user);
      }

      return result;
    } catch (error) {
      console.error('Token validation failed:', error);
      return { valid: false, message: 'Validation request failed' };
    }
  }

  // Refresh token
  async refreshToken(): Promise<boolean> {
    if (!this.token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.clearAuth();
        return false;
      }

      const result: LoginResponse = await response.json();
      this.storeAuth(result.token, result.user);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuth();
      return false;
    }
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Get current user
  getUser(): User | null {
    return this.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    if (!this.token) return true;

    try {
      const decoded = jwtDecode<CustomJwtPayload>(this.token);
      const now = Date.now() / 1000;
      return decoded.exp! < now;
    } catch {
      return true;
    }
  }

  // Get decoded token payload
  getTokenPayload(): CustomJwtPayload | null {
    if (!this.token) return null;

    try {
      return jwtDecode<CustomJwtPayload>(this.token);
    } catch {
      return null;
    }
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    return this.user?.permissions?.includes(permission) || false;
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  // Check if user has admin privileges
  isAdmin(): boolean {
    return this.hasRole('admin') || this.hasPermission('admin');
  }

  // Check if user has premium subscription
  isPremium(): boolean {
    return this.user?.subscriptionTier === 'premium' || this.user?.subscriptionTier === 'enterprise';
  }

  // Get authorization header
  getAuthHeader(): Record<string, string> {
    if (!this.token) return {};
    return {
      'Authorization': `Bearer ${this.token}`,
    };
  }

  // Make authenticated API request
  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle token expiration
    if (response.status === 401) {
      const isRefreshed = await this.refreshToken();
      if (isRefreshed) {
        // Retry with new token
        const newHeaders = {
          ...headers,
          ...this.getAuthHeader(),
        };
        return fetch(url, {
          ...options,
          headers: newHeaders,
        });
      } else {
        this.clearAuth();
        throw new Error('Authentication required');
      }
    }

    return response;
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export convenient hooks for React components
export const useAuth = () => {
  return {
    user: authService.getUser(),
    token: authService.getToken(),
    isAuthenticated: authService.isAuthenticated(),
    isTokenExpired: authService.isTokenExpired(),
    hasPermission: (permission: string) => authService.hasPermission(permission),
    hasRole: (role: string) => authService.hasRole(role),
    isAdmin: () => authService.isAdmin(),
    isPremium: () => authService.isPremium(),
    login: (data: LoginData) => authService.login(data),
    register: (data: RegisterData) => authService.register(data),
    logout: () => authService.logout(),
    validateToken: () => authService.validateToken(),
    refreshToken: () => authService.refreshToken(),
  };
};

export default authService;
