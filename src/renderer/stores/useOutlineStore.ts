/**
 * 大纲状态 Store
 */
import { create } from 'zustand';
import type { Outline, CreateOutlineDTO, UpdateOutlineDTO, OutlineReorderItem } from '../../shared/types';

interface OutlineState {
  outlines: Outline[];
  isLoading: boolean;
  error: string | null;

  loadOutlines: (projectId: string) => Promise<void>;
  createOutline: (data: CreateOutlineDTO) => Promise<Outline>;
  updateOutline: (id: string, data: UpdateOutlineDTO) => Promise<void>;
  deleteOutline: (id: string) => Promise<void>;
  moveNode: (id: string, newParentId: string | null, newOrder: number) => Promise<void>;
  clearError: () => void;
}

export const useOutlineStore = create<OutlineState>((set, get) => ({
  outlines: [],
  isLoading: false,
  error: null,

  loadOutlines: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const outlines = await window.electronAPI.outline.list(projectId);
      set({ outlines, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || '加载大纲失败', isLoading: false });
    }
  },

  createOutline: async (data: CreateOutlineDTO) => {
    set({ error: null });
    try {
      const outline = await window.electronAPI.outline.create(data);
      set((s) => ({ outlines: [...s.outlines, outline] }));
      return outline;
    } catch (err: any) {
      set({ error: err.message || '创建大纲节点失败' });
      throw err;
    }
  },

  updateOutline: async (id: string, data: UpdateOutlineDTO) => {
    set({ error: null });
    try {
      const updated = await window.electronAPI.outline.update(id, data);
      set((s) => ({
        outlines: s.outlines.map((o) => o.id === id ? updated : o),
      }));
    } catch (err: any) {
      set({ error: err.message || '更新大纲节点失败' });
      throw err;
    }
  },

  deleteOutline: async (id: string) => {
    set({ error: null });
    try {
      await window.electronAPI.outline.delete(id);
      // 移除该节点及其所有子节点
      const removeIds = new Set<string>([id]);
      // 递归收集子节点 ID
      const collectChildren = (parentId: string) => {
        get().outlines.filter((o) => o.parentId === parentId).forEach((o) => {
          removeIds.add(o.id);
          collectChildren(o.id);
        });
      };
      collectChildren(id);
      set((s) => ({ outlines: s.outlines.filter((o) => !removeIds.has(o.id)) }));
    } catch (err: any) {
      set({ error: err.message || '删除大纲节点失败' });
      throw err;
    }
  },

  moveNode: async (id: string, newParentId: string | null, newOrder: number) => {
    set({ error: null });
    try {
      await window.electronAPI.outline.update(id, { parentId: newParentId, order: newOrder });
      // 本地更新
      set((s) => ({
        outlines: s.outlines.map((o) =>
          o.id === id ? { ...o, parentId: newParentId, order: newOrder } : o
        ),
      }));
    } catch (err: any) {
      set({ error: err.message || '移动大纲节点失败' });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
