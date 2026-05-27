/**
 * 分镜管理页面 (P2 Stub)
 * 骨架实现 — 完整分镜编辑和即梦提示词导出留待 P2 阶段
 */
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, IconButton, Tooltip } from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { EmptyState } from '../components/common/EmptyState';
import { useAppStore } from '../stores/useAppStore';

export function StoryboardPage(): React.ReactElement {
  const { projectId } = useParams<{ projectId: string }>();
  const { setCurrentProjectId } = useAppStore();

  useEffect(() => {
    if (projectId) {
      setCurrentProjectId(projectId);
    }
  }, [projectId, setCurrentProjectId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2a2a4e] bg-[#0f0f23]">
        <h2 className="text-sm font-semibold text-[#cdd6f4]">🎬 分镜管理</h2>
        <div className="flex-1" />
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          disabled
          sx={{ textTransform: 'none', fontSize: 12 }}
        >
          新建分镜
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <EmptyState
          icon="🎬"
          title="分镜管理 (P2)"
          description="分镜拆解和即梦提示词生成功能将在后续版本中实现。届时支持从章节一键转换分镜脚本、管理镜头信息、导出即梦 CLI 可用提示词。"
        />
      </div>
    </div>
  );
}
