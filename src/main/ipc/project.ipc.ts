/**
 * Project IPC 处理器 — 项目 CRUD
 */
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { projectRepo } from '../db/repositories/project.repo';
import { logger } from '../utils/logger';
import type { CreateProjectDTO, UpdateProjectDTO } from '../../shared/types';

export function registerProjectHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.PROJECT_LIST, async () => {
    try {
      return projectRepo.list();
    } catch (err: any) {
      logger.error(`项目列表获取失败: ${err.message}`);
      throw new Error(`获取项目列表失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.PROJECT_GET, async (_event, id: string) => {
    try {
      const project = projectRepo.getById(id);
      if (!project) throw new Error(`项目不存在: ${id}`);
      return project;
    } catch (err: any) {
      logger.error(`项目获取失败: ${err.message}`);
      throw new Error(`获取项目失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.PROJECT_CREATE, async (_event, data: CreateProjectDTO) => {
    try {
      if (!data.name?.trim()) throw new Error('项目名称不能为空');
      return projectRepo.create(data);
    } catch (err: any) {
      logger.error(`项目创建失败: ${err.message}`);
      throw new Error(`创建项目失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.PROJECT_UPDATE, async (_event, id: string, data: UpdateProjectDTO) => {
    try {
      return projectRepo.update(id, data);
    } catch (err: any) {
      logger.error(`项目更新失败: ${err.message}`);
      throw new Error(`更新项目失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.PROJECT_DELETE, async (_event, id: string) => {
    try {
      projectRepo.delete(id);
    } catch (err: any) {
      logger.error(`项目删除失败: ${err.message}`);
      throw new Error(`删除项目失败: ${err.message}`);
    }
  });
}
