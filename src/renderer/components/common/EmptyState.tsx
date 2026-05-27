/**
 * 空状态占位组件
 */
import React from 'react';
import { Button } from '@mui/material';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-[#cdd6f4] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#6c7086] mb-4 max-w-md">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button
          variant="contained"
          size="small"
          onClick={onAction}
          sx={{ textTransform: 'none' }}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
