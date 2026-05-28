import React, { type ReactNode } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { BottomNav } from './BottomNav';
import { ContentArea } from './ContentArea';
import { Sidebar } from './Sidebar';
import { TitleBar } from './TitleBar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps): React.ReactElement {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="app-layout">
      <TitleBar />
      <div className="app-body">
        {sidebarOpen && <Sidebar />}
        <ContentArea>{children}</ContentArea>
      </div>
      <BottomNav />
    </div>
  );
}
