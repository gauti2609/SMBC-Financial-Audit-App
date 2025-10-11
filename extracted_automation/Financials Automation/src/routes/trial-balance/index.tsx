import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "~/components/Layout";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useCompanyStore } from '~/stores/companyStore';
import {
  DocumentArrowUpIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TableCellsIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export const Route = createFileRoute("/trial-balance/")({
  component: TrialBalance,
});

const trialBalanceSchema = z.object({
  ledgerName: z.string().min(1, 'Ledger name is required'),
  openingBalanceCY: z.number().default(0),
  debitCY: z.number().default(0),
  creditCY: z.number().default(0),
  closingBalanceCY: z.number().default(0),
  closingBalancePY: z.number().default(0),
  type: z.enum(['BS', 'PL']),
  majorHead: z.string().optional(),
  minorHead: z.string().optional(),
  grouping: z.string().optional(),
});

type TrialBalanceEntry = z.infer<typeof trialBalanceSchema>;

// Edit Entry Form Component
function EditEntryForm({ entry, onSubmit, onCancel, majorHeads, minorHeads, groupings, isLoading }: {
  entry: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  majorHeads: any[];
  minorHeads: any[];
  groupings: any[];
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(trialBalanceSchema),
    defaultValues: {
      ledgerName: entry.ledgerName,
      openingBalanceCY: Number(entry.openingBalanceCY),
      debitCY: Number(entry.debitCY),
      creditCY: Number(entry.creditCY),
      closingBalancePY: Number(entry.closingBalancePY),
      type: entry.type,
      majorHead: entry.majorHead,
      minorHead: entry.minorHead,
      grouping: entry.grouping,
    },
  });

  const openingBalance = watch('openingBalanceCY');
  const debit = watch('debitCY');
  const credit = watch('creditCY');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ledger Name *
          </label>
          <input
            {...register('ledgerName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter ledger name"
          />
          {errors.ledgerName && (
            <p className="text-red-500 text-sm mt-1">{errors.ledgerName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <select
            {...register('type')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select type</option>
            <option value="BS">Balance Sheet</option>
            <option value="PL">P&L Statement</option>
          </select>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Major Head
          </label>
          <select
            {...register('majorHead')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select major head</option>
            {majorHeads?.map((head) => (
              <option key={head.id} value={head.name}>
                {head.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minor Head
          </label>
          <select
            {...register('minorHead')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select minor head</option>
            {minorHeads?.map((head) => (
              <option key={head.id} value={head.name}>
                {head.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grouping
          </label>
          <select
            {...register('grouping')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select grouping</option>
            {groupings?.map((grouping) => (
              <option key={grouping.id} value={grouping.name}>
                {grouping.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opening Balance (CY)
          </label>
          <input
            {...register('openingBalanceCY', { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Debit (CY)
          </label>
          <input
            {...register('debitCY', { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credit (CY)
          </label>
          <input
            {...register('creditCY', { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Closing Balance (PY)
          </label>
          <input
            {...register('closingBalancePY', { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-gray-600">
          Calculated Closing Balance (CY): <strong>₹{formatCurrency((openingBalance || 0) + (debit || 0) - (credit || 0))}</strong>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Update Entry'}
          </button>
        </div>
      </div>
    </form>
  );
}

function TrialBalance() {
  const trpc = useTRPC();
  const { currentCompany } = useCompanyStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Fetch data
  const trialBalanceQuery = useQuery(trpc.getTrialBalance.queryOptions({
    companyId: currentCompany?.id || '',
  }));
  const majorHeadsQuery = useQuery(trpc.getMajorHeads.queryOptions());
  const minorHeadsQuery = useQuery(trpc.getMinorHeads.queryOptions());
  const groupingsQuery = useQuery(trpc.getGroupings.queryOptions());

  // Upload mutation
  const uploadMutation = useMutation({
    ...trpc.uploadTrialBalance.mutationOptions(),
    onSuccess: () => {
      toast.success('Trial Balance uploaded successfully!');
      trialBalanceQuery.refetch();
      setShowAddForm(false);
    },
    onError: (error) => {
      toast.error('Failed to upload trial balance: ' + error.message);
    },
  });

  // File upload mutations
  const getUploadUrlMutation = useMutation({
    ...trpc.getTrialBalanceUploadUrl.mutationOptions(),
    onError: (error) => {
      toast.error('Failed to get upload URL: ' + error.message);
      setUploadingFile(false);
    },
  });

  const processFileMutation = useMutation({
    ...trpc.processTrialBalanceFile.mutationOptions(),
    onSuccess: (data) => {
      toast.success(`Successfully uploaded ${data.entriesProcessed} trial balance entries!`);
      trialBalanceQuery.refetch();
      setUploadingFile(false);
      setUploadProgress(0);
    },
    onError: (error) => {
      toast.error('Failed to process file: ' + error.message);
      setUploadingFile(false);
      setUploadProgress(0);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    ...trpc.updateTrialBalanceEntry.mutationOptions(),
    onSuccess: () => {
      toast.success('Entry updated successfully!');
      trialBalanceQuery.refetch();
      setEditingEntry(null);
    },
    onError: (error) => {
      toast.error('Failed to update entry: ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    ...trpc.deleteTrialBalanceEntry.mutationOptions(),
    onSuccess: () => {
      toast.success('Entry deleted successfully!');
      trialBalanceQuery.refetch();
      setShowDeleteConfirm(null);
    },
    onError: (error) => {
      toast.error('Failed to delete entry: ' + error.message);
    },
  });

  // Form for adding new entries
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<TrialBalanceEntry>({
    resolver: zodResolver(trialBalanceSchema),
    defaultValues: {
      openingBalanceCY: 0,
      debitCY: 0,
      creditCY: 0,
      closingBalanceCY: 0,
      closingBalancePY: 0,
    },
  });

  // Watch for changes to calculate closing balance
  const openingBalance = watch('openingBalanceCY');
  const debit = watch('debitCY');
  const credit = watch('creditCY');

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!currentCompany?.id) {
      toast.error('Please select a company first');
      return;
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid Excel (.xlsx, .xls) or CSV file');
      return;
    }

    setUploadingFile(true);
    setUploadProgress(10);

    try {
      // Get upload URL
      const { uploadUrl, objectName } = await getUploadUrlMutation.mutateAsync({
        fileName: file.name,
        fileType: file.type,
      });

      setUploadProgress(30);

      // Upload file to Minio
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      setUploadProgress(60);

      // Process the uploaded file
      await processFileMutation.mutateAsync({ 
        objectName,
        companyId: currentCompany.id 
      });

      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleEditEntry = (entry: any) => {
    setEditingEntry({
      ...entry,
      majorHead: entry.majorHead?.name || '',
      minorHead: entry.minorHead?.name || '',
      grouping: entry.grouping?.name || '',
    });
  };

  const handleUpdateEntry = async (data: any) => {
    if (!editingEntry) return;

    const calculatedClosingBalance = (data.openingBalanceCY || 0) + (data.debitCY || 0) - (data.creditCY || 0);
    
    await updateMutation.mutateAsync({
      ...data,
      id: editingEntry.id,
      closingBalanceCY: calculatedClosingBalance,
    });
  };

  const handleDeleteEntry = async (id: string) => {
    await deleteMutation.mutateAsync({ id });
  };

  const onSubmit = async (data: TrialBalanceEntry) => {
    if (!currentCompany?.id) {
      toast.error('Please select a company first');
      return;
    }

    // Calculate closing balance
    const calculatedClosingBalance = (data.openingBalanceCY || 0) + (data.debitCY || 0) - (data.creditCY || 0);
    
    const entryWithCalculatedBalance = {
      ...data,
      closingBalanceCY: calculatedClosingBalance,
    };

    try {
      await uploadMutation.mutateAsync({
        companyId: currentCompany.id,
        entries: [entryWithCalculatedBalance]
      });
      reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleSampleDataLoad = () => {
    if (!currentCompany?.id) {
      toast.error('Please select a company first');
      return;
    }

    const sampleData: TrialBalanceEntry[] = [
      {
        ledgerName: "Cash at Bank",
        openingBalanceCY: 50000,
        debitCY: 25000,
        creditCY: 15000,
        closingBalanceCY: 60000,
        closingBalancePY: 45000,
        type: "BS",
        majorHead: "Cash and Cash Equivalents",
        minorHead: "Bank Balances",
        grouping: "Balances with banks"
      },
      {
        ledgerName: "Sales Revenue",
        openingBalanceCY: 0,
        debitCY: 5000,
        creditCY: 500000,
        closingBalanceCY: -495000,
        closingBalancePY: -450000,
        type: "PL",
        majorHead: "Revenue from Operations",
        minorHead: "Sale of Goods",
        grouping: "Sale of products"
      },
      {
        ledgerName: "Trade Receivables",
        openingBalanceCY: 75000,
        debitCY: 100000,
        creditCY: 80000,
        closingBalanceCY: 95000,
        closingBalancePY: 70000,
        type: "BS",
        majorHead: "Trade Receivables",
        minorHead: "Unsecured Receivables",
        grouping: "Trade receivables outstanding < 6 months"
      },
      {
        ledgerName: "Salary Expenses",
        openingBalanceCY: 0,
        debitCY: 120000,
        creditCY: 2000,
        closingBalanceCY: 118000,
        closingBalancePY: 110000,
        type: "PL",
        majorHead: "Employee Benefits Expense",
        minorHead: "Salaries and Wages",
        grouping: "Salaries and wages"
      }
    ];

    uploadMutation.mutate({
      companyId: currentCompany.id,
      entries: sampleData
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                Trial Balance Management
              </h1>
              <p className="text-gray-600 mt-2">
                Upload and manage your trial balance data for financial statement generation
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSampleDataLoad}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Load Sample Data
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Entry</span>
              </button>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Upload */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Excel File</h3>
              
              {uploadingFile ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600 mb-2">Processing file...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{uploadProgress}% complete</p>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your Excel file here, or
                  </p>
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                    browse to upload
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Supports .xlsx, .xls and .csv files
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                  />
                </div>
              )}
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Expected Format:</h4>
                <p className="text-xs text-blue-700">
                  Columns: Ledger Name, Opening Balance CY, Debit CY, Credit CY, Closing Balance CY, Closing Balance PY, Type (BS/PL), Major Head, Minor Head, Grouping
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-center">
                  <TableCellsIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{trialBalanceQuery.data?.length || 0}</p>
                  <p className="text-sm text-gray-600">Total Entries</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">BS</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {trialBalanceQuery.data?.filter(entry => entry.type === 'BS').length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Balance Sheet</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">PL</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {trialBalanceQuery.data?.filter(entry => entry.type === 'PL').length || 0}
                  </p>
                  <p className="text-sm text-gray-600">P&L Statement</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">₹</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      trialBalanceQuery.data?.reduce((sum, entry) => sum + Math.abs(Number(entry.closingBalanceCY)), 0) || 0
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Total Amount</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Entry Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Entry</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ledger Name *
                  </label>
                  <input
                    {...register('ledgerName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter ledger name"
                  />
                  {errors.ledgerName && (
                    <p className="text-red-500 text-sm mt-1">{errors.ledgerName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    {...register('type')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select type</option>
                    <option value="BS">Balance Sheet</option>
                    <option value="PL">P&L Statement</option>
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Major Head
                  </label>
                  <select
                    {...register('majorHead')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select major head</option>
                    {majorHeadsQuery.data?.map((head) => (
                      <option key={head.id} value={head.name}>
                        {head.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minor Head
                  </label>
                  <select
                    {...register('minorHead')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select minor head</option>
                    {minorHeadsQuery.data?.map((head) => (
                      <option key={head.id} value={head.name}>
                        {head.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grouping
                  </label>
                  <select
                    {...register('grouping')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select grouping</option>
                    {groupingsQuery.data?.map((grouping) => (
                      <option key={grouping.id} value={grouping.name}>
                        {grouping.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Balance (CY)
                  </label>
                  <input
                    {...register('openingBalanceCY', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Debit (CY)
                  </label>
                  <input
                    {...register('debitCY', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credit (CY)
                  </label>
                  <input
                    {...register('creditCY', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Closing Balance (PY)
                  </label>
                  <input
                    {...register('closingBalancePY', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-gray-600">
                  Calculated Closing Balance (CY): <strong>₹{formatCurrency((openingBalance || 0) + (debit || 0) - (credit || 0))}</strong>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      reset();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {uploadMutation.isPending ? 'Adding...' : 'Add Entry'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Edit Entry Modal */}
        {editingEntry && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Trial Balance Entry</h3>
                  <button
                    onClick={() => setEditingEntry(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <EditEntryForm
                  entry={editingEntry}
                  onSubmit={handleUpdateEntry}
                  onCancel={() => setEditingEntry(null)}
                  majorHeads={majorHeadsQuery.data || []}
                  minorHeads={minorHeadsQuery.data || []}
                  groupings={groupingsQuery.data || []}
                  isLoading={updateMutation.isPending}
                />
              </div>
            </div>
          </div>
        )}

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
                    <h3 className="text-lg font-medium text-gray-900">Delete Entry</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete this trial balance entry? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => showDeleteConfirm && handleDeleteEntry(showDeleteConfirm)}
                    disabled={deleteMutation.isPending}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Trial Balance Entries</h3>
          </div>
          
          {trialBalanceQuery.data && trialBalanceQuery.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ledger Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Major Head
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Minor Head
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opening (CY)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Debit (CY)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit (CY)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Closing (CY)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Closing (PY)
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trialBalanceQuery.data.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{entry.ledgerName}</div>
                        <div className="text-sm text-gray-500">{entry.grouping?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.type === 'BS' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.majorHead?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.minorHead?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ₹{formatCurrency(Number(entry.openingBalanceCY))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ₹{formatCurrency(Number(entry.debitCY))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ₹{formatCurrency(Number(entry.creditCY))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <span className={Number(entry.closingBalanceCY) < 0 ? 'text-red-600' : 'text-gray-900'}>
                          ₹{formatCurrency(Number(entry.closingBalanceCY))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ₹{formatCurrency(Number(entry.closingBalancePY))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEditEntry(entry)}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Edit entry"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(entry.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete entry"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <TableCellsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trial balance data</h3>
              <p className="text-gray-600 mb-4">
                Upload an Excel file or add entries manually to get started.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add First Entry
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
