import { DatabaseConnection } from '../connection';
import { v4 as uuidv4 } from 'uuid';
interface ORow { id: string; project_id: string; title: string; type: string; parent_id: string | null; chapter_id: string | null; sort_order: number; note: string; }
function rowToO(r: ORow) { return { id: r.id, projectId: r.project_id, title: r.title, type: r.type as 'volume'|'chapter', parentId: r.parent_id, chapterId: r.chapter_id, order: r.sort_order, note: r.note }; }

export class OutlineRepository {
  private get db() { return DatabaseConnection.getInstance().getDb(); }
  listByProject(pId: string) { return (this.db.prepare('SELECT * FROM outlines WHERE project_id = ? ORDER BY sort_order').all(pId) as ORow[]).map(rowToO); }
  getById(id: string) { const r = this.db.prepare('SELECT * FROM outlines WHERE id = ?').get(id) as ORow|undefined; return r ? rowToO(r) : null; }
  create(d: { projectId: string; title: string; type: string; parentId?: string|null; chapterId?: string|null; order?: number; note?: string }) {
    const id = uuidv4();
    this.db.prepare('INSERT INTO outlines (id, project_id, title, type, parent_id, chapter_id, sort_order, note) VALUES (?,?,?,?,?,?,?,?)')
      .run(id, d.projectId, d.title, d.type, d.parentId||null, d.chapterId||null, d.order||0, d.note||'');
    return this.getById(id)!;
  }
  update(id: string, d: Partial<{ title: string; type: string; parentId: string|null; chapterId: string|null; order: number; note: string }>) {
    const sets: string[] = []; const vals: unknown[] = [];
    const map: Record<string,string> = { title:'title', type:'type', parentId:'parent_id', chapterId:'chapter_id', order:'sort_order', note:'note' };
    for (const [k, col] of Object.entries(map)) { const v = (d as any)[k]; if (v !== undefined) { sets.push(`${col} = ?`); vals.push(v); } }
    if (sets.length===0) return this.getById(id)!;
    vals.push(id);
    this.db.prepare(`UPDATE outlines SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    return this.getById(id)!;
  }
  delete(id: string) { this.db.prepare('DELETE FROM outlines WHERE id = ?').run(id); }
  reorder(items: { id: string; order: number; parentId: string | null }[]) {
    const stmt = this.db.prepare('UPDATE outlines SET sort_order = ?, parent_id = ? WHERE id = ?');
    const tx = this.db.transaction(() => { items.forEach(it => stmt.run(it.order, it.parentId, it.id)); });
    tx();
  }
}

export const outlineRepo = new OutlineRepository();
