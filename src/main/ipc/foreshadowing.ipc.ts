/**
 * Foreshadowing IPC 处理器 — 伏笔 CRUD
 */
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { foreshadowingRepo } from '../db/repositories/foreshadowing.repo';
import { logger } from '../utils/logger';
import type { CreateForeshadowingDTO, UpdateForeshadowingDTO } from '../../shared/types';

export function registerForeshadowingHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.FORESHADOWING_LIST, async (_event, projectId: string) => {
    try {
      return foreshadowingRepo.listByProject(projectId);
    } catch (err: any) {
      logger.error(`伏笔列表获取失败: ${err.message}`);
      throw new Error(`获取伏笔列表失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.FORESHADOWING_CREATE, async (_event, data: CreateForeshadowingDTO) => {
    try {
      if (!data.title?.trim()) throw new Error('伏笔标题不能为空');
      return foreshadowingRepo.create(data);
    } catch (err: any) {
      logger.error(`伏笔创建失败: ${err.message}`);
      throw new Error(`创建伏笔失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.FORESHADOWING_UPDATE, async (_event, id: string, data: UpdateForeshadowingDTO) => {
    try {
      return foreshadowingRepo.update(id, data);
    } catch (err: any) {
      logger.error(`伏笔更新失败: ${err.message}`);
      throw new Error(`更新伏笔失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.FORESHADOWING_DELETE, async (_event, id: string) => {
    try {
      foreshadowingRepo.delete(id);
    } catch (err: any) {
      logger.error(`伏笔删除失败: ${err.message}`);
      throw new Error(`删除伏笔失败: ${err.message}`);
    }
  });
}
