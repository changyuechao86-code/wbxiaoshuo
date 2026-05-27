/**
 * 伏笔状态 Store (P1)
 */
import { create } from 'zustand';
import type { Foreshadowing, CreateForeshadowingDTO, UpdateForeshadowingDTO } from '../../shared/types';

interface ForeshadowingState {
  foreshadowings: Foreshadowing[];
  isLoading: boolean;
  error: string | null;

  loadForeshadowings: (projectId: string) => Promise<void>;
  createForeshadowing: (data: CreateForeshadowingDTO) => Promise<Foreshadowing>;
  updateForeshadowing: (id: string, data: UpdateForeshadowingDTO) => Promise<void>;
  deleteForeshadowing: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useForeshadowingStore = create<ForeshadowingState>((set) => ({
  foreshadowings: [],
  isLoading: false,
  error: null,

  loadForeshadowings: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const foreshadowings = await window.electronAPI.foreshadowing.list(projectId);
      set({ foreshadowings, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || '加载伏笔列表失败', isLoading: false });
    }
  },

  createForeshadowing: async (data: CreateForeshadowingDTO) => {
    set({ error: null });
    try {
      const f = await window.electronAPI.foreshadowing.create(data);
      set((s) => ({ foreshadowings: [...s.foreshadowings, f] }));
      return f;
    } catch (err: any) {
      set({ error: err.message || '创建伏笔失败' });
      throw err;
    }
  },

  updateForeshadowing: async (id: string, data: UpdateForeshadowingDTO) => {
    set({ error: null });
    try {
      const updated = await window.electronAPI.foreshadowing.update(id, data);
      set((s) => ({
        foreshadowings: s.foreshadowings.map((f) => f.id === id ? updated : f),
      }));
    } catch (err: any) {
      set({ error: err.message || '更新伏笔失败' });
      throw err;
    }
  },

  deleteForeshadowing: async (id: string) => {
    set({ error: null });
    try {
      await window.electronAPI.foreshadowing.delete(id);
      set((s) => ({ foreshadowings: s.foreshadowings.filter((f) => f.id !== id) }));
    } catch (err: any) {
      set({ error: err.message || '删除伏笔失败' });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
