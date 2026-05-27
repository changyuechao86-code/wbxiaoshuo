import { DatabaseConnection } from '../connection';
import { v4 as uuidv4 } from 'uuid';
interface FRow { id: string; project_id: string; title: string; description: string; planted_chapter_id: string; resolved_chapter_id: string|null; status: string; created_at: string; updated_at: string; }
function rowToF(r: FRow) { return { id: r.id, projectId: r.project_id, title: r.title, description: r.description, plantedChapterId: r.planted_chapter_id, resolvedChapterId: r.resolved_chapter_id, status: r.status as 'planted'|'hinted'|'resolved', createdAt: r.created_at, updatedAt: r.updated_at }; }

export class ForeshadowingRepository {
  private get db() { return DatabaseConnection.getInstance().getDb(); }
  listByProject(pId: string) { return (this.db.prepare('SELECT * FROM foreshadowings WHERE project_id = ? ORDER BY created_at').all(pId) as FRow[]).map(rowToF); }
  getById(id: string) { const r = this.db.prepare('SELECT * FROM foreshadowings WHERE id = ?').get(id) as FRow|undefined; return r ? rowToF(r) : null; }
  create(d: { projectId: string; title: string; description: string; plantedChapterId: string; status: string }) {
    const id = uuidv4(); const now = new Date().toISOString();
    this.db.prepare('INSERT INTO foreshadowings (id, project_id, title, description, planted_chapter_id, resolved_chapter_id, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)')
      .run(id, d.projectId, d.title, d.description, d.plantedChapterId, null, d.status, now, now);
    return this.getById(id)!;
  }
  update(id: string, d: Partial<{ title: string; description: string; resolvedChapterId: string|null; status: string }>) {
    const sets: string[] = []; const vals: unknown[] = [];
    const map: Record<string,string> = { title:'title', description:'description', resolvedChapterId:'resolved_chapter_id', status:'status' };
    for (const [k, col] of Object.entries(map)) { const v = (d as any)[k]; if (v !== undefined) { sets.push(`${col} = ?`); vals.push(v); } }
    if (sets.length===0) return this.getById(id)!;
    sets.push('updated_at = ?'); vals.push(new Date().toISOString()); vals.push(id);
    this.db.prepare(`UPDATE foreshadowings SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    return this.getById(id)!;
  }
  delete(id: string) { this.db.prepare('DELETE FROM foreshadowings WHERE id = ?').run(id); }
}

export const foreshadowingRepo = new ForeshadowingRepository();
