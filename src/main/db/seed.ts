import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from './connection';

const DEMO_PROJECT_NAME = '\u793a\u4f8b\u5c0f\u8bf4\u9879\u76ee';
const CHAPTER_ONE_TITLE = '\u7b2c\u4e00\u7ae0 \u5e8f\u7ae0';
const CHAPTER_TWO_TITLE = '\u7b2c\u4e8c\u7ae0';
const MAIN_CHARACTER_NAME = '\u4e3b\u89d2';
const VOLUME_ONE_TITLE = '\u7b2c\u4e00\u5377';

export function seedDemoProject(): string {
  const db = DatabaseConnection.getInstance().getDb();
  const projectId = uuidv4();
  const now = new Date().toISOString();

  db.prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(projectId, DEMO_PROJECT_NAME, 'novel', 4100, now, now);

  const ch1Id = uuidv4();
  const ch2Id = uuidv4();
  db.prepare(
    'INSERT INTO chapters (id, project_id, title, content, plain_text, word_count, status, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(ch1Id, projectId, CHAPTER_ONE_TITLE, '', '', 0, 'draft', 0, now, now);
  db.prepare(
    'INSERT INTO chapters (id, project_id, title, content, plain_text, word_count, status, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(ch2Id, projectId, CHAPTER_TWO_TITLE, '', '', 0, 'draft', 1, now, now);

  const char1Id = uuidv4();
  db.prepare(
    'INSERT INTO characters (id, project_id, name, aliases, appearance, personality, background, tags, avatar, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(char1Id, projectId, MAIN_CHARACTER_NAME, '[]', '', '', '', '[]', null, now, now);

  const outline1Id = uuidv4();
  db.prepare('INSERT INTO outlines (id, project_id, title, type, parent_id, chapter_id, sort_order, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(outline1Id, projectId, VOLUME_ONE_TITLE, 'volume', null, null, 0, '');

  db.prepare('INSERT INTO outlines (id, project_id, title, type, parent_id, chapter_id, sort_order, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(uuidv4(), projectId, CHAPTER_ONE_TITLE, 'chapter', outline1Id, ch1Id, 0, '');

  return projectId;
}
