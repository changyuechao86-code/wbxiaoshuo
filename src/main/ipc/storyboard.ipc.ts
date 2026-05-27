/**
 * Storyboard IPC 处理器 — 分镜 CRUD (P2)
 * 骨架实现，完整功能留待 P2 阶段
 */
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { storyboardRepo } from '../db/repositories/storyboard.repo';
import { logger } from '../utils/logger';
import type { CreateStoryboardDTO, UpdateStoryboardDTO } from '../../shared/types';

export function registerStoryboardHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.STORYBOARD_LIST, async (_event, projectId: string) => {
    try {
      return storyboardRepo.listByProject(projectId);
    } catch (err: any) {
      logger.error(`分镜列表获取失败: ${err.message}`);
      throw new Error(`获取分镜列表失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.STORYBOARD_CREATE, async (_event, data: CreateStoryboardDTO) => {
    try {
      return storyboardRepo.create(data);
    } catch (err: any) {
      logger.error(`分镜创建失败: ${err.message}`);
      throw new Error(`创建分镜失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.STORYBOARD_UPDATE, async (_event, id: string, data: UpdateStoryboardDTO) => {
    try {
      return storyboardRepo.update(id, data);
    } catch (err: any) {
      logger.error(`分镜更新失败: ${err.message}`);
      throw new Error(`更新分镜失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.STORYBOARD_DELETE, async (_event, id: string) => {
    try {
      storyboardRepo.delete(id);
    } catch (err: any) {
      logger.error(`分镜删除失败: ${err.message}`);
      throw new Error(`删除分镜失败: ${err.message}`);
    }
  });
}
