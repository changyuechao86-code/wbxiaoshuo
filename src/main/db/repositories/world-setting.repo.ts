import { DatabaseConnection } from '../connection';
import { v4 as uuidv4 } from 'uuid';
interface WSRow { id: string; project_id: string; name: string; category: string; parent_id: string|null; content: string; sort_order: number; }
function rowToWS(r: WSRow) { return { id: r.id, projectId: r.project_id, name: r.name, category: r.category, parentId: r.parent_id, content: r.content, order: r.sort_order }; }

export class WorldSettingRepository {
  private get db() { return DatabaseConnection.getInstance().getDb(); }
  listByProject(pId: string) { return (this.db.prepare('SELECT * FROM world_settings WHERE project_id = ? ORDER BY sort_order').all(pId) as WSRow[]).map(rowToWS); }
  getById(id: string) { const r = this.db.prepare('SELECT * FROM world_settings WHERE id = ?').get(id) as WSRow|undefined; return r ? rowToWS(r) : null; }
  create(d: { projectId: string; name: string; category: string; parentId?: string|null; content?: string; order?: number }) {
    const id = uuidv4();
    this.db.prepare('INSERT INTO world_settings (id, project_id, name, category, parent_id, content, sort_order) VALUES (?,?,?,?,?,?,?)')
      .run(id, d.projectId, d.name, d.category, d.parentId||null, d.content||'', d.order||0);
    return this.getById(id)!;
  }
  update(id: string, d: Partial<{ name: string; category: string; parentId: string|null; content: string; order: number }>) {
    const sets: string[] = []; const vals: unknown[] = [];
    const map: Record<string,string> = { name:'name', category:'category', parentId:'parent_id', content:'content', order:'sort_order' };
    for (const [k, col] of Object.entries(map)) { const v = (d as any)[k]; if (v !== undefined) { sets.push(`${col} = ?`); vals.push(v); } }
    if (sets.length===0) return this.getById(id)!;
    vals.push(id); this.db.prepare(`UPDATE world_settings SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    return this.getById(id)!;
  }
  delete(id: string) { this.db.prepare('DELETE FROM world_settings WHERE id = ?').run(id); }
}

export const worldSettingRepo = new WorldSettingRepository();
