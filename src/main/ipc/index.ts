import { BrowserWindow, ipcMain } from 'electron';
import { logger } from '../utils/logger';
import { registerAIHandlers } from './ai.ipc';
import { registerChapterHandlers } from './chapter.ipc';
import { registerCharacterHandlers } from './character.ipc';
import { registerCheckinHandlers } from './checkin.ipc';
import { registerFileHandlers } from './file.ipc';
import { registerForeshadowingHandlers } from './foreshadowing.ipc';
import { registerOutlineHandlers } from './outline.ipc';
import { registerProjectHandlers } from './project.ipc';
import { registerRevenueHandlers } from './revenue.ipc';
import { registerStoryboardHandlers } from './storyboard.ipc';
import { registerWorldSettingHandlers } from './world-setting.ipc';

export function registerAllHandlers(): void {
  logger.info('Registering IPC handlers...');

  try {
    registerProjectHandlers();
    registerChapterHandlers();
    registerCharacterHandlers();
    registerOutlineHandlers();
    registerWorldSettingHandlers();
    registerForeshadowingHandlers();
    registerRevenueHandlers();
    registerCheckinHandlers();
    registerStoryboardHandlers();
    registerAIHandlers();
    registerFileHandlers();

    ipcMain.on('app:minimize', (event) => {
      BrowserWindow.fromWebContents(event.sender)?.minimize();
    });
    ipcMain.on('app:maximize', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) {
        win.isMaximized() ? win.unmaximize() : win.maximize();
      }
    });
    ipcMain.on('app:close', (event) => {
      BrowserWindow.fromWebContents(event.sender)?.close();
    });

    logger.info('IPC handlers registered.');
  } catch (err: any) {
    logger.error(`IPC handler registration failed: ${err.message}`);
    throw err;
  }
}
