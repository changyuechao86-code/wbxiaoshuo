/**
 * Storyboard Repository — 分镜数据访问层 (P2)
 * 骨架实现，完整功能留待 P2 阶段
 */
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../connection';
import type { Storyboard, CreateStoryboardDTO, UpdateStoryboardDTO } from '../../../shared/types';

export class StoryboardRepository {
  /** 列出项目下所有分镜 */
  listByProject(projectId: string): Storyboard[] {
    const db = getDb();
    const rows = db.prepare(
      'SELECT id, project_id, chapter_id, scene_number, shot_number, shot_type, camera_movement, duration, description, prompt FROM storyboards WHERE project_id = ? ORDER BY scene_number ASC, shot_number ASC'
    ).all(projectId) as any[];
    return rows.map(this.mapRow);
  }

  /** 创建分镜 */
  create(data: CreateStoryboardDTO): Storyboard {
    const db = getDb();
    const id = uuidv4();
    db.prepare(`
      INSERT INTO storyboards (id, project_id, chapter_id, scene_number, shot_number, shot_type, camera_movement, duration, description, prompt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.projectId, data.chapterId, data.sceneNumber, data.shotNumber, data.shotType, data.cameraMovement, data.duration, data.description, data.prompt);
    return this.getById(id)!;
  }

  /** 更新分镜 */
  update(id: string, data: UpdateStoryboardDTO): Storyboard {
    const db = getDb();
    const sets: string[] = [];
    const params: any[] = [];

    const fields: (keyof UpdateStoryboardDTO)[] = ['sceneNumber', 'shotNumber', 'shotType', 'cameraMovement', 'duration', 'description', 'prompt'];
    const colMap: Record<string, string> = {
      sceneNumber: 'scene_number', shotNumber: 'shot_number', shotType: 'shot_type',
      cameraMovement: 'camera_movement', duration: 'duration', description: 'description', prompt: 'prompt',
    };

    for (const field of fields) {
      if (data[field] !== undefined) {
        sets.push(`${colMap[field]} = ?`);
        params.push(data[field]);
      }
    }

    if (sets.length === 0) return this.getById(id)!;

    params.push(id);
    db.prepare(`UPDATE storyboards SET ${sets.join(', ')} WHERE id = ?`).run(...params);
    return this.getById(id)!;
  }

  /** 删除分镜 */
  delete(id: string): void {
    const db = getDb();
    db.prepare('DELETE FROM storyboards WHERE id = ?').run(id);
  }

  private getById(id: string): Storyboard | null {
    const db = getDb();
    const row = db.prepare(
      'SELECT id, project_id, chapter_id, scene_number, shot_number, shot_type, camera_movement, duration, description, prompt FROM storyboards WHERE id = ?'
    ).get(id) as any | undefined;
    return row ? this.mapRow(row) : null;
  }

  private mapRow(row: any): Storyboard {
    return {
      id: row.id,
      projectId: row.project_id,
      chapterId: row.chapter_id,
      sceneNumber: row.scene_number,
      shotNumber: row.shot_number,
      shotType: row.shot_type,
      cameraMovement: row.camera_movement,
      duration: row.duration,
      description: row.description,
      prompt: row.prompt,
    };
  }
}

export const storyboardRepo = new StoryboardRepository();
