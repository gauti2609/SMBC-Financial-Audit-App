import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

interface DatabaseStore {
  // State
  config: DatabaseConfig;
  isConnected: boolean;
  isConnecting: boolean;
  lastConnectionError: string | null;
  
  // Actions
  setConfig: (config: Partial<DatabaseConfig>) => void;
  setConnectionStatus: (isConnected: boolean, error?: string) => void;
  setConnecting: (isConnecting: boolean) => void;
  resetToDefaults: () => void;
  
  // Getters
  getDatabaseUrl: () => string;
  getConnectionString: () => string;
}

const defaultConfig: DatabaseConfig = {
  host: '192.168.1.29',
  port: 5432,
  username: 'SMBC',
  password: 'Smbc@2025',
  database: 'financialsdb',
};

export const useDatabaseStore = create<DatabaseStore>()(
  persist(
    (set, get) => ({
      // Initial state
      config: defaultConfig,
      isConnected: false,
      isConnecting: false,
      lastConnectionError: null,
      
      // Actions
      setConfig: (newConfig: Partial<DatabaseConfig>) => {
        set((state) => ({
          config: { ...state.config, ...newConfig },
          // Reset connection status when config changes
          isConnected: false,
          lastConnectionError: null,
        }));
      },
      
      setConnectionStatus: (isConnected: boolean, error?: string) => {
        set({
          isConnected,
          isConnecting: false,
          lastConnectionError: error || null,
        });
      },
      
      setConnecting: (isConnecting: boolean) => {
        set({ isConnecting });
      },
      
      resetToDefaults: () => {
        set({
          config: defaultConfig,
          isConnected: false,
          isConnecting: false,
          lastConnectionError: null,
        });
      },
      
      // Getters
      getDatabaseUrl: () => {
        const { config } = get();
        return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
      },
      
      getConnectionString: () => {
        const { config } = get();
        return `${config.host}:${config.port}/${config.database}`;
      },
    }),
    {
      name: 'database-config', // Storage key
      storage: createJSONStorage(() => localStorage),
      
      // Only persist the config, not the connection status
      partialize: (state) => ({
        config: state.config,
      }),
      
      // Handle rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Reset connection status on rehydration
          state.isConnected = false;
          state.isConnecting = false;
          state.lastConnectionError = null;
        }
      },
      
      version: 1,
    }
  )
);

// Helper hooks for common use cases
export const useDatabaseConfig = () => {
  const config = useDatabaseStore(state => state.config);
  const isConnected = useDatabaseStore(state => state.isConnected);
  const isConnecting = useDatabaseStore(state => state.isConnecting);
  const lastConnectionError = useDatabaseStore(state => state.lastConnectionError);
  const getDatabaseUrl = useDatabaseStore(state => state.getDatabaseUrl);
  const getConnectionString = useDatabaseStore(state => state.getConnectionString);
  
  return {
    config,
    isConnected,
    isConnecting,
    lastConnectionError,
    databaseUrl: getDatabaseUrl(),
    connectionString: getConnectionString(),
  };
};
