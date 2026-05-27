/**
 * 编辑器底部状态栏 — 字数/进度/保存状态
 */
import React from 'react';
import { Chip, Tooltip, LinearProgress } from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Save as SaveIcon,
  Error as ErrorIcon,
  Sync as SavingIcon,
} from '@mui/icons-material';
import { useEditorStore } from '../../stores/useEditorStore';
import { useDailyProgress } from '../../hooks/useDailyProgress';
import { formatDateShort } from '../../utils/date';

export function EditorStatusBar(): React.ReactElement {
  const { wordCount, lastSavedAt, saveStatus, isDirty } = useEditorStore();
  const { todayWordCount, dailyGoal, progress, isGoalMet, remaining, progressBarColor } =
    useDailyProgress();

  const getSaveIcon = (): React.ReactElement => {
    switch (saveStatus) {
      case 'saving':
        return <SavingIcon fontSize="small" sx={{ color: '#ffc107' }} />;
      case 'error':
        return <ErrorIcon fontSize="small" sx={{ color: '#ef5350' }} />;
      case 'saved':
        return <SaveIcon fontSize="small" sx={{ color: isDirty ? '#ff9800' : '#4caf50' }} />;
    }
  };

  const getSaveText = (): string => {
    switch (saveStatus) {
      case 'saving':
        return '保存中...';
      case 'error':
        return '保存失败';
      case 'saved':
        return lastSavedAt
          ? `已保存 ${formatDateShort(lastSavedAt)}`
          : '已保存';
    }
  };

  return (
    <div
      className="flex items-center gap-3 px-3 border-t border-[#2a2a4e] bg-[#0f0f23]"
      style={{ height: 32, minHeight: 32 }}
    >
      {/* 字数统计 */}
      <span className="text-xs text-[#a0a0b0]">
        字数: <span className="text-[#cdd6f4] font-mono">{wordCount.toLocaleString()}</span>
      </span>

      {/* 日更进度条 */}
      <div className="flex items-center gap-2 flex-1 max-w-xs">
        <span className="text-xs text-[#a0a0b0] min-w-[120px]">
          {todayWordCount.toLocaleString()} / {dailyGoal.toLocaleString()}
        </span>
        <div className="flex-1 min-w-[60px]">
          <LinearProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            sx={{
              height: 4,
              borderRadius: 2,
              backgroundColor: '#2a2a4e',
              '& .MuiLinearProgress-bar': {
                backgroundColor: progressBarColor,
              },
            }}
          />
        </div>
        <span
          className="text-xs font-mono min-w-[36px] text-right"
          style={{ color: progressBarColor }}
        >
          {progress}%
        </span>
      </div>

      {/* 剩余字数 */}
      {!isGoalMet && (
        <span className="text-xs text-[#6c7086]">
          还差 {remaining.toLocaleString()} 字
        </span>
      )}

      {/* 打卡图标 */}
      {isGoalMet && (
        <Tooltip title="今日目标已达成">
          <CheckIcon fontSize="small" sx={{ color: '#4caf50' }} />
        </Tooltip>
      )}

      <div className="flex-1" />

      {/* 保存状态 */}
      <div className="flex items-center gap-1">
        {getSaveIcon()}
        <span
          className={`text-xs ${
            saveStatus === 'error'
              ? 'text-red-400'
              : isDirty
                ? 'text-yellow-400'
                : 'text-gray-500'
          }`}
        >
          {getSaveText()}
        </span>
      </div>

      {/* 未保存指示器 */}
      {isDirty && (
        <Chip
          label="未保存"
          size="small"
          sx={{
            height: 18,
            fontSize: 10,
            backgroundColor: 'rgba(255,152,0,0.15)',
            color: '#ff9800',
          }}
        />
      )}
    </div>
  );
}
