/**
 * 项目卡片组件 (P1 Stub)
 * 骨架实现 — 展示项目基本信息，完整仪表盘统计留待 P1
 */
import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip,
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
            <div className="flex items-center gap-2">
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
              label={isNovel ? '小说' : '剧本'}
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
              <span className="text-[#6c7086]">日更目标</span>
              <span className="text-[#a0a0b0] font-mono">
                {project.dailyGoal.toLocaleString()} 字
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#6c7086]">最近更新</span>
              <span className="text-[#a0a0b0]">
                {formatDate(project.updatedAt, 'MM-dd HH:mm')}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#6c7086]">创建时间</span>
              <span className="text-[#a0a0b0]">
                {formatDate(project.createdAt, 'yyyy-MM-dd')}
              </span>
            </div>
          </div>

          {/* P1 TODO: 添加总字数、打卡统计、收益汇总等 */}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
