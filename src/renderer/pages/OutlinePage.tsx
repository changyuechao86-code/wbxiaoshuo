/**
 * 大纲管理页面
 */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, IconButton, Tooltip, Snackbar, Alert, Select, MenuItem, FormControl } from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { OutlineTree } from '../components/outline/OutlineTree';
import { EmptyState } from '../components/common/EmptyState';
import { useOutlineStore } from '../stores/useOutlineStore';
import { useAppStore } from '../stores/useAppStore';
import type { Outline, OutlineNodeType } from '../../shared/types';

export function OutlinePage(): React.ReactElement {
  const { projectId } = useParams<{ projectId: string }>();
  const { outlines, isLoading, loadOutlines, createOutline } = useOutlineStore();
  const { setCurrentProjectId } = useAppStore();

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  useEffect(() => {
    if (projectId) {
      setCurrentProjectId(projectId);
      loadOutlines(projectId);
    }
  }, [projectId, loadOutlines, setCurrentProjectId]);

  const handleCreate = async (type: OutlineNodeType): Promise<void> => {
    if (!projectId) return;
    const order = outlines.length;
    try {
      await createOutline({
        projectId,
        title: type === 'volume' ? '新卷' : '新章节大纲',
        type,
        parentId: null,
        chapterId: null,
        order,
        note: '',
      });
      setSnackbar({ open: true, message: '大纲节点已创建', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: '创建大纲失败', severity: 'error' });
    }
  };

  const handleSelectNode = (node: Outline): void => {
    // TODO: 在大纲面板右侧显示详细信息，或跳转到对应章节
  };

  return (
    <div className="flex flex-col h-full">
      {/* 顶部操作栏 */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2a2a4e] bg-[#0f0f23]">
        <h2 className="text-sm font-semibold text-[#cdd6f4]">🗺️ 大纲管理</h2>
        <div className="flex-1" />
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleCreate('chapter')}
          sx={{ textTransform: 'none', fontSize: 12 }}
        >
          新章节
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => handleCreate('volume')}
          sx={{ textTransform: 'none', fontSize: 12, color: '#a0a0b0', borderColor: '#3a3a5e' }}
        >
          新卷
        </Button>
        <Tooltip title="刷新">
          <IconButton size="small" onClick={() => projectId && loadOutlines(projectId)} sx={{ color: '#6c7086' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      {/* 大纲树 */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-sm text-[#6c7086]">加载中...</div>
        ) : outlines.length === 0 ? (
          <EmptyState
            icon="🗺️"
            title="暂无大纲"
            description="创建大纲节点来规划你的故事结构"
            actionLabel="创建首条大纲"
            onAction={() => handleCreate('chapter')}
          />
        ) : (
          <OutlineTree outlines={outlines} onSelectNode={handleSelectNode} />
        )}
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
