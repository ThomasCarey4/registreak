import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '@/services/api';

interface User {
  student_id: string;
  username: string;
  is_staff: boolean;
  current_streak?: number;
  longest_streak?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, studentId: string, isStaff?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: (studentId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore token and user on app start
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const savedToken = await apiService.getToken();
      if (savedToken) {
        setToken(savedToken);
        // Decode the JWT payload to restore the user object
        try {
          const base64Url = savedToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(atob(base64));
          setUser({
            student_id: payload.student_id,
            username: payload.username,
            is_staff: payload.is_staff,
          });
        } catch {
          // Token malformed – clear it
          await apiService.clearToken();
          setToken(null);
        }
      }
    } catch (e) {
      // Restoring token failed
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await apiService.login(username, password);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, password: string, studentId: string, isStaff: boolean = false) => {
    try {
      const response = await apiService.register(username, password, studentId, isStaff);
      await apiService.setToken(response.token);
      setToken(response.token);
      setUser({ student_id: studentId, username, is_staff: isStaff });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async (studentId: string) => {
    try {
      const details = await apiService.getUserDetails(studentId);
      setUser(prev => prev ? { ...prev, ...details } : details);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
