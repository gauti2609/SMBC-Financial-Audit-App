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
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

export const Route = createFileRoute("/deferred-tax/")({
  component: DeferredTax,
});

const deferredTaxSchema = z.object({
  particulars: z.string().min(1, 'Particulars is required'),
  bookValue: z.number().default(0),
  taxValue: z.number().default(0),
  taxRate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100').default(25),
  category: z.enum(['Asset', 'Liability', 'Income', 'Expense']),
});

type DeferredTaxEntry = z.infer<typeof deferredTaxSchema> & {
  id?: string;
  temporaryDifference: number;
  deferredTaxAsset: number;
  deferredTaxLiability: number;
};

function DeferredTax() {
  const trpc = useTRPC();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DeferredTaxEntry | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Fetch data
  const deferredTaxQuery = useQuery(trpc.getDeferredTaxEntries.queryOptions());

  // Mutations
  const addMutation = useMutation({
    ...trpc.addDeferredTaxEntry.mutationOptions(),
    onSuccess: () => {
      toast.success('Deferred tax entry added successfully!');
      deferredTaxQuery.refetch();
      setShowAddForm(false);
      reset();
    },
    onError: (error) => {
      toast.error('Failed to add entry: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    ...trpc.updateDeferredTaxEntry.mutationOptions(),
    onSuccess: () => {
      toast.success('Entry updated successfully!');
      deferredTaxQuery.refetch();
      setEditingEntry(null);
    },
    onError: (error) => {
      toast.error('Failed to update entry: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    ...trpc.deleteDeferredTaxEntry.mutationOptions(),
    onSuccess: () => {
      toast.success('Entry deleted successfully!');
      deferredTaxQuery.refetch();
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
  } = useForm<DeferredTaxEntry>({
    resolver: zodResolver(deferredTaxSchema),
    defaultValues: {
      bookValue: 0,
      taxValue: 0,
      taxRate: 25,
      category: 'Asset',
    },
  });

  const watchedValues = watch();

  const calculateDeferredTax = (entry: Partial<DeferredTaxEntry>) => {
    const temporaryDifference = (entry.bookValue || 0) - (entry.taxValue || 0);
    const taxRate = (entry.taxRate || 0) / 100;
    const deferredTaxAmount = temporaryDifference * taxRate;
    
    return {
      temporaryDifference,
      deferredTaxAsset: deferredTaxAmount < 0 ? Math.abs(deferredTaxAmount) : 0,
      deferredTaxLiability: deferredTaxAmount > 0 ? deferredTaxAmount : 0,
    };
  };

  const onSubmit = async (data: DeferredTaxEntry) => {
    try {
      const calculations = calculateDeferredTax(data);
      await addMutation.mutateAsync({
        ...data,
        ...calculations,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUpdateEntry = async (data: DeferredTaxEntry) => {
    if (!editingEntry?.id) return;
    
    try {
      const calculations = calculateDeferredTax(data);
      await updateMutation.mutateAsync({
        ...data,
        id: editingEntry.id,
        ...calculations,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteEntry = async (id: string) => {
    await deleteMutation.mutateAsync({ id });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const particularsOptions = [
    "Depreciation - Plant & Machinery",
    "Depreciation - Buildings",
    "Provision for Gratuity",
    "Provision for Leave Encashment",
    "Provision for Doubtful Debts",
    "Preliminary Expenses",
    "Development Expenditure",
    "Unabsorbed Depreciation",
    "Business Loss Carried Forward",
    "Other Timing Differences",
  ];

  const currentCalculations = calculateDeferredTax(watchedValues);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                Deferred Tax Calculation
              </h1>
              <p className="text-gray-600 mt-2">
                Calculate and manage deferred tax assets and liabilities as per AS 22
              </p>
            </div>
            <div className="flex space-x-3">
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

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{deferredTaxQuery.data?.length || 0}</p>
                <p className="text-sm text-gray-600">Total Entries</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">DTA</span>
              </div>
              <div className="ml-4">
                <p className="text-lg font-bold text-gray-900">
                  ₹{formatCurrency(
                    deferredTaxQuery.data?.reduce((sum, entry) => sum + Number(entry.deferredTaxAsset), 0) || 0
                  )}
                </p>
                <p className="text-sm text-gray-600">Deferred Tax Assets</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">DTL</span>
              </div>
              <div className="ml-4">
                <p className="text-lg font-bold text-gray-900">
                  ₹{formatCurrency(
                    deferredTaxQuery.data?.reduce((sum, entry) => sum + Number(entry.deferredTaxLiability), 0) || 0
                  )}
                </p>
                <p className="text-sm text-gray-600">Deferred Tax Liabilities</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">Net</span>
              </div>
              <div className="ml-4">
                <p className="text-lg font-bold text-gray-900">
                  ₹{formatCurrency(
                    (deferredTaxQuery.data?.reduce((sum, entry) => sum + Number(entry.deferredTaxLiability), 0) || 0) -
                    (deferredTaxQuery.data?.reduce((sum, entry) => sum + Number(entry.deferredTaxAsset), 0) || 0)
                  )}
                </p>
                <p className="text-sm text-gray-600">Net DTL</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Entry Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Deferred Tax Entry</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Particulars *
                  </label>
                  <input
                    {...register('particulars')}
                    list="particulars-options"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter particulars"
                  />
                  <datalist id="particulars-options">
                    {particularsOptions.map((option) => (
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
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Book Value
                  </label>
                  <input
                    {...register('bookValue', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Value
                  </label>
                  <input
                    {...register('taxValue', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    {...register('taxRate', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.taxRate && (
                    <p className="text-red-500 text-sm mt-1">{errors.taxRate.message}</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Calculated Values</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Temporary Difference:</span>
                    <span className="ml-2 font-medium">₹{formatCurrency(currentCalculations.temporaryDifference)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Deferred Tax Asset:</span>
                    <span className="ml-2 font-medium text-green-600">₹{formatCurrency(currentCalculations.deferredTaxAsset)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Deferred Tax Liability:</span>
                    <span className="ml-2 font-medium text-red-600">₹{formatCurrency(currentCalculations.deferredTaxLiability)}</span>
                  </div>
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
                  Are you sure you want to delete this deferred tax entry? This action cannot be undone.
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
            <h3 className="text-lg font-semibold text-gray-900">Deferred Tax Entries</h3>
          </div>
          
          {deferredTaxQuery.data && deferredTaxQuery.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Particulars
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book Value
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax Value
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Temp. Diff.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax Rate
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DT Asset
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DT Liability
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deferredTaxQuery.data.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{entry.particulars}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.category === 'Asset' ? 'bg-green-100 text-green-800' :
                          entry.category === 'Liability' ? 'bg-red-100 text-red-800' :
                          entry.category === 'Income' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {entry.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ₹{formatCurrency(Number(entry.bookValue))}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ₹{formatCurrency(Number(entry.taxValue))}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <span className={Number(entry.temporaryDifference) >= 0 ? 'text-red-600' : 'text-green-600'}>
                          ₹{formatCurrency(Number(entry.temporaryDifference))}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {Number(entry.taxRate)}%
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600 text-right">
                        ₹{formatCurrency(Number(entry.deferredTaxAsset))}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-red-600 text-right">
                        ₹{formatCurrency(Number(entry.deferredTaxLiability))}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setEditingEntry({ ...entry })}
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
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No deferred tax entries</h3>
              <p className="text-gray-600 mb-4">
                Add entries to calculate deferred tax assets and liabilities.
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
