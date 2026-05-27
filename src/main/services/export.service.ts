/**
 * Export Service — 导出逻辑 (P2 Stub)
 * 骨架实现，完整功能（小说转剧本、即梦提示词导出等）留待 P2 阶段
 */
import { logger } from '../utils/logger';

/** 导出类型 */
export type ExportFormat = 'txt' | 'markdown' | 'html' | 'docx' | 'jimeng';

/** 导出选项 */
export interface ExportOptions {
  format: ExportFormat;
  projectId: string;
  chapterIds?: string[];
  outputPath: string;
}

/**
 * 导出章节内容（P2 Stub）
 * 当前仅支持纯文本导出，完整功能留待 P2
 */
export async function exportChapters(options: ExportOptions): Promise<string> {
  logger.info(`导出请求 (stub): format=${options.format}, projectId=${options.projectId}`);

  // P2 TODO: 实现完整的导出逻辑
  // - 纯文本 / Markdown / HTML 导出
  // - 即梦 CLI 提示词格式导出
  // - Word (docx) 导出

  throw new Error('导出功能将在后续版本中实现');
}

/**
 * 将章节转换为剧本格式（P2 Stub）
 */
export async function convertToScript(projectId: string, chapterIds: string[]): Promise<string> {
  logger.info(`剧本转换请求 (stub): projectId=${projectId}`);
  throw new Error('小说转剧本功能将在后续版本中实现');
}

/**
 * 生成即梦 CLI 提示词（P2 Stub）
 */
export async function generateJimengPrompts(projectId: string, chapterIds: string[]): Promise<string[]> {
  logger.info(`即梦提示词生成请求 (stub): projectId=${projectId}`);
  throw new Error('即梦提示词生成功能将在后续版本中实现');
}
