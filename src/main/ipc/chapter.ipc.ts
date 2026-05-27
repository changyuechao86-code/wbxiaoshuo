/**
 * Chapter IPC 处理器 — 章节 CRUD + 排序
 */
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { chapterRepo } from '../db/repositories/chapter.repo';
import { logger } from '../utils/logger';
import type { CreateChapterDTO, UpdateChapterDTO } from '../../shared/types';

export function registerChapterHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.CHAPTER_LIST, async (_event, projectId: string) => {
    try {
      return chapterRepo.listByProject(projectId);
    } catch (err: any) {
      logger.error(`章节列表获取失败: ${err.message}`);
      throw new Error(`获取章节列表失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHAPTER_GET, async (_event, id: string) => {
    try {
      const chapter = chapterRepo.getById(id);
      if (!chapter) throw new Error(`章节不存在: ${id}`);
      return chapter;
    } catch (err: any) {
      logger.error(`章节获取失败: ${err.message}`);
      throw new Error(`获取章节失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHAPTER_CREATE, async (_event, data: CreateChapterDTO) => {
    try {
      return chapterRepo.create(data);
    } catch (err: any) {
      logger.error(`章节创建失败: ${err.message}`);
      throw new Error(`创建章节失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHAPTER_UPDATE, async (_event, id: string, data: UpdateChapterDTO) => {
    try {
      return chapterRepo.update(id, data);
    } catch (err: any) {
      logger.error(`章节更新失败: ${err.message}`);
      throw new Error(`更新章节失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHAPTER_DELETE, async (_event, id: string) => {
    try {
      chapterRepo.delete(id);
    } catch (err: any) {
      logger.error(`章节删除失败: ${err.message}`);
      throw new Error(`删除章节失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHAPTER_REORDER, async (_event, projectId: string, ids: string[]) => {
    try {
      chapterRepo.reorder(projectId, ids);
    } catch (err: any) {
      logger.error(`章节排序失败: ${err.message}`);
      throw new Error(`排序章节失败: ${err.message}`);
    }
  });
}
