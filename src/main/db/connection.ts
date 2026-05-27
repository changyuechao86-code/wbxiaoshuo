import BetterSqlite3 from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import { MigrationRunner } from './migrations';

let db: BetterSqlite3.Database | null = null;

export class DatabaseConnection {
  private static instance: DatabaseConnection;

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  getDb(): BetterSqlite3.Database {
    if (!db) {
      const dbPath = path.join(app.getPath('userData'), 'data.db');
      db = new BetterSqlite3(dbPath);
      db.pragma('journal_mode = WAL');
      db.pragma('foreign_keys = ON');

      const migrator = new MigrationRunner();
      migrator.run(db);
    }
    return db;
  }

  close(): void {
    if (db) {
      db.close();
      db = null;
    }
  }
}

export function getDb(): BetterSqlite3.Database {
  return DatabaseConnection.getInstance().getDb();
}

export function initDatabase(): void {
  DatabaseConnection.getInstance().getDb();
}

export function closeDatabase(): void {
  DatabaseConnection.getInstance().close();
}
