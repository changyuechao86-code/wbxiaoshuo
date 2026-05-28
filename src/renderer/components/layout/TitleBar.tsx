import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import {
  Close as CloseIcon,
  CropSquare as MaximizeIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Menu as MenuIcon,
  Minimize as MinimizeIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAppStore } from '../../stores/useAppStore';

const text = {
  close: '\u5173\u95ed',
  darkMode: '\u6df1\u8272\u6a21\u5f0f',
  lightMode: '\u6d45\u8272\u6a21\u5f0f',
  maximize: '\u6700\u5927\u5316/\u8fd8\u539f',
  minimize: '\u6700\u5c0f\u5316',
  settings: '\u8bbe\u7f6e',
  toggleSidebar: '\u5207\u6362\u4fa7\u8fb9\u680f',
};

export function TitleBar(): React.ReactElement {
  const { theme, toggleTheme, toggleSidebar } = useAppStore();
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center justify-between bg-[#0f0f23] border-b border-[#2a2a4e] titlebar-drag"
      style={{ height: 'var(--titlebar-height, 38px)', minHeight: 38 }}
    >
      <div className="flex items-center h-full titlebar-no-drag">
        <Tooltip title={text.toggleSidebar}>
          <IconButton size="small" onClick={toggleSidebar} sx={{ ml: 0.5, color: '#cdd6f4' }}>
            <MenuIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <span className="text-sm font-semibold text-[#cdd6f4] ml-2 select-none">
          NovelScript Studio
        </span>
      </div>

      <div className="flex-1 h-full" />

      <div className="flex items-center h-full titlebar-no-drag">
        <Tooltip title={text.settings}>
          <IconButton size="small" onClick={() => navigate('/settings')} sx={{ color: '#cdd6f4' }}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={theme === 'dark' ? text.lightMode : text.darkMode}>
          <IconButton size="small" onClick={toggleTheme} sx={{ color: '#cdd6f4' }}>
            {theme === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <div className="flex items-center ml-1">
          <Tooltip title={text.minimize}>
            <IconButton
              size="small"
              onClick={() => window.electronAPI?.app?.minimize()}
              sx={{ color: '#cdd6f4', borderRadius: 0 }}
            >
              <MinimizeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={text.maximize}>
            <IconButton
              size="small"
              onClick={() => window.electronAPI?.app?.maximize()}
              sx={{ color: '#cdd6f4', borderRadius: 0 }}
            >
              <MaximizeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={text.close}>
            <IconButton
              size="small"
              onClick={() => window.electronAPI?.app?.close()}
              sx={{
                color: '#cdd6f4',
                borderRadius: 0,
                '&:hover': { backgroundColor: '#e81123', color: '#fff' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
