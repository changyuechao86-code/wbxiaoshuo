/**
 * 底部快捷导航栏
 */
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Public as WorldIcon,
  Movie as ScriptIcon,
} from '@mui/icons-material';

interface NavButton {
  id: string;
  label: string;
  icon: React.ReactElement;
  route: string;
}

export function BottomNav(): React.ReactElement {
  const navigate = useNavigate();
  const { currentProjectId } = useAppStore();

  const navItems: NavButton[] = [
    { id: 'dashboard', label: '仪表盘', icon: <DashboardIcon fontSize="small" />, route: '/dashboard' },
  ];

  if (currentProjectId) {
    navItems.push(
      { id: 'characters', label: '角色', icon: <PersonIcon fontSize="small" />, route: `/characters/${currentProjectId}` },
      { id: 'world', label: '设定', icon: <WorldIcon fontSize="small" />, route: `/world-setting/${currentProjectId}` },
      { id: 'script', label: '剧本', icon: <ScriptIcon fontSize="small" />, route: `/storyboard/${currentProjectId}` },
    );
  }

  const handleClick = (route: string): void => {
    navigate(route);
  };

  return (
    <div
      className="flex items-center justify-center gap-1 bg-[#0f0f23] border-t border-[#2a2a4e] px-2"
      style={{ height: 44, minHeight: 44 }}
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => handleClick(item.route)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#a0a0b0] hover:text-[#cdd6f4] hover:bg-[#2a2a3e] rounded-md transition-colors"
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
