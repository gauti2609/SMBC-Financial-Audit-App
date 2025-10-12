import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "~/components/Layout";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  BanknotesIcon,
  PlusIcon,
  DocumentArrowUpIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

export const Route = createFileRoute("/share-capital/")({
  component: ShareCapital,
});

const shareCapitalSchema = z.object({
  classOfShare: z.string().default("Equity Shares"),
  numberOfShares: z.string().transform((val) => BigInt(val || "0")),
  faceValue: z.number().default(10),
  amountCY: z.number().default(0),
  amountPY: z.number().default(0),
  shareholderName: z.string().optional(),
  holdingPercentageCY: z.number().optional(),
  numberOfSharesPY: z.string().optional().transform((val) => val ? BigInt(val) : undefined),
});

type ShareCapitalEntry = z.infer<typeof shareCapitalSchema>;

function ShareCapital() {
  const trpc = useTRPC();
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch data
  const shareCapitalQuery = useQuery(trpc.getShareCapitalEntries.queryOptions());

  // Add mutation
  const addMutation = useMutation({
    ...trpc.addShareCapitalEntry.mutationOptions(),
    onSuccess: () => {
      toast.success('Share capital entry added successfully!');
      shareCapitalQuery.refetch();
      setShowAddForm(false);
      reset();
    },
    onError: (error) => {
      toast.error('Failed to add entry: ' + error.message);
    },
  });

  // File upload mutations
  const getUploadUrlMutation = useMutation({
    ...trpc.getShareCapitalUploadUrl.mutationOptions(),
    onError: (error) => {
      toast.error('Failed to get upload URL: ' + error.message);
      setUploadingFile(false);
    },
  });

  const processFileMutation = useMutation({
    ...trpc.processShareCapitalFile.mutationOptions(),
    onSuccess: (data) => {
      toast.success(`Successfully uploaded ${data.entriesProcessed} share capital entries!`);
      shareCapitalQuery.refetch();
      setUploadingFile(false);
      setUploadProgress(0);
    },
    onError: (error) => {
      toast.error('Failed to process file: ' + error.message);
      setUploadingFile(false);
      setUploadProgress(0);
    },
  });

  // Form for adding new entries
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<ShareCapitalEntry>({
    resolver: zodResolver(shareCapitalSchema),
    defaultValues: {
      classOfShare: "Equity Shares",
      faceValue: 10,
      amountCY: 0,
      amountPY: 0,
    },
  });

  const numberOfShares = watch('numberOfShares');
  const faceValue = watch('faceValue');

  const onSubmit = async (data: ShareCapitalEntry) => {
    try {
      await addMutation.mutateAsync({
        ...data,
        numberOfShares: BigInt(data.numberOfShares.toString()),
        numberOfSharesPY: data.numberOfSharesPY ? BigInt(data.numberOfSharesPY.toString()) : undefined,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleSampleDataLoad = () => {
    const sampleData = [
      {
        classOfShare: "Equity Shares",
        numberOfShares: BigInt(100000),
        faceValue: 10,
        amountCY: 1000000,
        amountPY: 1000000,
        shareholderName: "Promoters",
        holdingPercentageCY: 60.0,
        numberOfSharesPY: BigInt(100000),
      },
      {
        classOfShare: "Equity Shares", 
        numberOfShares: BigInt(50000),
        faceValue: 10,
        amountCY: 500000,
        amountPY: 400000,
        shareholderName: "Public",
        holdingPercentageCY: 30.0,
        numberOfSharesPY: BigInt(40000),
      },
      {
        classOfShare: "Preference Shares",
        numberOfShares: BigInt(10000),
        faceValue: 100,
        amountCY: 1000000,
        amountPY: 1000000,
        shareholderName: "Financial Institutions",
        holdingPercentageCY: 10.0,
        numberOfSharesPY: BigInt(10000),
      },
    ];

    sampleData.forEach(async (data) => {
      try {
        await addMutation.mutateAsync(data);
      } catch (error) {
        console.error('Failed to add sample data:', error);
      }
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

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
      await processFileMutation.mutateAsync({ objectName });

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: bigint) => {
    return new Intl.NumberFormat('en-IN').format(Number(num));
  };

  // Predefined options
  const shareClassOptions = [
    "Equity Shares",
    "Preference Shares",
    "Cumulative Preference Shares",
    "Non-Cumulative Preference Shares",
    "Redeemable Preference Shares",
    "Convertible Preference Shares",
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                Share Capital Schedule
              </h1>
              <p className="text-gray-600 mt-2">
                Manage share capital details as per Schedule III requirements
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
                  onClick={() => document.getElementById('share-capital-file-upload')?.click()}
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
                    id="share-capital-file-upload"
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
                  Columns: Class of Share, Number of Shares, Face Value, Amount CY, Amount PY, Shareholder Name, Holding %, Number of Shares PY
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-center">
                  <BanknotesIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{shareCapitalQuery.data?.length || 0}</p>
                  <p className="text-sm text-gray-600">Total Entries</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">₹</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      shareCapitalQuery.data?.reduce((sum, entry) => sum + Number(entry.amountCY), 0) || 0
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Total Amount (CY)</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">#</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatNumber(
                      shareCapitalQuery.data?.reduce((sum, entry) => sum + BigInt(entry.numberOfShares), BigInt(0)) || BigInt(0)
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Total Shares</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">C</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(shareCapitalQuery.data?.map(entry => entry.classOfShare)).size || 0}
                  </p>
                  <p className="text-sm text-gray-600">Share Classes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Entry Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Share Capital Entry</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class of Share *
                  </label>
                  <select
                    {...register('classOfShare')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {shareClassOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.classOfShare && (
                    <p className="text-red-500 text-sm mt-1">{errors.classOfShare.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Shares (CY) *
                  </label>
                  <input
                    {...register('numberOfShares')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter number of shares"
                  />
                  {errors.numberOfShares && (
                    <p className="text-red-500 text-sm mt-1">{errors.numberOfShares.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Face Value per Share
                  </label>
                  <input
                    {...register('faceValue', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (Current Year)
                  </label>
                  <input
                    {...register('amountCY', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (Previous Year)
                  </label>
                  <input
                    {...register('amountPY', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shareholder Name
                  </label>
                  <input
                    {...register('shareholderName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter shareholder name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Holding Percentage (CY)
                  </label>
                  <input
                    {...register('holdingPercentageCY', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Shares (PY)
                  </label>
                  <input
                    {...register('numberOfSharesPY')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter number of shares"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-gray-600">
                  Calculated Amount: <strong>₹{formatCurrency((Number(numberOfShares) || 0) * (faceValue || 0))}</strong>
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
                    disabled={addMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {addMutation.isPending ? 'Adding...' : 'Add Entry'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Share Capital Entries</h3>
          </div>
          
          {shareCapitalQuery.data && shareCapitalQuery.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class of Share
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shareholder
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No. of Shares (CY)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Face Value
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount (CY)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount (PY)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Holding %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shareCapitalQuery.data.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {entry.classOfShare}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.shareholderName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatNumber(BigInt(entry.numberOfShares))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ₹{formatCurrency(Number(entry.faceValue))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ₹{formatCurrency(Number(entry.amountCY))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ₹{formatCurrency(Number(entry.amountPY))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {entry.holdingPercentageCY ? `${entry.holdingPercentageCY}%` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No share capital data</h3>
              <p className="text-gray-600 mb-4">
                Add entries manually or upload an Excel file to get started.
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
