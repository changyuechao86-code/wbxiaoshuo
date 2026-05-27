/**
 * React Router 路由配置 — 路由数组支持追加新路由
 */
import type { RouteObject } from 'react-router-dom';

// 路由将在 App.tsx 中直接定义，此文件预留用于集中管理路由配置
// P1/P2 可以从此处导入路由数组进行扩展

export const baseRoutes: RouteObject[] = [
  { path: '/', lazy: () => import('../pages/DashboardPage').then(m => ({ Component: m.DashboardPage })) },
  { path: '/dashboard', lazy: () => import('../pages/DashboardPage').then(m => ({ Component: m.DashboardPage })) },
  { path: '/editor/:projectId/:chapterId?', lazy: () => import('../pages/EditorPage').then(m => ({ Component: m.EditorPage })) },
  { path: '/outline/:projectId', lazy: () => import('../pages/OutlinePage').then(m => ({ Component: m.OutlinePage })) },
  { path: '/characters/:projectId', lazy: () => import('../pages/CharacterPage').then(m => ({ Component: m.CharacterPage })) },
  { path: '/world-setting/:projectId', lazy: () => import('../pages/WorldSettingPage').then(m => ({ Component: m.WorldSettingPage })) },
  { path: '/foreshadowing/:projectId', lazy: () => import('../pages/ForeshadowingPage').then(m => ({ Component: m.ForeshadowingPage })) },
  { path: '/revenue/:projectId', lazy: () => import('../pages/RevenuePage').then(m => ({ Component: m.RevenuePage })) },
  { path: '/storyboard/:projectId', lazy: () => import('../pages/StoryboardPage').then(m => ({ Component: m.StoryboardPage })) },
  { path: '/settings', lazy: () => import('../pages/SettingsPage').then(m => ({ Component: m.SettingsPage })) },
  { path: '/project/create', lazy: () => import('../pages/ProjectCreatePage').then(m => ({ Component: m.ProjectCreatePage })) },
];
