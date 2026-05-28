import { create } from 'zustand';
import type { CreateForeshadowingDTO, Foreshadowing, UpdateForeshadowingDTO } from '../../shared/types';

const text = {
  createFailed: '\u521b\u5efa\u4f0f\u7b14\u5931\u8d25',
  deleteFailed: '\u5220\u9664\u4f0f\u7b14\u5931\u8d25',
  loadFailed: '\u52a0\u8f7d\u4f0f\u7b14\u5217\u8868\u5931\u8d25',
  updateFailed: '\u66f4\u65b0\u4f0f\u7b14\u5931\u8d25',
};

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
      set({ error: err.message || text.loadFailed, isLoading: false });
    }
  },

  createForeshadowing: async (data: CreateForeshadowingDTO) => {
    set({ error: null });
    try {
      const foreshadowing = await window.electronAPI.foreshadowing.create(data);
      set((s) => ({ foreshadowings: [...s.foreshadowings, foreshadowing] }));
      return foreshadowing;
    } catch (err: any) {
      set({ error: err.message || text.createFailed });
      throw err;
    }
  },

  updateForeshadowing: async (id: string, data: UpdateForeshadowingDTO) => {
    set({ error: null });
    try {
      const updated = await window.electronAPI.foreshadowing.update(id, data);
      set((s) => ({
        foreshadowings: s.foreshadowings.map((foreshadowing) => (
          foreshadowing.id === id ? updated : foreshadowing
        )),
      }));
    } catch (err: any) {
      set({ error: err.message || text.updateFailed });
      throw err;
    }
  },

  deleteForeshadowing: async (id: string) => {
    set({ error: null });
    try {
      await window.electronAPI.foreshadowing.delete(id);
      set((s) => ({ foreshadowings: s.foreshadowings.filter((foreshadowing) => foreshadowing.id !== id) }));
    } catch (err: any) {
      set({ error: err.message || text.deleteFailed });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
