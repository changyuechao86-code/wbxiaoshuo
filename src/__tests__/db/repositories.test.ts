import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

// These SQL-level tests exercise the repository schema without touching the
// app's singleton DatabaseConnection. In local dev the installed
// better-sqlite3 binary may be rebuilt for Electron instead of Node, so probe
// the constructor before registering the suites.

type DatabaseModule = typeof import('better-sqlite3');
type Database = import('better-sqlite3').Database;

let BetterSqlite3: DatabaseModule | null = null;
let sqliteLoadError: unknown;
let db: Database | null = null;

try {
  BetterSqlite3 = require('better-sqlite3') as DatabaseModule;
  const probe = new BetterSqlite3(':memory:');
  probe.close();
} catch (error) {
  BetterSqlite3 = null;
  sqliteLoadError = error;
}

const describeSql = BetterSqlite3 ? describe : describe.skip;

if (sqliteLoadError) {
  console.warn(
    `Skipping repository SQL tests: better-sqlite3 native binding cannot run in this Node runtime. ${
      sqliteLoadError instanceof Error ? sqliteLoadError.message : String(sqliteLoadError)
    }`,
  );
}

function getDb(): Database {
  if (!db) {
    throw new Error('Test database was not initialized.');
  }
  return db;
}

beforeAll(() => {
  if (!BetterSqlite3) return;

  db = new BetterSqlite3(':memory:');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'novel' CHECK(type IN ('novel', 'script')),
      daily_goal INTEGER NOT NULL DEFAULT 4100,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      plain_text TEXT NOT NULL DEFAULT '',
      word_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'writing', 'completed')),
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      aliases TEXT NOT NULL DEFAULT '[]',
      appearance TEXT NOT NULL DEFAULT '',
      personality TEXT NOT NULL DEFAULT '',
      background TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      avatar TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS outlines (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT 'chapter' CHECK(type IN ('volume', 'chapter')),
      parent_id TEXT,
      chapter_id TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      note TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);
});

afterAll(() => {
  db?.close();
  db = null;
});

