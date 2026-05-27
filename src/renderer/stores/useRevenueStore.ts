/**
 * 收益状态 Store (P1)
 */
import { create } from 'zustand';
import type { Revenue, CreateRevenueDTO } from '../../shared/types';

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
      set({ error: err.message || '加载收益记录失败', isLoading: false });
    }
  },

  createRevenue: async (data: CreateRevenueDTO) => {
    set({ error: null });
    try {
      const r = await window.electronAPI.revenue.create(data);
      set((s) => ({ revenues: [r, ...s.revenues] }));
      return r;
    } catch (err: any) {
      set({ error: err.message || '创建收益记录失败' });
      throw err;
    }
  },

  deleteRevenue: async (id: string) => {
    set({ error: null });
    try {
      await window.electronAPI.revenue.delete(id);
      set((s) => ({ revenues: s.revenues.filter((r) => r.id !== id) }));
    } catch (err: any) {
      set({ error: err.message || '删除收益记录失败' });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
