import {
  Outlet,
  createRootRoute,
  useRouterState,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { useEffect } from 'react';
import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "react-hot-toast";
import { useAuth } from '~/stores/authStore';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const isFetching = useRouterState({ select: (s) => s.isLoading });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if current route is public (login/register)
  const isPublicRoute = location.pathname === '/login' || location.pathname === '/register';
  
  useEffect(() => {
    // Redirect to login if not authenticated and not on a public route
    if (!isAuthenticated && !isPublicRoute && !isFetching) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, isPublicRoute, isFetching, navigate]);
  
  // Show loading for unauthenticated users on protected routes
  if (!isAuthenticated && !isPublicRoute) {
    return (
      <TRPCReactProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Checking authentication...</p>
          </div>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              fontFamily: 'Bookman Old Style, serif',
            },
          }}
        />
      </TRPCReactProvider>
    );
  }

  return (
    <TRPCReactProvider>
      {isFetching ? (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Loading Financial Automation Tool...</p>
            <p className="text-sm text-gray-500 mt-2">Preparing your workspace</p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <Outlet />
        </div>
      )}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontFamily: 'Bookman Old Style, serif',
          },
        }}
      />
    </TRPCReactProvider>
  );
}
