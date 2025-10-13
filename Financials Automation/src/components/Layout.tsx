import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  TableCellsIcon, 
  ChartBarIcon, 
  CogIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  CalculatorIcon,
  UsersIcon,
  QuestionMarkCircleIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  DocumentDuplicateIcon,
  CreditCardIcon,
  CubeIcon,
  SparklesIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import DesktopFileManager from './DesktopFileManager';
import CompanySelector from './CompanySelector';
import DatabaseConnectionStatus from './DatabaseConnectionStatus';
import { useAuth, useAuthStore } from '~/stores/authStore';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Common Control', href: '/common-control', icon: CogIcon },
  { name: 'Trial Balance', href: '/trial-balance', icon: TableCellsIcon },
  
  // Input Schedules Section
  { name: 'Share Capital', href: '/share-capital', icon: BanknotesIcon },
  { name: 'PPE Schedule', href: '/ppe-schedule', icon: BuildingOfficeIcon },
  { name: 'Investments', href: '/investments', icon: ChartBarIcon },
  { name: 'Employee Benefits', href: '/employee-benefits', icon: UserGroupIcon },
  { name: 'Deferred Tax', href: '/deferred-tax', icon: DocumentTextIcon },
  { name: 'Contingent Liabilities', href: '/contingent-liabilities', icon: ExclamationTriangleIcon },
  
  // Other Data Management
  { name: 'Related Parties', href: '/related-parties', icon: UsersIcon },
  { name: 'Notes Selection', href: '/notes-selection', icon: ClipboardDocumentListIcon },
  { name: 'Accounting Policies', href: '/accounting-policies', icon: DocumentTextIcon },
  
  // Financial Statements
  { name: 'Balance Sheet', href: '/balance-sheet', icon: DocumentTextIcon },
  { name: 'P&L Statement', href: '/profit-loss', icon: ChartBarIcon },
  { name: 'Cash Flow', href: '/cash-flow', icon: CreditCardIcon },
  { name: 'Aging Schedules', href: '/aging-schedules', icon: ClockIcon },
  { name: 'Ratio Analysis', href: '/ratio-analysis', icon: CalculatorIcon },
  { name: 'Compliance Dashboard', href: '/compliance-dashboard', icon: ShieldCheckIcon },
  
  { name: 'Help', href: '/help', icon: QuestionMarkCircleIcon },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, token, fullName, isAuthenticated } = useAuth();
  const clearAuth = useAuthStore(state => state.clearAuth);
  const trpc = useTRPC();
  
  const logoutMutation = useMutation(trpc.logout.mutationOptions({
    onSuccess: () => {
      clearAuth();
      toast.success('Logged out successfully');
      // Navigation will be handled by route protection
    },
    onError: (error) => {
      // Even if logout fails on server, clear local auth
      clearAuth();
      toast.error('Logout failed, but you have been signed out locally');
    },
  }));
  
  const handleLogout = async () => {
    if (token) {
      await logoutMutation.mutateAsync({ token });
    } else {
      clearAuth();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                  Financial Automation Tool
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Schedule III Compliant Financial Statement Generator
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <CompanySelector />
              {isAuthenticated && user && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <UserCircleIcon className="h-5 w-5" />
                    <span>Welcome, {fullName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Generate Financials
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="bg-white w-64 min-h-screen border-r border-gray-200 shadow-sm">
          <div className="p-4">
            <div className="space-y-1">
              {navigation.slice(0, 3).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            
            {/* Input Schedules Section */}
            <div className="mt-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Input Schedules
              </h3>
              <div className="mt-2 space-y-1">
                {navigation.slice(3, 9).map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* Other Data Section */}
            <div className="mt-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Other Data
              </h3>
              <div className="mt-2 space-y-1">
                {navigation.slice(9, 12).map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* Financial Statements Section */}
            <div className="mt-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Financial Statements
              </h3>
              <div className="mt-2 space-y-1">
                {navigation.slice(12, 18).map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* Help Section */}
            <div className="mt-6">
              <div className="space-y-1">
                {navigation.slice(18).map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Database Connection Status */}
          <div className="mt-8 p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Database Status</h3>
            <DatabaseConnectionStatus />
          </div>
          
          {/* Quick Stats */}
          <div className="mt-8 p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Trial Balance Entries:</span>
                <span className="font-medium">Loading...</span>
              </div>
              <div className="flex justify-between">
                <span>Selected Notes:</span>
                <span className="font-medium">Loading...</span>
              </div>
              <div className="flex justify-between">
                <span>Entity Configured:</span>
                <span className="font-medium">Loading...</span>
              </div>
              <div className="flex justify-between">
                <span>Last Generated:</span>
                <span className="font-medium">Never</span>
              </div>
            </div>
          </div>

          {/* Desktop File Manager - only shows in Electron */}
          <div className="mt-8">
            <DesktopFileManager />
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
