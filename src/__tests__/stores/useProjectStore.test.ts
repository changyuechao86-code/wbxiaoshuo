import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockProject = {
  id: 'proj-1',
  name: 'Test Project',
  type: 'novel' as const,
  dailyGoal: 4100,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockElectronAPI = {
  project: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  chapter: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), reorder: vi.fn() },
  character: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  charRelation: { list: vi.fn(), create: vi.fn(), delete: vi.fn() },
  outline: { list: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), reorder: vi.fn() },
  worldSetting: { list: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  foreshadowing: { list: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  revenue: { list: vi.fn(), create: vi.fn(), delete: vi.fn() },
  checkin: { today: vi.fn(), monthly: vi.fn() },
  storyboard: { list: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  ai: {
    stream: vi.fn(),
    onStreamChunk: vi.fn(() => vi.fn()),
    onStreamComplete: vi.fn(() => vi.fn()),
    onStreamError: vi.fn(() => vi.fn()),
    getConfig: vi.fn(),
    saveConfig: vi.fn(),
    validateConfig: vi.fn(),
  },
  file: {
    backup: vi.fn(),
    restore: vi.fn(),
    exportDb: vi.fn(),
    importDb: vi.fn(),
    exportChapters: vi.fn(),
  },
  app: { getPath: vi.fn(), minimize: vi.fn(), maximize: vi.fn(), close: vi.fn() },
};

window.electronAPI = mockElectronAPI as any;

import { useProjectStore } from '../../renderer/stores/useProjectStore';

describe('useProjectStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProjectStore.setState({
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,
    });
  });

  describe('loadProjects', () => {
    it('loads project list', async () => {
      mockElectronAPI.project.list.mockResolvedValue([mockProject]);

      await useProjectStore.getState().loadProjects();

      const state = useProjectStore.getState();
      expect(state.projects).toHaveLength(1);
      expect(state.projects[0].name).toBe('Test Project');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('stores load errors', async () => {
      mockElectronAPI.project.list.mockRejectedValue(new Error('Network error'));

      await useProjectStore.getState().loadProjects();

      const state = useProjectStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);
      expect(state.projects).toHaveLength(0);
    });

    it('uses fallback error when no message exists', async () => {
      mockElectronAPI.project.list.mockRejectedValue({});

      await useProjectStore.getState().loadProjects();

      expect(useProjectStore.getState().error).toBe('\u52a0\u8f7d\u9879\u76ee\u5217\u8868\u5931\u8d25');
    });
  });

  describe('loadProject', () => {
    it('sets not found when project is missing', async () => {
      mockElectronAPI.project.get.mockResolvedValue(null);

      await useProjectStore.getState().loadProject('missing');

      expect(useProjectStore.getState().error).toBe('\u9879\u76ee\u4e0d\u5b58\u5728');
      expect(useProjectStore.getState().isLoading).toBe(false);
    });
  });

  describe('createProject', () => {
    it('creates a project and prepends it to the list', async () => {
      const newProject = { ...mockProject, id: 'proj-2', name: 'New Project' };
      mockElectronAPI.project.create.mockResolvedValue(newProject);

      const result = await useProjectStore.getState().createProject({
        name: 'New Project',
        type: 'novel',
        dailyGoal: 4100,
      });

      expect(result.id).toBe('proj-2');
      expect(useProjectStore.getState().projects).toHaveLength(1);
    });

    it('throws and stores create errors', async () => {
      mockElectronAPI.project.create.mockRejectedValue(new Error('Create failed'));

      await expect(
        useProjectStore.getState().createProject({ name: '', type: 'novel', dailyGoal: 4100 }),
      ).rejects.toThrow('Create failed');

      expect(useProjectStore.getState().error).toBe('Create failed');
    });
  });

  describe('updateProject', () => {
    it('updates a project', async () => {
      useProjectStore.setState({ projects: [mockProject], currentProject: mockProject });
      const updated = { ...mockProject, name: 'Updated Name' };
      mockElectronAPI.project.update.mockResolvedValue(updated);

      await useProjectStore.getState().updateProject('proj-1', { name: 'Updated Name' });

      const state = useProjectStore.getState();
      expect(state.projects[0].name).toBe('Updated Name');
      expect(state.currentProject?.name).toBe('Updated Name');
    });
  });

  describe('deleteProject', () => {
    it('deletes a project', async () => {
      useProjectStore.setState({ projects: [mockProject], currentProject: mockProject });
      mockElectronAPI.project.delete.mockResolvedValue(undefined);

      await useProjectStore.getState().deleteProject('proj-1');

      const state = useProjectStore.getState();
      expect(state.projects).toHaveLength(0);
      expect(state.currentProject).toBeNull();
    });
  });

  describe('setCurrentProject', () => {
    it('sets current project', () => {
      useProjectStore.getState().setCurrentProject(mockProject);
      expect(useProjectStore.getState().currentProject).toEqual(mockProject);
    });

    it('clears current project', () => {
      useProjectStore.setState({ currentProject: mockProject });
      useProjectStore.getState().setCurrentProject(null);
      expect(useProjectStore.getState().currentProject).toBeNull();
    });
  });

  describe('clearError', () => {
    it('clears error', () => {
      useProjectStore.setState({ error: 'Existing error' });
      useProjectStore.getState().clearError();
      expect(useProjectStore.getState().error).toBeNull();
    });
  });
});
