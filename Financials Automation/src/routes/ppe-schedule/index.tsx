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
  BuildingOfficeIcon,
  PlusIcon,
  DocumentArrowUpIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

export const Route = createFileRoute("/ppe-schedule/")({
  component: PPESchedule,
});

const ppeScheduleSchema = z.object({
  assetClass: z.string().min(1, 'Asset class is required'),
  openingGrossBlock: z.number().default(0),
  additions: z.number().default(0),
  disposalsGross: z.number().default(0),
  openingAccDepreciation: z.number().default(0),
  depreciationForYear: z.number().default(0),
  accDeprOnDisposals: z.number().default(0),
});

type PPEScheduleEntry = z.infer<typeof ppeScheduleSchema>;

function PPESchedule() {
  const trpc = useTRPC();
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch data
  const ppeScheduleQuery = useQuery(trpc.getPPEScheduleEntries.queryOptions());

  // Add mutation
  const addMutation = useMutation({
    ...trpc.addPPEScheduleEntry.mutationOptions(),
    onSuccess: () => {
      toast.success('PPE schedule entry added successfully!');
      ppeScheduleQuery.refetch();
      setShowAddForm(false);
      reset();
    },
    onError: (error) => {
      toast.error('Failed to add entry: ' + error.message);
    },
  });

  // File upload mutations
  const getUploadUrlMutation = useMutation({
    ...trpc.getPPEUploadUrl.mutationOptions(),
    onError: (error) => {
      toast.error('Failed to get upload URL: ' + error.message);
      setUploadingFile(false);
    },
  });

  const processFileMutation = useMutation({
    ...trpc.processPPEFile.mutationOptions(),
    onSuccess: (data) => {
      toast.success(`Successfully uploaded ${data.entriesProcessed} PPE schedule entries!`);
      ppeScheduleQuery.refetch();
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
  } = useForm<PPEScheduleEntry>({
    resolver: zodResolver(ppeScheduleSchema),
    defaultValues: {
      openingGrossBlock: 0,
      additions: 0,
      disposalsGross: 0,
      openingAccDepreciation: 0,
      depreciationForYear: 0,
      accDeprOnDisposals: 0,
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: PPEScheduleEntry) => {
    try {
      await addMutation.mutateAsync(data);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleSampleDataLoad = () => {
    const sampleData = [
      {
        assetClass: "Land",
        openingGrossBlock: 5000000,
        additions: 0,
        disposalsGross: 0,
        openingAccDepreciation: 0,
        depreciationForYear: 0,
        accDeprOnDisposals: 0,
      },
      {
        assetClass: "Buildings",
        openingGrossBlock: 15000000,
        additions: 2000000,
        disposalsGross: 0,
        openingAccDepreciation: 3000000,
        depreciationForYear: 850000,
        accDeprOnDisposals: 0,
      },
      {
        assetClass: "Plant and Machinery",
        openingGrossBlock: 25000000,
        additions: 5000000,
        disposalsGross: 1000000,
        openingAccDepreciation: 8000000,
        depreciationForYear: 2400000,
        accDeprOnDisposals: 800000,
      },
      {
        assetClass: "Furniture and Fixtures",
        openingGrossBlock: 2000000,
        additions: 300000,
        disposalsGross: 100000,
        openingAccDepreciation: 800000,
        depreciationForYear: 230000,
        accDeprOnDisposals: 80000,
      },
      {
        assetClass: "Vehicles",
        openingGrossBlock: 3000000,
        additions: 500000,
        disposalsGross: 200000,
        openingAccDepreciation: 1200000,
        depreciationForYear: 420000,
        accDeprOnDisposals: 160000,
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

  // Calculate derived values
  const calculateClosingGrossBlock = (entry: any) => {
    return entry.openingGrossBlock + entry.additions - entry.disposalsGross;
  };

  const calculateClosingAccDepreciation = (entry: any) => {
    return entry.openingAccDepreciation + entry.depreciationForYear - entry.accDeprOnDisposals;
  };

  const calculateNetBlock = (grossBlock: number, accDepreciation: number) => {
    return grossBlock - accDepreciation;
  };

  // Predefined asset classes
  const assetClassOptions = [
    "Land",
    "Buildings",
    "Plant and Machinery",
    "Furniture and Fixtures",
    "Vehicles",
    "Office Equipment",
    "Computer Equipment",
    "Electrical Equipment",
    "Laboratory Equipment",
    "Leasehold Improvements",
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                PPE Schedule
              </h1>
              <p className="text-gray-600 mt-2">
                Property, Plant & Equipment schedule as per AS 10 and Schedule III
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
                  onClick={() => document.getElementById('ppe-file-upload')?.click()}
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
                    id="ppe-file-upload"
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
                  Columns: Asset Class, Opening Gross Block, Additions, Disposals, Opening Acc Depreciation, Depreciation for Year, Acc Depr on Disposals
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-center">
                  <BuildingOfficeIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{ppeScheduleQuery.data?.length || 0}</p>
                  <p className="text-sm text-gray-600">Asset Classes</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      ppeScheduleQuery.data?.reduce((sum, entry) => 
                        sum + calculateClosingGrossBlock(entry), 0) || 0
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Gross Block</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">D</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      ppeScheduleQuery.data?.reduce((sum, entry) => 
                        sum + calculateClosingAccDepreciation(entry), 0) || 0
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Acc. Depreciation</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">N</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      ppeScheduleQuery.data?.reduce((sum, entry) => {
                        const grossBlock = calculateClosingGrossBlock(entry);
                        const accDepr = calculateClosingAccDepreciation(entry);
                        return sum + calculateNetBlock(grossBlock, accDepr);
                      }, 0) || 0
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Net Block</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Entry Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New PPE Schedule Entry</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asset Class *
                  </label>
                  <select
                    {...register('assetClass')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select asset class</option>
                    {assetClassOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.assetClass && (
                    <p className="text-red-500 text-sm mt-1">{errors.assetClass.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Gross Block
                  </label>
                  <input
                    {...register('openingGrossBlock', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additions
                  </label>
                  <input
                    {...register('additions', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Disposals (Gross)
                  </label>
                  <input
                    {...register('disposalsGross', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Acc. Depreciation
                  </label>
                  <input
                    {...register('openingAccDepreciation', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Depreciation for Year
                  </label>
                  <input
                    {...register('depreciationForYear', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Acc. Depr. on Disposals
                  </label>
                  <input
                    {...register('accDeprOnDisposals', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Closing Gross Block: <strong>₹{formatCurrency((watchedValues.openingGrossBlock || 0) + (watchedValues.additions || 0) - (watchedValues.disposalsGross || 0))}</strong></div>
                  <div>Closing Acc. Depreciation: <strong>₹{formatCurrency((watchedValues.openingAccDepreciation || 0) + (watchedValues.depreciationForYear || 0) - (watchedValues.accDeprOnDisposals || 0))}</strong></div>
                  <div>Net Block: <strong>₹{formatCurrency(((watchedValues.openingGrossBlock || 0) + (watchedValues.additions || 0) - (watchedValues.disposalsGross || 0)) - ((watchedValues.openingAccDepreciation || 0) + (watchedValues.depreciationForYear || 0) - (watchedValues.accDeprOnDisposals || 0)))}</strong></div>
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
            <h3 className="text-lg font-semibold text-gray-900">PPE Schedule Entries</h3>
          </div>
          
          {ppeScheduleQuery.data && ppeScheduleQuery.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset Class
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opening Gross
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Additions
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Disposals
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Closing Gross
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opening Acc. Depr.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Depr. for Year
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Closing Acc. Depr.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Block
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ppeScheduleQuery.data.map((entry) => {
                    const closingGrossBlock = calculateClosingGrossBlock(entry);
                    const closingAccDepreciation = calculateClosingAccDepreciation(entry);
                    const netBlock = calculateNetBlock(closingGrossBlock, closingAccDepreciation);
                    
                    return (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {entry.assetClass}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ₹{formatCurrency(Number(entry.openingGrossBlock))}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ₹{formatCurrency(Number(entry.additions))}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ₹{formatCurrency(Number(entry.disposalsGross))}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          ₹{formatCurrency(closingGrossBlock)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ₹{formatCurrency(Number(entry.openingAccDepreciation))}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ₹{formatCurrency(Number(entry.depreciationForYear))}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          ₹{formatCurrency(closingAccDepreciation)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-indigo-600 text-right">
                          ₹{formatCurrency(netBlock)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No PPE schedule data</h3>
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
