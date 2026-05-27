/**
 * 项目仪表盘页面 (P1 Stub)
 * 骨架实现 — 展示项目卡片列表，完整仪表盘功能留待 P1 阶段
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Skeleton } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { ProjectCard } from '../components/dashboard/ProjectCard';
import { EmptyState } from '../components/common/EmptyState';
import { useProjectStore } from '../stores/useProjectStore';

export function DashboardPage(): React.ReactElement {
  const navigate = useNavigate();
  const { projects, isLoading, loadProjects } = useProjectStore();

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div className="flex flex-col h-full">
      {/* 顶部 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a4e] bg-[#0f0f23]">
        <h2 className="text-sm font-semibold text-[#cdd6f4]">📊 项目仪表盘</h2>
        <div className="flex-1" />
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/project/create')}
          sx={{ textTransform: 'none', fontSize: 12 }}
        >
          新建项目
        </Button>
      </div>

      {/* 项目卡片网格 */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={180}
                sx={{ bgcolor: '#16213e' }}
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon="📊"
            title="欢迎使用 NovelScript Studio"
            description="创建你的第一个项目，开始创作之旅"
            actionLabel="新建项目"
            onAction={() => navigate('/project/create')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => navigate(`/editor/${project.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
