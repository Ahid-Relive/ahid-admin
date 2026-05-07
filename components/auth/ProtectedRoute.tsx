'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requireSuperAdmin?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredPermission, 
  requireSuperAdmin 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, isSuperAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (requireSuperAdmin && !isSuperAdmin()) {
        router.push('/dashboard');
        return;
      }

      if (requiredPermission && !hasPermission(requiredPermission as any)) {
        router.push('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, isLoading, requiredPermission, requireSuperAdmin, router, hasPermission, isSuperAdmin]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireSuperAdmin && !isSuperAdmin()) {
    return null;
  }

  if (requiredPermission && !hasPermission(requiredPermission as any)) {
    return null;
  }

  return <>{children}</>;
}
