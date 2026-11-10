'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, NotificationItem } from '../types';
import { ApiClient } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: 'customer' | 'staff' | 'admin') => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const storedToken = localStorage.getItem('careathome_token');
    const storedUser = localStorage.getItem('careathome_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
        // Verify with /api/auth/me in background
        ApiClient.get<User>('/auth/me')
          .then((freshUser) => {
            setUser(freshUser);
            localStorage.setItem('careathome_user', JSON.stringify(freshUser));
          })
          .catch(() => {
            // Token might be invalid/expired
          });
      } catch (e) {
        localStorage.removeItem('careathome_token');
        localStorage.removeItem('careathome_user');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user && token) {
      refreshNotifications();
    }
  }, [user, token]);

  const refreshNotifications = async () => {
    try {
      const notifs = await ApiClient.get<NotificationItem[]>('/notifications');
      setNotifications(notifs || []);
    } catch (e) {
      // Ignore background errors
    }
  };

  const markNotificationRead = async (id: number) => {
    try {
      await ApiClient.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await ApiClient.post('/auth/login', { email, password });
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('careathome_token', data.access_token);
      localStorage.setItem('careathome_refresh_token', data.refresh_token);
      localStorage.setItem('careathome_user', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const data = await ApiClient.post('/auth/register', userData);
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('careathome_token', data.access_token);
      localStorage.setItem('careathome_refresh_token', data.refresh_token);
      localStorage.setItem('careathome_user', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async (role: 'customer' | 'staff' | 'admin') => {
    const creds = {
      customer: { email: 'ananya.sharma@example.com', password: 'Customer@123' },
      staff: { email: 'rahul.phlebo@careathome.in', password: 'Staff@123' },
      admin: { email: 'admin@careathome.in', password: 'Admin@123' },
    }[role];

    await login(creds.email, creds.password);
  };

  const updateProfile = async (profileData: any) => {
    const updated = await ApiClient.put<User>('/auth/profile', profileData);
    setUser(updated);
    localStorage.setItem('careathome_user', JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('careathome_token');
    localStorage.removeItem('careathome_refresh_token');
    localStorage.removeItem('careathome_user');
  };

  const unreadNotifsCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        notifications,
        unreadNotifsCount,
        login,
        register,
        logout,
        quickDemoLogin,
        updateProfile,
        refreshNotifications,
        markNotificationRead,
      }}
    >
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

