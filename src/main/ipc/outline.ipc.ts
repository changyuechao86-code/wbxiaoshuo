/**
 * Outline IPC 处理器 — 大纲 CRUD + 排序
 */
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { outlineRepo } from '../db/repositories/outline.repo';
import { logger } from '../utils/logger';
import type { CreateOutlineDTO, UpdateOutlineDTO, OutlineReorderItem } from '../../shared/types';

export function registerOutlineHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.OUTLINE_LIST, async (_event, projectId: string) => {
    try {
      return outlineRepo.listByProject(projectId);
    } catch (err: any) {
      logger.error(`大纲列表获取失败: ${err.message}`);
      throw new Error(`获取大纲列表失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.OUTLINE_CREATE, async (_event, data: CreateOutlineDTO) => {
    try {
      if (!data.title?.trim()) throw new Error('大纲标题不能为空');
      return outlineRepo.create(data);
    } catch (err: any) {
      logger.error(`大纲创建失败: ${err.message}`);
      throw new Error(`创建大纲失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.OUTLINE_UPDATE, async (_event, id: string, data: UpdateOutlineDTO) => {
    try {
      return outlineRepo.update(id, data);
    } catch (err: any) {
      logger.error(`大纲更新失败: ${err.message}`);
      throw new Error(`更新大纲失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.OUTLINE_DELETE, async (_event, id: string) => {
    try {
      outlineRepo.delete(id);
    } catch (err: any) {
      logger.error(`大纲删除失败: ${err.message}`);
      throw new Error(`删除大纲失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.OUTLINE_REORDER, async (_event, items: OutlineReorderItem[]) => {
    try {
      outlineRepo.reorder(items);
    } catch (err: any) {
      logger.error(`大纲排序失败: ${err.message}`);
      throw new Error(`排序大纲失败: ${err.message}`);
    }
  });
}
