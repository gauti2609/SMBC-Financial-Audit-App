import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import Layout from "~/components/Layout";
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export const Route = createFileRoute("/profit-loss/")({
  component: ProfitLoss,
});

function ProfitLoss() {
  const trpc = useTRPC();

  // Fetch data
  const profitLossQuery = useQuery(trpc.generateProfitAndLoss.queryOptions());
  const commonControlQuery = useQuery(trpc.getCommonControl.queryOptions());

  // Tax expense query
  const taxExpenseQuery = useQuery(trpc.calculateTaxExpense.queryOptions());

  // Export mutation
  const exportMutation = useMutation({
    ...trpc.exportProfitAndLoss.mutationOptions(),
    onSuccess: (data) => {
      toast.success('Profit & Loss exported successfully!');
      window.open(data.downloadUrl, '_blank');
    },
    onError: (error) => {
      toast.error('Failed to export profit & loss: ' + error.message);
    },
  });

  // Compliance validation query
  const complianceQuery = useQuery(trpc.validateFinancialStatementFormat.queryOptions({
    statementType: 'profit_loss'
  }));

  const handleExport = () => {
    exportMutation.mutate({ format: 'xlsx' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const formatNegative = (amount: number, negativeColor: string = 'Brackets') => {
    if (amount >= 0) return formatCurrency(amount);
    
    switch (negativeColor) {
      case 'Red':
        return <span className="text-red-600">{formatCurrency(amount)}</span>;
      case 'Minus':
        return `-${formatCurrency(amount)}`;
      default: // Brackets
        return `(${formatCurrency(amount)})`;
    }
  };

  const entityData = commonControlQuery.data;
  const plData = profitLossQuery.data;

  if (profitLossQuery.isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating Profit & Loss Statement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!plData || (!plData.revenue.length && !plData.expenses.length)) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                  Profit & Loss Statement
                </h1>
                <p className="text-gray-600 mt-2">
                  Generate your Schedule III compliant profit & loss statement
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
                  Please upload trial balance data with P&L entries first to generate the profit & loss statement.
                </p>
                <div className="mt-4">
                  <a
                    href="/trial-balance"
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Upload Trial Balance
                  </a>
                </div>
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
              <ChartBarIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                  Profit & Loss Statement
                </h1>
                <p className="text-gray-600 mt-2">
                  For the year ended {entityData?.financialYearEnd 
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

        {/* Compliance Status */}
        {complianceQuery.data && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Schedule III Compliance</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                complianceQuery.data.formatCompliant 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {complianceQuery.data.formatCompliant ? 'Compliant' : 'Recommendations'}
              </div>
            </div>
            
            {complianceQuery.data.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Recommendations:</h4>
                <ul className="space-y-1">
                  {complianceQuery.data.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-yellow-600 flex items-start">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* P&L Statement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8" style={{ fontFamily: entityData?.defaultFont || 'Bookman Old Style, serif' }}>
            {/* Entity Header */}
            <div className="text-center mb-8 border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {entityData?.entityName || 'Entity Name'}
              </h2>
              <p className="text-sm text-gray-600 mb-1">
                {entityData?.address || 'Entity Address'}
              </p>
              {entityData?.cinNumber && (
                <p className="text-sm text-gray-600 mb-3">
                  CIN: {entityData.cinNumber}
                </p>
              )}
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                Statement of Profit and Loss for the year ended {entityData?.financialYearEnd 
                  ? new Date(entityData.financialYearEnd).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  : 'March 31, 2024'
                }
              </h3>
              <p className="text-sm text-gray-500">
                (All amounts in {entityData?.currency || 'INR'} {entityData?.units || 'Millions'})
              </p>
            </div>

            {/* P&L Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 font-semibold text-gray-900" style={{ width: '50%' }}>
                      Particulars
                    </th>
                    <th className="text-center py-3 font-semibold text-gray-900" style={{ width: '10%' }}>
                      Note No.
                    </th>
                    <th className="text-right py-3 font-semibold text-gray-900" style={{ width: '20%' }}>
                      Figures for current reporting period
                    </th>
                    <th className="text-right py-3 font-semibold text-gray-900" style={{ width: '20%' }}>
                      Figures for previous reporting period
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* REVENUE */}
                  <tr>
                    <td colSpan={4} className="py-4">
                      <h4 className="font-bold text-gray-900 text-lg">I. REVENUE</h4>
                    </td>
                  </tr>
                  
                  {/* Revenue from Operations */}
                  <tr>
                    <td className="py-2 pl-4 text-gray-800">Revenue from operations</td>
                    <td className="text-center text-gray-600">1</td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        plData.revenue
                          .filter(item => item.majorHead?.name?.includes('Revenue from Operations'))
                          .reduce((sum, item) => sum + Math.abs(Number(item.closingBalanceCY)), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        plData.revenue
                          .filter(item => item.majorHead?.name?.includes('Revenue from Operations'))
                          .reduce((sum, item) => sum + Math.abs(Number(item.closingBalancePY)), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Other Income */}
                  <tr>
                    <td className="py-2 pl-4 text-gray-800">Other income</td>
                    <td className="text-center text-gray-600">2</td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        plData.revenue
                          .filter(item => item.majorHead?.name?.includes('Other Income'))
                          .reduce((sum, item) => sum + Math.abs(Number(item.closingBalanceCY)), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        plData.revenue
                          .filter(item => item.majorHead?.name?.includes('Other Income'))
                          .reduce((sum, item) => sum + Math.abs(Number(item.closingBalancePY)), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Total Revenue */}
                  <tr className="border-t border-gray-200">
                    <td className="py-2 font-semibold text-gray-900">Total Revenue (I)</td>
                    <td></td>
                    <td className="text-right font-semibold text-gray-900">
                      {formatNegative(plData.totalRevenue, entityData?.negativeColor)}
                    </td>
                    <td className="text-right font-semibold text-gray-900">
                      {formatNegative(
                        plData.revenue.reduce((sum, item) => sum + Math.abs(Number(item.closingBalancePY)), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* EXPENSES */}
                  <tr>
                    <td colSpan={4} className="py-6">
                      <h4 className="font-bold text-gray-900 text-lg">II. EXPENSES</h4>
                    </td>
                  </tr>

                  {/* Cost of Materials Consumed */}
                  <tr>
                    <td className="py-2 pl-4 text-gray-800">Cost of materials consumed</td>
                    <td className="text-center text-gray-600">3</td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        plData.expenses
                          .filter(item => item.majorHead?.name?.includes('Cost of Materials'))
                          .reduce((sum, item) => sum + Number(item.closingBalanceCY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        plData.expenses
                          .filter(item => item.majorHead?.name?.includes('Cost of Materials'))
                          .reduce((sum, item) => sum + Number(item.closingBalancePY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Employee Benefits Expense */}
                  <tr>
                    <td className="py-2 pl-4 text-gray-800">Employee benefits expense</td>
                    <td className="text-center text-gray-600">4</td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        plData.expenses
                          .filter(item => item.majorHead?.name?.includes('Employee Benefits'))
                          .reduce((sum, item) => sum + Number(item.closingBalanceCY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        plData.expenses
                          .filter(item => item.majorHead?.name?.includes('Employee Benefits'))
                          .reduce((sum, item) => sum + Number(item.closingBalancePY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Finance Costs */}
                  <tr>
                    <td className="py-2 pl-4 text-gray-800">Finance costs</td>
                    <td className="text-center text-gray-600">5</td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        plData.expenses
                          .filter(item => item.majorHead?.name?.includes('Finance Costs'))
                          .reduce((sum, item) => sum + Number(item.closingBalanceCY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        plData.expenses
                          .filter(item => item.majorHead?.name?.includes('Finance Costs'))
                          .reduce((sum, item) => sum + Number(item.closingBalancePY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Depreciation and Amortization */}
                  <tr>
                    <td className="py-2 pl-4 text-gray-800">Depreciation and amortization expense</td>
                    <td className="text-center text-gray-600">6</td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        plData.expenses
                          .filter(item => item.majorHead?.name?.includes('Depreciation'))
                          .reduce((sum, item) => sum + Number(item.closingBalanceCY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        plData.expenses
                          .filter(item => item.majorHead?.name?.includes('Depreciation'))
                          .reduce((sum, item) => sum + Number(item.closingBalancePY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Other Expenses */}
                  <tr>
                    <td className="py-2 pl-4 text-gray-800">Other expenses</td>
                    <td className="text-center text-gray-600">7</td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        plData.expenses
                          .filter(item => item.majorHead?.name?.includes('Other Expenses'))
                          .reduce((sum, item) => sum + Number(item.closingBalanceCY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        plData.expenses
                          .filter(item => item.majorHead?.name?.includes('Other Expenses'))
                          .reduce((sum, item) => sum + Number(item.closingBalancePY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Total Expenses */}
                  <tr className="border-t border-gray-200">
                    <td className="py-2 font-semibold text-gray-900">Total Expenses (II)</td>
                    <td></td>
                    <td className="text-right font-semibold text-gray-900">
                      {formatNegative(plData.totalExpenses, entityData?.negativeColor)}
                    </td>
                    <td className="text-right font-semibold text-gray-900">
                      {formatNegative(
                        plData.expenses.reduce((sum, item) => sum + Number(item.closingBalancePY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Profit Before Tax */}
                  <tr className="border-t-2 border-gray-300">
                    <td className="py-3 font-bold text-gray-900">Profit/(Loss) before tax (I-II)</td>
                    <td></td>
                    <td className="text-right font-bold text-gray-900">
                      {formatNegative(plData.netProfit, entityData?.negativeColor)}
                    </td>
                    <td className="text-right font-bold text-gray-900">
                      {formatNegative(
                        plData.revenue.reduce((sum, item) => sum + Math.abs(Number(item.closingBalancePY)), 0) -
                        plData.expenses.reduce((sum, item) => sum + Number(item.closingBalancePY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Tax Expense */}
                  <tr>
                    <td className="py-2 pl-4 text-gray-800">Tax expense</td>
                    <td className="text-center text-gray-600">8</td>
                    <td className="text-right text-gray-900">
                      {formatNegative(taxExpenseQuery.data?.totalCurrentYear || 0, entityData?.negativeColor)}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(taxExpenseQuery.data?.totalPreviousYear || 0, entityData?.negativeColor)}
                    </td>
                  </tr>

                  {/* Profit After Tax */}
                  <tr className="border-t-2 border-gray-300">
                    <td className="py-3 font-bold text-gray-900">Profit/(Loss) for the period</td>
                    <td></td>
                    <td className="text-right font-bold text-gray-900">
                      {formatNegative(plData.netProfit - (taxExpenseQuery.data?.totalCurrentYear || 0), entityData?.negativeColor)}
                    </td>
                    <td className="text-right font-bold text-gray-900">
                      {formatNegative(
                        plData.revenue.reduce((sum, item) => sum + Math.abs(Number(item.closingBalancePY)), 0) -
                        plData.expenses.reduce((sum, item) => sum + Number(item.closingBalancePY), 0) -
                        (taxExpenseQuery.data?.totalPreviousYear || 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Earnings Per Share */}
                  <tr className="border-t border-gray-200">
                    <td className="py-2 font-semibold text-gray-900">Earnings per equity share (in {entityData?.currency || 'INR'})</td>
                    <td className="text-center text-gray-600">9</td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-gray-800">(1) Basic</td>
                    <td></td>
                    <td className="text-right text-gray-900">--</td>
                    <td className="text-right text-gray-900">--</td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-4 text-gray-800">(2) Diluted</td>
                    <td></td>
                    <td className="text-right text-gray-900">--</td>
                    <td className="text-right text-gray-900">--</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signature Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="h-16 border-b border-gray-300 mb-2"></div>
                  <p className="text-sm text-gray-600">Director</p>
                </div>
                <div className="text-center">
                  <div className="h-16 border-b border-gray-300 mb-2"></div>
                  <p className="text-sm text-gray-600">Company Secretary</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ₹{formatCurrency(plData.totalRevenue)}
              </div>
              <p className="text-gray-600">Total Revenue</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                ₹{formatCurrency(plData.totalExpenses)}
              </div>
              <p className="text-gray-600">Total Expenses</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${plData.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ₹{formatCurrency(plData.netProfit)}
              </div>
              <p className="text-gray-600">{plData.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
