import { DatabaseConnection } from '../connection';
import { v4 as uuidv4 } from 'uuid';

interface CharRow { id: string; project_id: string; name: string; aliases: string; appearance: string; personality: string; background: string; tags: string; avatar: string|null; created_at: string; updated_at: string; }
function rowToChar(r: CharRow) { return { id: r.id, projectId: r.project_id, name: r.name, aliases: r.aliases, appearance: r.appearance, personality: r.personality, background: r.background, tags: r.tags, avatar: r.avatar, createdAt: r.created_at, updatedAt: r.updated_at }; }

export class CharacterRepository {
  private get db() { return DatabaseConnection.getInstance().getDb(); }
  listByProject(pId: string) { return (this.db.prepare('SELECT * FROM characters WHERE project_id = ? ORDER BY name').all(pId) as CharRow[]).map(rowToChar); }
  getById(id: string) { const r = this.db.prepare('SELECT * FROM characters WHERE id = ?').get(id) as CharRow|undefined; return r ? rowToChar(r) : null; }
  create(d: { projectId: string; name: string; aliases?: string; appearance?: string; personality?: string; background?: string; tags?: string; avatar?: string|null }) {
    const id = uuidv4(); const now = new Date().toISOString();
    this.db.prepare('INSERT INTO characters (id, project_id, name, aliases, appearance, personality, background, tags, avatar, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .run(id, d.projectId, d.name, d.aliases||'[]', d.appearance||'', d.personality||'', d.background||'', d.tags||'[]', d.avatar||null, now, now);
    return this.getById(id)!;
  }
  update(id: string, d: Partial<{ name: string; aliases: string; appearance: string; personality: string; background: string; tags: string; avatar: string|null }>) {
    const sets: string[] = []; const vals: unknown[] = [];
    const fields = ['name','aliases','appearance','personality','background','tags','avatar'] as const;
    for (const f of fields) { if (d[f] !== undefined) { sets.push(`${f} = ?`); vals.push(d[f]); } }
    if (sets.length===0) return this.getById(id)!;
    sets.push('updated_at = ?'); vals.push(new Date().toISOString()); vals.push(id);
    this.db.prepare(`UPDATE characters SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    return this.getById(id)!;
  }
  delete(id: string) { this.db.prepare('DELETE FROM characters WHERE id = ?').run(id); }
}

export const characterRepo = new CharacterRepository();
