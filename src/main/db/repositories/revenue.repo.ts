import { DatabaseConnection } from '../connection';
import { v4 as uuidv4 } from 'uuid';
export class RevenueRepository {
  private get db() { return DatabaseConnection.getInstance().getDb(); }
  listByProject(pId: string) { return this.db.prepare('SELECT * FROM revenues WHERE project_id = ? ORDER BY date DESC').all(pId); }
  create(d: { projectId: string; date: string; amount: number; platform: string; note: string }) {
    const id = uuidv4();
    this.db.prepare('INSERT INTO revenues (id, project_id, date, amount, platform, note) VALUES (?,?,?,?,?,?)').run(id, d.projectId, d.date, d.amount, d.platform, d.note);
    return this.db.prepare('SELECT * FROM revenues WHERE id = ?').get(id);
  }
  delete(id: string) { this.db.prepare('DELETE FROM revenues WHERE id = ?').run(id); }
}

export const revenueRepo = new RevenueRepository();
