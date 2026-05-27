/**
 * 编辑器 UI 状态 Store
 * 管理编辑器中的 UI 状态：脏标记、字数、进度、自动保存、光标位置等
 */
import { create } from 'zustand';
import { AUTO_SAVE_DELAY } from '../utils/constants';

interface EditorState {
  isDirty: boolean;
  wordCount: number;
  dailyProgress: number;
  lastSavedAt: string | null;
  showAIPanel: boolean;
  autoSaveTimerId: ReturnType<typeof setTimeout> | null;
  saveStatus: 'saved' | 'saving' | 'error';

  setDirty: (dirty: boolean) => void;
  setWordCount: (count: number) => void;
  setDailyProgress: (progress: number) => void;
  setLastSavedAt: (time: string | null) => void;
  setShowAIPanel: (show: boolean) => void;
  toggleAIPanel: () => void;
  setSaveStatus: (status: 'saved' | 'saving' | 'error') => void;

  /** 触发自动保存（防抖） */
  triggerAutoSave: (saveFn: () => Promise<void>) => void;
  clearAutoSaveTimer: () => void;

  reset: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  isDirty: false,
  wordCount: 0,
  dailyProgress: 0,
  lastSavedAt: null,
  showAIPanel: false,
  autoSaveTimerId: null,
  saveStatus: 'saved',

  setDirty: (isDirty: boolean) => set({ isDirty }),
  setWordCount: (wordCount: number) => set({ wordCount }),
  setDailyProgress: (dailyProgress: number) => set({ dailyProgress }),
  setLastSavedAt: (lastSavedAt: string | null) => set({ lastSavedAt }),
  setShowAIPanel: (showAIPanel: boolean) => set({ showAIPanel }),
  toggleAIPanel: () => set((s) => ({ showAIPanel: !s.showAIPanel })),
  setSaveStatus: (saveStatus: 'saved' | 'saving' | 'error') => set({ saveStatus }),

  triggerAutoSave: (saveFn: () => Promise<void>) => {
    const { autoSaveTimerId } = get();
    if (autoSaveTimerId) {
      clearTimeout(autoSaveTimerId);
    }

    const timerId = setTimeout(async () => {
      set({ saveStatus: 'saving' });
      try {
        await saveFn();
        set({
          saveStatus: 'saved',
          isDirty: false,
          lastSavedAt: new Date().toISOString(),
        });
      } catch {
        set({ saveStatus: 'error' });
      }
    }, AUTO_SAVE_DELAY);

    set({ autoSaveTimerId: timerId });
  },

  clearAutoSaveTimer: () => {
    const { autoSaveTimerId } = get();
    if (autoSaveTimerId) {
      clearTimeout(autoSaveTimerId);
      set({ autoSaveTimerId: null });
    }
  },

  reset: () => set({
    isDirty: false,
    wordCount: 0,
    dailyProgress: 0,
    lastSavedAt: null,
    showAIPanel: false,
    autoSaveTimerId: null,
    saveStatus: 'saved',
  }),
}));
