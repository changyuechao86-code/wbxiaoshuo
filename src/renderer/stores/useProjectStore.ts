import { create } from 'zustand';
import type { CreateProjectDTO, Project, UpdateProjectDTO } from '../../shared/types';

const text = {
  createFailed: '\u521b\u5efa\u9879\u76ee\u5931\u8d25',
  deleteFailed: '\u5220\u9664\u9879\u76ee\u5931\u8d25',
  loadFailed: '\u52a0\u8f7d\u9879\u76ee\u5931\u8d25',
  loadListFailed: '\u52a0\u8f7d\u9879\u76ee\u5217\u8868\u5931\u8d25',
  notFound: '\u9879\u76ee\u4e0d\u5b58\u5728',
  updateFailed: '\u66f4\u65b0\u9879\u76ee\u5931\u8d25',
};

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

export const useProjectStore = create<ProjectState>((set) => ({
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
      set({ error: err.message || text.loadListFailed, isLoading: false });
    }
  },

  loadProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const project = await window.electronAPI.project.get(id);
      if (project) {
        set({ currentProject: project, isLoading: false });
      } else {
        set({ error: text.notFound, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message || text.loadFailed, isLoading: false });
    }
  },

  createProject: async (data: CreateProjectDTO) => {
    set({ isLoading: true, error: null });
    try {
      const project = await window.electronAPI.project.create(data);
      set((s) => ({ projects: [project, ...s.projects], isLoading: false }));
      return project;
    } catch (err: any) {
      set({ error: err.message || text.createFailed, isLoading: false });
      throw err;
    }
  },

  updateProject: async (id: string, data: UpdateProjectDTO) => {
    set({ error: null });
    try {
      const updated = await window.electronAPI.project.update(id, data);
      set((s) => ({
        projects: s.projects.map((p) => (p.id === id ? updated : p)),
        currentProject: s.currentProject?.id === id ? updated : s.currentProject,
      }));
    } catch (err: any) {
      set({ error: err.message || text.updateFailed });
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
      set({ error: err.message || text.deleteFailed });
      throw err;
    }
  },

  setCurrentProject: (project: Project | null) => set({ currentProject: project }),
  clearError: () => set({ error: null }),
}));
