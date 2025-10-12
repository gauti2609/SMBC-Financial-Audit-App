import React from 'react';
import { useAuth } from '~/stores/authStore';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGuard({ 
  children, 
  fallback,
  requireAdmin = false 
}: AuthGuardProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return fallback || (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <ShieldExclamationIcon className="h-6 w-6 text-yellow-600 mr-2" />
          <div>
            <h3 className="text-lg font-medium text-yellow-800">
              Authentication Required
            </h3>
            <p className="text-yellow-700 mt-1">
              Please log in to access this content.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  if (requireAdmin && !isAdmin) {
    return fallback || (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <ShieldExclamationIcon className="h-6 w-6 text-red-600 mr-2" />
          <div>
            <h3 className="text-lg font-medium text-red-800">
              Admin Access Required
            </h3>
            <p className="text-red-700 mt-1">
              You need administrator privileges to access this content.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
