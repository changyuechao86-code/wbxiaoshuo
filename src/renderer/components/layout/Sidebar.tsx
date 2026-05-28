import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Collapse,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  AccountTree as OutlineIcon,
  Add as AddIcon,
  AttachMoney as RevenueIcon,
  Dashboard as DashboardIcon,
  ExpandLess,
  ExpandMore,
  MenuBook as BookIcon,
  Movie as StoryboardIcon,
  Person as PersonIcon,
  Public as WorldIcon,
  Visibility as ForeshadowIcon,
} from '@mui/icons-material';
import { useProjectStore } from '../../stores/useProjectStore';
import type { Project } from '../../../shared/types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  route: string;
}

const text = {
  chapters: '\u7ae0\u8282',
  characters: '\u89d2\u8272',
  createProject: '\u65b0\u5efa\u9879\u76ee',
  dashboard: '\u4eea\u8868\u76d8',
  emptyProjects: '\u6682\u65e0\u9879\u76ee\uff0c\u70b9\u51fb + \u521b\u5efa',
  foreshadowing: '\u4f0f\u7b14',
  outline: '\u5927\u7eb2',
  projectList: '\u9879\u76ee\u5217\u8868',
  revenue: '\u6536\u76ca',
  settings: '\u8bbe\u5b9a',
  storyboard: '\u5206\u955c',
};

function getNovelNavItems(projectId: string): NavItem[] {
  return [
    { id: 'chapters', label: text.chapters, icon: <BookIcon fontSize="small" />, route: `/editor/${projectId}` },
    { id: 'outline', label: text.outline, icon: <OutlineIcon fontSize="small" />, route: `/outline/${projectId}` },
    { id: 'characters', label: text.characters, icon: <PersonIcon fontSize="small" />, route: `/characters/${projectId}` },
    { id: 'world-setting', label: text.settings, icon: <WorldIcon fontSize="small" />, route: `/world-setting/${projectId}` },
    { id: 'foreshadowing', label: text.foreshadowing, icon: <ForeshadowIcon fontSize="small" />, route: `/foreshadowing/${projectId}` },
  ];
}

function getScriptNavItems(projectId: string): NavItem[] {
  return [
    { id: 'chapters', label: text.chapters, icon: <BookIcon fontSize="small" />, route: `/editor/${projectId}` },
    { id: 'outline', label: text.outline, icon: <OutlineIcon fontSize="small" />, route: `/outline/${projectId}` },
    { id: 'characters', label: text.characters, icon: <PersonIcon fontSize="small" />, route: `/characters/${projectId}` },
    { id: 'storyboard', label: text.storyboard, icon: <StoryboardIcon fontSize="small" />, route: `/storyboard/${projectId}` },
    { id: 'revenue', label: text.revenue, icon: <RevenueIcon fontSize="small" />, route: `/revenue/${projectId}` },
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

  const handleNavClick = (route: string): void => {
    navigate(route);
  };

  return (
    <div
      className="flex flex-col bg-[#1e1e2e] border-r border-[#2a2a4e] overflow-hidden"
      style={{ width: 240, minWidth: 240 }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a4e]">
        <span className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider">{text.projectList}</span>
        <Tooltip title={text.createProject}>
          <IconButton size="small" onClick={() => handleNavClick('/project/create')} sx={{ color: '#7c3aed' }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      <div className="flex-1 overflow-y-auto">
        <List dense disablePadding>
          {projects.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#6c7086]">{text.emptyProjects}</div>
          ) : (
            projects.map((project: Project) => {
              const isExpanded = expandedProjects.has(project.id);
              const navItems = project.type === 'script'
                ? getScriptNavItems(project.id)
                : getNovelNavItems(project.id);

              return (
                <div key={project.id}>
                  <ListItemButton
                    onClick={() => toggleExpand(project.id)}
                    sx={{ py: 0.75, '&:hover': { backgroundColor: '#2a2a3e' } }}
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
                      primaryTypographyProps={{ fontSize: 13, noWrap: true, color: '#cdd6f4' }}
                    />
                    {isExpanded ? (
                      <ExpandLess sx={{ color: '#6c7086' }} fontSize="small" />
                    ) : (
                      <ExpandMore sx={{ color: '#6c7086' }} fontSize="small" />
                    )}
                  </ListItemButton>
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List dense disablePadding>
                      {navItems.map((item) => (
                        <ListItemButton
                          key={item.id}
                          onClick={() => handleNavClick(item.route)}
                          sx={{ pl: 5, py: 0.5, '&:hover': { backgroundColor: '#2a2a3e' } }}
                        >
                          <ListItemIcon sx={{ minWidth: 28 }}>{item.icon}</ListItemIcon>
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{ fontSize: 12, color: '#a0a0b0' }}
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

      <Divider sx={{ borderColor: '#2a2a4e' }} />
      <div className="p-2">
        <ListItemButton
          onClick={() => handleNavClick('/dashboard')}
          sx={{ borderRadius: 1, '&:hover': { backgroundColor: '#2a2a3e' } }}
        >
          <ListItemIcon sx={{ minWidth: 28 }}>
            <DashboardIcon fontSize="small" sx={{ color: '#a0a0b0' }} />
          </ListItemIcon>
          <ListItemText
            primary={text.dashboard}
            primaryTypographyProps={{ fontSize: 12, color: '#a0a0b0' }}
          />
        </ListItemButton>
      </div>
    </div>
  );
}
