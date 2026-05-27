import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEditorStore } from '../../renderer/stores/useEditorStore';

// Mock constants to speed up tests
vi.mock('../../renderer/utils/constants', () => ({
  AUTO_SAVE_DELAY: 10, // Fast for tests
}));

describe('useEditorStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useEditorStore.getState().reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('setDirty', () => {
    it('设置脏标记', () => {
      useEditorStore.getState().setDirty(true);
      expect(useEditorStore.getState().isDirty).toBe(true);
    });

    it('清除脏标记', () => {
      useEditorStore.getState().setDirty(true);
      useEditorStore.getState().setDirty(false);
      expect(useEditorStore.getState().isDirty).toBe(false);
    });
  });

  describe('setWordCount', () => {
    it('设置字数', () => {
      useEditorStore.getState().setWordCount(4100);
      expect(useEditorStore.getState().wordCount).toBe(4100);
    });

    it('接受零值', () => {
      useEditorStore.getState().setWordCount(500);
      useEditorStore.getState().setWordCount(0);
      expect(useEditorStore.getState().wordCount).toBe(0);
    });
  });

  describe('setDailyProgress', () => {
    it('设置进度', () => {
      useEditorStore.getState().setDailyProgress(93);
      expect(useEditorStore.getState().dailyProgress).toBe(93);
    });
  });

  describe('setLastSavedAt', () => {
    it('设置保存时间', () => {
      useEditorStore.getState().setLastSavedAt('12:03');
      expect(useEditorStore.getState().lastSavedAt).toBe('12:03');
    });

    it('清除保存时间', () => {
      useEditorStore.getState().setLastSavedAt('12:03');
      useEditorStore.getState().setLastSavedAt(null);
      expect(useEditorStore.getState().lastSavedAt).toBeNull();
    });
  });

  describe('setShowAIPanel and toggleAIPanel', () => {
    it('打开/关闭 AI 面板', () => {
      useEditorStore.getState().setShowAIPanel(true);
      expect(useEditorStore.getState().showAIPanel).toBe(true);

      useEditorStore.getState().setShowAIPanel(false);
      expect(useEditorStore.getState().showAIPanel).toBe(false);
    });

    it('切换 AI 面板', () => {
      expect(useEditorStore.getState().showAIPanel).toBe(false);
      useEditorStore.getState().toggleAIPanel();
      expect(useEditorStore.getState().showAIPanel).toBe(true);
      useEditorStore.getState().toggleAIPanel();
      expect(useEditorStore.getState().showAIPanel).toBe(false);
    });
  });

  describe('setSaveStatus', () => {
    it('设置保存状态', () => {
      useEditorStore.getState().setSaveStatus('saving');
      expect(useEditorStore.getState().saveStatus).toBe('saving');

      useEditorStore.getState().setSaveStatus('saved');
      expect(useEditorStore.getState().saveStatus).toBe('saved');

      useEditorStore.getState().setSaveStatus('error');
      expect(useEditorStore.getState().saveStatus).toBe('error');
    });
  });

  describe('triggerAutoSave', () => {
    it('防抖后执行保存', async () => {
      const saveFn = vi.fn().mockResolvedValue(undefined);

      useEditorStore.getState().triggerAutoSave(saveFn);

      // Should not have called yet
      expect(saveFn).not.toHaveBeenCalled();
      expect(useEditorStore.getState().saveStatus).toBe('saved');

      // Advance timer
      await vi.runAllTimersAsync();

      expect(saveFn).toHaveBeenCalledTimes(1);
      expect(useEditorStore.getState().saveStatus).toBe('saved');
      expect(useEditorStore.getState().isDirty).toBe(false);
      expect(useEditorStore.getState().lastSavedAt).toBeTruthy();
    });

    it('保存失败时设置 error 状态', async () => {
      const saveFn = vi.fn().mockRejectedValue(new Error('保存失败'));

      useEditorStore.getState().triggerAutoSave(saveFn);
      await vi.runAllTimersAsync();

      expect(useEditorStore.getState().saveStatus).toBe('error');
    });

    it('多次触发时重置定时器', async () => {
      const saveFn = vi.fn().mockResolvedValue(undefined);

      useEditorStore.getState().triggerAutoSave(saveFn);
      useEditorStore.getState().triggerAutoSave(saveFn);
      useEditorStore.getState().triggerAutoSave(saveFn);

      await vi.runAllTimersAsync();

      // Should only call once due to debounce
      expect(saveFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearAutoSaveTimer', () => {
    it('清除自动保存定时器', async () => {
      const saveFn = vi.fn().mockResolvedValue(undefined);

      useEditorStore.getState().triggerAutoSave(saveFn);
      useEditorStore.getState().clearAutoSaveTimer();

      await vi.runAllTimersAsync();

      // Should not have been called
      expect(saveFn).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('重置所有状态', () => {
      useEditorStore.getState().setDirty(true);
      useEditorStore.getState().setWordCount(500);
      useEditorStore.getState().setShowAIPanel(true);
      useEditorStore.getState().setSaveStatus('error');

      useEditorStore.getState().reset();

      const state = useEditorStore.getState();
      expect(state.isDirty).toBe(false);
      expect(state.wordCount).toBe(0);
      expect(state.dailyProgress).toBe(0);
      expect(state.lastSavedAt).toBeNull();
      expect(state.showAIPanel).toBe(false);
      expect(state.saveStatus).toBe('saved');
    });
  });
});
