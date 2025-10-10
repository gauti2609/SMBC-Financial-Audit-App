import { createFileRoute, Link } from "@tanstack/react-router";
import { useTRPC } from '~/trpc/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Layout from "~/components/Layout";
import { 
  PlusIcon, 
  DocumentArrowUpIcon, 
  ChartBarIcon, 
  BanknotesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  DocumentTextIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '~/stores/authStore';
import { useSelectedCompany } from '~/stores/companyStore';

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const trpc = useTRPC();
  const { token, isAuthenticated } = useAuth();
  const { selectedCompanyId } = useSelectedCompany();
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Only fetch data if authenticated and company is selected
  const canFetchData = isAuthenticated && !!token && !!selectedCompanyId;
  
  // Fetch data for dashboard using correct tRPC pattern with auth
  const trialBalanceQuery = useQuery(
    trpc.getTrialBalance.queryOptions(
      { companyId: selectedCompanyId || '' },
      { enabled: canFetchData }
    )
  );
  
  const commonControlQuery = useQuery(
    trpc.getCommonControl.queryOptions(
      { companyId: selectedCompanyId || '' },
      { enabled: canFetchData }
    )
  );
  
  const noteSelectionsQuery = useQuery(
    trpc.getNoteSelections.queryOptions(
      { companyId: selectedCompanyId || '' },
      { enabled: canFetchData }
    )
  );
  
  // Initialize default note selections
  const initializeNotesMutation = useMutation(
    trpc.initializeNoteSelections.mutationOptions({
      onSuccess: () => {
        toast.success('Default note selections initialized successfully!');
        noteSelectionsQuery.refetch();
      },
      onError: (error) => {
        toast.error('Failed to initialize note selections: ' + error.message);
      },
    })
  );

  const handleInitializeNotes = async () => {
    if (!selectedCompanyId) {
      toast.error('Please select a company first');
      return;
    }
    
    setIsInitializing(true);
    try {
      await initializeNotesMutation.mutateAsync({ companyId: selectedCompanyId });
    } finally {
      setIsInitializing(false);
    }
  };

  // Show company selection prompt if no company is selected
  if (!selectedCompanyId) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <CogIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Select a Company
            </h2>
            <p className="text-gray-600 mb-6">
              Please select or create a company to get started with your financial statements.
            </p>
            <p className="text-sm text-gray-500">
              Use the company selector in the header above to choose an existing company or create a new one.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      name: 'Trial Balance Entries',
      value: trialBalanceQuery.data?.length || 0,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase' as const,
    },
    {
      name: 'Selected Notes',
      value: noteSelectionsQuery.data?.filter(note => note.userSelected).length || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      change: '+5',
      changeType: 'increase' as const,
    },
    {
      name: 'Financial Year',
      value: commonControlQuery.data?.financialYearEnd 
        ? new Date(commonControlQuery.data.financialYearEnd).getFullYear().toString()
        : 'Not Set',
      icon: ClockIcon,
      color: 'bg-purple-500',
      change: 'Current',
      changeType: 'neutral' as const,
    },
    {
      name: 'Entity Configured',
      value: commonControlQuery.data?.entityName ? 'Yes' : 'No',
      icon: CogIcon,
      color: commonControlQuery.data?.entityName ? 'bg-green-500' : 'bg-red-500',
      change: commonControlQuery.data?.entityName ? 'Ready' : 'Pending',
      changeType: commonControlQuery.data?.entityName ? 'increase' as const : 'decrease' as const,
    },
  ];

  const quickActions = [
    {
      name: 'Upload Trial Balance',
      description: 'Import your trial balance data from Excel',
      href: '/trial-balance',
      icon: DocumentArrowUpIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Configure Entity',
      description: 'Set up entity details and preferences',
      href: '/common-control',
      icon: CogIcon,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      name: 'Select Notes',
      description: 'Choose which notes to include in statements',
      href: '/notes-selection',
      icon: DocumentTextIcon,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      name: 'View Balance Sheet',
      description: 'Generate and review balance sheet',
      href: '/balance-sheet',
      icon: BanknotesIcon,
      color: 'bg-indigo-600 hover:bg-indigo-700',
    },
  ];

  const recentActivity = [
    { action: 'Trial Balance uploaded', time: '2 hours ago', status: 'completed' },
    { action: 'Balance Sheet generated', time: '1 day ago', status: 'completed' },
    { action: 'Notes selection updated', time: '2 days ago', status: 'completed' },
    { action: 'Entity configuration saved', time: '3 days ago', status: 'completed' },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Bookman Old Style, serif' }}>
              Welcome to Financial Automation
            </h1>
            <p className="text-xl mb-6 text-blue-100">
              Generate Schedule III compliant financial statements with automated calculations, 
              comprehensive notes, and professional formatting.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/trial-balance"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Get Started
              </Link>
              <button
                onClick={handleInitializeNotes}
                disabled={isInitializing}
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors disabled:opacity-50"
              >
                {isInitializing ? 'Initializing...' : 'Initialize Notes'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm ${
                  stat.changeType === 'increase' ? 'text-green-600' : 
                  stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className={`${action.color} text-white p-6 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}
              >
                <action.icon className="h-8 w-8 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{action.name}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Database Connection</span>
                <span className="flex items-center text-green-600">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Trial Balance Status</span>
                <span className={`flex items-center ${
                  trialBalanceQuery.data?.length ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {trialBalanceQuery.data?.length ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Loaded ({trialBalanceQuery.data.length} entries)
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      Not Loaded
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Entity Configuration</span>
                <span className={`flex items-center ${
                  commonControlQuery.data?.entityName ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {commonControlQuery.data?.entityName ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Configured
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      Pending Setup
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Note Selections</span>
                <span className={`flex items-center ${
                  noteSelectionsQuery.data?.length ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {noteSelectionsQuery.data?.length ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Ready ({noteSelectionsQuery.data.length} notes)
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      Not Initialized
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        {(!commonControlQuery.data?.entityName || !trialBalanceQuery.data?.length) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex">
              <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 mt-1" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-amber-800">Setup Required</h3>
                <p className="text-amber-700 mt-1">
                  To get started with financial statement generation, please complete the following steps:
                </p>
                <ul className="mt-3 space-y-1 text-sm text-amber-700">
                  {!commonControlQuery.data?.entityName && (
                    <li>• Configure entity details in Common Control</li>
                  )}
                  {!trialBalanceQuery.data?.length && (
                    <li>• Upload your trial balance data</li>
                  )}
                  {!noteSelectionsQuery.data?.length && (
                    <li>• Initialize note selections (click button above)</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
