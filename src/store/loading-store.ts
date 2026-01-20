import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  // Support multiple loading keys if needed in future
  loadingCount: number;
  startLoading: () => void;
  stopLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  loadingCount: 0,
  setLoading: (loading) => set({ isLoading: loading }),
  startLoading: () => set((state) => ({ 
    loadingCount: state.loadingCount + 1,
    isLoading: true 
  })),
  stopLoading: () => set((state) => {
    const nextCount = Math.max(0, state.loadingCount - 1);
    return {
      loadingCount: nextCount,
      isLoading: nextCount > 0
    };
  }),
}));
