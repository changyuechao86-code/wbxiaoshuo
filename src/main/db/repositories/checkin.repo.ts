import { DatabaseConnection } from '../connection';
import { v4 as uuidv4 } from 'uuid';
export class CheckInRepository {
  private get db() { return DatabaseConnection.getInstance().getDb(); }
  getToday(pId: string, date: string) { return this.db.prepare('SELECT * FROM checkins WHERE project_id = ? AND date = ?').get(pId, date) || null; }
  getMonthly(pId: string, yearMonth: string) { return this.db.prepare('SELECT * FROM checkins WHERE project_id = ? AND date LIKE ? ORDER BY date').all(pId, `${yearMonth}%`); }
  upsert(d: { projectId: string; date: string; wordCount: number; goalMet: boolean }) {
    const existing = this.getToday(d.projectId, d.date);
    if (existing) {
      this.db.prepare('UPDATE checkins SET word_count = ?, goal_met = ? WHERE id = ?').run(d.wordCount, d.goalMet ? 1 : 0, (existing as any).id);
    } else {
      const id = uuidv4();
      this.db.prepare('INSERT INTO checkins (id, project_id, date, word_count, goal_met) VALUES (?,?,?,?,?)').run(id, d.projectId, d.date, d.wordCount, d.goalMet ? 1 : 0);
    }
    return this.getToday(d.projectId, d.date);
  }
}

export const checkinRepo = new CheckInRepository();
