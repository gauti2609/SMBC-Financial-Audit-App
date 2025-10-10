import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "~/components/Layout";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useSelectedCompany } from '~/stores/companyStore';
import {
  DocumentTextIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export const Route = createFileRoute("/accounting-policies/")({
  component: AccountingPolicies,
});

const policySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

type PolicyFormData = z.infer<typeof policySchema>;

type AccountingPolicy = {
  id: string;
  noteRef: string;
  title: string;
  content: string;
  isDefault: boolean;
};

function AccountingPolicies() {
  const trpc = useTRPC();
  const { selectedCompanyId } = useSelectedCompany();
  const [editingPolicy, setEditingPolicy] = useState<AccountingPolicy | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data
  const policiesQuery = useQuery(
    selectedCompanyId 
      ? trpc.getAccountingPolicies.queryOptions({ companyId: selectedCompanyId })
      : { enabled: false }
  );

  // Update mutation
  const updateMutation = useMutation({
    ...trpc.updateAccountingPolicy.mutationOptions(),
    onSuccess: () => {
      toast.success('Policy updated successfully!');
      policiesQuery.refetch();
      setEditingPolicy(null);
    },
    onError: (error) => {
      toast.error('Failed to update policy: ' + error.message);
    },
  });

  // Initialize mutation
  const initializeMutation = useMutation({
    ...trpc.initializeAccountingPolicies.mutationOptions(),
    onSuccess: (data) => {
      toast.success(`Successfully initialized ${data.count} default accounting policies!`);
      policiesQuery.refetch();
    },
    onError: (error) => {
      toast.error('Failed to initialize policies: ' + error.message);
    },
  });

  // Form for editing policies
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema),
  });

  // Load editing data
  useEffect(() => {
    if (editingPolicy) {
      reset({
        title: editingPolicy.title,
        content: editingPolicy.content,
      });
    }
  }, [editingPolicy, reset]);

  const handleUpdatePolicy = async (data: PolicyFormData) => {
    if (!editingPolicy || !selectedCompanyId) return;
    await updateMutation.mutateAsync({
      companyId: selectedCompanyId,
      id: editingPolicy.id,
      ...data,
    });
  };

  const filteredPolicies = policiesQuery.data?.filter(policy =>
    policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.noteRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getDefaultPolicies = () => [
    {
      noteRef: "A.2.1",
      title: "Revenue Recognition (AS 9)",
      content: `Revenue is recognized when it is probable that the economic benefits will flow to the Company and the revenue can be reliably measured. Revenue from sale of goods is recognized when the significant risks and rewards of ownership of the goods have passed to the buyer, usually on dispatch of the goods.

Service revenue is recognized on proportionate completion basis as the services are performed. Interest income is recognized on a time proportion basis taking into account the amount outstanding and the applicable interest rate.

Dividend income is recognized when the right to receive dividend is established.`
    },
    {
      noteRef: "A.2.2", 
      title: "Property, Plant and Equipment (AS 10)",
      content: `Property, Plant and Equipment are stated at cost, net of accumulated depreciation and accumulated impairment losses, if any. The cost comprises purchase price, borrowing costs if capitalization criteria are met and directly attributable cost of bringing the asset to its working condition for the intended use.

Subsequent expenditure related to an item of fixed asset is added to its book value only if it increases the future benefits from the existing asset beyond its previously assessed standard of performance. All other expenses on existing fixed assets, including day-to-day repair and maintenance expenditure and cost of replacing parts, are charged to the statement of profit and loss for the period during which such expenses are incurred.

Gains and losses on disposal of fixed assets are determined by comparing proceeds with carrying amount. These are included in profit or loss within other gains/(losses).`
    },
    {
      noteRef: "A.2.3",
      title: "Intangible Assets (AS 26)", 
      content: `Intangible assets acquired separately are measured on initial recognition at cost. Following initial recognition, intangible assets are carried at cost less accumulated amortization and accumulated impairment losses, if any.

The useful lives of intangible assets are assessed as either finite or indefinite. Intangible assets with finite lives are amortized over the useful economic life and assessed for impairment whenever there is an indication that the intangible asset may be impaired.

Computer software is amortized over a period of 3-5 years on straight line basis.`
    },
    {
      noteRef: "A.2.5",
      title: "Inventories (AS 2)",
      content: `Inventories are valued at the lower of cost and net realizable value. Cost of inventories comprises all costs of purchase, costs of conversion and other costs incurred in bringing the inventories to their present location and condition.

Raw materials and stores & spares are valued at cost on weighted average basis. Work-in-progress and finished goods are valued at cost including direct materials, direct labor and a proportion of manufacturing overheads or net realizable value, whichever is lower.

Net realizable value is the estimated selling price in the ordinary course of business, less estimated costs of completion and estimated costs necessary to make the sale.`
    },
    {
      noteRef: "A.2.8",
      title: "Employee Benefits (AS 15)",
      content: `Employee benefits include provident fund, employee state insurance scheme, gratuity and compensated absences.

Defined Contribution Plans: The Company's contribution to provident fund and employee state insurance scheme are considered as defined contribution plans and are charged as an expense based on the amount of contribution required to be made.

Defined Benefit Plans: For defined benefit plans such as gratuity, the cost of providing benefits is determined using the projected unit credit method, with actuarial valuations being carried out at each balance sheet date. Actuarial gains and losses are recognized in the statement of profit and loss in the period in which they occur.

Short-term employee benefits: The undiscounted amount of short-term employee benefits expected to be paid in exchange for the services rendered by employees are recognized during the year when the employees render the service.`
    },
    {
      noteRef: "A.2.11",
      title: "Income Taxes (AS 22)",
      content: `Tax expense comprises current and deferred tax. Current income tax is measured at the amount expected to be paid to the tax authorities in accordance with the Income Tax Act, 1961.

Deferred income taxes reflect the impact of timing differences between taxable income and accounting income originating during the current year and reversal of timing differences for the earlier years. Deferred tax is measured using the tax rates and the tax laws enacted or substantively enacted at the balance sheet date.

Deferred tax liabilities are recognized for all timing differences. Deferred tax assets are recognized for deductible timing differences only to the extent that there is reasonable certainty that sufficient future taxable income will be available against which such deferred tax assets can be realized.`
    }
  ];

  const initializeDefaultPolicies = async () => {
    if (!selectedCompanyId) {
      toast.error('Please select a company first');
      return;
    }
    try {
      await initializeMutation.mutateAsync({ companyId: selectedCompanyId });
    } catch (error) {
      // Error handled by mutation
    }
  };

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
                  Accounting Policies Editor
                </h1>
                <p className="text-gray-600 mt-2">
                  Edit and customize standard accounting policy content
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={initializeDefaultPolicies}
                disabled={initializeMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-5 w-5 ${initializeMutation.isPending ? 'animate-spin' : ''}`} />
                <span>{initializeMutation.isPending ? 'Initializing...' : 'Reset to Defaults'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Policies</h3>
              <input
                type="text"
                placeholder="Search by title, note ref, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{policiesQuery.data?.length || 0}</p>
                    <p className="text-sm text-gray-600">Total Policies</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {policiesQuery.data?.filter(p => p.isDefault).length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Default Policies</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <PencilIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {policiesQuery.data?.filter(p => !p.isDefault).length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Modified Policies</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Policies List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Accounting Policies</h3>
          </div>
          
          {filteredPolicies.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredPolicies.map((policy) => (
                <div key={policy.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          {policy.noteRef}
                        </span>
                        <h4 className="text-lg font-medium text-gray-900">{policy.title}</h4>
                        {!policy.isDefault && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            Modified
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 max-w-4xl">
                        <div className="line-clamp-4">
                          {policy.content.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-2">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => setEditingPolicy(policy)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No policies found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No policies match your search criteria.' : 'No accounting policies are available.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={initializeDefaultPolicies}
                  disabled={initializeMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {initializeMutation.isPending ? 'Initializing...' : 'Initialize Default Policies'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Edit Policy Modal */}
        {editingPolicy && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Edit Accounting Policy</h3>
                    <p className="text-sm text-gray-600 mt-1">Note Reference: {editingPolicy.noteRef}</p>
                  </div>
                  <button
                    onClick={() => setEditingPolicy(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit(handleUpdatePolicy)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Policy Title *
                    </label>
                    <input
                      {...register('title')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter policy title"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Policy Content *
                    </label>
                    <textarea
                      {...register('content')}
                      rows={15}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                      placeholder="Enter detailed policy content..."
                    />
                    {errors.content && (
                      <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Use line breaks to separate paragraphs. Content will be formatted automatically in the final notes.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Editing Guidelines:</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Ensure compliance with applicable Accounting Standards (AS)</li>
                      <li>• Include specific measurement and recognition criteria</li>
                      <li>• Mention any significant estimates or judgments</li>
                      <li>• Keep language clear and professional</li>
                      <li>• Separate different concepts into distinct paragraphs</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setEditingPolicy(null)}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {updateMutation.isPending && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                      <span>{updateMutation.isPending ? 'Saving...' : 'Save Policy'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Sample Policies Preview (if no data) */}
        {(!policiesQuery.data || policiesQuery.data.length === 0) && !policiesQuery.isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Accounting Policies</h3>
            <p className="text-gray-600 mb-4">
              These are examples of standard accounting policies that would be available for editing:
            </p>
            <div className="space-y-4">
              {getDefaultPolicies().slice(0, 2).map((policy, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {policy.noteRef}
                    </span>
                    <h4 className="font-medium text-gray-900">{policy.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{policy.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
