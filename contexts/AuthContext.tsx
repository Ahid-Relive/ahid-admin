'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setCredentials, logout as logoutAction } from '@/lib/features/auth/authSlice';

interface AdminPermissions {
  canManageUsers: boolean;
  canManageBrands: boolean;
  canManageCategories: boolean;
  canManagePosts: boolean;
  canViewAnalytics: boolean;
  canManageAdmins: boolean;
}

interface AdminProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: AdminPermissions;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

interface AuthContextType {
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, admin: AdminProfile) => void;
  logout: () => void;
  hasPermission: (permission: keyof AdminPermissions) => boolean;
  isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { admin, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('adminProfile');

    if (storedToken && storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        dispatch(setCredentials({ token: storedToken, admin: adminData }));
      } catch (error) {
        console.error('Failed to parse stored admin data:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminProfile');
      }
    }

    setIsLoading(false);
  }, [dispatch]);

  const login = (token: string, admin: AdminProfile) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminProfile', JSON.stringify(admin));
    dispatch(setCredentials({ token, admin }));
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminProfile');
    dispatch(logoutAction());
  };

  const hasPermission = (permission: keyof AdminPermissions): boolean => {
    if (!admin) return false;
    if (admin.role === 'super_admin') return true;
    return admin.permissions[permission] === true;
  };

  const isSuperAdmin = (): boolean => {
    return admin?.role === 'super_admin';
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated,
        isLoading,
        login,
        logout,
        hasPermission,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
