/**
 * 主进程日志工具
 * 轻量级日志记录，输出到控制台和文件
 */
import fs from 'fs';
import path from 'path';
import { getLogDir } from './paths';

const LOG_LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR'] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

class Logger {
  private logDir: string = '';
  private currentLogFile: string = '';
  private logStream: fs.WriteStream | null = null;
  private initialized = false;

  private ensureInit(): void {
    if (this.initialized) return;
    try {
      this.logDir = getLogDir();
      this.currentLogFile = path.join(this.logDir, `app-${this.getDateString()}.log`);
      this.ensureLogDir();
      this.openLogStream();
      this.initialized = true;
    } catch {
      // 如果 app 还没就绪，跳过文件日志
    }
  }

  private getDateString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private openLogStream(): void {
    if (this.logStream) {
      this.logStream.end();
    }
    this.logStream = fs.createWriteStream(this.currentLogFile, { flags: 'a' });
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  private write(level: LogLevel, message: string): void {
    this.ensureInit();
    const formatted = this.formatMessage(level, message);

    // 控制台输出
    switch (level) {
      case 'ERROR':
        console.error(formatted);
        break;
      case 'WARN':
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
    }

    // 文件输出
    if (this.logStream) {
      this.logStream.write(formatted + '\n');
    }
  }

  debug(message: string): void {
    this.write('DEBUG', message);
  }

  info(message: string): void {
    this.write('INFO', message);
  }

  warn(message: string): void {
    this.write('WARN', message);
  }

  error(message: string): void {
    this.write('ERROR', message);
  }

  close(): void {
    if (this.logStream) {
      this.logStream.end();
      this.logStream = null;
    }
  }
}

export const logger = new Logger();
