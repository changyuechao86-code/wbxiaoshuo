import { DatabaseConnection } from '../connection';
import { v4 as uuidv4 } from 'uuid';

interface ChapterRow { id: string; project_id: string; title: string; content: string; plain_text: string; word_count: number; status: string; sort_order: number; created_at: string; updated_at: string; }

function rowToChapter(row: ChapterRow) {
  return { id: row.id, projectId: row.project_id, title: row.title, content: row.content, plainText: row.plain_text, wordCount: row.word_count, status: row.status as 'draft'|'writing'|'completed', order: row.sort_order, createdAt: row.created_at, updatedAt: row.updated_at };
}

export class ChapterRepository {
  private get db() { return DatabaseConnection.getInstance().getDb(); }

  listByProject(projectId: string) {
    return (this.db.prepare('SELECT * FROM chapters WHERE project_id = ? ORDER BY sort_order').all(projectId) as ChapterRow[]).map(rowToChapter);
  }

  getById(id: string) {
    const row = this.db.prepare('SELECT * FROM chapters WHERE id = ?').get(id) as ChapterRow | undefined;
    return row ? rowToChapter(row) : null;
  }

  create(data: { projectId: string; title: string; content: string; status: string; order: number }) {
    const id = uuidv4(); const now = new Date().toISOString();
    this.db.prepare('INSERT INTO chapters (id, project_id, title, content, plain_text, word_count, status, sort_order, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .run(id, data.projectId, data.title, data.content, '', 0, data.status, data.order, now, now);
    return this.getById(id)!;
  }

  update(id: string, data: Partial<{ title: string; content: string; plainText: string; wordCount: number; status: string; order: number }>) {
    const sets: string[] = []; const vals: unknown[] = [];
    if (data.title !== undefined) { sets.push('title = ?'); vals.push(data.title); }
    if (data.content !== undefined) { sets.push('content = ?'); vals.push(data.content); }
    if (data.plainText !== undefined) { sets.push('plain_text = ?'); vals.push(data.plainText); }
    if (data.wordCount !== undefined) { sets.push('word_count = ?'); vals.push(data.wordCount); }
    if (data.status !== undefined) { sets.push('status = ?'); vals.push(data.status); }
    if (data.order !== undefined) { sets.push('sort_order = ?'); vals.push(data.order); }
    if (sets.length === 0) return this.getById(id)!;
    sets.push('updated_at = ?'); vals.push(new Date().toISOString()); vals.push(id);
    this.db.prepare(`UPDATE chapters SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    return this.getById(id)!;
  }

  delete(id: string) { this.db.prepare('DELETE FROM chapters WHERE id = ?').run(id); }

  reorder(projectId: string, ids: string[]) {
    const stmt = this.db.prepare('UPDATE chapters SET sort_order = ? WHERE id = ? AND project_id = ?');
    const tx = this.db.transaction(() => { ids.forEach((id, i) => stmt.run(i, id, projectId)); });
    tx();
  }
}

export const chapterRepo = new ChapterRepository();
