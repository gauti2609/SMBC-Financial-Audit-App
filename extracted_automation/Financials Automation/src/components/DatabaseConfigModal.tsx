import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  XMarkIcon, 
  ServerIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { useTRPC } from '~/trpc/react';
import { useDatabaseStore } from '~/stores/databaseStore';
import { useQuery, useMutation } from '@tanstack/react-query';

const databaseConfigSchema = z.object({
  host: z.string().min(1, 'Host/IP address is required'),
  port: z.number().int().min(1, 'Port must be a positive integer').max(65535, 'Port must be less than 65536'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  database: z.string().min(1, 'Database name is required'),
});

type DatabaseConfigForm = z.infer<typeof databaseConfigSchema>;

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DatabaseConfigModal({ isOpen, onClose, onSuccess }: DatabaseConfigModalProps) {
  const trpc = useTRPC();
  const { config, setConfig, setConnectionStatus, setConnecting } = useDatabaseStore();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<DatabaseConfigForm>({
    resolver: zodResolver(databaseConfigSchema),
    defaultValues: {
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,
    },
  });

  // Watch form values for real-time updates
  const formValues = watch();

  // Test connection mutation
  const testConnectionMutation = useMutation(
    trpc.testDatabaseConnection.mutationOptions({
      onSuccess: () => {
        setTestResult({ success: true, message: 'Connection successful!' });
        toast.success('Database connection test successful!');
      },
      onError: (error: any) => {
        const errorMessage = error.message || 'Connection test failed';
        setTestResult({ success: false, message: errorMessage });
        toast.error(errorMessage);
      },
    })
  );

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    
    try {
      await testConnectionMutation.mutateAsync(formValues);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const onSubmit = async (data: DatabaseConfigForm) => {
    // Update the store with new config
    setConfig(data);
    
    // Mark as connecting
    setConnecting(true);
    
    try {
      // Test the connection with new config
      await testConnectionMutation.mutateAsync(data);
      
      // If successful, mark as connected
      setConnectionStatus(true);
      toast.success('Database configuration updated successfully!');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal
      onClose();
    } catch (error: any) {
      // Mark as disconnected with error
      setConnectionStatus(false, error.message);
      toast.error('Failed to connect with new configuration');
    }
  };

  const handleClose = () => {
    reset();
    setTestResult(null);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <ServerIcon className="h-6 w-6 text-indigo-600 mr-2" />
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Database Configuration
                    </Dialog.Title>
                  </div>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500"
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Configure the database connection settings. The server IP may have changed due to dynamic IP assignment.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="host" className="block text-sm font-medium text-gray-700 mb-1">
                      Server IP / Host
                    </label>
                    <input
                      {...register('host')}
                      type="text"
                      placeholder="192.168.0.7"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.host && (
                      <p className="mt-1 text-sm text-red-600">{errors.host.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-1">
                      Port
                    </label>
                    <input
                      {...register('port', { valueAsNumber: true })}
                      type="number"
                      placeholder="5432"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.port && (
                      <p className="mt-1 text-sm text-red-600">{errors.port.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      {...register('username')}
                      type="text"
                      placeholder="SMBC"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      {...register('password')}
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="database" className="block text-sm font-medium text-gray-700 mb-1">
                      Database Name
                    </label>
                    <input
                      {...register('database')}
                      type="text"
                      placeholder="financialsdb"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.database && (
                      <p className="mt-1 text-sm text-red-600">{errors.database.message}</p>
                    )}
                  </div>

                  {/* Test Connection Result */}
                  {testResult && (
                    <div className={`p-3 rounded-md ${
                      testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center">
                        {testResult.success ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <p className={`text-sm ${
                          testResult.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {testResult.message}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTestingConnection || testConnectionMutation.isPending}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {(isTestingConnection || testConnectionMutation.isPending) ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        'Test Connection'
                      )}
                    </button>
                    
                    <button
                      type="submit"
                      disabled={testConnectionMutation.isPending || isTestingConnection}
                      className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save & Connect
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
