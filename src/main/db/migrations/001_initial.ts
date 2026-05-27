/**
 * 初始数据库 Schema — 一次性创建所有表
 * 包含 P0/P1/P2 全部数据表，确保后续迭代无需额外迁移
 */
import type Database from 'better-sqlite3';

export function migration001(db: Database.Database): void {
  db.exec(`
    -- 项目表
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'novel' CHECK(type IN ('novel', 'script')),
      daily_goal INTEGER NOT NULL DEFAULT 4100,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- 章节表
    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      plain_text TEXT NOT NULL DEFAULT '',
      word_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'writing', 'completed')),
      "order" INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chapters_project ON chapters(project_id, "order");

    -- 角色表
    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      aliases TEXT NOT NULL DEFAULT '[]',
      appearance TEXT NOT NULL DEFAULT '',
      personality TEXT NOT NULL DEFAULT '',
      background TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      avatar TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_characters_project ON characters(project_id);

    -- 角色关系表
    CREATE TABLE IF NOT EXISTS character_relations (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'other',
      description TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES characters(id) ON DELETE CASCADE,
      FOREIGN KEY (target_id) REFERENCES characters(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_char_rel_project ON character_relations(project_id);

    -- 大纲表
    CREATE TABLE IF NOT EXISTS outlines (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT 'chapter' CHECK(type IN ('volume', 'chapter')),
      parent_id TEXT,
      chapter_id TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      note TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_outlines_project ON outlines(project_id, "order");

    -- 世界观设定表
    CREATE TABLE IF NOT EXISTS world_settings (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'other',
      parent_id TEXT,
      content TEXT NOT NULL DEFAULT '',
      "order" INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_world_setting_project ON world_settings(project_id, "order");

    -- 伏笔表
    CREATE TABLE IF NOT EXISTS foreshadowings (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      planted_chapter_id TEXT NOT NULL,
      resolved_chapter_id TEXT,
      status TEXT NOT NULL DEFAULT 'planted' CHECK(status IN ('planted', 'hinted', 'resolved')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (planted_chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_foreshadowings_project ON foreshadowings(project_id);

    -- 收益记录表
    CREATE TABLE IF NOT EXISTS revenues (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      date TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      platform TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_revenues_project ON revenues(project_id, date);

    -- 打卡记录表
    CREATE TABLE IF NOT EXISTS checkins (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      date TEXT NOT NULL,
      word_count INTEGER NOT NULL DEFAULT 0,
      goal_met INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_checkins_project_date ON checkins(project_id, date);

    -- 分镜表
    CREATE TABLE IF NOT EXISTS storyboards (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      chapter_id TEXT NOT NULL,
      scene_number INTEGER NOT NULL DEFAULT 0,
      shot_number INTEGER NOT NULL DEFAULT 0,
      shot_type TEXT NOT NULL DEFAULT '',
      camera_movement TEXT NOT NULL DEFAULT '',
      duration REAL NOT NULL DEFAULT 0,
      description TEXT NOT NULL DEFAULT '',
      prompt TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_storyboards_project ON storyboards(project_id, chapter_id);

    -- 设置表（key-value 存储）
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );

    -- 插入默认设置
    INSERT OR IGNORE INTO settings (key, value) VALUES ('ai_endpoint', 'https://api.siliconflow.cn/v1');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('ai_model', 'deepseek-ai/DeepSeek-V3');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('ai_provider', 'deepseek');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('theme', 'dark');
  `);
}
