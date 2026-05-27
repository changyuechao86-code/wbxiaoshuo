/**
 * 自定义 Windows 标题栏 — 无框窗口拖拽区域
 */
import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import {
  Menu as MenuIcon,
  Settings as SettingsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Minimize as MinimizeIcon,
  CropSquare as MaximizeIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAppStore } from '../../stores/useAppStore';
import { useNavigate } from 'react-router-dom';

export function TitleBar(): React.ReactElement {
  const { theme, toggleTheme, toggleSidebar } = useAppStore();
  const navigate = useNavigate();

  const handleMinimize = (): void => {
    window.electronAPI?.app?.minimize();
  };

  const handleMaximize = (): void => {
    window.electronAPI?.app?.maximize();
  };

  const handleClose = (): void => {
    window.electronAPI?.app?.close();
  };

  const handleOpenSettings = (): void => {
    navigate('/settings');
  };

  return (
    <div
      className="flex items-center justify-between bg-[#0f0f23] border-b border-[#2a2a4e] titlebar-drag"
      style={{ height: 'var(--titlebar-height, 38px)', minHeight: 38 }}
    >
      {/* 左侧：菜单按钮 + 应用名称 */}
      <div className="flex items-center h-full titlebar-no-drag">
        <Tooltip title="切换侧边栏">
          <IconButton
            size="small"
            onClick={toggleSidebar}
            sx={{ ml: 0.5, color: '#cdd6f4' }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <span className="text-sm font-semibold text-[#cdd6f4] ml-2 select-none">
          NovelScript Studio
        </span>
      </div>

      {/* 中间：拖拽区域 */}
      <div className="flex-1 h-full" />

      {/* 右侧：操作按钮 */}
      <div className="flex items-center h-full titlebar-no-drag">
        <Tooltip title="设置">
          <IconButton
            size="small"
            onClick={handleOpenSettings}
            sx={{ color: '#cdd6f4' }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={theme === 'dark' ? '浅色模式' : '深色模式'}>
          <IconButton
            size="small"
            onClick={toggleTheme}
            sx={{ color: '#cdd6f4' }}
          >
            {theme === 'dark' ? (
              <LightModeIcon fontSize="small" />
            ) : (
              <DarkModeIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {/* Windows 窗口控制按钮 */}
        <div className="flex items-center ml-1">
          <IconButton
            size="small"
            onClick={handleMinimize}
            sx={{ color: '#cdd6f4', borderRadius: 0 }}
          >
            <MinimizeIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleMaximize}
            sx={{ color: '#cdd6f4', borderRadius: 0 }}
          >
            <MaximizeIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{
              color: '#cdd6f4',
              borderRadius: 0,
              '&:hover': { backgroundColor: '#e81123', color: '#fff' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
