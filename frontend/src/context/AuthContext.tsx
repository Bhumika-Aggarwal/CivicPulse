import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'CITIZEN' | 'WORKER' | 'SUPERVISOR' | 'ADMIN';
  departmentId?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved session or call /me
    const saved = localStorage.getItem('civicpulse_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('civicpulse_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User, token?: string) => {
    setUser(userData);
    localStorage.setItem('civicpulse_user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('civicpulse_token', token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('civicpulse_user');
    localStorage.removeItem('civicpulse_token');
    fetch('http://localhost:4000/api/v1/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
