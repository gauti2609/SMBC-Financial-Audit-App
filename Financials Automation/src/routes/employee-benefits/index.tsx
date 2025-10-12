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
  UserGroupIcon,
  PlusIcon,
  DocumentArrowUpIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

export const Route = createFileRoute("/employee-benefits/")({
  component: EmployeeBenefits,
});

const employeeBenefitSchema = z.object({
  particulars: z.string().min(1, 'Particulars is required'),
  currentYear: z.number().default(0),
  previousYear: z.number().default(0),
  category: z.enum(['Defined Contribution', 'Defined Benefit']),
});

type EmployeeBenefitEntry = z.infer<typeof employeeBenefitSchema>;

function EmployeeBenefits() {
  const trpc = useTRPC();
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch data
  const employeeBenefitsQuery = useQuery(trpc.getEmployeeBenefitEntries.queryOptions());

  // Add mutation
  const addMutation = useMutation({
    ...trpc.addEmployeeBenefitEntry.mutationOptions(),
    onSuccess: () => {
      toast.success('Employee benefit entry added successfully!');
      employeeBenefitsQuery.refetch();
      setShowAddForm(false);
      reset();
    },
    onError: (error) => {
      toast.error('Failed to add entry: ' + error.message);
    },
  });

  // File upload mutations
  const getUploadUrlMutation = useMutation({
    ...trpc.getEmployeeBenefitsUploadUrl.mutationOptions(),
    onError: (error) => {
      toast.error('Failed to get upload URL: ' + error.message);
      setUploadingFile(false);
    },
  });

  const processFileMutation = useMutation({
    ...trpc.processEmployeeBenefitsFile.mutationOptions(),
    onSuccess: (data) => {
      toast.success(`Successfully uploaded ${data.entriesProcessed} employee benefit entries!`);
      employeeBenefitsQuery.refetch();
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
  } = useForm<EmployeeBenefitEntry>({
    resolver: zodResolver(employeeBenefitSchema),
    defaultValues: {
      currentYear: 0,
      previousYear: 0,
      category: 'Defined Contribution',
    },
  });

  const onSubmit = async (data: EmployeeBenefitEntry) => {
    try {
      await addMutation.mutateAsync(data);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleSampleDataLoad = () => {
    const sampleData = [
      {
        particulars: "Salaries and Wages",
        currentYear: 12500000,
        previousYear: 11800000,
        category: "Defined Contribution" as const,
      },
      {
        particulars: "Contribution to Provident Fund",
        currentYear: 1200000,
        previousYear: 1150000,
        category: "Defined Contribution" as const,
      },
      {
        particulars: "Contribution to ESI",
        currentYear: 280000,
        previousYear: 265000,
        category: "Defined Contribution" as const,
      },
      {
        particulars: "Gratuity Provision",
        currentYear: 850000,
        previousYear: 780000,
        category: "Defined Benefit" as const,
      },
      {
        particulars: "Leave Encashment",
        currentYear: 450000,
        previousYear: 420000,
        category: "Defined Benefit" as const,
      },
      {
        particulars: "Medical Benefits",
        currentYear: 320000,
        previousYear: 300000,
        category: "Defined Contribution" as const,
      },
      {
        particulars: "Staff Welfare Expenses",
        currentYear: 180000,
        previousYear: 165000,
        category: "Defined Contribution" as const,
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

  // Predefined employee benefit options
  const benefitOptions = [
    "Salaries and Wages",
    "Contribution to Provident Fund",
    "Contribution to ESI",
    "Contribution to Pension Fund",
    "Gratuity Provision",
    "Leave Encashment",
    "Medical Benefits",
    "Staff Welfare Expenses",
    "Bonus and Incentives",
    "Directors' Remuneration",
    "Contract Labour Charges",
    "Training and Development",
    "Recruitment Expenses",
    "Other Employee Benefits",
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                Employee Benefits Schedule
              </h1>
              <p className="text-gray-600 mt-2">
                Manage employee benefit expenses as per AS 15 requirements
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
                  onClick={() => document.getElementById('employee-benefits-file-upload')?.click()}
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
                    id="employee-benefits-file-upload"
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
                  Columns: Particulars, Current Year, Previous Year, Category (Defined Contribution/Defined Benefit)
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-center">
                  <UserGroupIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{employeeBenefitsQuery.data?.length || 0}</p>
                  <p className="text-sm text-gray-600">Benefit Types</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">₹</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      employeeBenefitsQuery.data?.reduce((sum, entry) => sum + Number(entry.currentYear), 0) || 0
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Total (CY)</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">DC</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      employeeBenefitsQuery.data?.filter(entry => entry.category === 'Defined Contribution')
                        .reduce((sum, entry) => sum + Number(entry.currentYear), 0) || 0
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Defined Contribution</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">DB</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      employeeBenefitsQuery.data?.filter(entry => entry.category === 'Defined Benefit')
                        .reduce((sum, entry) => sum + Number(entry.currentYear), 0) || 0
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Defined Benefit</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Entry Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Employee Benefit Entry</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Particulars *
                  </label>
                  <input
                    {...register('particulars')}
                    list="benefit-options"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter benefit details"
                  />
                  <datalist id="benefit-options">
                    {benefitOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                  {errors.particulars && (
                    <p className="text-red-500 text-sm mt-1">{errors.particulars.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    {...register('category')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Defined Contribution">Defined Contribution</option>
                    <option value="Defined Benefit">Defined Benefit</option>
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (Current Year)
                  </label>
                  <input
                    {...register('currentYear', { valueAsNumber: true })}
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
                    {...register('previousYear', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
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
            </form>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Employee Benefit Entries</h3>
          </div>
          
          {employeeBenefitsQuery.data && employeeBenefitsQuery.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Particulars
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Year
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Previous Year
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employeeBenefitsQuery.data.map((entry) => {
                    const change = Number(entry.currentYear) - Number(entry.previousYear);
                    return (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{entry.particulars}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            entry.category === 'Defined Contribution' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {entry.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ₹{formatCurrency(Number(entry.currentYear))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ₹{formatCurrency(Number(entry.previousYear))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                          <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {change >= 0 ? '+' : ''}₹{formatCurrency(Math.abs(change))}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employee benefit data</h3>
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
