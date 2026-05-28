import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import type { CreateChapterDTO, UpdateChapterDTO } from '../../shared/types';
import { chapterRepo } from '../db/repositories/chapter.repo';
import { logger } from '../utils/logger';

const text = {
  createFailed: '\u521b\u5efa\u7ae0\u8282\u5931\u8d25',
  deleteFailed: '\u5220\u9664\u7ae0\u8282\u5931\u8d25',
  getFailed: '\u83b7\u53d6\u7ae0\u8282\u5931\u8d25',
  listFailed: '\u83b7\u53d6\u7ae0\u8282\u5217\u8868\u5931\u8d25',
  notFound: '\u7ae0\u8282\u4e0d\u5b58\u5728',
  reorderFailed: '\u6392\u5e8f\u7ae0\u8282\u5931\u8d25',
  updateFailed: '\u66f4\u65b0\u7ae0\u8282\u5931\u8d25',
};

function withDetail(prefix: string, err: any): Error {
  return new Error(`${prefix}${err?.message ? `: ${err.message}` : ''}`);
}

export function registerChapterHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.CHAPTER_LIST, async (_event, projectId: string) => {
    try {
      return chapterRepo.listByProject(projectId);
    } catch (err: any) {
      logger.error(`Chapter list failed: ${err.message}`);
      throw withDetail(text.listFailed, err);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHAPTER_GET, async (_event, id: string) => {
    try {
      const chapter = chapterRepo.getById(id);
      if (!chapter) throw new Error(`${text.notFound}: ${id}`);
      return chapter;
    } catch (err: any) {
      logger.error(`Chapter get failed: ${err.message}`);
      throw withDetail(text.getFailed, err);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHAPTER_CREATE, async (_event, data: CreateChapterDTO) => {
    try {
      return chapterRepo.create(data);
    } catch (err: any) {
      logger.error(`Chapter create failed: ${err.message}`);
      throw withDetail(text.createFailed, err);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHAPTER_UPDATE, async (_event, id: string, data: UpdateChapterDTO) => {
    try {
      return chapterRepo.update(id, data);
    } catch (err: any) {
      logger.error(`Chapter update failed: ${err.message}`);
      throw withDetail(text.updateFailed, err);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHAPTER_DELETE, async (_event, id: string) => {
    try {
      chapterRepo.delete(id);
    } catch (err: any) {
      logger.error(`Chapter delete failed: ${err.message}`);
      throw withDetail(text.deleteFailed, err);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHAPTER_REORDER, async (_event, projectId: string, ids: string[]) => {
    try {
      chapterRepo.reorder(projectId, ids);
    } catch (err: any) {
      logger.error(`Chapter reorder failed: ${err.message}`);
      throw withDetail(text.reorderFailed, err);
    }
  });
}
