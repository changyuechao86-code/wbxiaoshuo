import { dialog, ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import type { ChapterExportRequest, ExportFormat } from '../../shared/types';
import { backupDatabase, exportDatabase, importDatabase, restoreDatabase } from '../services/backup.service';
import { exportChapters } from '../services/export.service';
import { getUserDataPath } from '../utils/paths';
import { logger } from '../utils/logger';

const text = {
  backupFailed: '\u5907\u4efd\u5931\u8d25',
  chooseBackup: '\u9009\u62e9\u5907\u4efd\u6587\u4ef6',
  chooseImport: '\u9009\u62e9\u8981\u5bfc\u5165\u7684\u6570\u636e\u5e93',
  databaseFilter: '\u0053\u0051\u004c\u0069\u0074\u0065 \u6570\u636e\u5e93',
  exportChapters: '\u5bfc\u51fa\u7ae0\u8282',
  exportDatabase: '\u5bfc\u51fa\u6570\u636e\u5e93',
  exportDatabaseFailed: '\u5bfc\u51fa\u6570\u636e\u5e93\u5931\u8d25',
  importFailed: '\u5bfc\u5165\u5931\u8d25',
  restoreFailed: '\u6062\u590d\u5931\u8d25',
  textFilter: '\u6587\u672c\u6587\u4ef6',
  markdownFilter: '\u004d\u0061\u0072\u006b\u0064\u006f\u0077\u006e \u6587\u4ef6',
  htmlFilter: '\u0048\u0054\u004d\u004c \u6587\u4ef6',
  jimengFilter: '\u5373\u68a6\u63d0\u793a\u8bcd',
  chapterExportFailed: '\u7ae0\u8282\u5bfc\u51fa\u5931\u8d25',
};

const DB_FILTERS = [{ name: text.databaseFilter, extensions: ['db'] }];
const EXPORT_FILTERS: Record<ExportFormat, Electron.FileFilter> = {
  txt: { name: text.textFilter, extensions: ['txt'] },
  markdown: { name: text.markdownFilter, extensions: ['md'] },
  html: { name: text.htmlFilter, extensions: ['html'] },
  jimeng: { name: text.jimengFilter, extensions: ['txt'] },
};

const EXPORT_EXTENSIONS: Record<ExportFormat, string> = {
  txt: 'txt',
  markdown: 'md',
  html: 'html',
  jimeng: 'txt',
};

function buildUserError(prefix: string, err: any): Error {
  const detail = err?.message ? `: ${err.message}` : '';
  return new Error(`${prefix}${detail}`);
}

export function registerFileHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.FILE_BACKUP, async () => {
    try {
      return await backupDatabase();
    } catch (err: any) {
      logger.error(`Backup failed: ${err.message}`);
      throw buildUserError(text.backupFailed, err);
    }
  });

  ipcMain.handle(IPC_CHANNELS.FILE_RESTORE, async (_event, filePath?: string) => {
    try {
      let sourcePath = filePath;
      if (!sourcePath) {
        const result = await dialog.showOpenDialog({
          title: text.chooseBackup,
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
      throw buildUserError(text.restoreFailed, err);
    }
  });

  ipcMain.handle(IPC_CHANNELS.FILE_EXPORT, async () => {
    try {
      const result = await dialog.showSaveDialog({
        title: text.exportDatabase,
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
      throw buildUserError(text.exportDatabaseFailed, err);
    }
  });

  ipcMain.handle(IPC_CHANNELS.FILE_IMPORT, async (_event, filePath?: string) => {
    try {
      let sourcePath = filePath;
      if (!sourcePath) {
        const result = await dialog.showOpenDialog({
          title: text.chooseImport,
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
      throw buildUserError(text.importFailed, err);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHAPTER_EXPORT, async (_event, request: ChapterExportRequest) => {
    try {
      const extension = EXPORT_EXTENSIONS[request.format];
      const result = await dialog.showSaveDialog({
        title: text.exportChapters,
        defaultPath: `novel-chapters-${new Date().toISOString().slice(0, 10)}.${extension}`,
        filters: [EXPORT_FILTERS[request.format]],
      });
      if (result.canceled || !result.filePath) {
        return '';
      }

      return await exportChapters({ ...request, outputPath: result.filePath });
    } catch (err: any) {
      logger.error(`Chapter export failed: ${err.message}`);
      throw buildUserError(text.chapterExportFailed, err);
    }
  });

  ipcMain.handle(IPC_CHANNELS.APP_GET_PATH, async () => {
    return getUserDataPath();
  });
}
