import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";
import Layout from "~/components/Layout";
import { useSelectedCompany } from '~/stores/companyStore';
import {
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ServerIcon,
  TableCellsIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

export const Route = createFileRoute("/compliance-dashboard/debug/")({
  component: ComplianceDebug,
});

function ComplianceDebug() {
  const trpc = useTRPC();
  const { selectedCompanyId, selectedCompany } = useSelectedCompany();
  
  const debugQuery = useQuery(
    selectedCompanyId 
      ? trpc.debugCompliance.queryOptions({ companyId: selectedCompanyId })
      : { enabled: false }
  );

  const getStatusIcon = (status: 'pass' | 'fail') => {
    return status === 'pass' 
      ? <CheckCircleIcon className="h-5 w-5 text-green-600" />
      : <XCircleIcon className="h-5 w-5 text-red-600" />;
  };

  const getStatusColor = (status: 'pass' | 'fail') => {
    return status === 'pass' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  // Show company selection message if no company is selected
  if (!selectedCompanyId) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <WrenchScrewdriverIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                  Schedule III Compliance Diagnostics
                </h1>
                <p className="text-gray-600 mt-2">
                  System health check and troubleshooting information
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-blue-900">Company Selection Required</h2>
            </div>
            <p className="text-blue-800">
              Please select a company from the header to view its diagnostic information.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (debugQuery.isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Running compliance diagnostics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (debugQuery.isError) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <WrenchScrewdriverIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                  Compliance Debug - Critical Error
                </h1>
                <p className="text-gray-600 mt-2">
                  Unable to run diagnostic checks
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <XCircleIcon className="h-8 w-8 text-red-600 mr-3" />
              <h2 className="text-xl font-semibold text-red-900">Diagnostic Failure</h2>
            </div>
            <div className="space-y-4">
              <p className="text-red-800">
                The diagnostic system itself failed to run. This indicates a serious system-level issue:
              </p>
              <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">Error Details:</h3>
                <pre className="text-sm text-red-800 whitespace-pre-wrap">
                  {debugQuery.error?.message || 'Unknown critical error'}
                </pre>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-red-900">Possible causes:</p>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  <li>Database server is completely down</li>
                  <li>Network connectivity issues</li>
                  <li>Server application crash</li>
                  <li>Critical configuration errors</li>
                </ul>
              </div>
              <button
                onClick={() => debugQuery.refetch()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Retry Diagnostics
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const debugData = debugQuery.data;

  if (!debugData) {
    return (
      <Layout>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 mr-3" />
            <h2 className="text-xl font-semibold text-yellow-900">No Debug Data</h2>
          </div>
          <p className="text-yellow-800">Debug procedure completed but returned no data.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <WrenchScrewdriverIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                  Schedule III Compliance Diagnostics
                </h1>
                <p className="text-gray-600 mt-2">
                  System health check and troubleshooting information
                  {selectedCompany && (
                    <span className="ml-2 text-indigo-600 font-medium">
                      • {selectedCompany.displayName}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last run:</p>
              <p className="text-sm font-medium text-gray-900">
                {debugData?.timestamp ? new Date(debugData.timestamp).toLocaleString() : 'Not run'}
              </p>
              <button
                onClick={() => debugQuery.refetch()}
                className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors flex items-center"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Database Connection Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <ServerIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Database Connection</h2>
          </div>
          <div className={`flex items-center p-4 rounded-lg border ${
            debugData.databaseConnection 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            {debugData.databaseConnection 
              ? <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
              : <XCircleIcon className="h-6 w-6 text-red-600 mr-3" />
            }
            <div>
              <p className={`font-medium ${
                debugData.databaseConnection ? 'text-green-900' : 'text-red-900'
              }`}>
                {debugData.databaseConnection ? 'Connected' : 'Connection Failed'}
              </p>
              <p className={`text-sm ${
                debugData.databaseConnection ? 'text-green-700' : 'text-red-700'
              }`}>
                {debugData.databaseConnection 
                  ? 'Database is accessible and responding'
                  : 'Unable to connect to the database'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Tables Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <TableCellsIcon className="h-6 w-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Database Tables Status</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(debugData.tablesStatus).map(([tableName, status]) => (
              <div key={tableName} className={`p-4 rounded-lg border ${
                status.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{tableName}</h3>
                  {status.exists 
                    ? <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    : <XCircleIcon className="h-5 w-5 text-red-600" />
                  }
                </div>
                <p className={`text-sm ${status.exists ? 'text-green-700' : 'text-red-700'}`}>
                  {status.exists 
                    ? `${status.count} records`
                    : status.error || 'Table not accessible'
                  }
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Basic Checks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <ClipboardDocumentCheckIcon className="h-6 w-6 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">System Health Checks</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(debugData.basicChecks).map(([checkName, result]) => (
              <div key={checkName} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(result.status)}
                    <h3 className="ml-3 font-medium text-gray-900">
                      {checkName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h3>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    result.status === 'pass' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status.toUpperCase()}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-700">{result.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Troubleshooting Recommendations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Troubleshooting Guide</h2>
          </div>
          <div className="space-y-6">
            {!debugData.databaseConnection && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">Database Connection Issues</h3>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  <li>Check if the database server is running</li>
                  <li>Verify database connection credentials</li>
                  <li>Ensure network connectivity to the database</li>
                  <li>Check if the database URL in the configuration is correct</li>
                </ul>
              </div>
            )}

            {debugData.basicChecks.majorHeadsSeeded?.status === 'fail' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Missing Master Data</h3>
                <ul className="list-disc list-inside text-yellow-700 space-y-1">
                  <li>Run the database setup script to seed master data</li>
                  <li>Check if the application initialization completed successfully</li>
                  <li>Manually initialize major heads and groupings if needed</li>
                </ul>
              </div>
            )}

            {debugData.basicChecks.trialBalanceData?.status === 'fail' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">No Financial Data</h3>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li>Upload trial balance data to get started</li>
                  <li>Configure entity information in Common Control settings</li>
                  <li>The compliance module requires basic financial data to function</li>
                </ul>
                <div className="mt-3">
                  <a
                    href="/trial-balance"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                  >
                    Upload Trial Balance
                  </a>
                </div>
              </div>
            )}

            {debugData.basicChecks.mainComplianceProcedure?.status === 'pass' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">System is Working</h3>
                <p className="text-green-700">
                  All core systems are functioning properly. The compliance module should be working correctly.
                </p>
                <div className="mt-3">
                  <a
                    href="/compliance-dashboard"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
                  >
                    View Compliance Dashboard
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="/compliance-dashboard"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-indigo-600 mr-3" />
              <span className="font-medium text-gray-900">Compliance Dashboard</span>
            </a>
            
            <a
              href="/common-control"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ServerIcon className="h-6 w-6 text-blue-600 mr-3" />
              <span className="font-medium text-gray-900">Entity Settings</span>
            </a>
            
            <a
              href="/trial-balance"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TableCellsIcon className="h-6 w-6 text-green-600 mr-3" />
              <span className="font-medium text-gray-900">Trial Balance</span>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
