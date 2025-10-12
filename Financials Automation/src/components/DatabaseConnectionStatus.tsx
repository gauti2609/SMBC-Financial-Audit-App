import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ServerIcon,
  CogIcon,
  ArrowPathIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useTRPC } from '~/trpc/react';
import { useDatabaseStore, useDatabaseConfig } from '~/stores/databaseStore';
import DatabaseConfigModal from './DatabaseConfigModal';
import { useQuery } from '@tanstack/react-query';

// Connection history interface
interface ConnectionEvent {
  timestamp: Date;
  type: 'attempt' | 'success' | 'failure' | 'reconnect';
  message: string;
  error?: string;
}

export default function DatabaseConnectionStatus() {
  const trpc = useTRPC();
  const { 
    isConnected, 
    isConnecting, 
    lastConnectionError, 
    connectionString,
    config 
  } = useDatabaseConfig();
  const { setConnectionStatus, setConnecting } = useDatabaseStore();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [connectionHistory, setConnectionHistory] = useState<ConnectionEvent[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Reconnection state
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isAutoReconnecting, setIsAutoReconnecting] = useState(false);
  const [nextReconnectTime, setNextReconnectTime] = useState<Date | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const baseRetryDelay = 1000; // 1 second

  // Log connection events
  const logConnectionEvent = useCallback((event: Omit<ConnectionEvent, 'timestamp'>) => {
    const newEvent: ConnectionEvent = {
      ...event,
      timestamp: new Date()
    };
    
    setConnectionHistory(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50 events
    
    // Log to console (which will be forwarded to server)
    const logMessage = `Database Connection [${event.type}]: ${event.message}`;
    
    switch (event.type) {
      case 'failure':
        console.error(logMessage, event.error ? { error: event.error } : undefined);
        break;
      case 'success':
        console.info(logMessage);
        break;
      case 'attempt':
      case 'reconnect':
        console.log(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }, []);

  // Calculate exponential backoff delay
  const calculateRetryDelay = (attempt: number): number => {
    const delay = Math.min(baseRetryDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
    const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
    return delay + jitter;
  };

  // Auto-reconnect function with exponential backoff
  const scheduleReconnect = useCallback(() => {
    if (isConnected || reconnectAttempts >= maxReconnectAttempts || isAutoReconnecting) {
      return;
    }

    const delay = calculateRetryDelay(reconnectAttempts);
    const nextAttemptTime = new Date(Date.now() + delay);
    setNextReconnectTime(nextAttemptTime);
    setIsAutoReconnecting(true);

    logConnectionEvent({
      type: 'reconnect',
      message: `Scheduling reconnection attempt ${reconnectAttempts + 1}/${maxReconnectAttempts} in ${Math.round(delay / 1000)} seconds`
    });

    reconnectTimeoutRef.current = setTimeout(async () => {
      setReconnectAttempts(prev => prev + 1);
      setNextReconnectTime(null);
      
      logConnectionEvent({
        type: 'attempt',
        message: `Auto-reconnection attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`
      });

      try {
        await connectionStatusQuery.refetch();
      } catch (error) {
        console.error('Auto-reconnection failed:', error);
      } finally {
        setIsAutoReconnecting(false);
      }
    }, delay);
  }, [isConnected, reconnectAttempts, isAutoReconnecting, logConnectionEvent]);

  // Query to check database connection status with enhanced retry logic
  const connectionStatusQuery = useQuery(
    trpc.getDatabaseConnectionStatus.queryOptions(
      undefined,
      {
        refetchInterval: isConnected ? 30000 : false, // Only poll when connected
        retry: (failureCount, error) => {
          // Custom retry logic for connection checks
          if (failureCount < 3) {
            logConnectionEvent({
              type: 'attempt',
              message: `Connection check retry ${failureCount + 1}/3`
            });
            return true;
          }
          return false;
        },
        retryDelay: (attemptIndex) => calculateRetryDelay(attemptIndex),
        onSuccess: (data) => {
          setConnectionStatus(data.isConnected, data.isConnected ? undefined : data.message);
          
          if (data.isConnected) {
            logConnectionEvent({
              type: 'success',
              message: `Successfully connected to ${config.database} at ${config.host}:${config.port}`
            });
            
            // Reset reconnection attempts on successful connection
            setReconnectAttempts(0);
            setIsAutoReconnecting(false);
            setNextReconnectTime(null);
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
              reconnectTimeoutRef.current = null;
            }
          } else {
            logConnectionEvent({
              type: 'failure',
              message: 'Connection check failed',
              error: data.message
            });
            
            // Schedule reconnection if not already scheduled
            if (!isAutoReconnecting && reconnectAttempts < maxReconnectAttempts) {
              scheduleReconnect();
            }
          }
        },
        onError: (error: any) => {
          const errorMessage = error.message || 'Connection check failed';
          setConnectionStatus(false, errorMessage);
          
          logConnectionEvent({
            type: 'failure',
            message: 'Connection check error',
            error: errorMessage
          });
          
          // Schedule reconnection if not already scheduled
          if (!isAutoReconnecting && reconnectAttempts < maxReconnectAttempts) {
            scheduleReconnect();
          }
        },
      }
    )
  );

  const handleManualConnectionCheck = async () => {
    setIsCheckingConnection(true);
    setConnecting(true);
    
    logConnectionEvent({
      type: 'attempt',
      message: 'Manual connection check initiated'
    });
    
    try {
      await connectionStatusQuery.refetch();
    } finally {
      setIsCheckingConnection(false);
      setConnecting(false);
    }
  };

  const handleConfigureDatabase = () => {
    setShowConfigModal(true);
  };

  const handleConfigSuccess = () => {
    // Reset reconnection attempts and refresh connection status
    setReconnectAttempts(0);
    setIsAutoReconnecting(false);
    setNextReconnectTime(null);
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    logConnectionEvent({
      type: 'attempt',
      message: 'Connection check after configuration update'
    });
    
    connectionStatusQuery.refetch();
  };

  // Reset reconnection attempts when component unmounts
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Auto-show config modal if there's a connection error and user hasn't seen it
  useEffect(() => {
    if (!isConnected && lastConnectionError && !showConfigModal) {
      // Only auto-show if it's a network-related error
      const networkErrors = ['ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT'];
      const isNetworkError = networkErrors.some(code => 
        lastConnectionError.includes(code) || 
        lastConnectionError.includes('Connection refused') ||
        lastConnectionError.includes('timeout') ||
        lastConnectionError.includes('resolve host')
      );
      
      if (isNetworkError) {
        // Delay to avoid showing immediately on page load
        const timer = setTimeout(() => {
          setShowConfigModal(true);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isConnected, lastConnectionError, showConfigModal]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ServerIcon className="h-5 w-5 text-gray-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Database Connection</h3>
              <p className="text-xs text-gray-500">{connectionString}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Connection Status Indicator */}
            <div className="flex items-center">
              {isConnecting || isCheckingConnection || isAutoReconnecting ? (
                <ArrowPathIcon className="h-4 w-4 text-blue-500 animate-spin mr-1" />
              ) : isConnected ? (
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              
              <span className={`text-xs font-medium ${
                isConnecting || isCheckingConnection || isAutoReconnecting
                  ? 'text-blue-600' 
                  : isConnected 
                    ? 'text-green-600' 
                    : 'text-red-600'
              }`}>
                {isAutoReconnecting 
                  ? `Reconnecting (${reconnectAttempts}/${maxReconnectAttempts})` 
                  : isConnecting || isCheckingConnection 
                    ? 'Checking...' 
                    : isConnected 
                      ? 'Connected' 
                      : 'Disconnected'
                }
              </span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-1">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Connection history"
              >
                <ClockIcon className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleManualConnectionCheck}
                disabled={isConnecting || isCheckingConnection || isAutoReconnecting}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Check connection"
              >
                <ArrowPathIcon className={`h-4 w-4 ${
                  (isConnecting || isCheckingConnection || isAutoReconnecting) ? 'animate-spin' : ''
                }`} />
              </button>
              
              <button
                onClick={handleConfigureDatabase}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Configure database"
              >
                <CogIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Next Reconnect Time */}
        {nextReconnectTime && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700">
              Next reconnection attempt in {Math.ceil((nextReconnectTime.getTime() - Date.now()) / 1000)} seconds
            </p>
          </div>
        )}
        
        {/* Error Message */}
        {!isConnected && lastConnectionError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-700">
              {lastConnectionError}
            </p>
            <div className="mt-1 flex space-x-2">
              <button
                onClick={handleConfigureDatabase}
                className="text-xs text-red-600 hover:text-red-800 underline"
              >
                Configure database connection
              </button>
              {reconnectAttempts < maxReconnectAttempts && !isAutoReconnecting && (
                <button
                  onClick={() => {
                    setReconnectAttempts(0);
                    scheduleReconnect();
                  }}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  Retry now
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Success Message */}
        {isConnected && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-xs text-green-700">
              Connected to {config.database} at {config.host}:{config.port}
            </p>
          </div>
        )}
        
        {/* Connection History */}
        {showHistory && (
          <div className="mt-4 border-t border-gray-200 pt-3">
            <h4 className="text-xs font-medium text-gray-900 mb-2">Connection History</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {connectionHistory.length === 0 ? (
                <p className="text-xs text-gray-500">No connection events recorded</p>
              ) : (
                connectionHistory.map((event, index) => (
                  <div key={index} className="flex items-start space-x-2 text-xs">
                    <span className="text-gray-500 min-w-0 flex-shrink-0">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                    <span className={`font-medium ${
                      event.type === 'success' ? 'text-green-600' :
                      event.type === 'failure' ? 'text-red-600' :
                      event.type === 'reconnect' ? 'text-blue-600' :
                      'text-gray-600'
                    }`}>
                      {event.type}
                    </span>
                    <span className="text-gray-700 min-w-0">
                      {event.message}
                      {event.error && (
                        <span className="text-red-600 ml-1">({event.error})</span>
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Configuration Modal */}
      <DatabaseConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSuccess={handleConfigSuccess}
      />
    </>
  );
}
