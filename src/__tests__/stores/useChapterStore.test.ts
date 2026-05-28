import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockChapters = [
  {
    id: 'ch-1',
    projectId: 'proj-1',
    title: 'Chapter 1',
    content: '{}',
    plainText: '',
    wordCount: 0,
    status: 'draft' as const,
    order: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'ch-2',
    projectId: 'proj-1',
    title: 'Chapter 2',
    content: '{}',
    plainText: '',
    wordCount: 0,
    status: 'draft' as const,
    order: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
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

if (!window.electronAPI) {
  (window as any).electronAPI = {};
}
Object.assign(window.electronAPI, mockApi);

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
    it('loads chapter list', async () => {
      mockApi.chapter.list.mockResolvedValue(mockChapters);
      await useChapterStore.getState().loadChapters('proj-1');

      const state = useChapterStore.getState();
      expect(state.chapters).toHaveLength(2);
      expect(state.isLoading).toBe(false);
    });

    it('stores load errors', async () => {
      mockApi.chapter.list.mockRejectedValue(new Error('Load failed'));
      await useChapterStore.getState().loadChapters('proj-1');
      expect(useChapterStore.getState().error).toBe('Load failed');
    });
  });

  describe('createChapter', () => {
    it('creates a chapter', async () => {
      const newChapter = { ...mockChapters[0], id: 'ch-new', title: 'New Chapter' };
      mockApi.chapter.create.mockResolvedValue(newChapter);

      const result = await useChapterStore.getState().createChapter({
        projectId: 'proj-1',
        title: 'New Chapter',
        content: '{}',
        plainText: '',
        wordCount: 0,
        status: 'draft',
        order: 0,
      });

      expect(result.title).toBe('New Chapter');
      expect(useChapterStore.getState().chapters).toHaveLength(1);
    });
  });

  describe('saveChapter', () => {
    it('saves chapter updates', async () => {
      useChapterStore.setState({ chapters: [mockChapters[0]] });
      const updated = { ...mockChapters[0], title: 'Updated Title' };
      mockApi.chapter.update.mockResolvedValue(updated);

      await useChapterStore.getState().saveChapter('ch-1', { title: 'Updated Title' });
      expect(useChapterStore.getState().chapters[0].title).toBe('Updated Title');
    });
  });

  describe('deleteChapter', () => {
    it('deletes a chapter', async () => {
      useChapterStore.setState({ chapters: mockChapters });
      mockApi.chapter.delete.mockResolvedValue(undefined);

      await useChapterStore.getState().deleteChapter('ch-1');
      expect(useChapterStore.getState().chapters).toHaveLength(1);
    });

    it('clears currentChapter when the active chapter is deleted', async () => {
      useChapterStore.setState({ chapters: mockChapters, currentChapter: mockChapters[0] });
      mockApi.chapter.delete.mockResolvedValue(undefined);

      await useChapterStore.getState().deleteChapter('ch-1');
      expect(useChapterStore.getState().currentChapter).toBeNull();
    });
  });

  describe('reorderChapters', () => {
    it('reloads chapters after reorder', async () => {
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
