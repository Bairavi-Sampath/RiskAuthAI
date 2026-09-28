import React, { createContext, useContext, useState } from 'react';
import { MOCK_USERS } from '../services/mockData';
import { UserAccount } from '../services/types';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: UserAccount;
  loginAsDemoAdmin: () => void;
  loginWithEmail: (email: string) => Promise<{ success: boolean; requiresOtp?: boolean; riskScore?: number }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount>(MOCK_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Pre-authenticated for frictionless console review

  const loginAsDemoAdmin = () => {
    setCurrentUser(MOCK_USERS[0]);
    setIsAuthenticated(true);
  };

  const loginWithEmail = async (email: string) => {
    // Simulated credential check
    const matched = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setCurrentUser(matched);
      setIsAuthenticated(true);
      return { success: true, riskScore: matched.avgRiskScore };
    }

    // Default to Elena if user is testing a new email
    const newUser: UserAccount = {
      id: 'usr_' + Math.random().toString(36).substring(2, 6),
      name: email.split('@')[0].replace('.', ' '),
      email,
      role: 'SOC Analyst',
      status: 'Active',
      riskLevel: 'LOW',
      avgRiskScore: 16,
      lastLogin: 'Just now',
      trustedDevicesCount: 1,
      department: 'Security Operations',
    };
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    return { success: true, riskScore: 16 };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        loginAsDemoAdmin,
        loginWithEmail,
        logout,
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
