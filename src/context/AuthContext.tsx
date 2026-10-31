import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../types';
import { api, setStoredToken, getStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (data: { full_name: string; email: string; phone_number?: string; password: string }) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => void;
  switchDemoUser: () => Promise<void>;
  updateUser: (updates: Partial<User> & { new_password?: string }) => Promise<void>;
  refreshUserData: () => Promise<void>;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  completeOnboarding: (data: { currency: string; primary_network: string; monthly_budget: number }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getCurrentUser();
      setUser(res.user);
      if (!res.user.onboarded) {
        setIsOnboardingOpen(true);
      }
    } catch (err) {
      console.warn('Failed to load user session, loading demo account:', err);
      // Auto fallback to demo user for a smooth zero-friction initial render
      try {
        const demoRes = await api.switchDemo();
        setUser(demoRes.user);
      } catch {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (identifier: string, pass: string) => {
    const res = await api.login({ identifier, password: pass });
    setUser(res.user);
    if (!res.user.onboarded) {
      setIsOnboardingOpen(true);
    }
  };

  const register = async (data: { full_name: string; email: string; phone_number?: string; password: string }) => {
    const res = await api.register(data);
    setUser(res.user);
    setIsOnboardingOpen(true); // Guide new user through onboarding immediately
  };

  const googleLogin = async () => {
    const res = await api.googleLogin({
      email: 'adedayogafarayomide@gmail.com',
      name: 'Adedayo Ayomide',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });
    setUser(res.user);
    if (!res.user.onboarded) {
      setIsOnboardingOpen(true);
    }
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
  };

  const switchDemoUser = async () => {
    const res = await api.switchDemo();
    setUser(res.user);
  };

  const updateUser = async (updates: Partial<User> & { new_password?: string }) => {
    const res = await api.updateProfile(updates);
    setUser(res.user);
  };

  const completeOnboarding = async (data: { currency: string; primary_network: string; monthly_budget: number }) => {
    const res = await api.completeOnboarding(data);
    setUser(res.user);
    setIsOnboardingOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        switchDemoUser,
        updateUser,
        refreshUserData: fetchUser,
        isOnboardingOpen,
        setIsOnboardingOpen,
        completeOnboarding,
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
