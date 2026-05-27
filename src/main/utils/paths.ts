/**
 * 用户数据路径管理
 */
import { app } from 'electron';
import path from 'path';

/** 获取用户数据根目录 */
export function getUserDataPath(): string {
  return app.getPath('userData');
}

/** 获取数据库文件路径 */
export function getDbPath(): string {
  return path.join(app.getPath('userData'), 'data.db');
}

/** 获取备份目录路径 */
export function getBackupDir(): string {
  return path.join(app.getPath('userData'), 'backups');
}

/** 获取日志目录路径 */
export function getLogDir(): string {
  return path.join(app.getPath('userData'), 'logs');
}

/** 获取临时目录路径 */
export function getTempDir(): string {
  return path.join(app.getPath('temp'), 'novel-script-studio');
}
