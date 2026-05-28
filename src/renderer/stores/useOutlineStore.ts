import { create } from 'zustand';
import type { CreateOutlineDTO, Outline, UpdateOutlineDTO } from '../../shared/types';

const text = {
  createFailed: '\u521b\u5efa\u5927\u7eb2\u8282\u70b9\u5931\u8d25',
  deleteFailed: '\u5220\u9664\u5927\u7eb2\u8282\u70b9\u5931\u8d25',
  loadFailed: '\u52a0\u8f7d\u5927\u7eb2\u5931\u8d25',
  moveFailed: '\u79fb\u52a8\u5927\u7eb2\u8282\u70b9\u5931\u8d25',
  updateFailed: '\u66f4\u65b0\u5927\u7eb2\u8282\u70b9\u5931\u8d25',
};

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
      set({ error: err.message || text.loadFailed, isLoading: false });
    }
  },

  createOutline: async (data: CreateOutlineDTO) => {
    set({ error: null });
    try {
      const outline = await window.electronAPI.outline.create(data);
      set((s) => ({ outlines: [...s.outlines, outline] }));
      return outline;
    } catch (err: any) {
      set({ error: err.message || text.createFailed });
      throw err;
    }
  },

  updateOutline: async (id: string, data: UpdateOutlineDTO) => {
    set({ error: null });
    try {
      const updated = await window.electronAPI.outline.update(id, data);
      set((s) => ({
        outlines: s.outlines.map((outline) => (outline.id === id ? updated : outline)),
      }));
    } catch (err: any) {
      set({ error: err.message || text.updateFailed });
      throw err;
    }
  },

  deleteOutline: async (id: string) => {
    set({ error: null });
    try {
      await window.electronAPI.outline.delete(id);
      const removeIds = new Set<string>([id]);

      const collectChildren = (parentId: string): void => {
        get().outlines
          .filter((outline) => outline.parentId === parentId)
          .forEach((outline) => {
            removeIds.add(outline.id);
            collectChildren(outline.id);
          });
      };

      collectChildren(id);
      set((s) => ({ outlines: s.outlines.filter((outline) => !removeIds.has(outline.id)) }));
    } catch (err: any) {
      set({ error: err.message || text.deleteFailed });
      throw err;
    }
  },

  moveNode: async (id: string, newParentId: string | null, newOrder: number) => {
    set({ error: null });
    try {
      await window.electronAPI.outline.update(id, { parentId: newParentId, order: newOrder });
      set((s) => ({
        outlines: s.outlines.map((outline) => (
          outline.id === id ? { ...outline, parentId: newParentId, order: newOrder } : outline
        )),
      }));
    } catch (err: any) {
      set({ error: err.message || text.moveFailed });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
