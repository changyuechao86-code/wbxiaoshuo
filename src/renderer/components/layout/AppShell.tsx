/**
 * 应用壳组件 — 标题栏 + 侧栏 + 内容区 + 底部导航
 */
import React, { type ReactNode } from 'react';
import { TitleBar } from './TitleBar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { ContentArea } from './ContentArea';
import { useAppStore } from '../../stores/useAppStore';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps): React.ReactElement {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="app-layout">
      {/* 自定义标题栏 */}
      <TitleBar />

      <div className="app-body">
        {/* 左侧边栏 */}
        {sidebarOpen && <Sidebar />}

        {/* 主内容区 */}
        <ContentArea>{children}</ContentArea>
      </div>

      {/* 底部导航栏 */}
      <BottomNav />
    </div>
  );
}
