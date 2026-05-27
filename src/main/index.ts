import electron from 'electron';
import { createMainWindow, getMainWindow } from './window';
import { registerAllHandlers } from './ipc';
import { initDatabase, closeDatabase } from './db/connection';
import { logger } from './utils/logger';
import { performAutoBackup } from './services/backup.service';

const { app, BrowserWindow } = electron;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

app.on('second-instance', () => {
  const win = getMainWindow();
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.whenReady().then(async () => {
  logger.info('App starting...');

  try {
    initDatabase();
    logger.info('Database connection established');
  } catch (err: any) {
    logger.error(`Database initialization failed: ${err.message}`);
  }

  registerAllHandlers();
  logger.info('IPC handlers registered');

  createMainWindow();
  logger.info('Main window created');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', async () => {
  try {
    await performAutoBackup();
    logger.info('Auto backup completed');
  } catch (err: any) {
    logger.warn(`Auto backup failed: ${err.message}`);
  }

  closeDatabase();
  logger.info('Database closed');

  logger.close();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  closeDatabase();
});
