/**
 * 根组件 — 路由 + 布局壳
 */
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { useAppStore } from './stores/useAppStore';
import { useProjectStore } from './stores/useProjectStore';

// 页面组件 — 懒加载以优化首屏
import { lazy, Suspense } from 'react';

const EditorPage = lazy(() => import('./pages/EditorPage').then(m => ({ default: m.EditorPage })));
const OutlinePage = lazy(() => import('./pages/OutlinePage').then(m => ({ default: m.OutlinePage })));
const CharacterPage = lazy(() => import('./pages/CharacterPage').then(m => ({ default: m.CharacterPage })));
const WorldSettingPage = lazy(() => import('./pages/WorldSettingPage').then(m => ({ default: m.WorldSettingPage })));
const ForeshadowingPage = lazy(() => import('./pages/ForeshadowingPage').then(m => ({ default: m.ForeshadowingPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const RevenuePage = lazy(() => import('./pages/RevenuePage').then(m => ({ default: m.RevenuePage })));
const StoryboardPage = lazy(() => import('./pages/StoryboardPage').then(m => ({ default: m.StoryboardPage })));
const ScriptConverterPage = lazy(() => import('./pages/ScriptConverterPage').then(m => ({ default: m.ScriptConverterPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ProjectCreatePage = lazy(() => import('./pages/ProjectCreatePage').then(m => ({ default: m.ProjectCreatePage })));

/** 加载中占位 */
function PageLoading(): React.ReactElement {
  return (
    <div className="flex items-center justify-center h-full text-gray-400">
      <div className="text-lg">加载中...</div>
    </div>
  );
}

export default function App(): React.ReactElement {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { loadProjects } = useProjectStore();

  useEffect(() => {
    // 初始化：加载项目列表
    loadProjects().catch(console.error);
  }, [loadProjects]);

  return (
    <HashRouter>
      <AppShell>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            {/* 默认路由 — 仪表盘 */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* 编辑器 */}
            <Route path="/editor/:projectId/:chapterId?" element={<EditorPage />} />

            {/* 大纲 */}
            <Route path="/outline/:projectId" element={<OutlinePage />} />

            {/* 角色管理 */}
            <Route path="/characters/:projectId" element={<CharacterPage />} />

            {/* 世界观设定 */}
            <Route path="/world-setting/:projectId" element={<WorldSettingPage />} />

            {/* 伏笔管理 */}
            <Route path="/foreshadowing/:projectId" element={<ForeshadowingPage />} />

            {/* 收益追踪 */}
            <Route path="/revenue/:projectId" element={<RevenuePage />} />

            {/* 分镜管理 */}
            <Route path="/storyboard/:projectId" element={<StoryboardPage />} />

            {/* 设置 */}
            <Route path="/settings" element={<SettingsPage />} />

            {/* 新建项目 */}
            <Route path="/project/create" element={<ProjectCreatePage />} />
          </Routes>
        </Suspense>
      </AppShell>
    </HashRouter>
  );
}
