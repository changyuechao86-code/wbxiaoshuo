/**
 * 日更进度 Hook
 * 追踪当日累计字数与目标进度
 */
import { useMemo } from 'react';
import { useWordCount } from './useWordCount';

export function useDailyProgress() {
  const { todayWordCount, dailyGoal, progress } = useWordCount();

  const isGoalMet = useMemo(() => progress >= 100, [progress]);
  const remaining = useMemo(() => Math.max(0, dailyGoal - todayWordCount), [dailyGoal, todayWordCount]);

  const progressBarColor = useMemo(() => {
    if (progress >= 100) return '#4caf50';
    if (progress >= 80) return '#ff9800';
    if (progress >= 50) return '#ffc107';
    return '#7c3aed';
  }, [progress]);

  return {
    todayWordCount,
    dailyGoal,
    progress,
    isGoalMet,
    remaining,
    progressBarColor,
  };
}
