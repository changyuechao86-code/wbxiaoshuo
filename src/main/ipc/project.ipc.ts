import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import type { CreateProjectDTO, UpdateProjectDTO } from '../../shared/types';
import { projectRepo } from '../db/repositories/project.repo';
import { logger } from '../utils/logger';

const text = {
  createFailed: '\u521b\u5efa\u9879\u76ee\u5931\u8d25',
  deleteFailed: '\u5220\u9664\u9879\u76ee\u5931\u8d25',
  getFailed: '\u83b7\u53d6\u9879\u76ee\u5931\u8d25',
  listFailed: '\u83b7\u53d6\u9879\u76ee\u5217\u8868\u5931\u8d25',
  nameRequired: '\u9879\u76ee\u540d\u79f0\u4e0d\u80fd\u4e3a\u7a7a',
  notFound: '\u9879\u76ee\u4e0d\u5b58\u5728',
  updateFailed: '\u66f4\u65b0\u9879\u76ee\u5931\u8d25',
};

function withDetail(prefix: string, err: any): Error {
  return new Error(`${prefix}${err?.message ? `: ${err.message}` : ''}`);
}

export function registerProjectHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.PROJECT_LIST, async () => {
    try {
      return projectRepo.list();
    } catch (err: any) {
      logger.error(`Project list failed: ${err.message}`);
      throw withDetail(text.listFailed, err);
    }
  });

  ipcMain.handle(IPC_CHANNELS.PROJECT_GET, async (_event, id: string) => {
    try {
      const project = projectRepo.getById(id);
      if (!project) throw new Error(`${text.notFound}: ${id}`);
      return project;
    } catch (err: any) {
      logger.error(`Project get failed: ${err.message}`);
      throw withDetail(text.getFailed, err);
    }
  });

  ipcMain.handle(IPC_CHANNELS.PROJECT_CREATE, async (_event, data: CreateProjectDTO) => {
    try {
      if (!data.name?.trim()) throw new Error(text.nameRequired);
      return projectRepo.create(data);
    } catch (err: any) {
      logger.error(`Project create failed: ${err.message}`);
      throw withDetail(text.createFailed, err);
    }
  });

  ipcMain.handle(IPC_CHANNELS.PROJECT_UPDATE, async (_event, id: string, data: UpdateProjectDTO) => {
    try {
      return projectRepo.update(id, data);
    } catch (err: any) {
      logger.error(`Project update failed: ${err.message}`);
      throw withDetail(text.updateFailed, err);
    }
  });

  ipcMain.handle(IPC_CHANNELS.PROJECT_DELETE, async (_event, id: string) => {
    try {
      projectRepo.delete(id);
    } catch (err: any) {
      logger.error(`Project delete failed: ${err.message}`);
      throw withDetail(text.deleteFailed, err);
    }
  });
}
