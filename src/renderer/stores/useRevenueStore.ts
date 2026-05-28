import { create } from 'zustand';
import type { CreateRevenueDTO, Revenue } from '../../shared/types';

const text = {
  createFailed: '\u521b\u5efa\u6536\u76ca\u8bb0\u5f55\u5931\u8d25',
  deleteFailed: '\u5220\u9664\u6536\u76ca\u8bb0\u5f55\u5931\u8d25',
  loadFailed: '\u52a0\u8f7d\u6536\u76ca\u8bb0\u5f55\u5931\u8d25',
};

interface RevenueState {
  revenues: Revenue[];
  isLoading: boolean;
  error: string | null;

  loadRevenues: (projectId: string) => Promise<void>;
  createRevenue: (data: CreateRevenueDTO) => Promise<Revenue>;
  deleteRevenue: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useRevenueStore = create<RevenueState>((set) => ({
  revenues: [],
  isLoading: false,
  error: null,

  loadRevenues: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const revenues = await window.electronAPI.revenue.list(projectId);
      set({ revenues, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || text.loadFailed, isLoading: false });
    }
  },

  createRevenue: async (data: CreateRevenueDTO) => {
    set({ error: null });
    try {
      const revenue = await window.electronAPI.revenue.create(data);
      set((s) => ({ revenues: [revenue, ...s.revenues] }));
      return revenue;
    } catch (err: any) {
      set({ error: err.message || text.createFailed });
      throw err;
    }
  },

  deleteRevenue: async (id: string) => {
    set({ error: null });
    try {
      await window.electronAPI.revenue.delete(id);
      set((s) => ({ revenues: s.revenues.filter((revenue) => revenue.id !== id) }));
    } catch (err: any) {
      set({ error: err.message || text.deleteFailed });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
