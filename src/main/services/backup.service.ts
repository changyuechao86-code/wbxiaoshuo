import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { getDbPath } from '../utils/paths';
import { logger } from '../utils/logger';

const BACKUP_DIR_NAME = 'backups';
const MAX_BACKUPS = 10;

const text = {
  backupMissingSource: '\u6570\u636e\u5e93\u6587\u4ef6\u4e0d\u5b58\u5728\uff0c\u65e0\u6cd5\u5907\u4efd\u3002',
  importMissingSource: '\u5bfc\u5165\u6587\u4ef6\u4e0d\u5b58\u5728\u3002',
  missingDatabase: '\u6570\u636e\u5e93\u6587\u4ef6\u4e0d\u5b58\u5728\u3002',
  restoreMissingSource: '\u5907\u4efd\u6587\u4ef6\u4e0d\u5b58\u5728\u3002',
};

function getBackupDir(): string {
  return path.join(app.getPath('userData'), BACKUP_DIR_NAME);
}

function ensureBackupDir(): string {
  const dir = getBackupDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export async function backupDatabase(): Promise<string> {
  const srcPath = getDbPath();
  const destDir = ensureBackupDir();

  if (!fs.existsSync(srcPath)) {
    throw new Error(text.backupMissingSource);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${timestamp}.db`;
  const destPath = path.join(destDir, filename);

  fs.copyFileSync(srcPath, destPath);
  logger.info(`Database backup completed: ${destPath}`);

  cleanupOldBackups(destDir);

  return destPath;
}

export async function restoreDatabase(sourcePath: string): Promise<void> {
  const destPath = getDbPath();

  if (!fs.existsSync(sourcePath)) {
    throw new Error(text.restoreMissingSource);
  }

  const preRestoreBackup = path.join(
    path.dirname(destPath),
    `pre-restore-backup-${Date.now()}.db`,
  );

  if (fs.existsSync(destPath)) {
    fs.copyFileSync(destPath, preRestoreBackup);
    logger.info(`Pre-restore backup created: ${preRestoreBackup}`);
  }

  fs.copyFileSync(sourcePath, destPath);
  logger.info(`Database restored: ${sourcePath} -> ${destPath}`);
}

export async function performAutoBackup(): Promise<void> {
  try {
    const srcPath = getDbPath();
    if (!fs.existsSync(srcPath)) {
      logger.info('Database file does not exist, skipping auto backup.');
      return;
    }

    const destDir = ensureBackupDir();
    const destPath = path.join(destDir, 'auto-backup-latest.db');

    fs.copyFileSync(srcPath, destPath);
    logger.info(`Auto backup completed: ${destPath}`);
  } catch (err: any) {
    logger.warn(`Auto backup failed: ${err.message}`);
  }
}

function cleanupOldBackups(dir: string): void {
  try {
    const files = fs.readdirSync(dir)
      .filter((file) => file.startsWith('backup-') && file.endsWith('.db'))
      .map((file) => {
        const filePath = path.join(dir, file);
        return {
          name: file,
          path: filePath,
          time: fs.statSync(filePath).mtime.getTime(),
        };
      })
      .sort((a, b) => b.time - a.time);

    for (let i = MAX_BACKUPS; i < files.length; i++) {
      fs.unlinkSync(files[i].path);
      logger.info(`Old backup removed: ${files[i].name}`);
    }
  } catch (err: any) {
    logger.warn(`Failed to clean old backups: ${err.message}`);
  }
}

export async function exportDatabase(destPath: string): Promise<void> {
  const srcPath = getDbPath();
  if (!fs.existsSync(srcPath)) {
    throw new Error(text.missingDatabase);
  }

  fs.copyFileSync(srcPath, destPath);
  logger.info(`Database exported: ${destPath}`);
}

export async function importDatabase(sourcePath: string): Promise<void> {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(text.importMissingSource);
  }

  await restoreDatabase(sourcePath);
}
