import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import Layout from "~/components/Layout";
import {
  CalculatorIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export const Route = createFileRoute("/ratio-analysis/")({
  component: RatioAnalysis,
});

function RatioAnalysis() {
  const trpc = useTRPC();

  // Fetch data
  const ratioAnalysisQuery = useQuery(trpc.generateRatioAnalysis.queryOptions());
  const commonControlQuery = useQuery(trpc.getCommonControl.queryOptions());

  // Export mutation
  const exportMutation = useMutation({
    ...trpc.exportRatioAnalysis.mutationOptions(),
    onSuccess: (data) => {
      toast.success('Ratio analysis exported successfully!');
      window.open(data.downloadUrl, '_blank');
    },
    onError: (error) => {
      toast.error('Failed to export ratio analysis: ' + error.message);
    },
  });

  const handleExport = () => {
    exportMutation.mutate({ format: 'xlsx' });
  };

  const formatRatio = (value: number, isPercentage: boolean = false) => {
    if (isPercentage) {
      return value.toFixed(2) + '%';
    }
    return value.toFixed(2);
  };

  const formatVariance = (variance: number) => {
    const absVariance = Math.abs(variance);
    const sign = variance >= 0 ? '+' : '-';
    return `${sign}${absVariance.toFixed(1)}%`;
  };

  const entityData = commonControlQuery.data;
  const ratioData = ratioAnalysisQuery.data;

  if (ratioAnalysisQuery.isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating Ratio Analysis...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!ratioData || !ratioData.ratios.length) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CalculatorIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                  Ratio Analysis
                </h1>
                <p className="text-gray-600 mt-2">
                  Analyze key financial ratios and variance explanations
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
                  Please upload trial balance data first to generate ratio analysis.
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
              <CalculatorIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                  Ratio Analysis
                </h1>
                <p className="text-gray-600 mt-2">
                  Financial ratios for the year ended {entityData?.financialYearEnd 
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

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {ratioData.summary.totalRatios}
              </div>
              <p className="text-gray-600">Total Ratios</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {ratioData.summary.ratiosRequiringExplanation}
              </div>
              <p className="text-gray-600">Require Explanation</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {ratioData.summary.totalRatios - ratioData.summary.ratiosRequiringExplanation}
              </div>
              <p className="text-gray-600">Stable Ratios</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {ratioData.summary.averageVariance.toFixed(1)}%
              </div>
              <p className="text-gray-600">Avg. Variance</p>
            </div>
          </div>
        </div>

        {/* Ratios Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Financial Ratios Analysis</h3>
            <p className="text-sm text-gray-600 mt-1">
              Ratios with variance {'>'}25% require explanation as per Schedule III requirements
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ratio Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formula
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Year
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Previous Year
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variance
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ratioData.ratios.map((ratio, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ratio.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{ratio.formula}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatRatio(ratio.currentYear, ratio.name.includes('%'))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatRatio(ratio.previousYear, ratio.name.includes('%'))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`font-medium ${
                        Math.abs(ratio.variance) > 25 
                          ? ratio.variance > 0 ? 'text-green-600' : 'text-red-600'
                          : 'text-gray-900'
                      }`}>
                        {formatVariance(ratio.variance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {ratio.requiresExplanation ? (
                        <ExclamationCircleIcon className="h-6 w-6 text-red-500 mx-auto" title="Requires explanation" />
                      ) : (
                        <CheckCircleIcon className="h-6 w-6 text-green-500 mx-auto" title="Stable" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Variance Explanations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Variance Explanations</h3>
          <p className="text-sm text-gray-600 mb-6">
            As per Schedule III requirements, explanations for ratios with variance {'>'}25%:
          </p>
          
          <div className="space-y-4">
            {ratioData.ratios
              .filter(ratio => ratio.requiresExplanation)
              .map((ratio, index) => (
                <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-start">
                    <ExclamationCircleIcon className="h-5 w-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        {ratio.name} - {formatVariance(ratio.variance)} variance
                      </h4>
                      <p className="text-sm text-gray-700">{ratio.explanation}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        Current: {formatRatio(ratio.currentYear, ratio.name.includes('%'))} | 
                        Previous: {formatRatio(ratio.previousYear, ratio.name.includes('%'))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            
            {ratioData.ratios.filter(ratio => ratio.requiresExplanation).length === 0 && (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">All Ratios Stable</h4>
                <p className="text-gray-600">
                  No ratios have variance {'>'}25%, so no explanations are required.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Liquidity Analysis</h4>
              <p className="text-sm text-gray-600">
                {ratioData.ratios.find(r => r.name === 'Current Ratio')?.currentYear || 0 > 1.5
                  ? 'Strong liquidity position with adequate current assets to cover current liabilities.'
                  : 'Monitor liquidity position - current ratio may indicate potential cash flow concerns.'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Profitability Analysis</h4>
              <p className="text-sm text-gray-600">
                {ratioData.ratios.find(r => r.name === 'Return on Assets (%)')?.currentYear || 0 > 5
                  ? 'Good asset utilization generating reasonable returns.'
                  : 'Consider strategies to improve asset efficiency and profitability.'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Leverage Analysis</h4>
              <p className="text-sm text-gray-600">
                {ratioData.ratios.find(r => r.name === 'Debt to Equity Ratio')?.currentYear || 0 < 1
                  ? 'Conservative debt levels with strong equity base.'
                  : 'Monitor debt levels and ensure adequate cash flow to service debt obligations.'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Efficiency Analysis</h4>
              <p className="text-sm text-gray-600">
                {ratioData.ratios.find(r => r.name === 'Asset Turnover Ratio')?.currentYear || 0 > 1
                  ? 'Efficient asset utilization generating good revenue per rupee of assets.'
                  : 'Opportunity to improve asset turnover through better asset management.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