describeSql('Project Repository (SQL tests)', () => {
  beforeEach(() => {
    getDb().exec('DELETE FROM projects');
  });

  it('inserts a project', () => {
    const database = getDb();
    const id = 'proj-001';
    const now = new Date().toISOString();

    database
      .prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run(id, 'Test Project', 'novel', 4100, now, now);

    const row = database.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
    expect(row.name).toBe('Test Project');
    expect(row.type).toBe('novel');
    expect(row.daily_goal).toBe(4100);
  });

  it('lists projects ordered by updated_at descending', () => {
    const database = getDb();
    const now = new Date().toISOString();

    database
      .prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run('a', 'Project A', 'novel', 3000, now, '2024-01-01');
    database
      .prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run('b', 'Project B', 'script', 500, now, '2024-06-01');

    const rows = database.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as any[];
    expect(rows[0].name).toBe('Project B');
    expect(rows[1].name).toBe('Project A');
  });

  it('updates a project name', () => {
    const database = getDb();
    const id = 'proj-002';
    const now = new Date().toISOString();

    database
      .prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run(id, 'Old Name', 'novel', 2000, now, now);
    database.prepare('UPDATE projects SET name = ?, updated_at = ? WHERE id = ?').run('New Name', now, id);

    const row = database.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
    expect(row.name).toBe('New Name');
  });

  it('deletes project children through cascade', () => {
    const database = getDb();
    const projId = 'proj-cascade';
    const now = new Date().toISOString();

    database
      .prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run(projId, 'Cascade Project', 'novel', 1000, now, now);
    database
      .prepare('INSERT INTO chapters (id, project_id, title, content, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run('ch-1', projId, 'Chapter 1', '{}', now, now);

    database.prepare('DELETE FROM projects WHERE id = ?').run(projId);

    expect(database.prepare('SELECT * FROM projects WHERE id = ?').all(projId)).toHaveLength(0);
    expect(database.prepare('SELECT * FROM chapters WHERE project_id = ?').all(projId)).toHaveLength(0);
  });

  it('rejects an invalid project type', () => {
    expect(() => {
      getDb()
        .prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
        .run('bad', 'Bad', 'invalid', 1000, 'now', 'now');
    }).toThrow();
  });
});

describeSql('Chapter Repository (SQL tests)', () => {
  let projId: string;
  const now = new Date().toISOString();

  beforeEach(() => {
    const database = getDb();
    database.exec('DELETE FROM chapters');
    database.exec('DELETE FROM projects');
    projId = 'proj-ch';
    database
      .prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run(projId, 'Chapter Project', 'novel', 4100, now, now);
  });

  it('inserts and retrieves a chapter', () => {
    const database = getDb();

    database
      .prepare(
        'INSERT INTO chapters (id, project_id, title, content, plain_text, word_count, status, sort_order, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
      )
      .run('ch-1', projId, 'Chapter 1', '{"type":"doc"}', 'Chapter text', 12, 'draft', 0, now, now);

    const row = database.prepare('SELECT * FROM chapters WHERE id = ?').get('ch-1') as any;
    expect(row.title).toBe('Chapter 1');
    expect(row.plain_text).toBe('Chapter text');
    expect(row.word_count).toBe(12);
    expect(row.status).toBe('draft');
  });

  it('lists chapters by project ordered by sort_order', () => {
    const database = getDb();

    database
      .prepare('INSERT INTO chapters (id, project_id, title, content, created_at, updated_at, sort_order) VALUES (?,?,?,?,?,?,?)')
      .run('c2', projId, 'Chapter 2', '{}', now, now, 1);
    database
      .prepare('INSERT INTO chapters (id, project_id, title, content, created_at, updated_at, sort_order) VALUES (?,?,?,?,?,?,?)')
      .run('c1', projId, 'Chapter 1', '{}', now, now, 0);

    const rows = database.prepare('SELECT * FROM chapters WHERE project_id = ? ORDER BY sort_order').all(projId) as any[];
    expect(rows.map((row) => row.title)).toEqual(['Chapter 1', 'Chapter 2']);
  });

  it('reorders chapters', () => {
    const database = getDb();

    database
      .prepare('INSERT INTO chapters (id, project_id, title, content, created_at, updated_at, sort_order) VALUES (?,?,?,?,?,?,?)')
      .run('ca', projId, 'A', '{}', now, now, 0);
    database
      .prepare('INSERT INTO chapters (id, project_id, title, content, created_at, updated_at, sort_order) VALUES (?,?,?,?,?,?,?)')
      .run('cb', projId, 'B', '{}', now, now, 1);

    database.prepare('UPDATE chapters SET sort_order = 10 WHERE id = ? AND project_id = ?').run('ca', projId);
    database.prepare('UPDATE chapters SET sort_order = 0 WHERE id = ? AND project_id = ?').run('cb', projId);

    const rows = database.prepare('SELECT * FROM chapters WHERE project_id = ? ORDER BY sort_order').all(projId) as any[];
    expect(rows.map((row) => row.id)).toEqual(['cb', 'ca']);
  });

  it('rejects an invalid chapter status', () => {
    expect(() => {
      getDb()
        .prepare('INSERT INTO chapters (id, project_id, title, content, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?)')
        .run('bad', projId, 'Bad', '{}', 'invalid', now, now);
    }).toThrow();
  });
});

describeSql('Character Repository (SQL tests)', () => {
  let projId: string;
  const now = new Date().toISOString();

  beforeEach(() => {
    const database = getDb();
    database.exec('DELETE FROM characters');
    database.exec('DELETE FROM projects');
    projId = 'proj-char';
    database
      .prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run(projId, 'Character Project', 'novel', 4100, now, now);
  });

  it('inserts a character', () => {
    const database = getDb();

    database
      .prepare(
        'INSERT INTO characters (id, project_id, name, aliases, appearance, personality, background, tags, avatar, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      )
      .run('char-1', projId, 'Lin Shen', '["Lin"]', 'Tall', 'Calm', 'Wanderer', '["lead"]', null, now, now);

    const row = database.prepare('SELECT * FROM characters WHERE id = ?').get('char-1') as any;
    expect(row.name).toBe('Lin Shen');
    expect(row.personality).toBe('Calm');
  });

  it('lists characters by project ordered by name', () => {
    const database = getDb();

    database
      .prepare('INSERT INTO characters (id, project_id, name, created_at, updated_at) VALUES (?,?,?,?,?)')
      .run('c1', projId, 'Alice', now, now);
    database
      .prepare('INSERT INTO characters (id, project_id, name, created_at, updated_at) VALUES (?,?,?,?,?)')
      .run('c2', projId, 'Bob', now, now);

    const rows = database.prepare('SELECT * FROM characters WHERE project_id = ? ORDER BY name').all(projId) as any[];
    expect(rows.map((row) => row.name)).toEqual(['Alice', 'Bob']);
  });

  it('updates a character', () => {
    const database = getDb();

    database
      .prepare('INSERT INTO characters (id, project_id, name, created_at, updated_at) VALUES (?,?,?,?,?)')
      .run('char-u', projId, 'Old Character', now, now);
    database.prepare('UPDATE characters SET name = ?, updated_at = ? WHERE id = ?').run('New Character', now, 'char-u');

    const row = database.prepare('SELECT * FROM characters WHERE id = ?').get('char-u') as any;
    expect(row.name).toBe('New Character');
  });
});

describeSql('Outline Repository (SQL tests)', () => {
  let projId: string;
  const now = new Date().toISOString();

  beforeEach(() => {
    const database = getDb();
    database.exec('DELETE FROM outlines');
    database.exec('DELETE FROM projects');
    projId = 'proj-out';
    database
      .prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run(projId, 'Outline Project', 'novel', 4100, now, now);
  });

  it('inserts an outline node', () => {
    const database = getDb();

    database
      .prepare('INSERT INTO outlines (id, project_id, title, type, parent_id, chapter_id, sort_order, note) VALUES (?,?,?,?,?,?,?,?)')
      .run('out-1', projId, 'Volume 1', 'volume', null, null, 0, 'Opening volume');

    const row = database.prepare('SELECT * FROM outlines WHERE id = ?').get('out-1') as any;
    expect(row.title).toBe('Volume 1');
    expect(row.type).toBe('volume');
  });

  it('keeps hierarchical outline structure', () => {
    const database = getDb();

    database
      .prepare('INSERT INTO outlines (id, project_id, title, type, parent_id, chapter_id, sort_order, note) VALUES (?,?,?,?,?,?,?,?)')
      .run('v1', projId, 'Volume 1', 'volume', null, null, 0, '');
    database
      .prepare('INSERT INTO outlines (id, project_id, title, type, parent_id, chapter_id, sort_order, note) VALUES (?,?,?,?,?,?,?,?)')
      .run('c1', projId, 'Chapter 1', 'chapter', 'v1', null, 0, '');
    database
      .prepare('INSERT INTO outlines (id, project_id, title, type, parent_id, chapter_id, sort_order, note) VALUES (?,?,?,?,?,?,?,?)')
      .run('c2', projId, 'Chapter 2', 'chapter', 'v1', null, 1, '');

    const all = database.prepare('SELECT * FROM outlines WHERE project_id = ? ORDER BY sort_order').all(projId) as any[];
    const children = all.filter((row) => row.parent_id === 'v1');

    expect(all).toHaveLength(3);
    expect(children.map((row) => row.title)).toEqual(['Chapter 1', 'Chapter 2']);
  });

  it('reorders outline items', () => {
    const database = getDb();

    database
      .prepare('INSERT INTO outlines (id, project_id, title, type, sort_order) VALUES (?,?,?,?,?)')
      .run('a', projId, 'A', 'chapter', 0);
    database
      .prepare('INSERT INTO outlines (id, project_id, title, type, sort_order) VALUES (?,?,?,?,?)')
      .run('b', projId, 'B', 'chapter', 1);

    database.prepare('UPDATE outlines SET sort_order = 10 WHERE id = ?').run('a');
    database.prepare('UPDATE outlines SET sort_order = 0 WHERE id = ?').run('b');

    const rows = database.prepare('SELECT * FROM outlines WHERE project_id = ? ORDER BY sort_order').all(projId) as any[];
    expect(rows.map((row) => row.id)).toEqual(['b', 'a']);
  });

  it('rejects an invalid outline type', () => {
    expect(() => {
      getDb()
        .prepare('INSERT INTO outlines (id, project_id, title, type, sort_order) VALUES (?,?,?,?,?)')
        .run('bad', projId, 'Bad', 'unknown', 0);
    }).toThrow();
  });
});
