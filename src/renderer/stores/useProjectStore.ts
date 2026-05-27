/**
 * 项目状态 Store
 */
import { create } from 'zustand';
import type { Project, CreateProjectDTO, UpdateProjectDTO } from '../../shared/types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  loadProjects: () => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  createProject: (data: CreateProjectDTO) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectDTO) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  loadProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await window.electronAPI.project.list();
      set({ projects, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || '加载项目列表失败', isLoading: false });
    }
  },

  loadProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const project = await window.electronAPI.project.get(id);
      if (project) {
        set({ currentProject: project, isLoading: false });
      } else {
        set({ error: '项目不存在', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message || '加载项目失败', isLoading: false });
    }
  },

  createProject: async (data: CreateProjectDTO) => {
    set({ isLoading: true, error: null });
    try {
      const project = await window.electronAPI.project.create(data);
      set((s) => ({ projects: [project, ...s.projects], isLoading: false }));
      return project;
    } catch (err: any) {
      set({ error: err.message || '创建项目失败', isLoading: false });
      throw err;
    }
  },

  updateProject: async (id: string, data: UpdateProjectDTO) => {
    set({ error: null });
    try {
      const updated = await window.electronAPI.project.update(id, data);
      set((s) => ({
        projects: s.projects.map((p) => p.id === id ? updated : p),
        currentProject: s.currentProject?.id === id ? updated : s.currentProject,
      }));
    } catch (err: any) {
      set({ error: err.message || '更新项目失败' });
      throw err;
    }
  },

  deleteProject: async (id: string) => {
    set({ error: null });
    try {
      await window.electronAPI.project.delete(id);
      set((s) => ({
        projects: s.projects.filter((p) => p.id !== id),
        currentProject: s.currentProject?.id === id ? null : s.currentProject,
      }));
    } catch (err: any) {
      set({ error: err.message || '删除项目失败' });
      throw err;
    }
  },

  setCurrentProject: (project: Project | null) => set({ currentProject: project }),
  clearError: () => set({ error: null }),
}));
