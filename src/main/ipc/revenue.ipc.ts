/**
 * Revenue IPC 处理器 — 收益 CRUD
 */
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { revenueRepo } from '../db/repositories/revenue.repo';
import { logger } from '../utils/logger';
import type { CreateRevenueDTO } from '../../shared/types';

export function registerRevenueHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.REVENUE_LIST, async (_event, projectId: string) => {
    try {
      return revenueRepo.listByProject(projectId);
    } catch (err: any) {
      logger.error(`收益列表获取失败: ${err.message}`);
      throw new Error(`获取收益列表失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.REVENUE_CREATE, async (_event, data: CreateRevenueDTO) => {
    try {
      return revenueRepo.create(data);
    } catch (err: any) {
      logger.error(`收益记录创建失败: ${err.message}`);
      throw new Error(`创建收益记录失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.REVENUE_DELETE, async (_event, id: string) => {
    try {
      revenueRepo.delete(id);
    } catch (err: any) {
      logger.error(`收益记录删除失败: ${err.message}`);
      throw new Error(`删除收益记录失败: ${err.message}`);
    }
  });
}
