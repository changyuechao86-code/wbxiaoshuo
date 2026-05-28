import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import {
  MenuBook as NovelIcon,
  Movie as ScriptIcon,
} from '@mui/icons-material';
import type { Project } from '../../../shared/types';
import { formatDate } from '../../utils/date';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const text = {
  createdAt: '\u521b\u5efa\u65f6\u95f4',
  dailyGoal: '\u65e5\u66f4\u76ee\u6807',
  novel: '\u5c0f\u8bf4',
  script: '\u5267\u672c',
  updatedAt: '\u6700\u8fd1\u66f4\u65b0',
  words: '\u5b57',
};

export function ProjectCard({ project, onClick }: ProjectCardProps): React.ReactElement {
  const isNovel = project.type === 'novel';

  return (
    <Card
      elevation={0}
      sx={{
        backgroundColor: '#16213e',
        border: '1px solid #2a2a4e',
        borderRadius: 2,
        transition: 'border-color 0.2s',
        '&:hover': {
          borderColor: '#7c3aed',
        },
      }}
    >
      <CardActionArea onClick={onClick}>
        <CardContent>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              {isNovel ? (
                <NovelIcon sx={{ color: '#7c3aed', fontSize: 20 }} />
              ) : (
                <ScriptIcon sx={{ color: '#06b6d4', fontSize: 20 }} />
              )}
              <Typography
                variant="subtitle2"
                noWrap
                sx={{ color: '#cdd6f4', fontWeight: 600 }}
              >
                {project.name}
              </Typography>
            </div>
            <Chip
              label={isNovel ? text.novel : text.script}
              size="small"
              sx={{
                fontSize: 10,
                height: 20,
                backgroundColor: isNovel ? 'rgba(124,58,237,0.15)' : 'rgba(6,182,212,0.15)',
                color: isNovel ? '#a78bfa' : '#22d3ee',
              }}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#6c7086]">{text.dailyGoal}</span>
              <span className="text-[#a0a0b0] font-mono">
                {project.dailyGoal.toLocaleString()} {text.words}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#6c7086]">{text.updatedAt}</span>
              <span className="text-[#a0a0b0]">
                {formatDate(project.updatedAt, 'MM-dd HH:mm')}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#6c7086]">{text.createdAt}</span>
              <span className="text-[#a0a0b0]">
                {formatDate(project.createdAt, 'yyyy-MM-dd')}
              </span>
            </div>
          </div>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
