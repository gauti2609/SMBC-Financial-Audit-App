import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useCompanyStore } from './companyStore';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'ADMIN';
}

interface AuthStore {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
  
  // Getters
  getFullName: () => string;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      // Actions
      setAuth: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },
      
      clearAuth: () => {
        // Clear company data as well
        const { clearAll } = useCompanyStore.getState();
        clearAll();
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },
      
      // Getters
      getFullName: () => {
        const { user } = get();
        if (!user) return '';
        
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        
        if (firstName && lastName) {
          return `${firstName} ${lastName}`;
        } else if (firstName) {
          return firstName;
        } else if (lastName) {
          return lastName;
        } else {
          return user.email;
        }
      },
      
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'ADMIN';
      },
    }),
    {
      name: 'auth-storage', // Storage key
      storage: createJSONStorage(() => localStorage),
      
      // Only persist essential data
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      
      // Handle rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Verify authentication status on rehydration
          state.isAuthenticated = !!(state.user && state.token);
        }
      },
      
      // Handle migration if needed
      version: 1,
    }
  )
);

// Helper hooks for common use cases
export const useAuth = () => {
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const getFullName = useAuthStore(state => state.getFullName);
  const isAdmin = useAuthStore(state => state.isAdmin);
  
  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    fullName: getFullName(),
    isAdmin: isAdmin(),
  };
};
