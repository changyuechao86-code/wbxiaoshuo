import { describe, it, expect, beforeEach, vi } from 'vitest';

// Setup mocks before importing stores
const mockChapters = [
  { id: 'ch-1', projectId: 'proj-1', title: '第一章', content: '{}', plainText: '', wordCount: 0, status: 'draft' as const, order: 0, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ch-2', projectId: 'proj-1', title: '第二章', content: '{}', plainText: '', wordCount: 0, status: 'draft' as const, order: 1, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
];

const mockApi = {
  chapter: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    reorder: vi.fn(),
  },
};
// @ts-ignore setup global mock
if (!(window as any).electronAPI) (window as any).electronAPI = {};
Object.assign((window as any).electronAPI, mockApi);

import { useChapterStore } from '../../renderer/stores/useChapterStore';

describe('useChapterStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useChapterStore.setState({
      chapters: [],
      currentChapter: null,
      isLoading: false,
      error: null,
    });
  });

  describe('loadChapters', () => {
    it('加载章节列表', async () => {
      mockApi.chapter.list.mockResolvedValue(mockChapters);
      await useChapterStore.getState().loadChapters('proj-1');

      const state = useChapterStore.getState();
      expect(state.chapters).toHaveLength(2);
      expect(state.isLoading).toBe(false);
    });

    it('加载失败时的错误处理', async () => {
      mockApi.chapter.list.mockRejectedValue(new Error('加载失败'));
      await useChapterStore.getState().loadChapters('proj-1');
      expect(useChapterStore.getState().error).toBe('加载失败');
    });
  });

  describe('createChapter', () => {
    it('创建章节', async () => {
      const newChapter = { ...mockChapters[0], id: 'ch-new', title: '新章节' };
      mockApi.chapter.create.mockResolvedValue(newChapter);

      const result = await useChapterStore.getState().createChapter({
        projectId: 'proj-1', title: '新章节', content: '{}', status: 'draft', order: 0,
      });

      expect(result.title).toBe('新章节');
      expect(useChapterStore.getState().chapters).toHaveLength(1);
    });
  });

  describe('saveChapter', () => {
    it('保存章节更新', async () => {
      useChapterStore.setState({ chapters: [mockChapters[0]] });
      const updated = { ...mockChapters[0], title: '更新标题' };
      mockApi.chapter.update.mockResolvedValue(updated);

      await useChapterStore.getState().saveChapter('ch-1', { title: '更新标题' });
      expect(useChapterStore.getState().chapters[0].title).toBe('更新标题');
    });
  });

  describe('deleteChapter', () => {
    it('删除章节', async () => {
      useChapterStore.setState({ chapters: mockChapters });
      mockApi.chapter.delete.mockResolvedValue(undefined);

      await useChapterStore.getState().deleteChapter('ch-1');
      expect(useChapterStore.getState().chapters).toHaveLength(1);
    });

    it('删除当前章节时清空 currentChapter', async () => {
      useChapterStore.setState({ chapters: mockChapters, currentChapter: mockChapters[0] });
      mockApi.chapter.delete.mockResolvedValue(undefined);

      await useChapterStore.getState().deleteChapter('ch-1');
      expect(useChapterStore.getState().currentChapter).toBeNull();
    });
  });

  describe('reorderChapters', () => {
    it('重排后重新加载', async () => {
      mockApi.chapter.reorder.mockResolvedValue(undefined);
      mockApi.chapter.list.mockResolvedValue([
        { ...mockChapters[1], order: 0 },
        { ...mockChapters[0], order: 1 },
      ]);

      await useChapterStore.getState().reorderChapters('proj-1', ['ch-2', 'ch-1']);
      expect(useChapterStore.getState().chapters[0].id).toBe('ch-2');
    });
  });
});
