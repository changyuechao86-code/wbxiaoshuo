/**
 * 世界观设定状态 Store
 */
import { create } from 'zustand';
import type { WorldSetting, CreateWorldSettingDTO, UpdateWorldSettingDTO } from '../../shared/types';

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
      set({ error: err.message || '加载世界观设定失败', isLoading: false });
    }
  },

  createWorldSetting: async (data: CreateWorldSettingDTO) => {
    set({ error: null });
    try {
      const ws = await window.electronAPI.worldSetting.create(data);
      set((s) => ({ worldSettings: [...s.worldSettings, ws] }));
      return ws;
    } catch (err: any) {
      set({ error: err.message || '创建世界观设定失败' });
      throw err;
    }
  },

  updateWorldSetting: async (id: string, data: UpdateWorldSettingDTO) => {
    set({ error: null });
    try {
      const updated = await window.electronAPI.worldSetting.update(id, data);
      set((s) => ({
        worldSettings: s.worldSettings.map((w) => w.id === id ? updated : w),
      }));
    } catch (err: any) {
      set({ error: err.message || '更新世界观设定失败' });
      throw err;
    }
  },

  deleteWorldSetting: async (id: string) => {
    set({ error: null });
    try {
      await window.electronAPI.worldSetting.delete(id);
      set((s) => ({ worldSettings: s.worldSettings.filter((w) => w.id !== id) }));
    } catch (err: any) {
      set({ error: err.message || '删除世界观设定失败' });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
