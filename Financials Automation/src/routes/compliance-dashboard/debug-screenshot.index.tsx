import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useTRPC } from '~/trpc/react';
import { useQuery } from '@tanstack/react-query';
import Layout from '~/components/Layout';
import { 
  CameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ServerIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  EyeIcon,
  BugAntIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  SignalIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '~/stores/authStore';
import { useSelectedCompany } from '~/stores/companyStore';
import { useDatabaseConfig } from '~/stores/databaseStore';
import toast from 'react-hot-toast';

export const Route = createFileRoute('/compliance-dashboard/debug-screenshot/')({
  component: DebugScreenshotPage,
});

interface SystemCheck {
  name: string;
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
  details?: string;
  timestamp: Date;
}

function DebugScreenshotPage() {
  const trpc = useTRPC();
  const { isAuthenticated, token, user } = useAuth();
  const { selectedCompanyId } = useSelectedCompany();
  const { isConnected, connectionString, lastConnectionError } = useDatabaseConfig();
  
  const [systemChecks, setSystemChecks] = useState<SystemCheck[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);

  // Test queries to verify tRPC functionality
  const trialBalanceQuery = useQuery(
    trpc.getTrialBalance.queryOptions(
      { companyId: selectedCompanyId || '' },
      { enabled: !!selectedCompanyId }
    )
  );

  const connectionStatusQuery = useQuery(
    trpc.getDatabaseConnectionStatus.queryOptions(undefined, {
      refetchInterval: 5000, // Check every 5 seconds for debug
    })
  );

  // Capture console logs for debugging
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    const logCapture = (level: string, ...args: any[]) => {
      const message = `[${new Date().toLocaleTimeString()}] [${level}] ${args.join(' ')}`;
      setConnectionLogs(prev => [message, ...prev.slice(0, 49)]); // Keep last 50 logs
    };

    console.log = (...args) => {
      originalLog(...args);
      if (args.some(arg => typeof arg === 'string' && arg.includes('Database Connection'))) {
        logCapture('LOG', ...args);
      }
    };

    console.error = (...args) => {
      originalError(...args);
      if (args.some(arg => typeof arg === 'string' && arg.includes('Database Connection'))) {
        logCapture('ERROR', ...args);
      }
    };

    console.warn = (...args) => {
      originalWarn(...args);
      if (args.some(arg => typeof arg === 'string' && arg.includes('Database Connection'))) {
        logCapture('WARN', ...args);
      }
    };

    console.info = (...args) => {
      originalInfo(...args);
      if (args.some(arg => typeof arg === 'string' && arg.includes('Database Connection'))) {
        logCapture('INFO', ...args);
      }
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
    };
  }, []);

  // Run comprehensive system checks
  const runSystemChecks = async () => {
    setIsRunningTests(true);
    const checks: SystemCheck[] = [];
    
    try {
      // Authentication check
      checks.push({
        name: 'Authentication',
        status: isAuthenticated ? 'success' : 'error',
        message: isAuthenticated ? `Authenticated as ${user?.email}` : 'Not authenticated',
        details: token ? `Token: ${token.substring(0, 20)}...` : 'No token available',
        timestamp: new Date()
      });

      // Company selection check
      checks.push({
        name: 'Company Selection',
        status: selectedCompanyId ? 'success' : 'warning',
        message: selectedCompanyId ? `Company selected: ${selectedCompanyId}` : 'No company selected',
        details: selectedCompanyId ? undefined : 'Please select a company to proceed',
        timestamp: new Date()
      });

      // Database connection check
      checks.push({
        name: 'Database Connection',
        status: isConnected ? 'success' : 'error',
        message: isConnected ? `Connected to ${connectionString}` : 'Database disconnected',
        details: lastConnectionError || undefined,
        timestamp: new Date()
      });

      // tRPC functionality check
      try {
        await connectionStatusQuery.refetch();
        checks.push({
          name: 'tRPC Communication',
          status: 'success',
          message: 'tRPC client communication working',
          details: 'Successfully executed database status query',
          timestamp: new Date()
        });
      } catch (error) {
        checks.push({
          name: 'tRPC Communication',
          status: 'error',
          message: 'tRPC communication failed',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        });
      }

      // Trial balance data check
      if (selectedCompanyId) {
        try {
          const tbData = await trialBalanceQuery.refetch();
          checks.push({
            name: 'Trial Balance Data',
            status: tbData.data?.length ? 'success' : 'warning',
            message: tbData.data?.length ? `${tbData.data.length} entries loaded` : 'No trial balance data',
            details: tbData.data?.length ? undefined : 'Upload trial balance to proceed',
            timestamp: new Date()
          });
        } catch (error) {
          checks.push({
            name: 'Trial Balance Data',
            status: 'error',
            message: 'Failed to load trial balance',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date()
          });
        }
      }

      // Browser environment check
      checks.push({
        name: 'Browser Environment',
        status: 'info',
        message: `${navigator.userAgent.split(' ').pop()} on ${navigator.platform}`,
        details: `Screen: ${screen.width}x${screen.height}, Viewport: ${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date()
      });

      // Local storage check
      try {
        localStorage.setItem('debug-test', 'test');
        localStorage.removeItem('debug-test');
        checks.push({
          name: 'Local Storage',
          status: 'success',
          message: 'Local storage working',
          details: 'Configuration persistence available',
          timestamp: new Date()
        });
      } catch (error) {
        checks.push({
          name: 'Local Storage',
          status: 'error',
          message: 'Local storage unavailable',
          details: 'Configuration will not persist',
          timestamp: new Date()
        });
      }

      // Console forwarding check
      console.log('Database Connection [test]: Debug system check initiated');
      checks.push({
        name: 'Console Forwarding',
        status: 'info',
        message: 'Console forwarding active',
        details: 'Client logs are being forwarded to server',
        timestamp: new Date()
      });

      setSystemChecks(checks);
      toast.success('System checks completed');
    } catch (error) {
      console.error('System checks failed:', error);
      toast.error('System checks failed');
    } finally {
      setIsRunningTests(false);
    }
  };

  // Take screenshot of current page
  const takeScreenshot = async () => {
    try {
      // Use html2canvas if available, otherwise use native browser API
      if ('html2canvas' in window) {
        // @ts-ignore
        const canvas = await window.html2canvas(document.body);
        setScreenshotData(canvas.toDataURL());
      } else {
        // Fallback to basic screenshot info
        const screenshotInfo = {
          timestamp: new Date().toISOString(),
          url: window.location.href,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          screen: {
            width: screen.width,
            height: screen.height
          },
          userAgent: navigator.userAgent
        };
        setScreenshotData(`data:text/plain;base64,${btoa(JSON.stringify(screenshotInfo, null, 2))}`);
      }
      toast.success('Screenshot captured');
    } catch (error) {
      console.error('Screenshot failed:', error);
      toast.error('Screenshot capture failed');
    }
  };

  // Force connection test
  const testConnection = async () => {
    console.log('Database Connection [attempt]: Manual connection test initiated from debug page');
    try {
      await connectionStatusQuery.refetch();
      toast.success('Connection test completed');
    } catch (error) {
      console.error('Database Connection [failure]: Manual connection test failed', error);
      toast.error('Connection test failed');
    }
  };

  // Clear logs
  const clearLogs = () => {
    setConnectionLogs([]);
    toast.success('Logs cleared');
  };

  const getStatusIcon = (status: SystemCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: SystemCheck['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Debug Screenshot Tool</h1>
              <p className="text-purple-100">
                Comprehensive system testing and screenshot capture for debugging
              </p>
            </div>
            <BugAntIcon className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={runSystemChecks}
            disabled={isRunningTests}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isRunningTests ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                <span>Running Tests...</span>
              </>
            ) : (
              <>
                <ComputerDesktopIcon className="h-5 w-5" />
                <span>Run System Checks</span>
              </>
            )}
          </button>

          <button
            onClick={takeScreenshot}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
          >
            <CameraIcon className="h-5 w-5" />
            <span>Take Screenshot</span>
          </button>

          <button
            onClick={testConnection}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
          >
            <ServerIcon className="h-5 w-5" />
            <span>Test Connection</span>
          </button>

          <button
            onClick={clearLogs}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span>Clear Logs</span>
          </button>
        </div>

        {/* System Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Checks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">System Checks</h2>
              <span className="text-sm text-gray-500">
                {systemChecks.length} checks performed
              </span>
            </div>
            
            <div className="space-y-3">
              {systemChecks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No system checks performed yet. Click "Run System Checks" to start.
                </p>
              ) : (
                systemChecks.map((check, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${getStatusColor(check.status)}`}>
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(check.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{check.name}</h3>
                          <span className="text-xs text-gray-500">
                            {check.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{check.message}</p>
                        {check.details && (
                          <p className="text-xs text-gray-500 mt-1">{check.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Connection Logs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Connection Logs</h2>
              <div className="flex items-center space-x-2">
                <SignalIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {connectionLogs.length} log entries
                </span>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 max-h-80 overflow-y-auto">
              {connectionLogs.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No connection logs captured yet. Connection events will appear here.
                </p>
              ) : (
                <div className="space-y-1">
                  {connectionLogs.map((log, index) => (
                    <div key={index} className="text-xs font-mono">
                      <span className={`${
                        log.includes('[ERROR]') ? 'text-red-400' :
                        log.includes('[WARN]') ? 'text-yellow-400' :
                        log.includes('[INFO]') ? 'text-blue-400' :
                        'text-green-400'
                      }`}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Screenshot Display */}
        {screenshotData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Screenshot Capture</h2>
              <div className="flex items-center space-x-2">
                <EyeIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  Captured at {new Date().toLocaleString()}
                </span>
              </div>
            </div>
            
            {screenshotData.startsWith('data:image/') ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={screenshotData} 
                  alt="Page Screenshot" 
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Screenshot Information</h3>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                  {atob(screenshotData.split(',')[1])}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Current State Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current State Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Authentication</h3>
              <p className="text-sm text-gray-600">
                Status: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
              </p>
              {user && (
                <p className="text-sm text-gray-600">
                  User: {user.email}
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Database</h3>
              <p className="text-sm text-gray-600">
                Status: {isConnected ? 'Connected' : 'Disconnected'}
              </p>
              <p className="text-sm text-gray-600">
                Connection: {connectionString}
              </p>
              {lastConnectionError && (
                <p className="text-sm text-red-600 mt-1">
                  Error: {lastConnectionError}
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Company</h3>
              <p className="text-sm text-gray-600">
                Selected: {selectedCompanyId || 'None'}
              </p>
              <p className="text-sm text-gray-600">
                Trial Balance: {trialBalanceQuery.data?.length || 0} entries
              </p>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-6 w-6 text-yellow-600 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Debug Information</h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>• This page provides comprehensive debugging tools for the financial automation system</p>
                <p>• System checks verify authentication, database connectivity, and data availability</p>
                <p>• Connection logs show real-time database connection events with timestamps</p>
                <p>• Screenshots can be captured for visual debugging and issue reporting</p>
                <p>• All client-side console logs are automatically forwarded to the server for analysis</p>
                <p>• The system includes automatic reconnection with exponential backoff for database failures</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
