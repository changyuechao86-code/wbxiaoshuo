import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAutoSave } from '../../renderer/hooks/useAutoSave';
import { useChapterStore } from '../../renderer/stores/useChapterStore';
import { useEditorStore } from '../../renderer/stores/useEditorStore';

describe('useAutoSave', () => {
  const saveChapter = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    saveChapter.mockReset();
    useEditorStore.getState().reset();
    useChapterStore.setState({ saveChapter } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces automatic saves and records save time', async () => {
    saveChapter.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAutoSave());

    act(() => {
      void result.current.triggerSave('chapter-1', '{"type":"doc"}', 'plain text', 10);
    });

    expect(useEditorStore.getState().isDirty).toBe(true);
    expect(saveChapter).not.toHaveBeenCalled();

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(saveChapter).toHaveBeenCalledTimes(1);
    expect(saveChapter).toHaveBeenCalledWith('chapter-1', {
      content: '{"type":"doc"}',
      plainText: 'plain text',
      wordCount: 10,
    });
    expect(useEditorStore.getState().isDirty).toBe(false);
    expect(useEditorStore.getState().saveStatus).toBe('saved');
    expect(useEditorStore.getState().lastSavedAt).toBeTruthy();
  });

  it('surfaces manual save failures', async () => {
    saveChapter.mockRejectedValue(new Error('write failed'));
    const { result } = renderHook(() => useAutoSave());

    let thrown: unknown;
    await act(async () => {
      try {
        await result.current.saveNow('chapter-1', '{}', '', 0);
      } catch (error) {
        thrown = error;
      }
    });

    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toBe('write failed');
    expect(useEditorStore.getState().saveStatus).toBe('error');
  });

  it('cleans pending automatic saves', async () => {
    saveChapter.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAutoSave());

    act(() => {
      void result.current.triggerSave('chapter-1', '{}', '', 0);
      result.current.cleanup();
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(saveChapter).not.toHaveBeenCalled();
  });
});
