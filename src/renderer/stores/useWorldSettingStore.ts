import { create } from 'zustand';
import type { CreateWorldSettingDTO, UpdateWorldSettingDTO, WorldSetting } from '../../shared/types';

const text = {
  createFailed: '\u521b\u5efa\u4e16\u754c\u89c2\u8bbe\u5b9a\u5931\u8d25',
  deleteFailed: '\u5220\u9664\u4e16\u754c\u89c2\u8bbe\u5b9a\u5931\u8d25',
  loadFailed: '\u52a0\u8f7d\u4e16\u754c\u89c2\u8bbe\u5b9a\u5931\u8d25',
  updateFailed: '\u66f4\u65b0\u4e16\u754c\u89c2\u8bbe\u5b9a\u5931\u8d25',
};

interface WorldSettingState {
  worldSettings: WorldSetting[];
  isLoading: boolean;
  error: string | null;

  loadWorldSettings: (projectId: string) => Promise<void>;
  createWorldSetting: (data: CreateWorldSettingDTO) => Promise<WorldSetting>;
  updateWorldSetting: (id: string, data: UpdateWorldSettingDTO) => Promise<void>;
  deleteWorldSetting: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useWorldSettingStore = create<WorldSettingState>((set) => ({
  worldSettings: [],
  isLoading: false,
  error: null,

  loadWorldSettings: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const worldSettings = await window.electronAPI.worldSetting.list(projectId);
      set({ worldSettings, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || text.loadFailed, isLoading: false });
    }
  },

  createWorldSetting: async (data: CreateWorldSettingDTO) => {
    set({ error: null });
    try {
      const worldSetting = await window.electronAPI.worldSetting.create(data);
      set((s) => ({ worldSettings: [...s.worldSettings, worldSetting] }));
      return worldSetting;
    } catch (err: any) {
      set({ error: err.message || text.createFailed });
      throw err;
    }
  },

  updateWorldSetting: async (id: string, data: UpdateWorldSettingDTO) => {
    set({ error: null });
    try {
      const updated = await window.electronAPI.worldSetting.update(id, data);
      set((s) => ({
        worldSettings: s.worldSettings.map((worldSetting) => (
          worldSetting.id === id ? updated : worldSetting
        )),
      }));
    } catch (err: any) {
      set({ error: err.message || text.updateFailed });
      throw err;
    }
  },

  deleteWorldSetting: async (id: string) => {
    set({ error: null });
    try {
      await window.electronAPI.worldSetting.delete(id);
      set((s) => ({ worldSettings: s.worldSettings.filter((worldSetting) => worldSetting.id !== id) }));
    } catch (err: any) {
      set({ error: err.message || text.deleteFailed });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
