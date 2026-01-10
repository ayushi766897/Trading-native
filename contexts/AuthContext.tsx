import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { User } from '../services/stockApi';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'lastActive' | 'totalInvested' | 'stocksOwned' | 'loginCount' | 'portfolio' | 'cashBalance'>) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Error getting stored user', e);
      } finally {
        setLoading(false);
      }
    };
    
    loadStoredUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userData = await import('../services/stockApi');
      const authenticatedUser = await userData.stockApi.authenticateUser(email, password);
      
      if (authenticatedUser) {
        setUser(authenticatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(authenticatedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  const register = async (userData: Omit<User, 'id' | 'lastActive' | 'totalInvested' | 'stocksOwned' | 'loginCount' | 'portfolio' | 'cashBalance'>): Promise<boolean> => {
    try {
      const api = await import('../services/stockApi');
      const newUser = await api.stockApi.createUser(userData);
      
      if (newUser) {
        setUser(newUser);
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };

  if (loading) {
    return null; // Or a loading component
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};