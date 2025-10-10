import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Company {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CompanyStore {
  // State
  selectedCompanyId: string | null;
  companies: Company[];
  isLoading: boolean;
  
  // Actions
  setSelectedCompany: (companyId: string) => void;
  setCompanies: (companies: Company[]) => void;
  addCompany: (company: Company) => void;
  updateCompany: (companyId: string, updates: Partial<Company>) => void;
  removeCompany: (companyId: string) => void;
  setLoading: (loading: boolean) => void;
  clearSelection: () => void;
  clearAll: () => void;
  
  // Getters
  getSelectedCompany: () => Company | null;
  getCompanyById: (id: string) => Company | null;
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedCompanyId: null,
      companies: [],
      isLoading: false,
      
      // Actions
      setSelectedCompany: (companyId: string) => {
        set({ selectedCompanyId: companyId });
      },
      
      setCompanies: (companies: Company[]) => {
        set({ companies });
        
        // Auto-select first company if none selected
        const { selectedCompanyId } = get();
        if (!selectedCompanyId && companies.length > 0) {
          set({ selectedCompanyId: companies[0].id });
        }
      },
      
      addCompany: (company: Company) => {
        set((state) => ({
          companies: [...state.companies, company]
        }));
        
        // Auto-select if it's the first company
        const { selectedCompanyId } = get();
        if (!selectedCompanyId) {
          set({ selectedCompanyId: company.id });
        }
      },
      
      updateCompany: (companyId: string, updates: Partial<Company>) => {
        set((state) => ({
          companies: state.companies.map(company =>
            company.id === companyId ? { ...company, ...updates } : company
          )
        }));
      },
      
      removeCompany: (companyId: string) => {
        set((state) => {
          const newCompanies = state.companies.filter(c => c.id !== companyId);
          const newState: Partial<CompanyStore> = { companies: newCompanies };
          
          // If removing selected company, select first available or clear selection
          if (state.selectedCompanyId === companyId) {
            newState.selectedCompanyId = newCompanies.length > 0 ? newCompanies[0].id : null;
          }
          
          return newState;
        });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      clearSelection: () => {
        set({ selectedCompanyId: null });
      },
      
      clearAll: () => {
        set({
          selectedCompanyId: null,
          companies: [],
          isLoading: false,
        });
      },
      
      // Getters
      getSelectedCompany: () => {
        const { selectedCompanyId, companies } = get();
        return companies.find(c => c.id === selectedCompanyId) || null;
      },
      
      getCompanyById: (id: string) => {
        const { companies } = get();
        return companies.find(c => c.id === id) || null;
      },
    }),
    {
      name: 'company-selection', // Storage key
      storage: createJSONStorage(() => localStorage),
      
      // Only persist essential data - companies will be refetched from server
      partialize: (state) => ({
        selectedCompanyId: state.selectedCompanyId,
        // Don't persist companies - they'll be refetched on login
      }),
      
      // Handle migration if needed
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from version 0 to 1
          return {
            ...persistedState,
            companies: persistedState.companies || [],
          };
        }
        return persistedState;
      },
    }
  )
);

// Helper hooks for common use cases
export const useSelectedCompany = () => {
  const selectedCompanyId = useCompanyStore(state => state.selectedCompanyId);
  const getSelectedCompany = useCompanyStore(state => state.getSelectedCompany);
  return {
    selectedCompanyId,
    selectedCompany: getSelectedCompany(),
  };
};

export const useCompanyList = () => {
  const companies = useCompanyStore(state => state.companies);
  const isLoading = useCompanyStore(state => state.isLoading);
  return { companies, isLoading };
};
