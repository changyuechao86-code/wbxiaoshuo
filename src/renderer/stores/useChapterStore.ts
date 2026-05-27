/**
 * 章节状态 Store
 */
import { create } from 'zustand';
import type { Chapter, CreateChapterDTO, UpdateChapterDTO } from '../../shared/types';

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
      set({ error: err.message || '加载章节列表失败', isLoading: false });
    }
  },

  loadChapter: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const chapter = await window.electronAPI.chapter.get(id);
      set({ currentChapter: chapter, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || '加载章节失败', isLoading: false });
    }
  },

  createChapter: async (data: CreateChapterDTO) => {
    set({ error: null });
    try {
      const chapter = await window.electronAPI.chapter.create(data);
      set((s) => ({ chapters: [...s.chapters, chapter] }));
      return chapter;
    } catch (err: any) {
      set({ error: err.message || '创建章节失败' });
      throw err;
    }
  },

  saveChapter: async (id: string, data: UpdateChapterDTO) => {
    set({ error: null });
    try {
      const updated = await window.electronAPI.chapter.update(id, data);
      set((s) => ({
        chapters: s.chapters.map((c) => c.id === id ? updated : c),
        currentChapter: s.currentChapter?.id === id ? updated : s.currentChapter,
      }));
    } catch (err: any) {
      set({ error: err.message || '保存章节失败' });
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
      set({ error: err.message || '删除章节失败' });
      throw err;
    }
  },

  reorderChapters: async (projectId: string, ids: string[]) => {
    set({ error: null });
    try {
      await window.electronAPI.chapter.reorder(projectId, ids);
      // 重新加载以获取最新排序
      await get().loadChapters(projectId);
    } catch (err: any) {
      set({ error: err.message || '排序章节失败' });
      throw err;
    }
  },

  setCurrentChapter: (chapter: Chapter | null) => set({ currentChapter: chapter }),
  clearError: () => set({ error: null }),
}));
