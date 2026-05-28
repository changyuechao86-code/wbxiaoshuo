import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Add as AddIcon, Dashboard as DashboardIcon, MenuBook as EmptyIcon } from '@mui/icons-material';
import { Button, Skeleton } from '@mui/material';
import { EmptyState } from '../components/common/EmptyState';
import { ProjectCard } from '../components/dashboard/ProjectCard';
import { useProjectStore } from '../stores/useProjectStore';

const text = {
  createProject: '\u65b0\u5efa\u9879\u76ee',
  emptyDescription: '\u521b\u5efa\u7b2c\u4e00\u4e2a\u5c0f\u8bf4\u6216\u5267\u672c\u9879\u76ee\uff0c\u7cfb\u7edf\u4f1a\u81ea\u52a8\u4e3a\u4f60\u7ba1\u7406\u7ae0\u8282\u3001\u5927\u7eb2\u3001\u89d2\u8272\u548c\u6bcf\u65e5\u76ee\u6807\u3002',
  emptyTitle: '\u5f00\u59cb\u4f60\u7684\u7b2c\u4e00\u4e2a\u521b\u4f5c\u9879\u76ee',
  title: '\u9879\u76ee\u4eea\u8868\u76d8',
};

export function DashboardPage(): React.ReactElement {
  const navigate = useNavigate();
  const { projects, isLoading, loadProjects } = useProjectStore();

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a4e] bg-[#0f0f23]">
        <DashboardIcon sx={{ color: '#7c3aed', fontSize: 18 }} />
        <h2 className="text-sm font-semibold text-[#cdd6f4]">{text.title}</h2>
        <div className="flex-1" />
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/project/create')}
          sx={{ textTransform: 'none', fontSize: 12 }}
        >
          {text.createProject}
        </Button>
      </div>

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
            icon={<EmptyIcon sx={{ fontSize: 48 }} />}
            title={text.emptyTitle}
            description={text.emptyDescription}
            actionLabel={text.createProject}
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
