/**
 * IPC 处理器注册入口
 * 集中注册所有 IPC handlers，支持动态扩展
 */
import { ipcMain } from 'electron';
import { logger } from '../utils/logger';
import { registerProjectHandlers } from './project.ipc';
import { registerChapterHandlers } from './chapter.ipc';
import { registerCharacterHandlers } from './character.ipc';
import { registerOutlineHandlers } from './outline.ipc';
import { registerWorldSettingHandlers } from './world-setting.ipc';
import { registerForeshadowingHandlers } from './foreshadowing.ipc';
import { registerRevenueHandlers } from './revenue.ipc';
import { registerCheckinHandlers } from './checkin.ipc';
import { registerStoryboardHandlers } from './storyboard.ipc';
import { registerAIHandlers } from './ai.ipc';
import { registerFileHandlers } from './file.ipc';

/** 注册所有 IPC 处理器 */
export function registerAllHandlers(): void {
  logger.info('注册 IPC 处理器...');

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

    // 注册窗口控制 handlers
    ipcMain.on('app:minimize', (event) => {
      event.sender.getOwnerBrowserWindow()?.minimize();
    });
    ipcMain.on('app:maximize', (event) => {
      const win = event.sender.getOwnerBrowserWindow();
      if (win) {
        win.isMaximized() ? win.unmaximize() : win.maximize();
      }
    });
    ipcMain.on('app:close', (event) => {
      event.sender.getOwnerBrowserWindow()?.close();
    });

    logger.info('IPC 处理器注册完成 (11 个模块)');
  } catch (err: any) {
    logger.error(`IPC 处理器注册失败: ${err.message}`);
    throw err;
  }
}
