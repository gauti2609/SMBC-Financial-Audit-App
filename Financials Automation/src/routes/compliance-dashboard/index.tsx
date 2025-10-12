import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";
import Layout from "~/components/Layout";
import { useSelectedCompany } from '~/stores/companyStore';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

export const Route = createFileRoute("/compliance-dashboard/")({
  component: ComplianceDashboard,
});

function ComplianceDashboard() {
  const trpc = useTRPC();
  const { selectedCompanyId, selectedCompany } = useSelectedCompany();

  // Fetch overall compliance data for selected company
  const complianceQuery = useQuery(
    selectedCompanyId 
      ? trpc.validateScheduleIIICompliance.queryOptions({ companyId: selectedCompanyId })
      : { enabled: false }
  );

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'fail':
        return <XCircleIcon className="h-6 w-6 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getSeverityIcon = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  // Show company selection message if no company is selected
  if (!selectedCompanyId) {
    return (
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                  Schedule III Compliance Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Monitor and ensure compliance with Schedule III disclosure requirements
                </p>
              </div>
            </div>
          </div>

          {/* Company Selection Required */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-blue-900">Company Selection Required</h2>
            </div>
            <div className="space-y-4">
              <p className="text-blue-800">
                Please select a company from the header to view its Schedule III compliance status.
              </p>
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Getting Started:</h3>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li>Select an existing company from the dropdown in the header</li>
                  <li>Or create a new company using the "Create New Company" option</li>
                  <li>Once selected, the compliance dashboard will show data for that company</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (complianceQuery.isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Validating Schedule III compliance...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (complianceQuery.isError) {
    return (
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                  Schedule III Compliance Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Monitor and ensure compliance with Schedule III disclosure requirements
                  {selectedCompany && (
                    <span className="ml-2 text-indigo-600 font-medium">
                      • {selectedCompany.displayName}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Error State */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <XCircleIcon className="h-8 w-8 text-red-600 mr-3" />
              <h2 className="text-xl font-semibold text-red-900">Compliance Module Error</h2>
            </div>
            <div className="space-y-4">
              <p className="text-red-800">
                The Schedule III compliance validation failed to load. This could be due to:
              </p>
              <ul className="list-disc list-inside text-red-700 space-y-2">
                <li>Database connection issues</li>
                <li>Missing required data (trial balance, entity information, etc.)</li>
                <li>Server configuration problems</li>
              </ul>
              <div className="bg-red-100 border border-red-300 rounded-lg p-4 mt-4">
                <h3 className="font-semibold text-red-900 mb-2">Technical Details:</h3>
                <pre className="text-sm text-red-800 whitespace-pre-wrap">
                  {complianceQuery.error?.message || 'Unknown error occurred'}
                </pre>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => complianceQuery.refetch()}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry Validation
                </button>
                <a
                  href="/common-control"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Setup Entity Information
                </a>
                <a
                  href="/trial-balance"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Upload Trial Balance
                </a>
                <a
                  href="/compliance-dashboard/debug"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Run Diagnostics
                </a>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const complianceData = complianceQuery.data;

  if (!complianceData) {
    return (
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                  Schedule III Compliance Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Monitor and ensure compliance with Schedule III disclosure requirements
                  {selectedCompany && (
                    <span className="ml-2 text-indigo-600 font-medium">
                      • {selectedCompany.displayName}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* No Data State */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 mr-3" />
              <h2 className="text-xl font-semibold text-yellow-900">No Compliance Data Available</h2>
            </div>
            <div className="space-y-4">
              <p className="text-yellow-800">
                The compliance validation completed but returned no data. This usually means:
              </p>
              <ul className="list-disc list-inside text-yellow-700 space-y-2">
                <li>The database is empty or not properly initialized</li>
                <li>Required master data (major heads, groupings) is missing</li>
                <li>The compliance validation procedure returned null/undefined</li>
              </ul>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => complianceQuery.refetch()}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Retry Validation
                </button>
                <a
                  href="/common-control"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Initialize Entity Data
                </a>
                <a
                  href="/compliance-dashboard/debug"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Run Diagnostics
                </a>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                Schedule III Compliance Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor and ensure compliance with Schedule III disclosure requirements
                {selectedCompany && (
                  <span className="ml-2 text-indigo-600 font-medium">
                    • {selectedCompany.displayName}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {complianceData && (
          <>
            {/* Overall Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Overall Compliance Status</h2>
                <div className={`px-4 py-2 rounded-full text-lg font-medium ${
                  complianceData.overallStatus === 'compliant' ? 'bg-green-100 text-green-800' :
                  complianceData.overallStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {complianceData.overallStatus === 'compliant' ? 'Compliant' :
                   complianceData.overallStatus === 'partial' ? 'Partial Compliance' :
                   'Non-Compliant'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-indigo-600 mb-2">
                    {complianceData.complianceScore}%
                  </div>
                  <p className="text-gray-600">Compliance Score</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {complianceData.passedChecks}
                  </div>
                  <p className="text-gray-600">Checks Passed</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {complianceData.issues.filter(i => i.severity === 'error').length}
                  </div>
                  <p className="text-gray-600">Critical Issues</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className={`h-3 rounded-full ${
                    complianceData.complianceScore >= 90 ? 'bg-green-500' :
                    complianceData.complianceScore >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${complianceData.complianceScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 text-center">
                {complianceData.passedChecks} of {complianceData.totalChecks} compliance checks passed
              </p>
            </div>

            {/* Category Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Compliance Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-4" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Entity Information</h3>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(complianceData.summary.entityInformation)}
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(complianceData.summary.entityInformation)}`}>
                        {complianceData.summary.entityInformation.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <ClipboardDocumentListIcon className="h-8 w-8 text-purple-600 mr-4" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Note Selections</h3>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(complianceData.summary.noteSelections)}
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(complianceData.summary.noteSelections)}`}>
                        {complianceData.summary.noteSelections.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <DocumentTextIcon className="h-8 w-8 text-green-600 mr-4" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Financial Statements</h3>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(complianceData.summary.financialStatements)}
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(complianceData.summary.financialStatements)}`}>
                        {complianceData.summary.financialStatements.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <ClockIcon className="h-8 w-8 text-orange-600 mr-4" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Aging Schedules</h3>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(complianceData.summary.agingSchedules)}
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(complianceData.summary.agingSchedules)}`}>
                        {complianceData.summary.agingSchedules.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <ChartBarIcon className="h-8 w-8 text-indigo-600 mr-4" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Ratio Analysis</h3>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(complianceData.summary.ratioAnalysis)}
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(complianceData.summary.ratioAnalysis)}`}>
                        {complianceData.summary.ratioAnalysis.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <DocumentTextIcon className="h-8 w-8 text-red-600 mr-4" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Mandatory Disclosures</h3>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(complianceData.summary.mandatoryDisclosures)}
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(complianceData.summary.mandatoryDisclosures)}`}>
                        {complianceData.summary.mandatoryDisclosures.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Issues and Recommendations */}
            {complianceData.issues.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Issues and Recommendations</h2>
                
                {/* Filter by severity */}
                <div className="space-y-6">
                  {['error', 'warning', 'info'].map((severity) => {
                    const severityIssues = complianceData.issues.filter(issue => issue.severity === severity);
                    if (severityIssues.length === 0) return null;

                    return (
                      <div key={severity}>
                        <h3 className={`font-medium mb-3 ${
                          severity === 'error' ? 'text-red-800' :
                          severity === 'warning' ? 'text-yellow-800' :
                          'text-blue-800'
                        }`}>
                          {severity === 'error' ? 'Critical Issues' :
                           severity === 'warning' ? 'Warnings' :
                           'Information'}
                          <span className="ml-2 text-sm">({severityIssues.length})</span>
                        </h3>
                        
                        <div className="space-y-3">
                          {severityIssues.map((issue, index) => (
                            <div key={index} className={`border rounded-lg p-4 ${
                              severity === 'error' ? 'border-red-200 bg-red-50' :
                              severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                              'border-blue-200 bg-blue-50'
                            }`}>
                              <div className="flex items-start">
                                {getSeverityIcon(issue.severity as 'error' | 'warning' | 'info')}
                                <div className="ml-3 flex-1">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900">{issue.issue}</h4>
                                      <p className="text-sm text-gray-600 mt-1">{issue.recommendation}</p>
                                      <div className="flex items-center mt-2 space-x-4">
                                        <span className="text-xs text-gray-500">Category: {issue.category}</span>
                                        {issue.noteRef && (
                                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                            Note: {issue.noteRef}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <a
                  href="/common-control"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <span className="font-medium text-gray-900">Entity Settings</span>
                </a>
                
                <a
                  href="/notes-selection"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ClipboardDocumentListIcon className="h-6 w-6 text-purple-600 mr-3" />
                  <span className="font-medium text-gray-900">Note Selection</span>
                </a>
                
                <a
                  href="/aging-schedules"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ClockIcon className="h-6 w-6 text-orange-600 mr-3" />
                  <span className="font-medium text-gray-900">Aging Schedules</span>
                </a>
                
                <a
                  href="/ratio-analysis"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChartBarIcon className="h-6 w-6 text-indigo-600 mr-3" />
                  <span className="font-medium text-gray-900">Ratio Analysis</span>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
