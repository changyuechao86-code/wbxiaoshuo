import { DatabaseConnection } from '../connection';
import { v4 as uuidv4 } from 'uuid';

export function seedDemoProject(): string {
  const db = DatabaseConnection.getInstance().getDb();
  const projectId = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(projectId, '示例小说项目', 'novel', 4100, now, now);

  const ch1Id = uuidv4();
  const ch2Id = uuidv4();
  db.prepare(`INSERT INTO chapters (id, project_id, title, content, plain_text, word_count, status, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(ch1Id, projectId, '第一章 序章', '', '', 0, 'draft', 0, now, now);
  db.prepare(`INSERT INTO chapters (id, project_id, title, content, plain_text, word_count, status, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(ch2Id, projectId, '第二章', '', '', 0, 'draft', 1, now, now);

  const char1Id = uuidv4();
  db.prepare(`INSERT INTO characters (id, project_id, name, aliases, appearance, personality, background, tags, avatar, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(char1Id, projectId, '主角', '[]', '', '', '', '[]', null, now, now);

  const outline1Id = uuidv4();
  db.prepare(`INSERT INTO outlines (id, project_id, title, type, parent_id, chapter_id, sort_order, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(outline1Id, projectId, '第一卷', 'volume', null, null, 0, '');

  db.prepare(`INSERT INTO outlines (id, project_id, title, type, parent_id, chapter_id, sort_order, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(uuidv4(), projectId, '第一章 序章', 'chapter', outline1Id, ch1Id, 0, '');

  return projectId;
}
