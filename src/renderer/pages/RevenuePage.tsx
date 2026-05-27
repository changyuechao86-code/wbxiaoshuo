/**
 * 收益追踪页面 (P1 Stub)
 * 骨架实现 — 完整收益图表和统计留待 P1 阶段
 */
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, IconButton, Tooltip } from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { EmptyState } from '../components/common/EmptyState';
import { useRevenueStore } from '../stores/useRevenueStore';
import { useAppStore } from '../stores/useAppStore';

export function RevenuePage(): React.ReactElement {
  const { projectId } = useParams<{ projectId: string }>();
  const { revenues, isLoading, loadRevenues } = useRevenueStore();
  const { setCurrentProjectId } = useAppStore();

  useEffect(() => {
    if (projectId) {
      setCurrentProjectId(projectId);
      loadRevenues(projectId);
    }
  }, [projectId, loadRevenues, setCurrentProjectId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2a2a4e] bg-[#0f0f23]">
        <h2 className="text-sm font-semibold text-[#cdd6f4]">💰 收益追踪</h2>
        <div className="flex-1" />
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ textTransform: 'none', fontSize: 12 }}
        >
          录入收益
        </Button>
        <Tooltip title="刷新">
          <IconButton
            size="small"
            onClick={() => projectId && loadRevenues(projectId)}
            sx={{ color: '#6c7086' }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-sm text-[#6c7086]">加载中...</div>
        ) : revenues.length === 0 ? (
          <EmptyState
            icon="💰"
            title="暂无收益记录"
            description="P1 阶段将支持完整的收益图表、月度统计和平台分析"
            actionLabel="录入首条收益"
          />
        ) : (
          <div className="space-y-2">
            {revenues.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 bg-[#16213e] border border-[#2a2a4e] rounded-lg p-3"
              >
                <span className="text-xs text-[#6c7086]">{r.date}</span>
                <span className="text-sm text-[#4caf50] font-mono">
                  ¥{r.amount.toLocaleString()}
                </span>
                <span className="text-xs text-[#a0a0b0]">{r.platform}</span>
                {r.note && <span className="text-xs text-[#6c7086]">{r.note}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
