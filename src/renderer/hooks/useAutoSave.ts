/**
 * 自动保存 Hook
 * 监听编辑器内容变化，防抖后自动保存到数据库
 */
import { useCallback, useRef } from 'react';
import { useEditorStore } from '../stores/useEditorStore';
import { useChapterStore } from '../stores/useChapterStore';

export function useAutoSave() {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isDirty, setDirty, setSaveStatus } = useEditorStore();
  const { saveChapter } = useChapterStore();

  /** 触发自动保存 */
  const triggerSave = useCallback(
    async (chapterId: string, content: string, plainText: string, wordCount: number) => {
      if (!chapterId) return;

      // 清除之前的定时器
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      setDirty(true);

      // 2秒防抖
      saveTimerRef.current = setTimeout(async () => {
        setSaveStatus('saving');
        try {
          await saveChapter(chapterId, {
            content,
            plainText,
            wordCount,
          });
          setDirty(false);
          setSaveStatus('saved');
        } catch {
          setSaveStatus('error');
        }
      }, 2000);
    },
    [saveChapter, setDirty, setSaveStatus],
  );

  /** 立即保存（手动触发） */
  const saveNow = useCallback(
    async (chapterId: string, content: string, plainText: string, wordCount: number) => {
      if (!chapterId) return;

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      setSaveStatus('saving');
      try {
        await saveChapter(chapterId, {
          content,
          plainText,
          wordCount,
        });
        setDirty(false);
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    },
    [saveChapter, setDirty, setSaveStatus],
  );

  /** 清理定时器 */
  const cleanup = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  }, []);

  return { isDirty, triggerSave, saveNow, cleanup };
}
