import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  roles?: string[];
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  permission, 
  roles, 
  fallback 
}) => {
  const { hasPermission, profile } = useAuth();

  const hasRole = roles ? profile?.roles.some(r => roles.includes(r)) : true;
  const hasPerm = permission ? hasPermission(permission) : true;

  if (hasRole && hasPerm) {
    return <>{children}</>;
  }

  return (
    fallback || (
      <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-center">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900">Access Denied</h3>
        <p className="text-sm text-red-700 mt-2">
          You do not have the required permissions to view this content.
        </p>
      </div>
    )
  );
};
