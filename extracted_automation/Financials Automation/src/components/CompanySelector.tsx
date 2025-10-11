import { useState, useEffect } from 'react';
import { useTRPC } from '~/trpc/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useCompanyStore, useSelectedCompany, useCompanyList } from '~/stores/companyStore';
import { useAuth } from '~/stores/authStore';
import {
  BuildingOfficeIcon,
  PlusIcon,
  ChevronDownIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface CompanySelectorProps {
  className?: string;
}

export default function CompanySelector({ className = "" }: CompanySelectorProps) {
  const trpc = useTRPC();
  const { token, isAuthenticated } = useAuth();
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyDisplayName, setNewCompanyDisplayName] = useState('');
  
  // Company store hooks
  const { selectedCompanyId, selectedCompany } = useSelectedCompany();
  const { companies, isLoading: storeLoading } = useCompanyList();
  const { 
    setSelectedCompany, 
    setCompanies, 
    addCompany, 
    setLoading 
  } = useCompanyStore();

  // Fetch companies from server - only if authenticated
  const companiesQuery = useQuery(
    trpc.getCompanies.queryOptions(
      { token: token || '' },
      { 
        enabled: isAuthenticated && !!token,
        retry: false 
      }
    )
  );
  
  // Create company mutation
  const createCompanyMutation = useMutation(trpc.createCompany.mutationOptions({
    onSuccess: (newCompany) => {
      addCompany(newCompany);
      setSelectedCompany(newCompany.id);
      setIsCreatingCompany(false);
      setNewCompanyName('');
      setNewCompanyDisplayName('');
      companiesQuery.refetch();
    },
    onError: (error) => {
      console.error('Failed to create company:', error);
      alert('Failed to create company: ' + error.message);
    }
  }));

  // Update store when server data changes
  useEffect(() => {
    if (companiesQuery.data) {
      setCompanies(companiesQuery.data);
    }
  }, [companiesQuery.data, setCompanies]);

  // Update loading state
  useEffect(() => {
    setLoading(companiesQuery.isLoading || createCompanyMutation.isPending);
  }, [companiesQuery.isLoading, createCompanyMutation.isPending, setLoading]);

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompany(companyId);
  };

  const handleCreateCompany = () => {
    if (!newCompanyName.trim() || !newCompanyDisplayName.trim()) {
      alert('Please provide both company name and display name');
      return;
    }

    if (!token) {
      alert('Authentication required to create company');
      return;
    }

    createCompanyMutation.mutate({
      token,
      name: newCompanyName.trim(),
      displayName: newCompanyDisplayName.trim(),
      description: `Company created on ${new Date().toLocaleDateString()}`,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <BuildingOfficeIcon className="h-5 w-5" />
        <span className="text-sm">Not authenticated</span>
      </div>
    );
  }

  if (companiesQuery.isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
        <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
      </div>
    );
  }

  if (companiesQuery.isError) {
    return (
      <div className={`flex items-center space-x-2 text-red-600 ${className}`}>
        <BuildingOfficeIcon className="h-5 w-5" />
        <span className="text-sm">Error loading companies</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full justify-center items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
            <span className="truncate max-w-48">
              {selectedCompany ? selectedCompany.displayName : 'Select Company'}
            </span>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {/* Company List */}
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Select Company
              </div>
              {companies.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No companies available
                </div>
              ) : (
                companies
                  .filter(company => company.isActive)
                  .map((company) => (
                    <Menu.Item key={company.id}>
                      {({ active }) => (
                        <button
                          onClick={() => handleCompanySelect(company.id)}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                        >
                          <div className="flex-1 text-left">
                            <div className="font-medium">{company.displayName}</div>
                            <div className="text-xs text-gray-500">{company.name}</div>
                            {company.description && (
                              <div className="text-xs text-gray-400 truncate">
                                {company.description}
                              </div>
                            )}
                          </div>
                          {selectedCompanyId === company.id && (
                            <CheckIcon className="h-4 w-4 text-indigo-600 ml-2" />
                          )}
                        </button>
                      )}
                    </Menu.Item>
                  ))
              )}
            </div>

            {/* Create New Company */}
            <div className="py-1">
              {!isCreatingCompany ? (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setIsCreatingCompany(true)}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                    >
                      <PlusIcon className="h-4 w-4 mr-3 text-gray-400" />
                      Create New Company
                    </button>
                  )}
                </Menu.Item>
              ) : (
                <div className="px-4 py-3 space-y-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Create New Company
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Company Name (unique)"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Display Name"
                      value={newCompanyDisplayName}
                      onChange={(e) => setNewCompanyDisplayName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setIsCreatingCompany(false);
                        setNewCompanyName('');
                        setNewCompanyDisplayName('');
                      }}
                      className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                      disabled={createCompanyMutation.isPending}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateCompany}
                      disabled={createCompanyMutation.isPending || !newCompanyName.trim() || !newCompanyDisplayName.trim()}
                      className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createCompanyMutation.isPending ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
