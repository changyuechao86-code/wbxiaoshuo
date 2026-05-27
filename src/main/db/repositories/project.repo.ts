import { DatabaseConnection } from '../connection';
import { v4 as uuidv4 } from 'uuid';

interface ProjectRow {
  id: string; name: string; type: string; daily_goal: number;
  created_at: string; updated_at: string;
}

function rowToProject(row: ProjectRow) {
  return {
    id: row.id, name: row.name,
    type: row.type as 'novel' | 'script',
    dailyGoal: row.daily_goal,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export class ProjectRepository {
  private get db() { return DatabaseConnection.getInstance().getDb(); }

  list() {
    return (this.db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as ProjectRow[]).map(rowToProject);
  }

  getById(id: string) {
    const row = this.db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined;
    return row ? rowToProject(row) : null;
  }

  create(data: { name: string; type: string; dailyGoal: number }) {
    const id = uuidv4();
    const now = new Date().toISOString();
    this.db.prepare('INSERT INTO projects (id, name, type, daily_goal, created_at, updated_at) VALUES (?,?,?,?,?,?)')
      .run(id, data.name, data.type, data.dailyGoal, now, now);
    return this.getById(id)!;
  }

  update(id: string, data: Partial<{ name: string; type: string; dailyGoal: number }>) {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (data.name !== undefined) { sets.push('name = ?'); vals.push(data.name); }
    if (data.type !== undefined) { sets.push('type = ?'); vals.push(data.type); }
    if (data.dailyGoal !== undefined) { sets.push('daily_goal = ?'); vals.push(data.dailyGoal); }
    if (sets.length === 0) return this.getById(id)!;
    sets.push("updated_at = ?"); vals.push(new Date().toISOString());
    vals.push(id);
    this.db.prepare(`UPDATE projects SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    return this.getById(id)!;
  }

  delete(id: string) {
    this.db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  }
}

export const projectRepo = new ProjectRepository();
