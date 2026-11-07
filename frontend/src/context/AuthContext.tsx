import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email?: string, password?: string, role?: UserRole) => Promise<User>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize user session
    const current = authService.getCurrentUser();
    setUser(current);
  }, []);

  const login = async (email?: string, password?: string, role: UserRole = 'Incident Commander') => {
    const loggedIn = await authService.login(email, password, role);
    setUser(loggedIn);
    return loggedIn;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    const updated = authService.switchRole(role);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
