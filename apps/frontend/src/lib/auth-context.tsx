'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, AuthUser } from './api';

export interface RolePreset {
  role: string;
  displayName: string;
  name: string;
  email: string;
  legacyEmail: string;
  avatarText: string;
}

export const ROLE_PRESETS: RolePreset[] = [
  { role: 'super_admin', displayName: 'Super Administrator', name: 'Alex Vance', email: 'admin@scriptara.com', legacyEmail: 'admin@inzovate.com', avatarText: 'SA' },
  { role: 'operations_manager', displayName: 'Operations Manager', name: 'David Mercer', email: 'david.m@scriptara.com', legacyEmail: 'david.m@inzovate.com', avatarText: 'OM' },
  { role: 'research_manager', displayName: 'Research Manager', name: 'Elena Rostova', email: 'elena.r@scriptara.com', legacyEmail: 'elena.r@inzovate.com', avatarText: 'RM' },
  { role: 'research_staff', displayName: 'Research Staff / Developer', name: 'Dr. Sarah Chen', email: 'sarah.c@scriptara.com', legacyEmail: 'sarah.c@inzovate.com', avatarText: 'RS' },
  { role: 'quality_analyst', displayName: 'Quality Analyst (QC)', name: 'Marcus Vance', email: 'marcus.v@scriptara.com', legacyEmail: 'marcus.v@inzovate.com', avatarText: 'QA' },
  { role: 'publication_executive', displayName: 'Publication Executive', name: 'Priya Sharma', email: 'priya.s@scriptara.com', legacyEmail: 'priya.s@inzovate.com', avatarText: 'PE' },
  { role: 'client', displayName: 'Client / Author', name: 'Dr. John Reynolds', email: 'reynolds@stanford.edu', legacyEmail: 'reynolds@stanford.edu', avatarText: 'CL' },
  { role: 'finance', displayName: 'Finance & Accounts', name: 'Sophie Taylor', email: 'sophie.t@scriptara.com', legacyEmail: 'sophie.t@inzovate.com', avatarText: 'FN' },
  { role: 'management', displayName: 'Executive Management', name: 'Robert Stirling', email: 'robert.s@scriptara.com', legacyEmail: 'robert.s@inzovate.com', avatarText: 'EM' },
];

interface AuthContextType {
  user: AuthUser | null;
  role: string;
  displayName: string;
  switchRole: (roleKey: string) => void;
  logout: () => void;
  login: (email: string, pass: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'super_admin',
  displayName: 'Super Administrator',
  switchRole: () => {},
  logout: () => {},
  login: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentPreset, setCurrentPreset] = useState<RolePreset>(ROLE_PRESETS[0]);
  const [user, setUser] = useState<AuthUser | null>(null);

  const attemptLogin = async (preset: RolePreset) => {
    // Try Scriptara email first, then fallback to legacy inzovate email
    const emailsToTry = [preset.email, preset.legacyEmail];
    for (const email of emailsToTry) {
      try {
        const res: any = await api.request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password: 'Password123!' }),
        });
        const token = res?.accessToken || res?.tokens?.accessToken;
        if (token) {
          api.setToken(token);
          if (res.user) {
            setUser(res.user);
            return;
          }
        }
      } catch (e) {
        // Try next candidate
      }
    }

    // Local fallback state
    setUser({
      id: 'user-' + preset.role,
      email: preset.email,
      firstName: preset.name.split(' ')[0],
      lastName: preset.name.split(' ')[1] || '',
      role: {
        id: 'role-' + preset.role,
        name: preset.role,
        displayName: preset.displayName,
      },
    });
  };

  useEffect(() => {
    attemptLogin(currentPreset);
  }, [currentPreset]);

  const switchRole = async (roleKey: string) => {
    const found = ROLE_PRESETS.find((p) => p.role === roleKey);
    if (found) {
      setCurrentPreset(found);
      await attemptLogin(found);
    }
  };

  const logout = () => {
    api.setToken(null);
    switchRole('super_admin');
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res: any = await api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });
      const token = res?.accessToken || res?.tokens?.accessToken;
      if (token) {
        api.setToken(token);
        setUser(res.user);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentPreset.role,
        displayName: currentPreset.displayName,
        switchRole,
        logout,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
