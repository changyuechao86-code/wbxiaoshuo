import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Movie as ScriptIcon,
  Person as PersonIcon,
  Public as WorldIcon,
} from '@mui/icons-material';
import { useAppStore } from '../../stores/useAppStore';

interface NavButton {
  id: string;
  label: string;
  icon: React.ReactElement;
  route: string;
}

const text = {
  characters: '\u89d2\u8272',
  dashboard: '\u4eea\u8868\u76d8',
  script: '\u5267\u672c',
  settings: '\u8bbe\u5b9a',
};

export function BottomNav(): React.ReactElement {
  const navigate = useNavigate();
  const { currentProjectId } = useAppStore();

  const navItems: NavButton[] = [
    { id: 'dashboard', label: text.dashboard, icon: <DashboardIcon fontSize="small" />, route: '/dashboard' },
  ];

  if (currentProjectId) {
    navItems.push(
      { id: 'characters', label: text.characters, icon: <PersonIcon fontSize="small" />, route: `/characters/${currentProjectId}` },
      { id: 'world', label: text.settings, icon: <WorldIcon fontSize="small" />, route: `/world-setting/${currentProjectId}` },
      { id: 'script', label: text.script, icon: <ScriptIcon fontSize="small" />, route: `/storyboard/${currentProjectId}` },
    );
  }

  return (
    <div
      className="flex items-center justify-center gap-1 bg-[#0f0f23] border-t border-[#2a2a4e] px-2"
      style={{ height: 44, minHeight: 44 }}
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => navigate(item.route)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#a0a0b0] hover:text-[#cdd6f4] hover:bg-[#2a2a3e] rounded-md transition-colors"
          type="button"
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
