import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "~/components/Layout";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useSelectedCompany } from '~/stores/companyStore';
import {
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  CogIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export const Route = createFileRoute("/common-control/")({
  component: CommonControl,
});

const commonControlSchema = z.object({
  entityName: z.string().min(1, 'Entity name is required'),
  address: z.string().min(1, 'Address is required'),
  cinNumber: z.string().optional(),
  financialYearStart: z.string().min(1, 'Financial year start is required'),
  financialYearEnd: z.string().min(1, 'Financial year end is required'),
  currency: z.string().default('INR'),
  units: z.string().default('Millions'),
  numbersFormat: z.string().default('Accounting'),
  negativeColor: z.string().default('Brackets'),
  defaultFont: z.string().default('Bookman Old Style'),
  defaultFontSize: z.number().min(8).max(72).default(11),
  
  // Comparison Settings
  showVarianceAnalysis: z.boolean().default(true),
  showGrowthRates: z.boolean().default(true),
  showTrendIndicators: z.boolean().default(true),
  varianceThreshold: z.number().min(0).max(100).default(25),
  comparisonLayout: z.string().default('Detailed'),
  
  // Report Customization
  includeComplianceIndicators: z.boolean().default(true),
  showNoteNumbers: z.boolean().default(true),
  includeSummaryStats: z.boolean().default(true),
  reportHeaderStyle: z.string().default('Standard'),
  pageOrientation: z.string().default('Portrait'),
  includeSignatureSection: z.boolean().default(true),
  
  // Advanced Settings
  roundingPrecision: z.number().min(0).max(4).default(2),
  zeroDisplayMode: z.string().default('Dash'),
  includeComparativeAnalysis: z.boolean().default(true),
  autoGenerateExplanations: z.boolean().default(true),
});

type CommonControlData = z.infer<typeof commonControlSchema>;

function CommonControl() {
  const trpc = useTRPC();
  const { selectedCompanyId } = useSelectedCompany();

  const [editingMajorHead, setEditingMajorHead] = useState<{ id: string; name: string } | null>(null);
  const [editingGrouping, setEditingGrouping] = useState<{ id: string; name: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'majorHead' | 'grouping'; id: string; name: string } | null>(null);

  // Fetch current data
  const commonControlQuery = useQuery(
    selectedCompanyId 
      ? trpc.getCommonControl.queryOptions({ companyId: selectedCompanyId })
      : { enabled: false }
  );

  // Fetch minor heads data
  const minorHeadsQuery = useQuery(
    selectedCompanyId 
      ? trpc.getMinorHeads.queryOptions({ companyId: selectedCompanyId })
      : { enabled: false }
  );

  // Fetch major heads and groupings data
  const majorHeadsQuery = useQuery(trpc.getMajorHeads.queryOptions());
  const groupingsQuery = useQuery(trpc.getGroupings.queryOptions());

  // Update mutation
  const updateMutation = useMutation({
    ...trpc.updateCommonControl.mutationOptions(),
    onSuccess: () => {
      toast.success('Configuration saved successfully!');
      commonControlQuery.refetch();
    },
    onError: (error) => {
      toast.error('Failed to save configuration: ' + error.message);
    },
  });

  // Add minor head mutation
  const addMinorHeadMutation = useMutation({
    ...trpc.addMinorHead.mutationOptions(),
    onSuccess: () => {
      toast.success('Minor head added successfully!');
      minorHeadsQuery.refetch();
    },
    onError: (error) => {
      toast.error('Failed to add minor head: ' + error.message);
    },
  });

  // Major heads mutations
  const addMajorHeadMutation = useMutation({
    ...trpc.addMajorHead.mutationOptions(),
    onSuccess: () => {
      toast.success('Major head added successfully!');
      majorHeadsQuery.refetch();
    },
    onError: (error) => {
      toast.error('Failed to add major head: ' + error.message);
    },
  });

  const updateMajorHeadMutation = useMutation({
    ...trpc.updateMajorHead.mutationOptions(),
    onSuccess: () => {
      toast.success('Major head updated successfully!');
      majorHeadsQuery.refetch();
      setEditingMajorHead(null);
    },
    onError: (error) => {
      toast.error('Failed to update major head: ' + error.message);
    },
  });

  const deleteMajorHeadMutation = useMutation({
    ...trpc.deleteMajorHead.mutationOptions(),
    onSuccess: () => {
      toast.success('Major head deleted successfully!');
      majorHeadsQuery.refetch();
      setShowDeleteConfirm(null);
    },
    onError: (error) => {
      toast.error('Failed to delete major head: ' + error.message);
    },
  });

  // Groupings mutations
  const addGroupingMutation = useMutation({
    ...trpc.addGrouping.mutationOptions(),
    onSuccess: () => {
      toast.success('Grouping added successfully!');
      groupingsQuery.refetch();
    },
    onError: (error) => {
      toast.error('Failed to add grouping: ' + error.message);
    },
  });

  const updateGroupingMutation = useMutation({
    ...trpc.updateGrouping.mutationOptions(),
    onSuccess: () => {
      toast.success('Grouping updated successfully!');
      groupingsQuery.refetch();
      setEditingGrouping(null);
    },
    onError: (error) => {
      toast.error('Failed to update grouping: ' + error.message);
    },
  });

  const deleteGroupingMutation = useMutation({
    ...trpc.deleteGrouping.mutationOptions(),
    onSuccess: () => {
      toast.success('Grouping deleted successfully!');
      groupingsQuery.refetch();
      setShowDeleteConfirm(null);
    },
    onError: (error) => {
      toast.error('Failed to delete grouping: ' + error.message);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<CommonControlData>({
    resolver: zodResolver(commonControlSchema),
    defaultValues: {
      currency: 'INR',
      units: 'Millions',
      numbersFormat: 'Accounting',
      negativeColor: 'Brackets',
      defaultFont: 'Bookman Old Style',
      defaultFontSize: 11,
      showVarianceAnalysis: true,
      showGrowthRates: true,
      showTrendIndicators: true,
      varianceThreshold: 25,
      comparisonLayout: 'Detailed',
      includeComplianceIndicators: true,
      showNoteNumbers: true,
      includeSummaryStats: true,
      reportHeaderStyle: 'Standard',
      pageOrientation: 'Portrait',
      includeSignatureSection: true,
      roundingPrecision: 2,
      zeroDisplayMode: 'Dash',
      includeComparativeAnalysis: true,
      autoGenerateExplanations: true,
    },
  });

  // Load existing data when query succeeds
  useEffect(() => {
    if (commonControlQuery.data) {
      const data = commonControlQuery.data;
      reset({
        entityName: data.entityName || '',
        address: data.address || '',
        cinNumber: data.cinNumber || '',
        financialYearStart: data.financialYearStart 
          ? new Date(data.financialYearStart).toISOString().split('T')[0] 
          : '',
        financialYearEnd: data.financialYearEnd 
          ? new Date(data.financialYearEnd).toISOString().split('T')[0] 
          : '',
        currency: data.currency,
        units: data.units,
        numbersFormat: data.numbersFormat,
        negativeColor: data.negativeColor,
        defaultFont: data.defaultFont,
        defaultFontSize: data.defaultFontSize,
        showVarianceAnalysis: data.showVarianceAnalysis ?? true,
        showGrowthRates: data.showGrowthRates ?? true,
        showTrendIndicators: data.showTrendIndicators ?? true,
        varianceThreshold: data.varianceThreshold ?? 25,
        comparisonLayout: data.comparisonLayout ?? 'Detailed',
        includeComplianceIndicators: data.includeComplianceIndicators ?? true,
        showNoteNumbers: data.showNoteNumbers ?? true,
        includeSummaryStats: data.includeSummaryStats ?? true,
        reportHeaderStyle: data.reportHeaderStyle ?? 'Standard',
        pageOrientation: data.pageOrientation ?? 'Portrait',
        includeSignatureSection: data.includeSignatureSection ?? true,
        roundingPrecision: data.roundingPrecision ?? 2,
        zeroDisplayMode: data.zeroDisplayMode ?? 'Dash',
        includeComparativeAnalysis: data.includeComparativeAnalysis ?? true,
        autoGenerateExplanations: data.autoGenerateExplanations ?? true,
      });
    }
  }, [commonControlQuery.data, reset]);

  const onSubmit = async (data: CommonControlData) => {
    if (!selectedCompanyId) {
      toast.error('Please select a company first');
      return;
    }
    try {
      await updateMutation.mutateAsync({
        companyId: selectedCompanyId,
        ...data,
        financialYearStart: new Date(data.financialYearStart),
        financialYearEnd: new Date(data.financialYearEnd),
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleAddMajorHead = (name: string) => {
    if (name.trim()) {
      addMajorHeadMutation.mutate({ name: name.trim() });
    }
  };

  const handleUpdateMajorHead = (name: string) => {
    if (editingMajorHead && name.trim()) {
      updateMajorHeadMutation.mutate({ id: editingMajorHead.id, name: name.trim() });
    }
  };

  const handleDeleteMajorHead = (id: string) => {
    deleteMajorHeadMutation.mutate({ id });
  };

  const handleAddGrouping = (name: string) => {
    if (name.trim()) {
      addGroupingMutation.mutate({ name: name.trim() });
    }
  };

  const handleUpdateGrouping = (name: string) => {
    if (editingGrouping && name.trim()) {
      updateGroupingMutation.mutate({ id: editingGrouping.id, name: name.trim() });
    }
  };

  const handleDeleteGrouping = (id: string) => {
    deleteGroupingMutation.mutate({ id });
  };

  // Watch values for preview
  const watchedValues = watch();

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CogIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                Common Control Settings
              </h1>
              <p className="text-gray-600 mt-2">
                Configure your entity details and financial statement preferences
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Entity Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Entity Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entity Name *
                    </label>
                    <input
                      {...register('entityName')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter entity name"
                    />
                    {errors.entityName && (
                      <p className="text-red-500 text-sm mt-1">{errors.entityName.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      {...register('address')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter complete address"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CIN Number
                    </label>
                    <input
                      {...register('cinNumber')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter CIN number (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Year */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <CalendarIcon className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Financial Year</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      {...register('financialYearStart')}
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.financialYearStart && (
                      <p className="text-red-500 text-sm mt-1">{errors.financialYearStart.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      {...register('financialYearEnd')}
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.financialYearEnd && (
                      <p className="text-red-500 text-sm mt-1">{errors.financialYearEnd.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Display Preferences */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <DocumentTextIcon className="h-6 w-6 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Display Preferences</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      {...register('currency')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="INR">INR (Indian Rupee)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Units
                    </label>
                    <select
                      {...register('units')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Actual">Actual</option>
                      <option value="Thousands">Thousands</option>
                      <option value="Millions">Millions</option>
                      <option value="Crores">Crores</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numbers Format
                    </label>
                    <select
                      {...register('numbersFormat')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Accounting">Accounting</option>
                      <option value="Number">Number</option>
                      <option value="Currency">Currency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Negative Display
                    </label>
                    <select
                      {...register('negativeColor')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Brackets">Brackets (1,000)</option>
                      <option value="Red">Red Color</option>
                      <option value="Minus">Minus Sign -1,000</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Font
                    </label>
                    <select
                      {...register('defaultFont')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Bookman Old Style">Bookman Old Style</option>
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Calibri">Calibri</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Size
                    </label>
                    <input
                      {...register('defaultFontSize', { valueAsNumber: true })}
                      type="number"
                      min="8"
                      max="72"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.defaultFontSize && (
                      <p className="text-red-500 text-sm mt-1">{errors.defaultFontSize.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Comparison Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-amber-600 rounded mr-2"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Comparison Settings</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variance Threshold (%)
                    </label>
                    <input
                      {...register('varianceThreshold', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Threshold for highlighting significant variances
                    </p>
                    {errors.varianceThreshold && (
                      <p className="text-red-500 text-sm mt-1">{errors.varianceThreshold.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comparison Layout
                    </label>
                    <select
                      {...register('comparisonLayout')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Detailed">Detailed (All columns)</option>
                      <option value="Compact">Compact (Essential columns)</option>
                      <option value="Summary">Summary (Totals only)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          {...register('showVarianceAnalysis')}
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Show variance analysis in reports
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          {...register('showGrowthRates')}
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Include growth rate calculations
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          {...register('showTrendIndicators')}
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Display trend indicators
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          {...register('includeComparativeAnalysis')}
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Include comparative analysis section
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Customization */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-teal-600 rounded mr-2"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Report Customization</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Report Header Style
                    </label>
                    <select
                      {...register('reportHeaderStyle')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Minimal">Minimal</option>
                      <option value="Detailed">Detailed</option>
                      <option value="Corporate">Corporate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Page Orientation
                    </label>
                    <select
                      {...register('pageOrientation')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Portrait">Portrait</option>
                      <option value="Landscape">Landscape</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rounding Precision
                    </label>
                    <select
                      {...register('roundingPrecision', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={0}>Whole numbers</option>
                      <option value={1}>1 decimal place</option>
                      <option value={2}>2 decimal places</option>
                      <option value={3}>3 decimal places</option>
                      <option value={4}>4 decimal places</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zero Display Mode
                    </label>
                    <select
                      {...register('zeroDisplayMode')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Dash">Dash (--)</option>
                      <option value="Zero">Zero (0.00)</option>
                      <option value="Blank">Blank</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          {...register('includeComplianceIndicators')}
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Include compliance indicators
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          {...register('showNoteNumbers')}
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Show note numbers in statements
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          {...register('includeSummaryStats')}
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Include summary statistics
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          {...register('includeSignatureSection')}
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Include signature section
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          {...register('autoGenerateExplanations')}
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Auto-generate variance explanations
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending || !isDirty}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>

            {/* Minor Heads Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-orange-600 rounded mr-2"></div>
                <h3 className="text-lg font-semibold text-gray-900">Minor Heads</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter minor head name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value;
                        if (value.trim() && selectedCompanyId) {
                          addMinorHeadMutation.mutate({ companyId: selectedCompanyId, name: value.trim() });
                          (e.target as HTMLInputElement).value = '';
                        } else if (!selectedCompanyId) {
                          toast.error('Please select a company first');
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Enter minor head name"]') as HTMLInputElement;
                      const value = input.value;
                      if (value.trim() && selectedCompanyId) {
                        addMinorHeadMutation.mutate({ companyId: selectedCompanyId, name: value.trim() });
                        input.value = '';
                      } else if (!selectedCompanyId) {
                        toast.error('Please select a company first');
                      }
                    }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {minorHeadsQuery.data?.map((minorHead) => (
                      <div key={minorHead.id} className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                        <span className="text-sm text-gray-800">{minorHead.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {(!minorHeadsQuery.data || minorHeadsQuery.data.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No minor heads configured</p>
                  </div>
                )}
              </div>
            </div>

            {/* Major Heads Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-600 rounded mr-2"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Major Heads</h3>
                </div>
                <span className="text-sm text-gray-500">
                  {majorHeadsQuery.data?.length || 0} items
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter major head name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value;
                        handleAddMajorHead(value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Enter major head name"]') as HTMLInputElement;
                      const value = input.value;
                      handleAddMajorHead(value);
                      input.value = '';
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-2">
                    {majorHeadsQuery.data?.map((majorHead) => (
                      <div key={majorHead.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                        {editingMajorHead?.id === majorHead.id ? (
                          <div className="flex-1 flex items-center space-x-2">
                            <input
                              type="text"
                              defaultValue={majorHead.name}
                              className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateMajorHead((e.target as HTMLInputElement).value);
                                }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                const input = document.querySelector(`input[defaultValue="${majorHead.name}"]`) as HTMLInputElement;
                                handleUpdateMajorHead(input.value);
                              }}
                              className="text-green-600 hover:text-green-800 p-1"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingMajorHead(null)}
                              className="text-gray-600 hover:text-gray-800 p-1"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm text-gray-800 flex-1">{majorHead.name}</span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => setEditingMajorHead(majorHead)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm({ type: 'majorHead', id: majorHead.id, name: majorHead.name })}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {(!majorHeadsQuery.data || majorHeadsQuery.data.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No major heads configured</p>
                  </div>
                )}
              </div>
            </div>

            {/* Groupings Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-purple-600 rounded mr-2"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Groupings</h3>
                </div>
                <span className="text-sm text-gray-500">
                  {groupingsQuery.data?.length || 0} items
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter grouping name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value;
                        handleAddGrouping(value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Enter grouping name"]') as HTMLInputElement;
                      const value = input.value;
                      handleAddGrouping(value);
                      input.value = '';
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {groupingsQuery.data?.map((grouping) => (
                      <div key={grouping.id} className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center justify-between">
                        {editingGrouping?.id === grouping.id ? (
                          <div className="flex-1 flex items-center space-x-2">
                            <input
                              type="text"
                              defaultValue={grouping.name}
                              className="flex-1 px-2 py-1 border border-purple-300 rounded text-sm"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateGrouping((e.target as HTMLInputElement).value);
                                }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                const input = document.querySelector(`input[defaultValue="${grouping.name}"]`) as HTMLInputElement;
                                handleUpdateGrouping(input.value);
                              }}
                              className="text-green-600 hover:text-green-800 p-1"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingGrouping(null)}
                              className="text-gray-600 hover:text-gray-800 p-1"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm text-gray-800 flex-1">{grouping.name}</span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => setEditingGrouping(grouping)}
                                className="text-purple-600 hover:text-purple-800 p-1"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm({ type: 'grouping', id: grouping.id, name: grouping.name })}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {(!groupingsQuery.data || groupingsQuery.data.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No groupings configured</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="text-center" style={{ fontFamily: watchedValues.defaultFont, fontSize: `${watchedValues.defaultFontSize}px` }}>
                    <h4 className="font-bold text-gray-900">
                      {watchedValues.entityName || 'Entity Name'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {watchedValues.address || 'Entity Address'}
                    </p>
                    {watchedValues.cinNumber && (
                      <p className="text-sm text-gray-600">
                        CIN: {watchedValues.cinNumber}
                      </p>
                    )}
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <p className="text-sm font-medium">
                        Balance Sheet as at{' '}
                        {watchedValues.financialYearEnd 
                          ? new Date(watchedValues.financialYearEnd).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          : 'March 31, 2024'
                        }
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        (All amounts in {watchedValues.currency} {watchedValues.units})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sample Numbers Display */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Number Format Preview</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Positive Amount:</span>
                      <span>₹1,50,000.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Negative Amount:</span>
                      <span className={watchedValues.negativeColor === 'Red' ? 'text-red-600' : ''}>
                        {watchedValues.negativeColor === 'Brackets' ? '(₹50,000.00)' : 
                         watchedValues.negativeColor === 'Minus' ? '-₹50,000.00' : 
                         '₹50,000.00'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comparison Preview */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Comparison Settings Preview</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Variance Threshold:</span>
                      <span>{watchedValues.varianceThreshold}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Layout:</span>
                      <span>{watchedValues.comparisonLayout}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Show Variance:</span>
                      <span className={watchedValues.showVarianceAnalysis ? 'text-green-600' : 'text-red-600'}>
                        {watchedValues.showVarianceAnalysis ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Growth Rates:</span>
                      <span className={watchedValues.showGrowthRates ? 'text-green-600' : 'text-red-600'}>
                        {watchedValues.showGrowthRates ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trend Indicators:</span>
                      <span className={watchedValues.showTrendIndicators ? 'text-green-600' : 'text-red-600'}>
                        {watchedValues.showTrendIndicators ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Report Customization Preview */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Report Settings Preview</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Header Style:</span>
                      <span>{watchedValues.reportHeaderStyle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Page Orientation:</span>
                      <span>{watchedValues.pageOrientation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rounding:</span>
                      <span>{watchedValues.roundingPrecision} decimal places</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Zero Display:</span>
                      <span>{watchedValues.zeroDisplayMode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Note Numbers:</span>
                      <span className={watchedValues.showNoteNumbers ? 'text-green-600' : 'text-red-600'}>
                        {watchedValues.showNoteNumbers ? 'Show' : 'Hide'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className={`h-5 w-5 mr-2 ${
                      watchedValues.entityName && watchedValues.address && 
                      watchedValues.financialYearStart && watchedValues.financialYearEnd
                        ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm ${
                      watchedValues.entityName && watchedValues.address && 
                      watchedValues.financialYearStart && watchedValues.financialYearEnd
                        ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {watchedValues.entityName && watchedValues.address && 
                       watchedValues.financialYearStart && watchedValues.financialYearEnd
                        ? 'Configuration Complete' : 'Configuration Incomplete'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Delete {showDeleteConfirm.type === 'majorHead' ? 'Major Head' : 'Grouping'}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete "{showDeleteConfirm.name}"? This action cannot be undone and may affect existing trial balance entries.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (showDeleteConfirm.type === 'majorHead') {
                        handleDeleteMajorHead(showDeleteConfirm.id);
                      } else {
                        handleDeleteGrouping(showDeleteConfirm.id);
                      }
                    }}
                    disabled={deleteMajorHeadMutation.isPending || deleteGroupingMutation.isPending}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {(deleteMajorHeadMutation.isPending || deleteGroupingMutation.isPending) ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
