import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Chapter, Project } from '../../shared/types';

const project: Project = {
  id: 'proj-1',
  name: 'Test Novel',
  type: 'novel',
  dailyGoal: 4100,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const chapters: Chapter[] = [
  {
    id: 'ch-1',
    projectId: project.id,
    title: 'Opening',
    content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"From JSON"}]}]}',
    plainText: 'Plain opening',
    wordCount: 2,
    status: 'draft',
    order: 0,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  },
  {
    id: 'ch-2',
    projectId: project.id,
    title: '<Twist>',
    content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"JSON twist"}]}]}',
    plainText: '',
    wordCount: 2,
    status: 'draft',
    order: 1,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  },
];

vi.mock('../../main/db/repositories/project.repo', () => ({
  projectRepo: {
    getById: vi.fn(() => project),
  },
}));

vi.mock('../../main/db/repositories/chapter.repo', () => ({
  chapterRepo: {
    listByProject: vi.fn(() => chapters),
  },
}));

vi.mock('../../main/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const { chapterRepo } = await import('../../main/db/repositories/chapter.repo');
const { projectRepo } = await import('../../main/db/repositories/project.repo');
const { exportChapters, convertToScript, generateJimengPrompts } = await import('../../main/services/export.service');

let tempDir = '';

beforeEach(async () => {
  vi.clearAllMocks();
  vi.mocked(projectRepo.getById).mockReturnValue(project);
  vi.mocked(chapterRepo.listByProject).mockReturnValue(chapters);
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'novel-export-'));
});

afterEach(async () => {
  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

describe('export.service', () => {
  it('exports Markdown with selected chapter order', async () => {
    const outputPath = path.join(tempDir, 'chapters.md');

    await exportChapters({
      format: 'markdown',
      projectId: project.id,
      chapterIds: ['ch-2', 'ch-1'],
      outputPath,
    });

    const output = await fs.readFile(outputPath, 'utf8');
    expect(output.indexOf('## <Twist>')).toBeLessThan(output.indexOf('## Opening'));
    expect(output).toContain('JSON twist');
    expect(output).toContain('Plain opening');
  });

  it('escapes HTML output', async () => {
    const outputPath = path.join(tempDir, 'chapters.html');

    await exportChapters({
      format: 'html',
      projectId: project.id,
      outputPath,
    });

    const output = await fs.readFile(outputPath, 'utf8');
    expect(output).toContain('<html lang="zh-CN">');
    expect(output).toContain('<h2>&lt;Twist&gt;</h2>');
    expect(output).not.toContain('<h2><Twist></h2>');
  });

  it('generates script draft and Jimeng prompts', async () => {
    await expect(convertToScript(project.id, ['ch-1'])).resolves.toContain('## Script Draft');

    const prompts = await generateJimengPrompts(project.id, ['ch-1']);
    expect(prompts).toHaveLength(1);
    expect(prompts[0]).toContain('Scene 1: Opening');
  });

  it('throws when project does not exist', async () => {
    vi.mocked(projectRepo.getById).mockReturnValue(null);

    await expect(exportChapters({
      format: 'txt',
      projectId: 'missing',
      outputPath: path.join(tempDir, 'missing.txt'),
    })).rejects.toThrow('Project does not exist.');
  });
});
