import React from 'react';
import { Chip, LinearProgress, Tooltip } from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Save as SaveIcon,
  Sync as SavingIcon,
} from '@mui/icons-material';
import { useDailyProgress } from '../../hooks/useDailyProgress';
import { useEditorStore } from '../../stores/useEditorStore';
import { formatDateShort } from '../../utils/date';

const text = {
  goalMet: '\u4eca\u65e5\u76ee\u6807\u5df2\u8fbe\u6210',
  remainingPrefix: '\u8fd8\u5dee',
  saved: '\u5df2\u4fdd\u5b58',
  saving: '\u4fdd\u5b58\u4e2d...',
  saveFailed: '\u4fdd\u5b58\u5931\u8d25',
  unsaved: '\u672a\u4fdd\u5b58',
  wordCount: '\u5b57\u6570',
  words: '\u5b57',
};

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
        return text.saving;
      case 'error':
        return text.saveFailed;
      case 'saved':
        return lastSavedAt ? `${text.saved} ${formatDateShort(lastSavedAt)}` : text.saved;
    }
  };

  return (
    <div
      className="flex items-center gap-3 px-3 border-t border-[#2a2a4e] bg-[#0f0f23]"
      style={{ height: 32, minHeight: 32 }}
    >
      <span className="text-xs text-[#a0a0b0]">
        {text.wordCount}: <span className="text-[#cdd6f4] font-mono">{wordCount.toLocaleString()}</span>
      </span>

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

      {!isGoalMet && (
        <span className="text-xs text-[#6c7086]">
          {text.remainingPrefix} {remaining.toLocaleString()} {text.words}
        </span>
      )}

      {isGoalMet && (
        <Tooltip title={text.goalMet}>
          <CheckIcon fontSize="small" sx={{ color: '#4caf50' }} />
        </Tooltip>
      )}

      <div className="flex-1" />

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

      {isDirty && (
        <Chip
          label={text.unsaved}
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
