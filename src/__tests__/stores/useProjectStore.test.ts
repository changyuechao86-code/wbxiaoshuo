import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock window.electronAPI before importing store
const mockProject = {
  id: 'proj-1',
  name: '测试项目',
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
  file: { backup: vi.fn(), restore: vi.fn(), exportDb: vi.fn(), importDb: vi.fn() },
  app: { getPath: vi.fn(), minimize: vi.fn(), maximize: vi.fn(), close: vi.fn() },
};

// @ts-ignore
window.electronAPI = mockElectronAPI;

// Import after mock is set up
import { useProjectStore } from '../../renderer/stores/useProjectStore';

describe('useProjectStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useProjectStore.setState({
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,
    });
  });

  describe('loadProjects', () => {
    it('成功加载项目列表', async () => {
      mockElectronAPI.project.list.mockResolvedValue([mockProject]);

      await useProjectStore.getState().loadProjects();

      const state = useProjectStore.getState();
      expect(state.projects).toHaveLength(1);
      expect(state.projects[0].name).toBe('测试项目');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('加载失败时设置错误信息', async () => {
      mockElectronAPI.project.list.mockRejectedValue(new Error('网络错误'));

      await useProjectStore.getState().loadProjects();

      const state = useProjectStore.getState();
      expect(state.error).toBe('网络错误');
      expect(state.isLoading).toBe(false);
      expect(state.projects).toHaveLength(0);
    });

    it('无错误消息时使用默认错误信息', async () => {
      mockElectronAPI.project.list.mockRejectedValue({});

      await useProjectStore.getState().loadProjects();

      const state = useProjectStore.getState();
      expect(state.error).toBe('加载项目列表失败');
    });
  });

  describe('createProject', () => {
    it('成功创建项目并添加到列表', async () => {
      const newProject = { ...mockProject, id: 'proj-2', name: '新项目' };
      mockElectronAPI.project.create.mockResolvedValue(newProject);

      const result = await useProjectStore.getState().createProject({
        name: '新项目', type: 'novel', dailyGoal: 4100,
      });

      expect(result.id).toBe('proj-2');
      expect(useProjectStore.getState().projects).toHaveLength(1);
    });

    it('创建失败时抛出错误', async () => {
      mockElectronAPI.project.create.mockRejectedValue(new Error('创建失败'));

      await expect(
        useProjectStore.getState().createProject({ name: '', type: 'novel', dailyGoal: 4100 })
      ).rejects.toThrow('创建失败');

      expect(useProjectStore.getState().error).toBe('创建失败');
    });
  });

  describe('updateProject', () => {
    it('成功更新项目', async () => {
      useProjectStore.setState({ projects: [mockProject], currentProject: mockProject });
      const updated = { ...mockProject, name: '更新后' };
      mockElectronAPI.project.update.mockResolvedValue(updated);

      await useProjectStore.getState().updateProject('proj-1', { name: '更新后' });

      const state = useProjectStore.getState();
      expect(state.projects[0].name).toBe('更新后');
      expect(state.currentProject?.name).toBe('更新后');
    });
  });

  describe('deleteProject', () => {
    it('成功删除项目', async () => {
      useProjectStore.setState({ projects: [mockProject], currentProject: mockProject });
      mockElectronAPI.project.delete.mockResolvedValue(undefined);

      await useProjectStore.getState().deleteProject('proj-1');

      const state = useProjectStore.getState();
      expect(state.projects).toHaveLength(0);
      expect(state.currentProject).toBeNull();
    });
  });

  describe('setCurrentProject', () => {
    it('设置当前项目', () => {
      useProjectStore.getState().setCurrentProject(mockProject);
      expect(useProjectStore.getState().currentProject).toEqual(mockProject);
    });

    it('清除当前项目', () => {
      useProjectStore.setState({ currentProject: mockProject });
      useProjectStore.getState().setCurrentProject(null);
      expect(useProjectStore.getState().currentProject).toBeNull();
    });
  });

  describe('clearError', () => {
    it('清除错误信息', () => {
      useProjectStore.setState({ error: '有错误' });
      useProjectStore.getState().clearError();
      expect(useProjectStore.getState().error).toBeNull();
    });
  });
});
