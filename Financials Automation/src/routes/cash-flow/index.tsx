import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import Layout from "~/components/Layout";
import {
  DocumentTextIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export const Route = createFileRoute("/cash-flow/")({
  component: CashFlow,
});

function CashFlow() {
  const trpc = useTRPC();

  // Fetch data
  const cashFlowQuery = useQuery(trpc.generateCashFlow.queryOptions());
  const commonControlQuery = useQuery(trpc.getCommonControl.queryOptions());

  // Export mutation
  const exportMutation = useMutation({
    ...trpc.exportCashFlow.mutationOptions(),
    onSuccess: (data) => {
      toast.success('Cash Flow exported successfully!');
      window.open(data.downloadUrl, '_blank');
    },
    onError: (error) => {
      toast.error('Failed to export cash flow: ' + error.message);
    },
  });

  // Compliance validation query
  const complianceQuery = useQuery(trpc.validateFinancialStatementFormat.queryOptions({
    statementType: 'cash_flow'
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
  const cashFlowData = cashFlowQuery.data;

  if (cashFlowQuery.isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating Cash Flow Statement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!cashFlowData) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                  Cash Flow Statement
                </h1>
                <p className="text-gray-600 mt-2">
                  Generate your Schedule III compliant cash flow statement
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
                  Please upload trial balance data first to generate the cash flow statement.
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
              <DocumentTextIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                  Cash Flow Statement
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
                  : 'bg-red-100 text-red-800'
              }`}>
                {complianceQuery.data.formatCompliant ? 'Compliant' : 'Issues Found'}
              </div>
            </div>
            
            {complianceQuery.data.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Issues to Address:</h4>
                <ul className="space-y-1">
                  {complianceQuery.data.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-red-600 flex items-start">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Cash Flow Statement */}
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
                Cash Flow Statement for the year ended {entityData?.financialYearEnd 
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

            {/* Cash Flow Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 font-semibold text-gray-900" style={{ width: '70%' }}>
                      Particulars
                    </th>
                    <th className="text-right py-3 font-semibold text-gray-900" style={{ width: '15%' }}>
                      Current Year
                    </th>
                    <th className="text-right py-3 font-semibold text-gray-900" style={{ width: '15%' }}>
                      Previous Year
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* CASH FLOWS FROM OPERATING ACTIVITIES */}
                  <tr>
                    <td colSpan={3} className="py-4">
                      <h4 className="font-bold text-gray-900 text-lg">A. CASH FLOWS FROM OPERATING ACTIVITIES</h4>
                    </td>
                  </tr>
                  
                  {/* Net Profit Before Tax */}
                  <tr>
                    <td className="py-2 pl-4 text-gray-800">Net profit/(loss) before tax</td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.operatingActivities.netProfit, entityData?.negativeColor)}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.operatingActivities.netProfitPY || 0, entityData?.negativeColor)}
                    </td>
                  </tr>

                  {/* Adjustments for: */}
                  <tr>
                    <td className="py-2 pl-4 font-medium text-gray-800">Adjustments for:</td>
                    <td></td>
                    <td></td>
                  </tr>

                  <tr>
                    <td className="py-1 pl-8 text-gray-800">Depreciation and amortization</td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.operatingActivities.depreciation, entityData?.negativeColor)}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.operatingActivities.depreciationPY || 0, entityData?.negativeColor)}
                    </td>
                  </tr>

                  {/* Operating profit before working capital changes */}
                  <tr className="border-t border-gray-200">
                    <td className="py-2 pl-4 font-medium text-gray-800">Operating profit before working capital changes</td>
                    <td className="text-right font-medium text-gray-900">
                      {formatNegative(
                        cashFlowData.operatingActivities.netProfit + cashFlowData.operatingActivities.depreciation,
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right font-medium text-gray-900">
                      {formatNegative(
                        (cashFlowData.operatingActivities.netProfitPY || 0) + (cashFlowData.operatingActivities.depreciationPY || 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Changes in working capital: */}
                  <tr>
                    <td className="py-2 pl-4 font-medium text-gray-800">Changes in working capital:</td>
                    <td></td>
                    <td></td>
                  </tr>

                  <tr>
                    <td className="py-1 pl-8 text-gray-800">(Increase)/decrease in trade receivables</td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.operatingActivities.receivablesChange, entityData?.negativeColor)}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.operatingActivities.receivablesChangePY || 0, entityData?.negativeColor)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-1 pl-8 text-gray-800">(Increase)/decrease in inventories</td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.operatingActivities.inventoryChange, entityData?.negativeColor)}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.operatingActivities.inventoryChangePY || 0, entityData?.negativeColor)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-1 pl-8 text-gray-800">Increase/(decrease) in trade payables</td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.operatingActivities.payablesChange, entityData?.negativeColor)}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.operatingActivities.payablesChangePY || 0, entityData?.negativeColor)}
                    </td>
                  </tr>

                  {/* Cash generated from operations */}
                  <tr className="border-t border-gray-200">
                    <td className="py-2 pl-4 font-semibold text-gray-900">Cash generated from operations</td>
                    <td className="text-right font-semibold text-gray-900">
                      {formatNegative(cashFlowData.operatingActivities.total, entityData?.negativeColor)}
                    </td>
                    <td className="text-right font-semibold text-gray-900">
                      {formatNegative(cashFlowData.operatingActivities.totalPY || 0, entityData?.negativeColor)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-1 pl-8 text-gray-800">Direct taxes paid</td>
                    <td className="text-right text-gray-900">--</td>
                    <td className="text-right text-gray-900">--</td>
                  </tr>

                  {/* Net cash from operating activities */}
                  <tr className="border-t-2 border-gray-300">
                    <td className="py-3 font-bold text-gray-900">Net cash from operating activities (A)</td>
                    <td className="text-right font-bold text-gray-900">
                      {formatNegative(cashFlowData.operatingActivities.total, entityData?.negativeColor)}
                    </td>
                    <td className="text-right font-bold text-gray-900">
                      {formatNegative(cashFlowData.operatingActivities.totalPY || 0, entityData?.negativeColor)}
                    </td>
                  </tr>

                  {/* CASH FLOWS FROM INVESTING ACTIVITIES */}
                  <tr>
                    <td colSpan={3} className="py-6">
                      <h4 className="font-bold text-gray-900 text-lg">B. CASH FLOWS FROM INVESTING ACTIVITIES</h4>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 pl-4 text-gray-800">Purchase of property, plant and equipment</td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.investingActivities.ppeAdditions, entityData?.negativeColor)}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.investingActivities.ppeAdditionsPY || 0, entityData?.negativeColor)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 pl-4 text-gray-800">Purchase/sale of investments</td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.investingActivities.investmentChange, entityData?.negativeColor)}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.investingActivities.investmentChangePY || 0, entityData?.negativeColor)}
                    </td>
                  </tr>

                  {/* Net cash used in investing activities */}
                  <tr className="border-t-2 border-gray-300">
                    <td className="py-3 font-bold text-gray-900">Net cash used in investing activities (B)</td>
                    <td className="text-right font-bold text-gray-900">
                      {formatNegative(cashFlowData.investingActivities.total, entityData?.negativeColor)}
                    </td>
                    <td className="text-right font-bold text-gray-900">
                      {formatNegative(cashFlowData.investingActivities.totalPY || 0, entityData?.negativeColor)}
                    </td>
                  </tr>

                  {/* CASH FLOWS FROM FINANCING ACTIVITIES */}
                  <tr>
                    <td colSpan={3} className="py-6">
                      <h4 className="font-bold text-gray-900 text-lg">C. CASH FLOWS FROM FINANCING ACTIVITIES</h4>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 pl-4 text-gray-800">Proceeds from/(repayment of) borrowings</td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.financingActivities.borrowingsChange, entityData?.negativeColor)}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.financingActivities.borrowingsChangePY || 0, entityData?.negativeColor)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 pl-4 text-gray-800">Proceeds from issue of equity shares</td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.financingActivities.equityChange, entityData?.negativeColor)}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.financingActivities.equityChangePY || 0, entityData?.negativeColor)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 pl-4 text-gray-800">Dividends paid</td>
                    <td className="text-right text-gray-900">--</td>
                    <td className="text-right text-gray-900">--</td>
                  </tr>

                  {/* Net cash from financing activities */}
                  <tr className="border-t-2 border-gray-300">
                    <td className="py-3 font-bold text-gray-900">Net cash from financing activities (C)</td>
                    <td className="text-right font-bold text-gray-900">
                      {formatNegative(cashFlowData.financingActivities.total, entityData?.negativeColor)}
                    </td>
                    <td className="text-right font-bold text-gray-900">
                      {formatNegative(cashFlowData.financingActivities.totalPY || 0, entityData?.negativeColor)}
                    </td>
                  </tr>

                  {/* NET INCREASE/DECREASE IN CASH */}
                  <tr className="border-t-2 border-gray-300">
                    <td className="py-3 font-bold text-gray-900">Net increase/(decrease) in cash and cash equivalents (A+B+C)</td>
                    <td className="text-right font-bold text-gray-900">
                      {formatNegative(cashFlowData.netCashFlow, entityData?.negativeColor)}
                    </td>
                    <td className="text-right font-bold text-gray-900">
                      {formatNegative(cashFlowData.netCashFlowPY || 0, entityData?.negativeColor)}
                    </td>
                  </tr>

                  {/* CASH AND CASH EQUIVALENTS */}
                  <tr>
                    <td className="py-2 text-gray-800">Cash and cash equivalents at the beginning of the year</td>
                    <td className="text-right text-gray-900">
                      {formatNegative(cashFlowData.openingCash, entityData?.negativeColor)}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative((cashFlowData.openingCash - (cashFlowData.netCashFlowPY || 0)), entityData?.negativeColor)}
                    </td>
                  </tr>

                  <tr className="border-t-2 border-gray-300">
                    <td className="py-3 font-bold text-gray-900">Cash and cash equivalents at the end of the year</td>
                    <td className="text-right font-bold text-gray-900">
                      {formatNegative(cashFlowData.closingCash, entityData?.negativeColor)}
                    </td>
                    <td className="text-right font-bold text-gray-900">
                      {formatNegative(cashFlowData.openingCash, entityData?.negativeColor)}
                    </td>
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
              <div className={`text-3xl font-bold mb-2 ${cashFlowData.operatingActivities.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{formatCurrency(cashFlowData.operatingActivities.total)}
              </div>
              <p className="text-gray-600">Operating Cash Flow</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${cashFlowData.investingActivities.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{formatCurrency(cashFlowData.investingActivities.total)}
              </div>
              <p className="text-gray-600">Investing Cash Flow</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${cashFlowData.financingActivities.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{formatCurrency(cashFlowData.financingActivities.total)}
              </div>
              <p className="text-gray-600">Financing Cash Flow</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
