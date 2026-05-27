import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock all child components and stores
vi.mock('../../renderer/components/layout/TitleBar', () => ({
  TitleBar: () => React.createElement('div', { 'data-testid': 'title-bar' }, 'TitleBar'),
}));
vi.mock('../../renderer/components/layout/Sidebar', () => ({
  Sidebar: () => React.createElement('div', { 'data-testid': 'sidebar' }, 'Sidebar'),
}));
vi.mock('../../renderer/components/layout/BottomNav', () => ({
  BottomNav: () => React.createElement('div', { 'data-testid': 'bottom-nav' }, 'BottomNav'),
}));
vi.mock('../../renderer/components/layout/ContentArea', () => ({
  ContentArea: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'content-area' }, children),
}));

// Mock useAppStore
let sidebarOpen = true;
vi.mock('../../renderer/stores/useAppStore', () => ({
  useAppStore: (selector?: any) => {
    const state = { sidebarOpen, toggleSidebar: () => { sidebarOpen = !sidebarOpen; } };
    return selector ? selector(state) : state;
  },
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  HashRouter: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'router' }, children),
  Routes: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', {}, children),
  Route: () => null,
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/' }),
  NavLink: ({ children }: { children: React.ReactNode }) => React.createElement('a', {}, children),
  Outlet: () => React.createElement('div', { 'data-testid': 'outlet' }, 'Outlet'),
}));

// Mock MUI ThemeProvider
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual as any,
    ThemeProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'theme-provider' }, children),
  };
});

import { AppShell } from '../../renderer/components/layout/AppShell';

describe('AppShell', () => {
  beforeEach(() => {
    sidebarOpen = true;
  });

  it('渲染标题栏', () => {
    render(React.createElement(AppShell, { children: '内容' }));
    expect(screen.getByTestId('title-bar')).toBeDefined();
  });

  it('渲染侧边栏', () => {
    render(React.createElement(AppShell, { children: '内容' }));
    expect(screen.getByTestId('sidebar')).toBeDefined();
  });

  it('侧边栏关闭时不渲染', () => {
    sidebarOpen = false;
    render(React.createElement(AppShell, { children: '内容' }));
    expect(screen.queryByTestId('sidebar')).toBeNull();
  });

  it('渲染底部导航', () => {
    render(React.createElement(AppShell, { children: '内容' }));
    expect(screen.getByTestId('bottom-nav')).toBeDefined();
  });

  it('渲染内容区并传递 children', () => {
    render(React.createElement(AppShell, { children: React.createElement('span', { 'data-testid': 'child' }, 'Hello') }));
    expect(screen.getByTestId('content-area')).toBeDefined();
    expect(screen.getByTestId('child')).toBeDefined();
  });
});
