import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    idNumber?: string;
    password?: string;
  }) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => Promise<void>;
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
}

const defaultClientUser: User = {
  id: 'usr_client_001',
  email: 'client@royalsquare.co.za',
  name: 'Sipho Dlamini',
  role: 'client',
  phone: '+27 82 459 8920',
  idNumber: '8803155123088',
  taxNumber: '9482103492',
  adviserId: 'usr_adv_001',
  twoFactorEnabled: true,
};

const defaultAdviserUser: User = {
  id: 'usr_adv_001',
  email: 'adviser@royalsquare.co.za',
  name: 'Johan van der Merwe, CFP®',
  role: 'adviser',
  phone: '+27 83 912 4001',
  idNumber: '7506125021081',
  taxNumber: '9120485719',
  twoFactorEnabled: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('rsf_role') as UserRole) || 'client';
  });

  const [user, setUser] = useState<User | null>(() => {
    const savedRole = localStorage.getItem('rsf_role') as UserRole | null;
    const savedUser = localStorage.getItem('rsf_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        // ignore JSON parse failure
      }
    }
    // If there was a saved role in this session
    if (savedRole === 'adviser') return defaultAdviserUser;
    if (savedRole === 'client') return defaultClientUser;
    return defaultClientUser;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('usr_client_001');

  useEffect(() => {
    if (role) {
      localStorage.setItem('rsf_role', role);
    }
    if (user) {
      localStorage.setItem('rsf_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rsf_user');
    }
    localStorage.setItem('rsf_client_id', selectedClientId);
  }, [role, user, selectedClientId]);

  const login = async (email: string, targetRole: UserRole) => {
    setLoading(true);
    try {
      const res = await api.auth.login(email, targetRole);
      localStorage.setItem('rsf_token', res.token);
      localStorage.setItem('rsf_role', res.user.role);
      localStorage.setItem('rsf_user', JSON.stringify(res.user));
      setUser(res.user);
      setRole(res.user.role);
    } catch (err) {
      console.warn('Backend login fallback to local persona:', err);
      const fallbackUser = targetRole === 'adviser' ? defaultAdviserUser : defaultClientUser;
      setUser(fallbackUser);
      setRole(targetRole);
      localStorage.setItem('rsf_role', targetRole);
      localStorage.setItem('rsf_user', JSON.stringify(fallbackUser));
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    idNumber?: string;
    password?: string;
  }) => {
    setLoading(true);
    try {
      const res = await api.auth.register(data);
      localStorage.setItem('rsf_token', res.token);
      localStorage.setItem('rsf_role', res.user.role);
      localStorage.setItem('rsf_user', JSON.stringify(res.user));
      setUser(res.user);
      setRole(res.user.role);
    } catch (err) {
      console.warn('Backend register fallback to local user:', err);
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        idNumber: data.idNumber,
        twoFactorEnabled: true,
      };
      setUser(newUser);
      setRole(data.role);
      localStorage.setItem('rsf_role', data.role);
      localStorage.setItem('rsf_user', JSON.stringify(newUser));
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (newRole: UserRole) => {
    setLoading(true);
    try {
      const email = newRole === 'adviser' ? 'adviser@royalsquare.co.za' : 'client@royalsquare.co.za';
      await login(email, newRole);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('rsf_token');
    localStorage.removeItem('rsf_role');
    localStorage.removeItem('rsf_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        switchRole,
        selectedClientId,
        setSelectedClientId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
