import { dialog, ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import type { ChapterExportRequest, ExportFormat } from '../../shared/types';
import { backupDatabase, exportDatabase, importDatabase, restoreDatabase } from '../services/backup.service';
import { exportChapters } from '../services/export.service';
import { getUserDataPath } from '../utils/paths';
import { logger } from '../utils/logger';

const DB_FILTERS = [{ name: 'SQLite database', extensions: ['db'] }];
const EXPORT_FILTERS: Record<ExportFormat, Electron.FileFilter> = {
  txt: { name: 'Text file', extensions: ['txt'] },
  markdown: { name: 'Markdown file', extensions: ['md'] },
  html: { name: 'HTML file', extensions: ['html'] },
  jimeng: { name: 'Jimeng prompts', extensions: ['txt'] },
};

const EXPORT_EXTENSIONS: Record<ExportFormat, string> = {
  txt: 'txt',
  markdown: 'md',
  html: 'html',
  jimeng: 'txt',
};

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

  ipcMain.handle(IPC_CHANNELS.CHAPTER_EXPORT, async (_event, request: ChapterExportRequest) => {
    try {
      const extension = EXPORT_EXTENSIONS[request.format];
      const result = await dialog.showSaveDialog({
        title: 'Export chapters',
        defaultPath: `novel-chapters-${new Date().toISOString().slice(0, 10)}.${extension}`,
        filters: [EXPORT_FILTERS[request.format]],
      });
      if (result.canceled || !result.filePath) {
        return '';
      }

      return await exportChapters({ ...request, outputPath: result.filePath });
    } catch (err: any) {
      logger.error(`Chapter export failed: ${err.message}`);
      throw new Error(`Chapter export failed: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.APP_GET_PATH, async () => {
    return getUserDataPath();
  });
}
