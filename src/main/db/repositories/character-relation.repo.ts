import { DatabaseConnection } from '../connection';
import { v4 as uuidv4 } from 'uuid';
interface RelRow { id: string; project_id: string; source_id: string; target_id: string; type: string; description: string; }
function rowToRel(r: RelRow) { return { id: r.id, projectId: r.project_id, sourceId: r.source_id, targetId: r.target_id, type: r.type, description: r.description }; }

export class CharacterRelationRepository {
  private get db() { return DatabaseConnection.getInstance().getDb(); }
  listByProject(pId: string) { return (this.db.prepare('SELECT * FROM character_relations WHERE project_id = ?').all(pId) as RelRow[]).map(rowToRel); }
  listByCharacter(charId: string) { return (this.db.prepare('SELECT * FROM character_relations WHERE source_id = ? OR target_id = ?').all(charId, charId) as RelRow[]).map(rowToRel); }
  create(d: { projectId: string; sourceId: string; targetId: string; type: string; description: string }) {
    const id = uuidv4();
    this.db.prepare('INSERT INTO character_relations (id, project_id, source_id, target_id, type, description) VALUES (?,?,?,?,?,?)').run(id, d.projectId, d.sourceId, d.targetId, d.type, d.description);
    const row = this.db.prepare('SELECT * FROM character_relations WHERE id = ?').get(id) as RelRow | undefined;
    return row ? rowToRel(row) : null;
  }
  delete(id: string) { this.db.prepare('DELETE FROM character_relations WHERE id = ?').run(id); }
}

export const characterRelationRepo = new CharacterRelationRepository();
