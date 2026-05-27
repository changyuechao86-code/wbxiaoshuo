/**
 * 字数统计 Hook
 * 实时统计编辑器中文本的字数
 */
import { useCallback, useState } from 'react';
import { countWords, calcProgress } from '../utils/word-counter';
import { useEditorStore } from '../stores/useEditorStore';
import { useProjectStore } from '../stores/useProjectStore';

export function useWordCount() {
  const [todayWordCount, setTodayWordCount] = useState(0);
  const { setWordCount, setDailyProgress } = useEditorStore();
  const { currentProject } = useProjectStore();

  /** 更新字数统计 */
  const updateCount = useCallback(
    (plainText: string) => {
      const count = countWords(plainText);
      setWordCount(count);
      setTodayWordCount((prev) => Math.max(prev, count));

      if (currentProject) {
        const progress = calcProgress(count, currentProject.dailyGoal);
        setDailyProgress(progress);
      }
    },
    [currentProject, setWordCount, setDailyProgress],
  );

  const dailyGoal = currentProject?.dailyGoal ?? 4100;
  const progress = dailyGoal > 0 ? Math.min(100, Math.round((todayWordCount / dailyGoal) * 100)) : 0;

  return { todayWordCount, dailyGoal, progress, updateCount };
}
