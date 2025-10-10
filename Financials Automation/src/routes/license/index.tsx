import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ShieldCheckIcon, KeyIcon, ServerIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useTRPC } from '~/trpc/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Layout from '~/components/Layout';

const licenseSchema = z.object({
  licenseKey: z.string().min(1, 'License key is required'),
});

type LicenseForm = z.infer<typeof licenseSchema>;

function LicensePage() {
  const trpc = useTRPC();
  const [currentLicenseKey, setCurrentLicenseKey] = useState<string>('');
  const [showLicenseInfo, setShowLicenseInfo] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LicenseForm>({
    resolver: zodResolver(licenseSchema),
  });
  
  // License validation query
  const validateLicenseMutation = useMutation(trpc.validateLicense.mutationOptions({
    onSuccess: (data) => {
      toast.success('License validated successfully!');
      setShowLicenseInfo(true);
      // Store license key in localStorage for future use
      localStorage.setItem('licenseKey', currentLicenseKey);
    },
    onError: (error) => {
      toast.error(error.message || 'License validation failed');
      setShowLicenseInfo(false);
    },
  }));
  
  // Get license info query
  const licenseInfoQuery = useQuery(
    trpc.getLicenseInfo.queryOptions(
      { licenseKey: currentLicenseKey },
      { 
        enabled: !!currentLicenseKey && showLicenseInfo,
        retry: false 
      }
    )
  );
  
  const onSubmit = async (data: LicenseForm) => {
    setCurrentLicenseKey(data.licenseKey);
    await validateLicenseMutation.mutateAsync({
      licenseKey: data.licenseKey,
      clientIp: undefined, // Will be determined server-side
    });
  };
  
  const handleClearLicense = () => {
    setCurrentLicenseKey('');
    setShowLicenseInfo(false);
    localStorage.removeItem('licenseKey');
    reset();
    toast.success('License cleared');
  };
  
  // Load saved license key on component mount
  useEffect(() => {
    const savedLicenseKey = localStorage.getItem('licenseKey');
    if (savedLicenseKey) {
      setCurrentLicenseKey(savedLicenseKey);
      setShowLicenseInfo(true);
    }
  }, []);
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            License Management
          </h1>
          <p className="text-gray-600">
            Manage your software license for network deployment and centralized database access.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* License Key Input */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <KeyIcon className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Enter License Key
              </h2>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="licenseKey" className="block text-sm font-medium text-gray-700 mb-1">
                  License Key
                </label>
                <input
                  {...register('licenseKey')}
                  type="text"
                  placeholder="Enter your license key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.licenseKey && (
                  <p className="mt-1 text-sm text-red-600">{errors.licenseKey.message}</p>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={validateLicenseMutation.isPending}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {validateLicenseMutation.isPending ? 'Validating...' : 'Validate License'}
                </button>
                
                {currentLicenseKey && (
                  <button
                    type="button"
                    onClick={handleClearLicense}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>
          
          {/* License Information */}
          {showLicenseInfo && licenseInfoQuery.data && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  License Information
                </h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Company Name</label>
                  <p className="text-lg font-semibold text-gray-900">{licenseInfoQuery.data.companyName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Contact Email</label>
                  <p className="text-gray-900">{licenseInfoQuery.data.contactEmail}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Max Users</label>
                    <p className="text-lg font-semibold text-gray-900">{licenseInfoQuery.data.maxUsers}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Max Companies</label>
                    <p className="text-lg font-semibold text-gray-900">{licenseInfoQuery.data.maxCompanies}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Active Users</label>
                    <p className="text-lg text-blue-600">{licenseInfoQuery.data.activeUsers}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Active Companies</label>
                    <p className="text-lg text-blue-600">{licenseInfoQuery.data.activeCompanies}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Issued Date</label>
                  <p className="text-gray-900">
                    {new Date(licenseInfoQuery.data.issuedAt).toLocaleDateString()}
                  </p>
                </div>
                
                {licenseInfoQuery.data.expiresAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Expires On</label>
                    <p className="text-gray-900">
                      {new Date(licenseInfoQuery.data.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                {licenseInfoQuery.data.lastUsedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Last Used</label>
                    <p className="text-gray-900">
                      {new Date(licenseInfoQuery.data.lastUsedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center pt-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    licenseInfoQuery.data.isActive ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`font-medium ${
                    licenseInfoQuery.data.isActive ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {licenseInfoQuery.data.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Network Deployment Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <ServerIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Network Deployment Setup
            </h3>
          </div>
          
          <div className="prose text-sm text-gray-700">
            <p className="mb-4">
              To set up this application for network deployment with a centralized database:
            </p>
            
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>Ensure your license is validated above</li>
              <li>Configure the central server with the database exposed on port 5432</li>
              <li>Update the <code>DATABASE_URL</code> environment variable on client instances to point to the central server</li>
              <li>Example: <code>DATABASE_URL=postgresql://postgres:postgres@192.168.1.100:5432/app</code></li>
              <li>Start client instances with the updated configuration</li>
            </ol>
            
            <div className="bg-white rounded border border-blue-200 p-4">
              <h4 className="font-medium text-gray-900 mb-2">Environment Variables for Client Instances:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`DATABASE_URL=postgresql://postgres:postgres@[CENTRAL_SERVER_IP]:5432/app
BASE_URL=http://[CENTRAL_SERVER_IP]:8000
JWT_SECRET=[SAME_AS_CENTRAL_SERVER]`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const Route = createFileRoute('/license/')({
  component: LicensePage,
});
