import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/outline';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ComparisonData {
  label: string;
  currentYear: number;
  previousYear: number;
  category?: string;
  noteNumber?: string;
}

interface ComparisonViewProps {
  data: ComparisonData[];
  title: string;
  currency?: string;
  units?: string;
  negativeColor?: string;
  showVariance?: boolean;
  showGrowthRate?: boolean;
  showTrendIndicators?: boolean;
  compactView?: boolean;
  varianceThreshold?: number;
}

export default function ComparisonView({
  data,
  title,
  currency = 'INR',
  units = 'Millions',
  negativeColor = 'Brackets',
  showVariance = true,
  showGrowthRate = true,
  showTrendIndicators = true,
  compactView = false,
  varianceThreshold = 25,
}: ComparisonViewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const formatNegative = (amount: number) => {
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

  const calculateVariance = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const getTrendIcon = (variance: number) => {
    if (Math.abs(variance) < 5) return <MinusIcon className="h-4 w-4 text-gray-500" />;
    if (variance > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getVarianceColor = (variance: number) => {
    if (Math.abs(variance) < 5) return 'text-gray-600';
    if (Math.abs(variance) > varianceThreshold) return variance > 0 ? 'text-green-700' : 'text-red-700';
    return variance > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">
          Period-over-period comparison ({currency} {units})
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Particulars
              </th>
              {!compactView && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
                </th>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Year
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Previous Year
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change (₹)
              </th>
              {showVariance && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variance (%)
                </th>
              )}
              {showGrowthRate && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth (%)
                </th>
              )}
              {showTrendIndicators && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => {
              const variance = calculateVariance(item.currentYear, item.previousYear);
              const growthRate = calculateGrowthRate(item.currentYear, item.previousYear);
              const absoluteChange = item.currentYear - item.previousYear;
              
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.label}</div>
                    {item.category && (
                      <div className="text-xs text-gray-500">{item.category}</div>
                    )}
                  </td>
                  {!compactView && (
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                      {item.noteNumber || '--'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatNegative(item.currentYear)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatNegative(item.previousYear)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={absoluteChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {absoluteChange >= 0 ? '+' : ''}{formatNegative(absoluteChange)}
                    </span>
                  </td>
                  {showVariance && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={getVarianceColor(variance)}>
                        {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
                      </span>
                      {Math.abs(variance) > varianceThreshold && (
                        <span className="ml-1 text-xs text-amber-600">⚠</span>
                      )}
                    </td>
                  )}
                  {showGrowthRate && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                      </span>
                    </td>
                  )}
                  {showTrendIndicators && (
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getTrendIcon(variance)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Summary Section */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Items:</span>
            <span className="ml-2 font-medium">{data.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Items Increased:</span>
            <span className="ml-2 font-medium text-green-600">
              {data.filter(item => item.currentYear > item.previousYear).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Items Decreased:</span>
            <span className="ml-2 font-medium text-red-600">
              {data.filter(item => item.currentYear < item.previousYear).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Significant Changes:</span>
            <span className="ml-2 font-medium text-amber-600">
              {data.filter(item => Math.abs(calculateVariance(item.currentYear, item.previousYear)) > varianceThreshold).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
