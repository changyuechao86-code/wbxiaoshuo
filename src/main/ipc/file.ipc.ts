/**
 * File IPC 处理器 — 备份/恢复/导入/导出
 */
import { ipcMain, dialog } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { backupDatabase, restoreDatabase, exportDatabase, importDatabase } from '../services/backup.service';
import { getUserDataPath } from '../utils/paths';
import { logger } from '../utils/logger';

export function registerFileHandlers(): void {
  // 手动备份
  ipcMain.handle(IPC_CHANNELS.FILE_BACKUP, async () => {
    try {
      const path = await backupDatabase();
      return path;
    } catch (err: any) {
      logger.error(`备份失败: ${err.message}`);
      throw new Error(`备份失败: ${err.message}`);
    }
  });

  // 从备份恢复
  ipcMain.handle(IPC_CHANNELS.FILE_RESTORE, async (_event, filePath?: string) => {
    try {
      let sourcePath = filePath;
      if (!sourcePath) {
        const result = await dialog.showOpenDialog({
          title: '选择备份文件',
          filters: [{ name: '数据库文件', extensions: ['db'] }],
          properties: ['openFile'],
        });
        if (result.canceled || result.filePaths.length === 0) {
          throw new Error('用户取消了恢复操作');
        }
        sourcePath = result.filePaths[0];
      }
      await restoreDatabase(sourcePath);
    } catch (err: any) {
      logger.error(`恢复失败: ${err.message}`);
      throw new Error(`恢复失败: ${err.message}`);
    }
  });

  // 导出数据库
  ipcMain.handle(IPC_CHANNELS.FILE_EXPORT, async () => {
    try {
      const result = await dialog.showSaveDialog({
        title: '导出数据库',
        defaultPath: `novel-studio-export-${new Date().toISOString().slice(0, 10)}.db`,
        filters: [{ name: '数据库文件', extensions: ['db'] }],
      });
      if (result.canceled || !result.filePath) {
        throw new Error('用户取消了导出操作');
      }
      await exportDatabase(result.filePath);
      return result.filePath;
    } catch (err: any) {
      logger.error(`导出失败: ${err.message}`);
      throw new Error(`导出失败: ${err.message}`);
    }
  });

  // 导入数据库
  ipcMain.handle(IPC_CHANNELS.FILE_IMPORT, async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: '导入数据库',
        filters: [{ name: '数据库文件', extensions: ['db'] }],
        properties: ['openFile'],
      });
      if (result.canceled || result.filePaths.length === 0) {
        throw new Error('用户取消了导入操作');
      }
      await importDatabase(result.filePaths[0]);
    } catch (err: any) {
      logger.error(`导入失败: ${err.message}`);
      throw new Error(`导入失败: ${err.message}`);
    }
  });

  // 获取用户数据路径
  ipcMain.handle(IPC_CHANNELS.APP_GET_PATH, async () => {
    return getUserDataPath();
  });
}
