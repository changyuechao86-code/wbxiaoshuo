import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import BetterSqlite3 from 'better-sqlite3';

// We need to test repositories in isolation with an in-memory DB.
// The Repository classes use DatabaseConnection singleton, so we can't easily
// inject an :memory: DB. Instead, we test the SQL schema and queries directly.

let db: BetterSqlite3.Database;

beforeAll(() => {
  db = new BetterSqlite3(':memory:');
  db.pragma('foreign_keys = ON');

  // Apply schema from migrations
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
      "order" INTEGER NOT NULL DEFAULT 0,
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
      "order" INTEGER NOT NULL DEFAULT 0,
      note TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);
});

afterAll(() => {
  db.close();
});

describe('Project Repository (SQL tests)', () => {
  beforeEach(() => {
    db.exec('DELETE FROM projects');
  });

  it('insert project', () => {
    const id = 'proj-001';
    const now = new Date().toISOString();
    db.prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run(id, '测试项目', 'novel', 4100, now, now);

    const row: any = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    expect(row.name).toBe('测试项目');
    expect(row.type).toBe('novel');
    expect(row.daily_goal).toBe(4100);
  });

  it('list projects ordered by updated_at DESC', () => {
    const now = new Date().toISOString();
    db.prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run('a', 'A项目', 'novel', 3000, now, '2024-01-01');
    db.prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run('b', 'B项目', 'script', 500, now, '2024-06-01');

    const rows: any[] = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all();
    expect(rows[0].name).toBe('B项目');
    expect(rows[1].name).toBe('A项目');
  });

  it('update project name', () => {
    const id = 'proj-002';
    const now = new Date().toISOString();
    db.prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run(id, '旧名', 'novel', 2000, now, now);

    db.prepare('UPDATE projects SET name = ?, updated_at = ? WHERE id = ?')
      .run('新名', new Date().toISOString(), id);

    const row: any = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    expect(row.name).toBe('新名');
  });

  it('delete project cascades', () => {
    const projId = 'proj-cascade';
    const now = new Date().toISOString();
    db.prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run(projId, '测试', 'novel', 1000, now, now);
    db.prepare('INSERT INTO chapters (id, project_id, title, content, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run('ch-1', projId, '章节', '{}', now, now);

    db.prepare('DELETE FROM projects WHERE id = ?').run(projId);

    const projects = db.prepare('SELECT * FROM projects WHERE id = ?').all(projId);
    expect(projects).toHaveLength(0);

    const chapters = db.prepare('SELECT * FROM chapters WHERE project_id = ?').all(projId);
    expect(chapters).toHaveLength(0); // CASCADE delete
  });

  it('type CHECK constraint rejects invalid type', () => {
    expect(() => {
      db.prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
        .run('bad', 'Bad', 'invalid', 1000, 'now', 'now');
    }).toThrow();
  });
});

describe('Chapter Repository (SQL tests)', () => {
  let projId: string;
  const now = new Date().toISOString();

  beforeEach(() => {
    db.exec('DELETE FROM chapters');
    db.exec('DELETE FROM projects');
    projId = 'proj-ch';
    db.prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run(projId, '章节测试', 'novel', 4100, now, now);
  });

  it('insert and retrieve chapter', () => {
    db.prepare('INSERT INTO chapters (id, project_id, title, content, plain_text, word_count, status, sort_order, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .run('ch-1', projId, '第一章', '{"type":"doc"}', '测试内容', 4, 'draft', 0, now, now);

    const row: any = db.prepare('SELECT * FROM chapters WHERE id = ?').get('ch-1');
    expect(row.title).toBe('第一章');
    expect(row.plain_text).toBe('测试内容');
    expect(row.word_count).toBe(4);
    expect(row.status).toBe('draft');
  });

  it('list chapters by project ordered by sort_order', () => {
    db.prepare('INSERT INTO chapters (id, project_id, title, content, created_at, updated_at, sort_order) VALUES (?,?,?,?,?,?,?)')
      .run('c2', projId, '第二章', '{}', now, now, 1);
    db.prepare('INSERT INTO chapters (id, project_id, title, content, created_at, updated_at, sort_order) VALUES (?,?,?,?,?,?,?)')
      .run('c1', projId, '第一章', '{}', now, now, 0);

    const rows: any[] = db.prepare('SELECT * FROM chapters WHERE project_id = ? ORDER BY sort_order').all(projId);
    expect(rows).toHaveLength(2);
    expect(rows[0].title).toBe('第一章');
    expect(rows[1].title).toBe('第二章');
  });

  it('reorder chapters', () => {
    db.prepare('INSERT INTO chapters (id, project_id, title, content, created_at, updated_at, sort_order) VALUES (?,?,?,?,?,?,?)')
      .run('ca', projId, 'A', '{}', now, now, 0);
    db.prepare('INSERT INTO chapters (id, project_id, title, content, created_at, updated_at, sort_order) VALUES (?,?,?,?,?,?,?)')
      .run('cb', projId, 'B', '{}', now, now, 1);

    // Reverse order
    db.prepare('UPDATE chapters SET sort_order = 10 WHERE id = ? AND project_id = ?').run('ca', projId);
    db.prepare('UPDATE chapters SET sort_order = 0 WHERE id = ? AND project_id = ?').run('cb', projId);

    const rows: any[] = db.prepare('SELECT * FROM chapters WHERE project_id = ? ORDER BY sort_order').all(projId);
    expect(rows[0].id).toBe('cb');
    expect(rows[1].id).toBe('ca');
  });

  it('status CHECK rejects invalid status', () => {
    expect(() => {
      db.prepare('INSERT INTO chapters (id, project_id, title, content, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?)')
        .run('bad', projId, 'Bad', '{}', 'invalid', now, now);
    }).toThrow();
  });
});

describe('Character Repository (SQL tests)', () => {
  let projId: string;
  const now = new Date().toISOString();

  beforeEach(() => {
    db.exec('DELETE FROM characters');
    db.exec('DELETE FROM projects');
    projId = 'proj-char';
    db.prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run(projId, '角色测试', 'novel', 4100, now, now);
  });

  it('insert character', () => {
    db.prepare('INSERT INTO characters (id, project_id, name, aliases, appearance, personality, background, tags, avatar, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .run('char-1', projId, '林渊', '["小林","剑客"]', '英俊潇洒', '冷静果断', '出身剑阁', '["主角","剑修"]', null, now, now);

    const row: any = db.prepare('SELECT * FROM characters WHERE id = ?').get('char-1');
    expect(row.name).toBe('林渊');
    expect(row.personality).toBe('冷静果断');
  });

  it('list characters by project ordered by name', () => {
    db.prepare('INSERT INTO characters (id, project_id, name, created_at, updated_at) VALUES (?,?,?,?,?)')
      .run('c1', projId, '张三', now, now);
    db.prepare('INSERT INTO characters (id, project_id, name, created_at, updated_at) VALUES (?,?,?,?,?)')
      .run('c2', projId, '李四', now, now);
    db.prepare('INSERT INTO characters (id, project_id, name, created_at, updated_at) VALUES (?,?,?,?,?)')
      .run('c3', projId, '王五', now, now);

    const rows: any[] = db.prepare('SELECT * FROM characters WHERE project_id = ? ORDER BY name').all(projId);
    expect(rows[0].name).toBe('张三');
    expect(rows[1].name).toBe('李四');
    expect(rows[2].name).toBe('王五');
  });

  it('update character', () => {
    db.prepare('INSERT INTO characters (id, project_id, name, created_at, updated_at) VALUES (?,?,?,?,?)')
      .run('char-u', projId, '原名称', now, now);

    db.prepare('UPDATE characters SET name = ?, updated_at = ? WHERE id = ?')
      .run('新名称', new Date().toISOString(), 'char-u');

    const row: any = db.prepare('SELECT * FROM characters WHERE id = ?').get('char-u');
    expect(row.name).toBe('新名称');
  });
});

describe('Outline Repository (SQL tests)', () => {
  let projId: string;
  const now = new Date().toISOString();

  beforeEach(() => {
    db.exec('DELETE FROM outlines');
    db.exec('DELETE FROM projects');
    projId = 'proj-out';
    db.prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run(projId, '大纲测试', 'novel', 4100, now, now);
  });

  it('insert outline node', () => {
    db.prepare('INSERT INTO outlines (id, project_id, title, type, parent_id, chapter_id, sort_order, note) VALUES (?,?,?,?,?,?,?,?)')
      .run('out-1', projId, '第一卷', 'volume', null, null, 0, '开幕卷');

    const row: any = db.prepare('SELECT * FROM outlines WHERE id = ?').get('out-1');
    expect(row.title).toBe('第一卷');
    expect(row.type).toBe('volume');
  });

  it('hierarchical outline structure', () => {
    // Insert volume
    db.prepare('INSERT INTO outlines (id, project_id, title, type, parent_id, chapter_id, sort_order, note) VALUES (?,?,?,?,?,?,?,?)')
      .run('v1', projId, '第一卷', 'volume', null, null, 0, '');
    // Insert chapters under volume
    db.prepare('INSERT INTO outlines (id, project_id, title, type, parent_id, chapter_id, sort_order, note) VALUES (?,?,?,?,?,?,?,?)')
      .run('c1', projId, '第1章', 'chapter', 'v1', null, 0, '');
    db.prepare('INSERT INTO outlines (id, project_id, title, type, parent_id, chapter_id, sort_order, note) VALUES (?,?,?,?,?,?,?,?)')
      .run('c2', projId, '第2章', 'chapter', 'v1', null, 1, '');

    const all: any[] = db.prepare('SELECT * FROM outlines WHERE project_id = ? ORDER BY sort_order').all(projId);
    expect(all).toHaveLength(3);

    const children = all.filter((r: any) => r.parent_id === 'v1');
    expect(children).toHaveLength(2);
    expect(children[0].title).toBe('第1章');
  });

  it('reorder outline items', () => {
    db.prepare('INSERT INTO outlines (id, project_id, title, type, sort_order) VALUES (?,?,?,?,?)')
      .run('a', projId, 'A', 'chapter', 0);
    db.prepare('INSERT INTO outlines (id, project_id, title, type, sort_order) VALUES (?,?,?,?,?)')
      .run('b', projId, 'B', 'chapter', 1);

    db.prepare('UPDATE outlines SET sort_order = 10 WHERE id = ?').run('a');
    db.prepare('UPDATE outlines SET sort_order = 0 WHERE id = ?').run('b');

    const rows: any[] = db.prepare('SELECT * FROM outlines WHERE project_id = ? ORDER BY sort_order').all(projId);
    expect(rows[0].id).toBe('b');
    expect(rows[1].id).toBe('a');
  });

  it('type CHECK rejects invalid', () => {
    expect(() => {
      db.prepare('INSERT INTO outlines (id, project_id, title, type, sort_order) VALUES (?,?,?,?,?)')
        .run('bad', projId, 'Bad', 'unknown', 0);
    }).toThrow();
  });
});
