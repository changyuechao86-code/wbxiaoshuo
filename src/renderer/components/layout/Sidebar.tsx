/**
 * 左侧项目树导航
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
  MenuBook as BookIcon,
  AccountTree as OutlineIcon,
  Person as PersonIcon,
  Public as WorldIcon,
  Visibility as ForeshadowIcon,
  Movie as StoryboardIcon,
  AttachMoney as RevenueIcon,
} from '@mui/icons-material';
import { useProjectStore } from '../../stores/useProjectStore';
import type { Project } from '../../../shared/types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  route: string;
}

function getProjectNavItems(projectId: string): NavItem[] {
  return [
    { id: 'chapters', label: '章节', icon: <BookIcon fontSize="small" />, route: `/editor/${projectId}` },
    { id: 'outline', label: '大纲', icon: <OutlineIcon fontSize="small" />, route: `/outline/${projectId}` },
    { id: 'characters', label: '角色', icon: <PersonIcon fontSize="small" />, route: `/characters/${projectId}` },
    { id: 'world-setting', label: '设定', icon: <WorldIcon fontSize="small" />, route: `/world-setting/${projectId}` },
    { id: 'foreshadowing', label: '伏笔', icon: <ForeshadowIcon fontSize="small" />, route: `/foreshadowing/${projectId}` },
  ];
}

function getScriptNavItems(projectId: string): NavItem[] {
  return [
    { id: 'chapters', label: '章节', icon: <BookIcon fontSize="small" />, route: `/editor/${projectId}` },
    { id: 'outline', label: '大纲', icon: <OutlineIcon fontSize="small" />, route: `/outline/${projectId}` },
    { id: 'characters', label: '角色', icon: <PersonIcon fontSize="small" />, route: `/characters/${projectId}` },
    { id: 'storyboard', label: '分镜', icon: <StoryboardIcon fontSize="small" />, route: `/storyboard/${projectId}` },
    { id: 'revenue', label: '收益', icon: <RevenueIcon fontSize="small" />, route: `/revenue/${projectId}` },
  ];
}

export function Sidebar(): React.ReactElement {
  const navigate = useNavigate();
  const { projects, loadProjects } = useProjectStore();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProjects().catch(console.error);
  }, [loadProjects]);

  const toggleExpand = (projectId: string): void => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const handleCreateProject = (): void => {
    navigate('/project/create');
  };

  const handleNavClick = (route: string): void => {
    navigate(route);
  };

  return (
    <div
      className="flex flex-col bg-[#1e1e2e] border-r border-[#2a2a4e] overflow-hidden"
      style={{ width: 240, minWidth: 240 }}
    >
      {/* 顶部标题 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a4e]">
        <span className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider">项目列表</span>
        <Tooltip title="新建项目">
          <IconButton
            size="small"
            onClick={handleCreateProject}
            sx={{ color: '#7c3aed' }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      {/* 项目列表 */}
      <div className="flex-1 overflow-y-auto">
        <List dense disablePadding>
          {projects.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#6c7086]">
              暂无项目，点击 + 创建
            </div>
          ) : (
            projects.map((project: Project) => {
              const isExpanded = expandedProjects.has(project.id);
              const navItems = project.type === 'script'
                ? getScriptNavItems(project.id)
                : getProjectNavItems(project.id);

              return (
                <div key={project.id}>
                  <ListItemButton
                    onClick={() => toggleExpand(project.id)}
                    sx={{
                      py: 0.75,
                      '&:hover': { backgroundColor: '#2a2a3e' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      {project.type === 'script' ? (
                        <StoryboardIcon fontSize="small" sx={{ color: '#06b6d4' }} />
                      ) : (
                        <BookIcon fontSize="small" sx={{ color: '#7c3aed' }} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={project.name}
                      primaryTypographyProps={{
                        fontSize: 13,
                        noWrap: true,
                        color: '#cdd6f4',
                      }}
                    />
                    {isExpanded ? <ExpandLess sx={{ color: '#6c7086' }} fontSize="small" /> : <ExpandMore sx={{ color: '#6c7086' }} fontSize="small" />}
                  </ListItemButton>
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List dense disablePadding>
                      {navItems.map((item) => (
                        <ListItemButton
                          key={item.id}
                          onClick={() => handleNavClick(item.route)}
                          sx={{
                            pl: 5,
                            py: 0.5,
                            '&:hover': { backgroundColor: '#2a2a3e' },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              fontSize: 12,
                              color: '#a0a0b0',
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </div>
              );
            })
          )}
        </List>
      </div>

      {/* 底部快速入口 */}
      <Divider sx={{ borderColor: '#2a2a4e' }} />
      <div className="p-2">
        <ListItemButton
          onClick={() => handleNavClick('/dashboard')}
          sx={{
            borderRadius: 1,
            '&:hover': { backgroundColor: '#2a2a3e' },
          }}
        >
          <ListItemText
            primary="📊 仪表盘"
            primaryTypographyProps={{ fontSize: 12, color: '#a0a0b0' }}
          />
        </ListItemButton>
      </div>
    </div>
  );
}
