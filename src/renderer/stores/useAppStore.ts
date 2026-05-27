/**
 * 全局应用状态 Store
 * 管理主题、侧边栏、当前项目选择等全局 UI 状态
 */
import { create } from 'zustand';

export type AppTheme = 'light' | 'dark';

interface AppState {
  /** 当前主题 */
  theme: AppTheme;
  /** 侧边栏是否展开 */
  sidebarOpen: boolean;
  /** 当前选中的项目 ID */
  currentProjectId: string | null;
  /** 应用是否正在加载 */
  isLoading: boolean;
  /** 全局错误消息 */
  errorMessage: string | null;

  // Actions
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCurrentProjectId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  sidebarOpen: true,
  currentProjectId: null,
  isLoading: false,
  errorMessage: null,

  setTheme: (theme: AppTheme) => set({ theme }),
  toggleTheme: () => set((s) => ({
    theme: s.theme === 'dark' ? 'light' : 'dark',
  })),
  setSidebarOpen: (sidebarOpen: boolean) => set({ sidebarOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setCurrentProjectId: (currentProjectId: string | null) => set({ currentProjectId }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (errorMessage: string | null) => set({ errorMessage }),
  clearError: () => set({ errorMessage: null }),
}));
