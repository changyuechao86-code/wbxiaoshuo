import { create } from 'zustand';
import type { Chapter, CreateChapterDTO, UpdateChapterDTO } from '../../shared/types';

const text = {
  createFailed: '\u521b\u5efa\u7ae0\u8282\u5931\u8d25',
  deleteFailed: '\u5220\u9664\u7ae0\u8282\u5931\u8d25',
  loadFailed: '\u52a0\u8f7d\u7ae0\u8282\u5931\u8d25',
  loadListFailed: '\u52a0\u8f7d\u7ae0\u8282\u5217\u8868\u5931\u8d25',
  reorderFailed: '\u6392\u5e8f\u7ae0\u8282\u5931\u8d25',
  saveFailed: '\u4fdd\u5b58\u7ae0\u8282\u5931\u8d25',
};

interface ChapterState {
  chapters: Chapter[];
  currentChapter: Chapter | null;
  isLoading: boolean;
  error: string | null;

  loadChapters: (projectId: string) => Promise<void>;
  loadChapter: (id: string) => Promise<void>;
  createChapter: (data: CreateChapterDTO) => Promise<Chapter>;
  saveChapter: (id: string, data: UpdateChapterDTO) => Promise<void>;
  deleteChapter: (id: string) => Promise<void>;
  reorderChapters: (projectId: string, ids: string[]) => Promise<void>;
  setCurrentChapter: (chapter: Chapter | null) => void;
  clearError: () => void;
}

export const useChapterStore = create<ChapterState>((set, get) => ({
  chapters: [],
  currentChapter: null,
  isLoading: false,
  error: null,

  loadChapters: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const chapters = await window.electronAPI.chapter.list(projectId);
      set({ chapters, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || text.loadListFailed, isLoading: false });
    }
  },

  loadChapter: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const chapter = await window.electronAPI.chapter.get(id);
      set({ currentChapter: chapter, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || text.loadFailed, isLoading: false });
    }
  },

  createChapter: async (data: CreateChapterDTO) => {
    set({ error: null });
    try {
      const chapter = await window.electronAPI.chapter.create(data);
      set((s) => ({ chapters: [...s.chapters, chapter] }));
      return chapter;
    } catch (err: any) {
      set({ error: err.message || text.createFailed });
      throw err;
    }
  },

  saveChapter: async (id: string, data: UpdateChapterDTO) => {
    set({ error: null });
    try {
      const updated = await window.electronAPI.chapter.update(id, data);
      set((s) => ({
        chapters: s.chapters.map((c) => (c.id === id ? updated : c)),
        currentChapter: s.currentChapter?.id === id ? updated : s.currentChapter,
      }));
    } catch (err: any) {
      set({ error: err.message || text.saveFailed });
      throw err;
    }
  },

  deleteChapter: async (id: string) => {
    set({ error: null });
    try {
      await window.electronAPI.chapter.delete(id);
      set((s) => ({
        chapters: s.chapters.filter((c) => c.id !== id),
        currentChapter: s.currentChapter?.id === id ? null : s.currentChapter,
      }));
    } catch (err: any) {
      set({ error: err.message || text.deleteFailed });
      throw err;
    }
  },

  reorderChapters: async (projectId: string, ids: string[]) => {
    set({ error: null });
    try {
      await window.electronAPI.chapter.reorder(projectId, ids);
      await get().loadChapters(projectId);
    } catch (err: any) {
      set({ error: err.message || text.reorderFailed });
      throw err;
    }
  },

  setCurrentChapter: (chapter: Chapter | null) => set({ currentChapter: chapter }),
  clearError: () => set({ error: null }),
}));
