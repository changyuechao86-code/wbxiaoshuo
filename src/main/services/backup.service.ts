/**
 * Backup Service — 数据库备份/恢复逻辑
 */
import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { getDbPath } from '../utils/paths';
import { logger } from '../utils/logger';

const BACKUP_DIR_NAME = 'backups';
const MAX_BACKUPS = 10;

/** 获取备份目录路径 */
function getBackupDir(): string {
  return path.join(app.getPath('userData'), BACKUP_DIR_NAME);
}

/** 确保备份目录存在 */
function ensureBackupDir(): string {
  const dir = getBackupDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/** 手动备份数据库 */
export async function backupDatabase(): Promise<string> {
  const srcPath = getDbPath();
  const destDir = ensureBackupDir();

  if (!fs.existsSync(srcPath)) {
    throw new Error('数据库文件不存在，无法备份');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${timestamp}.db`;
  const destPath = path.join(destDir, filename);

  fs.copyFileSync(srcPath, destPath);
  logger.info(`数据库备份完成: ${destPath}`);

  // 清理旧备份，保留最近 MAX_BACKUPS 个
  cleanupOldBackups(destDir);

  return destPath;
}

/** 从备份恢复数据库 */
export async function restoreDatabase(sourcePath: string): Promise<void> {
  const destPath = getDbPath();

  if (!fs.existsSync(sourcePath)) {
    throw new Error('备份文件不存在');
  }

  // 先备份当前数据库以防万一
  const preRestoreBackup = path.join(
    path.dirname(destPath),
    `pre-restore-backup-${Date.now()}.db`
  );
  if (fs.existsSync(destPath)) {
    fs.copyFileSync(destPath, preRestoreBackup);
  }

  // 执行恢复
  fs.copyFileSync(sourcePath, destPath);
  logger.info(`数据库恢复完成: ${sourcePath} → ${destPath}`);
}

/** 应用退出时的自动备份 */
export async function performAutoBackup(): Promise<void> {
  try {
    const srcPath = getDbPath();
    if (!fs.existsSync(srcPath)) {
      logger.info('数据库文件不存在，跳过自动备份');
      return;
    }

    const destDir = ensureBackupDir();
    const filename = 'auto-backup-latest.db';
    const destPath = path.join(destDir, filename);

    fs.copyFileSync(srcPath, destPath);
    logger.info('自动备份完成');
  } catch (err: any) {
    logger.warn(`自动备份失败: ${err.message}`);
  }
}

/** 清理旧备份 */
function cleanupOldBackups(dir: string): void {
  try {
    const files = fs.readdirSync(dir)
      .filter((f) => f.startsWith('backup-') && f.endsWith('.db'))
      .map((f) => ({
        name: f,
        path: path.join(dir, f),
        time: fs.statSync(path.join(dir, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    // 删除超出 MAX_BACKUPS 的旧文件
    for (let i = MAX_BACKUPS; i < files.length; i++) {
      fs.unlinkSync(files[i].path);
      logger.info(`清理旧备份: ${files[i].name}`);
    }
  } catch (err: any) {
    logger.warn(`清理旧备份失败: ${err.message}`);
  }
}

/** 导出数据库到指定路径 */
export async function exportDatabase(destPath: string): Promise<void> {
  const srcPath = getDbPath();
  if (!fs.existsSync(srcPath)) {
    throw new Error('数据库文件不存在');
  }
  fs.copyFileSync(srcPath, destPath);
  logger.info(`数据库导出完成: ${destPath}`);
}

/** 从指定路径导入数据库 */
export async function importDatabase(sourcePath: string): Promise<void> {
  if (!fs.existsSync(sourcePath)) {
    throw new Error('导入文件不存在');
  }
  // 导入是 restore 的别名
  await restoreDatabase(sourcePath);
}
