import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'astronaut' | 'surgeon';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  callsignOrCredential: string;
  title: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithRole: (role: UserRole) => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'astrocare_demo_auth_role';

const DEMO_USERS: Record<UserRole, AuthUser> = {
  astronaut: {
    id: 'ASTRO-74-SJ',
    name: 'Dr. Salma Johnson',
    email: 'salma.johnson@nasa-exp74.sim',
    role: 'astronaut',
    callsignOrCredential: 'Callsign: Nova',
    title: 'Mission Specialist / Payload Bio-Engineer',
  },
  surgeon: {
    id: 'NASA-FS-9842',
    name: 'Dr. Marcus Vance, M.D., FACEP',
    email: 'marcus.vance@jsc-medcom.sim',
    role: 'surgeon',
    callsignOrCredential: 'Badge: NASA-FS-9842',
    title: 'Lead Flight Surgeon · JSC Aerospace Medicine',
  },
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedRole = window.localStorage.getItem(AUTH_STORAGE_KEY) as UserRole | null;
      if (storedRole === 'astronaut' || storedRole === 'surgeon') {
        setUser(DEMO_USERS[storedRole]);
      }
    } catch {
      // Ignore storage access errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithRole = (selectedRole: UserRole) => {
    const demoUser = DEMO_USERS[selectedRole];
    setUser(demoUser);
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, selectedRole);
    } catch {
      // Ignore storage access errors
    }
  };

  const logout = () => {
    setUser(null);
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore storage access errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isAuthenticated: Boolean(user),
        isLoading,
        loginWithRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
