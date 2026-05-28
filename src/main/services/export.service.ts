import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chapterRepo } from '../db/repositories/chapter.repo';
import { projectRepo } from '../db/repositories/project.repo';
import { logger } from '../utils/logger';
import type { ExportFormat } from '../../shared/types';

export interface ExportOptions {
  format: ExportFormat;
  projectId: string;
  chapterIds?: string[];
  outputPath: string;
}

interface ExportChapter {
  title: string;
  plainText: string;
  content: string;
}

export async function exportChapters(options: ExportOptions): Promise<string> {
  const project = projectRepo.getById(options.projectId);
  if (!project) {
    throw new Error('Project does not exist.');
  }

  const chapters = selectChapters(options.projectId, options.chapterIds);
  if (chapters.length === 0) {
    throw new Error('No chapters are available to export.');
  }

  const body = renderExport(project.name, chapters, options.format);
  await ensureParentDir(options.outputPath);
  await writeFile(options.outputPath, body, 'utf8');

  logger.info(`Chapters exported: format=${options.format}, projectId=${options.projectId}, path=${options.outputPath}`);
  return options.outputPath;
}

export async function convertToScript(projectId: string, chapterIds: string[]): Promise<string> {
  const project = projectRepo.getById(projectId);
  if (!project) {
    throw new Error('Project does not exist.');
  }

  const chapters = selectChapters(projectId, chapterIds);
  if (chapters.length === 0) {
    throw new Error('No chapters are available to convert.');
  }

  return chapters
    .map((chapter, index) => {
      const text = getChapterText(chapter);
      return [
        `# Scene ${index + 1}: ${chapter.title}`,
        '',
        '## Summary',
        text || '(empty)',
        '',
        '## Script Draft',
        'INT./EXT. Location - Time',
        '',
        text || '(Add action, dialogue, and scene notes here.)',
      ].join('\n');
    })
    .join('\n\n---\n\n');
}

export async function generateJimengPrompts(projectId: string, chapterIds: string[]): Promise<string[]> {
  const project = projectRepo.getById(projectId);
  if (!project) {
    throw new Error('Project does not exist.');
  }

  return selectChapters(projectId, chapterIds).map((chapter, index) => {
    const summary = getChapterText(chapter).replace(/\s+/g, ' ').trim().slice(0, 280);
    return [
      `Scene ${index + 1}: ${chapter.title}`,
      summary,
      'cinematic composition, clear subject, dramatic lighting, high detail',
    ].filter(Boolean).join(', ');
  });
}

function selectChapters(projectId: string, chapterIds?: string[]): ExportChapter[] {
  const chapters = chapterRepo.listByProject(projectId);
  if (!chapterIds || chapterIds.length === 0) {
    return chapters;
  }

  const order = new Map(chapterIds.map((id, index) => [id, index]));
  return chapters
    .filter((chapter) => order.has(chapter.id))
    .sort((a, b) => order.get(a.id)! - order.get(b.id)!);
}

function renderExport(projectName: string, chapters: ExportChapter[], format: ExportFormat): string {
  switch (format) {
    case 'txt':
      return renderTxt(projectName, chapters);
    case 'markdown':
      return renderMarkdown(projectName, chapters);
    case 'html':
      return renderHtml(projectName, chapters);
    case 'jimeng':
      return renderJimeng(chapters);
    default:
      assertNever(format);
  }
}

function renderTxt(projectName: string, chapters: ExportChapter[]): string {
  return [
    projectName,
    '='.repeat(projectName.length),
    '',
    ...chapters.flatMap((chapter) => [
      chapter.title,
      '-'.repeat(chapter.title.length),
      '',
      getChapterText(chapter),
      '',
    ]),
  ].join('\n');
}

function renderMarkdown(projectName: string, chapters: ExportChapter[]): string {
  return [
    `# ${projectName}`,
    '',
    ...chapters.flatMap((chapter) => [
      `## ${chapter.title}`,
      '',
      getChapterText(chapter),
      '',
    ]),
  ].join('\n');
}

function renderHtml(projectName: string, chapters: ExportChapter[]): string {
  const sections = chapters.map((chapter) => {
    const paragraphs = splitParagraphs(getChapterText(chapter))
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join('\n');

    return `<section>\n<h2>${escapeHtml(chapter.title)}</h2>\n${paragraphs || '<p></p>'}\n</section>`;
  });

  return [
    '<!doctype html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="utf-8">',
    `<title>${escapeHtml(projectName)}</title>`,
    '<style>body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.8;max-width:820px;margin:40px auto;padding:0 24px;color:#202124;}h1,h2{line-height:1.35;}section{margin-top:32px;}p{white-space:pre-wrap;}</style>',
    '</head>',
    '<body>',
    `<h1>${escapeHtml(projectName)}</h1>`,
    ...sections,
    '</body>',
    '</html>',
  ].join('\n');
}

function renderJimeng(chapters: ExportChapter[]): string {
  return chapters
    .map((chapter, index) => {
      const summary = getChapterText(chapter).replace(/\s+/g, ' ').trim().slice(0, 280);
      return `Scene ${index + 1}: ${chapter.title}\n${summary}\n`;
    })
    .join('\n');
}

function getChapterText(chapter: ExportChapter): string {
  return (chapter.plainText || stripJsonText(chapter.content)).trim();
}

function stripJsonText(content: string): string {
  if (!content) return '';
  try {
    const parsed = JSON.parse(content) as { content?: Array<{ content?: Array<{ text?: string }> }> };
    return parsed.content
      ?.flatMap((node) => node.content?.map((child) => child.text ?? '') ?? [])
      .join('\n') ?? '';
  } catch {
    return content;
  }
}

function splitParagraphs(text: string): string[] {
  return text.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function ensureParentDir(filePath: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
}

function assertNever(value: never): never {
  throw new Error(`Unsupported export format: ${value}`);
}
