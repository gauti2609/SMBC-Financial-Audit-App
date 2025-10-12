import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import Layout from "~/components/Layout";
import { useSelectedCompany } from '~/stores/companyStore';
import {
  ClockIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

export const Route = createFileRoute("/aging-schedules/")({
  component: AgingSchedules,
});

function AgingSchedules() {
  const trpc = useTRPC();
  const { selectedCompanyId } = useSelectedCompany();

  // Fetch data
  const agingQuery = useQuery(
    selectedCompanyId 
      ? trpc.getAgingSchedules.queryOptions({ companyId: selectedCompanyId })
      : { enabled: false }
  );
  const reconciliationQuery = useQuery(
    selectedCompanyId 
      ? trpc.checkTrialBalanceReconciliation.queryOptions({ companyId: selectedCompanyId })
      : { enabled: false }
  );
  const commonControlQuery = useQuery(
    selectedCompanyId 
      ? trpc.getCommonControl.queryOptions({ companyId: selectedCompanyId })
      : { enabled: false }
  );

  // Export mutation
  const exportMutation = useMutation({
    ...trpc.exportAgingSchedules.mutationOptions(),
    onSuccess: (data) => {
      toast.success('Aging schedules exported successfully!');
      window.open(data.downloadUrl, '_blank');
    },
    onError: (error) => {
      toast.error('Failed to export aging schedules: ' + error.message);
    },
  });

  const handleExport = () => {
    if (!selectedCompanyId) {
      toast.error('Please select a company first');
      return;
    }
    exportMutation.mutate({ companyId: selectedCompanyId, format: 'xlsx' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const agingData = agingQuery.data;
  const reconciliationData = reconciliationQuery.data;
  const entityData = commonControlQuery.data;

  if (agingQuery.isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading aging schedules...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!agingData) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                  Aging Schedules
                </h1>
                <p className="text-gray-600 mt-2">
                  Receivables and Payables aging analysis
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex">
              <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 mt-1" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-amber-800">No Data Available</h3>
                <p className="text-amber-700 mt-1">
                  Please upload receivables and payables data to generate aging schedules.
                </p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                  Aging Schedules
                </h1>
                <p className="text-gray-600 mt-2">
                  Receivables and Payables aging analysis as at {entityData?.financialYearEnd 
                    ? new Date(entityData.financialYearEnd).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'March 31, 2024'
                  }
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <PrinterIcon className="h-5 w-5" />
                <span>Print</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ShareIcon className="h-5 w-5" />
                <span>Share</span>
              </button>
              <button 
                onClick={handleExport}
                disabled={exportMutation.isPending}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                <span>{exportMutation.isPending ? 'Exporting...' : 'Export to Excel'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reconciliation Status */}
        {reconciliationData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Receivables Reconciliation</h3>
                {reconciliationData.receivables.reconciled ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Trial Balance:</span>
                  <span>₹{formatCurrency(reconciliationData.receivables.trialBalanceAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ledger Total:</span>
                  <span>₹{formatCurrency(reconciliationData.receivables.ledgerTotal)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Variance:</span>
                  <span className={`font-medium ${reconciliationData.receivables.reconciled ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{formatCurrency(Math.abs(reconciliationData.receivables.variance))}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Payables Reconciliation</h3>
                {reconciliationData.payables.reconciled ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Trial Balance:</span>
                  <span>₹{formatCurrency(reconciliationData.payables.trialBalanceAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ledger Total:</span>
                  <span>₹{formatCurrency(reconciliationData.payables.ledgerTotal)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Variance:</span>
                  <span className={`font-medium ${reconciliationData.payables.reconciled ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{formatCurrency(Math.abs(reconciliationData.payables.variance))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                ₹{formatCurrency(agingData.receivables.totalOutstanding)}
              </div>
              <p className="text-gray-600">Total Receivables</p>
              <p className="text-xs text-gray-500 mt-1">
                {agingData.receivables.entries.length} entries
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ₹{formatCurrency(agingData.receivables.advanceFromCustomers)}
              </div>
              <p className="text-gray-600">Advance from Customers</p>
              <p className="text-xs text-gray-500 mt-1">Credit balances</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                ₹{formatCurrency(agingData.payables.totalOutstanding)}
              </div>
              <p className="text-gray-600">Total Payables</p>
              <p className="text-xs text-gray-500 mt-1">
                {agingData.payables.entries.length} entries
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                ₹{formatCurrency(agingData.payables.advanceToSuppliers)}
              </div>
              <p className="text-gray-600">Advance to Suppliers</p>
              <p className="text-xs text-gray-500 mt-1">Debit balances</p>
            </div>
          </div>
        </div>

        {/* Receivables Aging */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Trade Receivables Aging</h3>
            <p className="text-sm text-gray-600 mt-1">
              Aging analysis with disputed/undisputed classification
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age Bucket
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Undisputed
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disputed
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(agingData.receivables.aging).map(([bucket, data]) => (
                  <tr key={bucket} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bucket}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ₹{formatCurrency(data.undisputed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                      ₹{formatCurrency(data.disputed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      ₹{formatCurrency(data.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {((data.total / agingData.receivables.totalOutstanding) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payables Aging */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Trade Payables Aging</h3>
            <p className="text-sm text-gray-600 mt-1">
              Aging analysis with MSME/Others classification
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age Bucket
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MSME
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Others
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disputed
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(agingData.payables.aging).map(([bucket, data]) => (
                  <tr key={bucket} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bucket}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 text-right">
                      ₹{formatCurrency(data.msme)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ₹{formatCurrency(data.others)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                      ₹{formatCurrency(data.disputed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      ₹{formatCurrency(data.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {((data.total / agingData.payables.totalOutstanding) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Information Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex">
            <InformationCircleIcon className="h-6 w-6 text-blue-600 mt-1" />
            <div className="ml-3">
              <h3 className="text-lg font-medium text-blue-800">Schedule III Compliance</h3>
              <div className="text-blue-700 mt-1 space-y-1 text-sm">
                <p>• Aging schedules are prepared as per Schedule III requirements</p>
                <p>• Receivables are classified as Disputed/Undisputed</p>
                <p>• Payables are classified as MSME/Others with disputed amounts</p>
                <p>• Negative balances in receivables are treated as "Advance from Customers"</p>
                <p>• Positive balances in payables are treated as "Advance to Suppliers"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
