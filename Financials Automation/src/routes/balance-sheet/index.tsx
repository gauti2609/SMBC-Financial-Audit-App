import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import Layout from "~/components/Layout";
import ComparisonView from "~/components/ComparisonView";
import {
  BanknotesIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export const Route = createFileRoute("/balance-sheet/")({
  component: BalanceSheet,
});

function BalanceSheet() {
  const trpc = useTRPC();

  // Fetch data
  const balanceSheetQuery = useQuery(trpc.generateBalanceSheet.queryOptions());
  const commonControlQuery = useQuery(trpc.getCommonControl.queryOptions());

  // Export mutation
  const exportMutation = useMutation({
    ...trpc.exportBalanceSheet.mutationOptions(),
    onSuccess: (data) => {
      toast.success('Balance sheet exported successfully!');
      // Open download link
      window.open(data.downloadUrl, '_blank');
    },
    onError: (error) => {
      toast.error('Failed to export balance sheet: ' + error.message);
    },
  });

  // Compliance validation query
  const complianceQuery = useQuery(trpc.validateFinancialStatementFormat.queryOptions({
    statementType: 'balance_sheet'
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
  const balanceSheetData = balanceSheetQuery.data;

  if (balanceSheetQuery.isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating Balance Sheet...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!balanceSheetData || (!balanceSheetData.assets.length && !balanceSheetData.liabilities.length && !balanceSheetData.equity.length)) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <BanknotesIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                  Balance Sheet
                </h1>
                <p className="text-gray-600 mt-2">
                  Generate your Schedule III compliant balance sheet
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
                  Please upload trial balance data first to generate the balance sheet.
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
              <BanknotesIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ 
                  fontFamily: entityData?.defaultFont || 'Bookman Old Style, serif',
                  fontSize: `${(entityData?.defaultFontSize || 11) + 10}px`
                }}>
                  Balance Sheet
                </h1>
                <p className="text-gray-600 mt-2">
                  As at {entityData?.financialYearEnd 
                    ? new Date(entityData.financialYearEnd).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'March 31, 2024'
                  }
                </p>
                {entityData?.reportHeaderStyle === 'Detailed' && (
                  <p className="text-sm text-gray-500 mt-1">
                    Schedule III Compliant | Generated on {new Date().toLocaleDateString('en-IN')}
                  </p>
                )}
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
          
          {entityData?.reportHeaderStyle === 'Corporate' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  <span className="font-medium">Report Type:</span> Balance Sheet (Schedule III)
                </div>
                <div>
                  <span className="font-medium">Orientation:</span> {entityData.pageOrientation}
                </div>
                <div>
                  <span className="font-medium">Precision:</span> {entityData.roundingPrecision} decimal places
                </div>
              </div>
            </div>
          )}
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

            <div className="mt-4 text-sm text-gray-600">
              Compliance Score: {complianceQuery.data.passedChecks}/{complianceQuery.data.totalChecks} checks passed
            </div>
          </div>
        )}

        {/* Balance Sheet Statement */}
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
                Balance Sheet as at {entityData?.financialYearEnd 
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

            {/* Balance Sheet Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 font-semibold text-gray-900" style={{ width: entityData?.showNoteNumbers ? '50%' : '60%' }}>
                      Particulars
                    </th>
                    {entityData?.showNoteNumbers && (
                      <th className="text-center py-3 font-semibold text-gray-900" style={{ width: '10%' }}>
                        Note No.
                      </th>
                    )}
                    <th className="text-right py-3 font-semibold text-gray-900" style={{ width: '20%' }}>
                      Figures as at the end of current reporting period
                    </th>
                    <th className="text-right py-3 font-semibold text-gray-900" style={{ width: '20%' }}>
                      Figures as at the end of previous reporting period
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* ASSETS */}
                  <tr>
                    <td colSpan={entityData?.showNoteNumbers ? 4 : 3} className="py-4">
                      <h4 className="font-bold text-gray-900 text-lg">I. ASSETS</h4>
                    </td>
                  </tr>
                  
                  {/* Non-current Assets */}
                  <tr>
                    <td className="py-2 pl-4">
                      <span className="font-semibold text-gray-900">(1) Non-current assets</span>
                    </td>
                    {entityData?.showNoteNumbers && <td></td>}
                    <td></td>
                    <td></td>
                  </tr>

                  {/* Property, Plant and Equipment */}
                  <tr>
                    <td className="py-1 pl-8 text-gray-800">(a) Property, Plant and Equipment</td>
                    {entityData?.showNoteNumbers && (
                      <td className="text-center text-gray-600">1</td>
                    )}
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.assets
                          .filter(asset => asset.majorHead?.name?.includes('Property, Plant and Equipment'))
                          .reduce((sum, asset) => sum + Number(asset.closingBalanceCY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.assets
                          .filter(asset => asset.majorHead?.name?.includes('Property, Plant and Equipment'))
                          .reduce((sum, asset) => sum + Number(asset.closingBalancePY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Intangible Assets */}
                  <tr>
                    <td className="py-1 pl-8 text-gray-800">(b) Intangible assets</td>
                    {entityData?.showNoteNumbers && (
                      <td className="text-center text-gray-600">2</td>
                    )}
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.assets
                          .filter(asset => asset.majorHead?.name?.includes('Intangible'))
                          .reduce((sum, asset) => sum + Number(asset.closingBalanceCY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.assets
                          .filter(asset => asset.majorHead?.name?.includes('Intangible'))
                          .reduce((sum, asset) => sum + Number(asset.closingBalancePY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Non-current Investments */}
                  <tr>
                    <td className="py-1 pl-8 text-gray-800">(c) Non-current investments</td>
                    {entityData?.showNoteNumbers && (
                      <td className="text-center text-gray-600">3</td>
                    )}
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.assets
                          .filter(asset => asset.majorHead?.name?.includes('Non-current Investments'))
                          .reduce((sum, asset) => sum + Number(asset.closingBalanceCY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.assets
                          .filter(asset => asset.majorHead?.name?.includes('Non-current Investments'))
                          .reduce((sum, asset) => sum + Number(asset.closingBalancePY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Current Assets */}
                  <tr>
                    <td className="py-2 pl-4 pt-6">
                      <span className="font-semibold text-gray-900">(2) Current assets</span>
                    </td>
                    {entityData?.showNoteNumbers && <td></td>}
                    <td></td>
                    <td></td>
                  </tr>

                  {/* Inventories */}
                  <tr>
                    <td className="py-1 pl-8 text-gray-800">(a) Inventories</td>
                    {entityData?.showNoteNumbers && (
                      <td className="text-center text-gray-600">4</td>
                    )}
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.assets
                          .filter(asset => asset.majorHead?.name?.includes('Inventories'))
                          .reduce((sum, asset) => sum + Number(asset.closingBalanceCY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.assets
                          .filter(asset => asset.majorHead?.name?.includes('Inventories'))
                          .reduce((sum, asset) => sum + Number(asset.closingBalancePY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Trade Receivables */}
                  <tr>
                    <td className="py-1 pl-8 text-gray-800">(b) Trade receivables</td>
                    {entityData?.showNoteNumbers && (
                      <td className="text-center text-gray-600">5</td>
                    )}
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.assets
                          .filter(asset => asset.majorHead?.name?.includes('Trade Receivables'))
                          .reduce((sum, asset) => sum + Number(asset.closingBalanceCY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.assets
                          .filter(asset => asset.majorHead?.name?.includes('Trade Receivables'))
                          .reduce((sum, asset) => sum + Number(asset.closingBalancePY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Cash and Cash Equivalents */}
                  <tr>
                    <td className="py-1 pl-8 text-gray-800">(c) Cash and cash equivalents</td>
                    {entityData?.showNoteNumbers && (
                      <td className="text-center text-gray-600">6</td>
                    )}
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.assets
                          .filter(asset => asset.majorHead?.name?.includes('Cash'))
                          .reduce((sum, asset) => sum + Number(asset.closingBalanceCY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.assets
                          .filter(asset => asset.majorHead?.name?.includes('Cash'))
                          .reduce((sum, asset) => sum + Number(asset.closingBalancePY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Total Assets */}
                  <tr className="border-t-2 border-gray-300">
                    <td className="py-3 font-bold text-gray-900">TOTAL ASSETS</td>
                    {entityData?.showNoteNumbers && <td></td>}
                    <td className="text-right font-bold text-gray-900">
                      {formatNegative(balanceSheetData.totalAssets, entityData?.negativeColor)}
                    </td>
                    <td className="text-right font-bold text-gray-900">
                      {formatNegative(
                        balanceSheetData.assets.reduce((sum, asset) => sum + Number(asset.closingBalancePY), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* EQUITY AND LIABILITIES */}
                  <tr>
                    <td colSpan={entityData?.showNoteNumbers ? 4 : 3} className="py-6">
                      <h4 className="font-bold text-gray-900 text-lg">II. EQUITY AND LIABILITIES</h4>
                    </td>
                  </tr>

                  {/* Equity */}
                  <tr>
                    <td className="py-2 pl-4">
                      <span className="font-semibold text-gray-900">(1) Equity</span>
                    </td>
                    {entityData?.showNoteNumbers && <td></td>}
                    <td></td>
                    <td></td>
                  </tr>

                  {/* Equity Share Capital */}
                  <tr>
                    <td className="py-1 pl-8 text-gray-800">(a) Equity Share Capital</td>
                    {entityData?.showNoteNumbers && (
                      <td className="text-center text-gray-600">7</td>
                    )}
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.equity
                          .filter(equity => equity.majorHead?.name?.includes('Share Capital'))
                          .reduce((sum, equity) => sum + Math.abs(Number(equity.closingBalanceCY)), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.equity
                          .filter(equity => equity.majorHead?.name?.includes('Share Capital'))
                          .reduce((sum, equity) => sum + Math.abs(Number(equity.closingBalancePY)), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Other Equity */}
                  <tr>
                    <td className="py-1 pl-8 text-gray-800">(b) Other Equity</td>
                    {entityData?.showNoteNumbers && (
                      <td className="text-center text-gray-600">8</td>
                    )}
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.equity
                          .filter(equity => equity.majorHead?.name?.includes('Other Equity'))
                          .reduce((sum, equity) => sum + Math.abs(Number(equity.closingBalanceCY)), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.equity
                          .filter(equity => equity.majorHead?.name?.includes('Other Equity'))
                          .reduce((sum, equity) => sum + Math.abs(Number(equity.closingBalancePY)), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Liabilities */}
                  <tr>
                    <td className="py-2 pl-4 pt-6">
                      <span className="font-semibold text-gray-900">(2) Liabilities</span>
                    </td>
                    {entityData?.showNoteNumbers && <td></td>}
                    <td></td>
                    <td></td>
                  </tr>

                  {/* Non-current Liabilities */}
                  <tr>
                    <td className="py-1 pl-8 text-gray-800 font-medium">Non-current liabilities</td>
                    {entityData?.showNoteNumbers && <td></td>}
                    <td></td>
                    <td></td>
                  </tr>

                  {/* Long-term Borrowings */}
                  <tr>
                    <td className="py-1 pl-12 text-gray-800">(a) Long-term borrowings</td>
                    {entityData?.showNoteNumbers && (
                      <td className="text-center text-gray-600">9</td>
                    )}
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.liabilities
                          .filter(liability => liability.majorHead?.name?.includes('Long-term Borrowings'))
                          .reduce((sum, liability) => sum + Math.abs(Number(liability.closingBalanceCY)), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.liabilities
                          .filter(liability => liability.majorHead?.name?.includes('Long-term Borrowings'))
                          .reduce((sum, liability) => sum + Math.abs(Number(liability.closingBalancePY)), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Current Liabilities */}
                  <tr>
                    <td className="py-1 pl-8 text-gray-800 font-medium pt-4">Current liabilities</td>
                    {entityData?.showNoteNumbers && <td></td>}
                    <td></td>
                    <td></td>
                  </tr>

                  {/* Trade Payables */}
                  <tr>
                    <td className="py-1 pl-12 text-gray-800">(a) Trade payables</td>
                    {entityData?.showNoteNumbers && (
                      <td className="text-center text-gray-600">10</td>
                    )}
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.liabilities
                          .filter(liability => liability.majorHead?.name?.includes('Trade Payables'))
                          .reduce((sum, liability) => sum + Math.abs(Number(liability.closingBalanceCY)), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right text-gray-900">
                      {formatNegative(
                        balanceSheetData.liabilities
                          .filter(liability => liability.majorHead?.name?.includes('Trade Payables'))
                          .reduce((sum, liability) => sum + Math.abs(Number(liability.closingBalancePY)), 0),
                        entityData?.negativeColor
                      )}
                    </td>
                  </tr>

                  {/* Total Equity and Liabilities */}
                  <tr className="border-t-2 border-gray-300">
                    <td className="py-3 font-bold text-gray-900">TOTAL EQUITY AND LIABILITIES</td>
                    {entityData?.showNoteNumbers && <td></td>}
                    <td className="text-right font-bold text-gray-900">
                      {formatNegative(
                        balanceSheetData.totalEquity + balanceSheetData.totalLiabilities,
                        entityData?.negativeColor
                      )}
                    </td>
                    <td className="text-right font-bold text-gray-900">
                      {formatNegative(
                        balanceSheetData.equity.reduce((sum, equity) => sum + Math.abs(Number(equity.closingBalancePY)), 0) +
                        balanceSheetData.liabilities.reduce((sum, liability) => sum + Math.abs(Number(liability.closingBalancePY)), 0),
                        entityData?.negativeColor
                      )}
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

        {/* Enhanced Comparison Analysis */}
        {entityData?.includeComparativeAnalysis && balanceSheetData && (
          <ComparisonView
            title="Balance Sheet Comparison Analysis"
            data={[
              // Assets comparison
              {
                label: "Property, Plant and Equipment",
                currentYear: balanceSheetData.assets
                  .filter(asset => asset.majorHead?.name?.includes('Property, Plant and Equipment'))
                  .reduce((sum, asset) => sum + Number(asset.closingBalanceCY), 0),
                previousYear: balanceSheetData.assets
                  .filter(asset => asset.majorHead?.name?.includes('Property, Plant and Equipment'))
                  .reduce((sum, asset) => sum + Number(asset.closingBalancePY), 0),
                category: "Non-current Assets",
                noteNumber: "1",
              },
              {
                label: "Intangible Assets",
                currentYear: balanceSheetData.assets
                  .filter(asset => asset.majorHead?.name?.includes('Intangible'))
                  .reduce((sum, asset) => sum + Number(asset.closingBalanceCY), 0),
                previousYear: balanceSheetData.assets
                  .filter(asset => asset.majorHead?.name?.includes('Intangible'))
                  .reduce((sum, asset) => sum + Number(asset.closingBalancePY), 0),
                category: "Non-current Assets",
                noteNumber: "2",
              },
              {
                label: "Non-current Investments",
                currentYear: balanceSheetData.assets
                  .filter(asset => asset.majorHead?.name?.includes('Non-current Investments'))
                  .reduce((sum, asset) => sum + Number(asset.closingBalanceCY), 0),
                previousYear: balanceSheetData.assets
                  .filter(asset => asset.majorHead?.name?.includes('Non-current Investments'))
                  .reduce((sum, asset) => sum + Number(asset.closingBalancePY), 0),
                category: "Non-current Assets",
                noteNumber: "3",
              },
              {
                label: "Inventories",
                currentYear: balanceSheetData.assets
                  .filter(asset => asset.majorHead?.name?.includes('Inventories'))
                  .reduce((sum, asset) => sum + Number(asset.closingBalanceCY), 0),
                previousYear: balanceSheetData.assets
                  .filter(asset => asset.majorHead?.name?.includes('Inventories'))
                  .reduce((sum, asset) => sum + Number(asset.closingBalancePY), 0),
                category: "Current Assets",
                noteNumber: "4",
              },
              {
                label: "Trade Receivables",
                currentYear: balanceSheetData.assets
                  .filter(asset => asset.majorHead?.name?.includes('Trade Receivables'))
                  .reduce((sum, asset) => sum + Number(asset.closingBalanceCY), 0),
                previousYear: balanceSheetData.assets
                  .filter(asset => asset.majorHead?.name?.includes('Trade Receivables'))
                  .reduce((sum, asset) => sum + Number(asset.closingBalancePY), 0),
                category: "Current Assets",
                noteNumber: "5",
              },
              {
                label: "Cash and Cash Equivalents",
                currentYear: balanceSheetData.assets
                  .filter(asset => asset.majorHead?.name?.includes('Cash'))
                  .reduce((sum, asset) => sum + Number(asset.closingBalanceCY), 0),
                previousYear: balanceSheetData.assets
                  .filter(asset => asset.majorHead?.name?.includes('Cash'))
                  .reduce((sum, asset) => sum + Number(asset.closingBalancePY), 0),
                category: "Current Assets",
                noteNumber: "6",
              },
              // Equity comparison
              {
                label: "Equity Share Capital",
                currentYear: balanceSheetData.equity
                  .filter(equity => equity.majorHead?.name?.includes('Share Capital'))
                  .reduce((sum, equity) => sum + Math.abs(Number(equity.closingBalanceCY)), 0),
                previousYear: balanceSheetData.equity
                  .filter(equity => equity.majorHead?.name?.includes('Share Capital'))
                  .reduce((sum, equity) => sum + Math.abs(Number(equity.closingBalancePY)), 0),
                category: "Equity",
                noteNumber: "7",
              },
              {
                label: "Other Equity",
                currentYear: balanceSheetData.equity
                  .filter(equity => equity.majorHead?.name?.includes('Other Equity'))
                  .reduce((sum, equity) => sum + Math.abs(Number(equity.closingBalanceCY)), 0),
                previousYear: balanceSheetData.equity
                  .filter(equity => equity.majorHead?.name?.includes('Other Equity'))
                  .reduce((sum, equity) => sum + Math.abs(Number(equity.closingBalancePY)), 0),
                category: "Equity",
                noteNumber: "8",
              },
              // Liabilities comparison
              {
                label: "Long-term Borrowings",
                currentYear: balanceSheetData.liabilities
                  .filter(liability => liability.majorHead?.name?.includes('Long-term Borrowings'))
                  .reduce((sum, liability) => sum + Math.abs(Number(liability.closingBalanceCY)), 0),
                previousYear: balanceSheetData.liabilities
                  .filter(liability => liability.majorHead?.name?.includes('Long-term Borrowings'))
                  .reduce((sum, liability) => sum + Math.abs(Number(liability.closingBalancePY)), 0),
                category: "Non-current Liabilities",
                noteNumber: "9",
              },
              {
                label: "Trade Payables",
                currentYear: balanceSheetData.liabilities
                  .filter(liability => liability.majorHead?.name?.includes('Trade Payables'))
                  .reduce((sum, liability) => sum + Math.abs(Number(liability.closingBalanceCY)), 0),
                previousYear: balanceSheetData.liabilities
                  .filter(liability => liability.majorHead?.name?.includes('Trade Payables'))
                  .reduce((sum, liability) => sum + Math.abs(Number(liability.closingBalancePY)), 0),
                category: "Current Liabilities",
                noteNumber: "10",
              },
            ].filter(item => item.currentYear !== 0 || item.previousYear !== 0)}
            currency={entityData?.currency}
            units={entityData?.units}
            negativeColor={entityData?.negativeColor}
            showVariance={entityData?.showVarianceAnalysis}
            showGrowthRate={entityData?.showGrowthRates}
            showTrendIndicators={entityData?.showTrendIndicators}
            compactView={entityData?.comparisonLayout === 'Compact'}
            varianceThreshold={entityData?.varianceThreshold || 25}
          />
        )}

        {/* Key Financial Ratios */}
        {entityData?.includeComparativeAnalysis && balanceSheetData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Financial Ratios & Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Current Ratio */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-900">Current Ratio</h4>
                  <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    Liquidity
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-900 mb-1">
                  {(() => {
                    const currentAssets = balanceSheetData.assets
                      .filter(asset => asset.majorHead?.name?.includes('Trade Receivables') || 
                                     asset.majorHead?.name?.includes('Cash') || 
                                     asset.majorHead?.name?.includes('Inventories'))
                      .reduce((sum, asset) => sum + Number(asset.closingBalanceCY), 0);
                    const currentLiabilities = balanceSheetData.liabilities
                      .filter(liability => liability.majorHead?.name?.includes('Trade Payables') || 
                                          liability.majorHead?.name?.includes('Current Liabilities'))
                      .reduce((sum, liability) => sum + Math.abs(Number(liability.closingBalanceCY)), 0);
                    return currentLiabilities > 0 ? (currentAssets / currentLiabilities).toFixed(2) : '0.00';
                  })()}
                </div>
                <p className="text-xs text-blue-700">
                  {(() => {
                    const currentAssets = balanceSheetData.assets
                      .filter(asset => asset.majorHead?.name?.includes('Trade Receivables') || 
                                     asset.majorHead?.name?.includes('Cash') || 
                                     asset.majorHead?.name?.includes('Inventories'))
                      .reduce((sum, asset) => sum + Number(asset.closingBalanceCY), 0);
                    const currentLiabilities = balanceSheetData.liabilities
                      .filter(liability => liability.majorHead?.name?.includes('Trade Payables') || 
                                          liability.majorHead?.name?.includes('Current Liabilities'))
                      .reduce((sum, liability) => sum + Math.abs(Number(liability.closingBalanceCY)), 0);
                    const ratio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
                    return ratio > 2 ? 'Strong liquidity' : ratio > 1 ? 'Adequate liquidity' : 'Liquidity concern';
                  })()}
                </p>
              </div>

              {/* Debt to Equity Ratio */}
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-red-900">Debt-to-Equity</h4>
                  <div className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                    Leverage
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-900 mb-1">
                  {(() => {
                    const totalDebt = balanceSheetData.liabilities
                      .reduce((sum, liability) => sum + Math.abs(Number(liability.closingBalanceCY)), 0);
                    const totalEquity = balanceSheetData.totalEquity;
                    return totalEquity > 0 ? (totalDebt / totalEquity).toFixed(2) : '0.00';
                  })()}
                </div>
                <p className="text-xs text-red-700">
                  {(() => {
                    const totalDebt = balanceSheetData.liabilities
                      .reduce((sum, liability) => sum + Math.abs(Number(liability.closingBalanceCY)), 0);
                    const totalEquity = balanceSheetData.totalEquity;
                    const ratio = totalEquity > 0 ? totalDebt / totalEquity : 0;
                    return ratio < 0.5 ? 'Conservative' : ratio < 1 ? 'Moderate' : 'High leverage';
                  })()}
                </p>
              </div>

              {/* Asset Composition */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-green-900">Current Assets %</h4>
                  <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                    Structure
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-900 mb-1">
                  {(() => {
                    const currentAssets = balanceSheetData.assets
                      .filter(asset => asset.majorHead?.name?.includes('Trade Receivables') || 
                                     asset.majorHead?.name?.includes('Cash') || 
                                     asset.majorHead?.name?.includes('Inventories'))
                      .reduce((sum, asset) => sum + Number(asset.closingBalanceCY), 0);
                    const totalAssets = balanceSheetData.totalAssets;
                    return totalAssets > 0 ? ((currentAssets / totalAssets) * 100).toFixed(1) : '0.0';
                  })()}%
                </div>
                <p className="text-xs text-green-700">
                  Of total assets
                </p>
              </div>

              {/* Return on Assets */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-purple-900">Asset Growth</h4>
                  <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                    Growth
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-900 mb-1">
                  {(() => {
                    const currentAssets = balanceSheetData.totalAssets;
                    const previousAssets = balanceSheetData.assets.reduce((sum, asset) => sum + Number(asset.closingBalancePY), 0);
                    const growth = previousAssets > 0 ? ((currentAssets - previousAssets) / previousAssets) * 100 : 0;
                    return (growth >= 0 ? '+' : '') + growth.toFixed(1);
                  })()}%
                </div>
                <p className="text-xs text-purple-700">
                  Year-over-year
                </p>
              </div>
            </div>

            {/* Insights Section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <strong>Liquidity Position:</strong>
                  <p>
                    {(() => {
                      const currentAssets = balanceSheetData.assets
                        .filter(asset => asset.majorHead?.name?.includes('Trade Receivables') || 
                                       asset.majorHead?.name?.includes('Cash') || 
                                       asset.majorHead?.name?.includes('Inventories'))
                        .reduce((sum, asset) => sum + Number(asset.closingBalanceCY), 0);
                      const currentLiabilities = balanceSheetData.liabilities
                        .filter(liability => liability.majorHead?.name?.includes('Trade Payables') || 
                                            liability.majorHead?.name?.includes('Current Liabilities'))
                        .reduce((sum, liability) => sum + Math.abs(Number(liability.closingBalanceCY)), 0);
                      const ratio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
                      
                      if (ratio > 2) return "Strong liquidity position with adequate current assets to cover short-term obligations.";
                      if (ratio > 1) return "Adequate liquidity to meet current obligations, monitor cash flow.";
                      return "Liquidity concerns - current assets may not cover short-term liabilities.";
                    })()}
                  </p>
                </div>
                <div>
                  <strong>Capital Structure:</strong>
                  <p>
                    {(() => {
                      const totalDebt = balanceSheetData.liabilities
                        .reduce((sum, liability) => sum + Math.abs(Number(liability.closingBalanceCY)), 0);
                      const totalEquity = balanceSheetData.totalEquity;
                      const ratio = totalEquity > 0 ? totalDebt / totalEquity : 0;
                      
                      if (ratio < 0.5) return "Conservative capital structure with low debt levels.";
                      if (ratio < 1) return "Balanced capital structure with moderate leverage.";
                      return "High leverage - monitor debt servicing capacity.";
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                ₹{formatCurrency(balanceSheetData.totalAssets)}
              </div>
              <p className="text-gray-600">Total Assets</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ₹{formatCurrency(balanceSheetData.totalEquity)}
              </div>
              <p className="text-gray-600">Total Equity</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                ₹{formatCurrency(balanceSheetData.totalLiabilities)}
              </div>
              <p className="text-gray-600">Total Liabilities</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
