/**
 * WorldSetting IPC 处理器 — 世界观设定 CRUD
 */
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { worldSettingRepo } from '../db/repositories/world-setting.repo';
import { logger } from '../utils/logger';
import type { CreateWorldSettingDTO, UpdateWorldSettingDTO } from '../../shared/types';

export function registerWorldSettingHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.WORLD_SETTING_LIST, async (_event, projectId: string) => {
    try {
      return worldSettingRepo.listByProject(projectId);
    } catch (err: any) {
      logger.error(`世界观设定列表获取失败: ${err.message}`);
      throw new Error(`获取世界观设定列表失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.WORLD_SETTING_CREATE, async (_event, data: CreateWorldSettingDTO) => {
    try {
      if (!data.name?.trim()) throw new Error('设定名称不能为空');
      return worldSettingRepo.create(data);
    } catch (err: any) {
      logger.error(`世界观设定创建失败: ${err.message}`);
      throw new Error(`创建世界观设定失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.WORLD_SETTING_UPDATE, async (_event, id: string, data: UpdateWorldSettingDTO) => {
    try {
      return worldSettingRepo.update(id, data);
    } catch (err: any) {
      logger.error(`世界观设定更新失败: ${err.message}`);
      throw new Error(`更新世界观设定失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.WORLD_SETTING_DELETE, async (_event, id: string) => {
    try {
      worldSettingRepo.delete(id);
    } catch (err: any) {
      logger.error(`世界观设定删除失败: ${err.message}`);
      throw new Error(`删除世界观设定失败: ${err.message}`);
    }
  });
}
