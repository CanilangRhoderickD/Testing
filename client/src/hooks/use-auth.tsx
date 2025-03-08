import React, { useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<User>;
  register: (username: string, password: string, age: number) => Promise<User>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/api/user', { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    const response = await axios.post('/api/login', { username, password });
    setUser(response.data);
    return response.data;
  };

  const register = async (username: string, password: string, age: number): Promise<User> => {
    const response = await axios.post('/api/register', { username, password, age }, { withCredentials: true });
    setUser(response.data);
    return response.data;
  };

  const logout = async (): Promise<void> => {
    await axios.post('/api/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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