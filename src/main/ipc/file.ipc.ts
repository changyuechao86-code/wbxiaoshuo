import { dialog, ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { backupDatabase, exportDatabase, importDatabase, restoreDatabase } from '../services/backup.service';
import { getUserDataPath } from '../utils/paths';
import { logger } from '../utils/logger';

const DB_FILTERS = [{ name: 'SQLite database', extensions: ['db'] }];

export function registerFileHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.FILE_BACKUP, async () => {
    try {
      return await backupDatabase();
    } catch (err: any) {
      logger.error(`Backup failed: ${err.message}`);
      throw new Error(`Backup failed: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.FILE_RESTORE, async (_event, filePath?: string) => {
    try {
      let sourcePath = filePath;
      if (!sourcePath) {
        const result = await dialog.showOpenDialog({
          title: 'Choose backup file',
          filters: DB_FILTERS,
          properties: ['openFile'],
        });
        if (result.canceled || result.filePaths.length === 0) {
          return false;
        }
        sourcePath = result.filePaths[0];
      }
      await restoreDatabase(sourcePath);
      return true;
    } catch (err: any) {
      logger.error(`Restore failed: ${err.message}`);
      throw new Error(`Restore failed: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.FILE_EXPORT, async () => {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Export database',
        defaultPath: `novel-studio-export-${new Date().toISOString().slice(0, 10)}.db`,
        filters: DB_FILTERS,
      });
      if (result.canceled || !result.filePath) {
        return '';
      }

      await exportDatabase(result.filePath);
      return result.filePath;
    } catch (err: any) {
      logger.error(`Export failed: ${err.message}`);
      throw new Error(`Export failed: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.FILE_IMPORT, async (_event, filePath?: string) => {
    try {
      let sourcePath = filePath;
      if (!sourcePath) {
        const result = await dialog.showOpenDialog({
          title: 'Import database',
          filters: DB_FILTERS,
          properties: ['openFile'],
        });
        if (result.canceled || result.filePaths.length === 0) {
          return false;
        }
        sourcePath = result.filePaths[0];
      }
      await importDatabase(sourcePath);
      return true;
    } catch (err: any) {
      logger.error(`Import failed: ${err.message}`);
      throw new Error(`Import failed: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.APP_GET_PATH, async () => {
    return getUserDataPath();
  });
}
