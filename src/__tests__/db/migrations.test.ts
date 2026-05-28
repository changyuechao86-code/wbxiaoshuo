import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const migrationSourcePath = path.resolve(process.cwd(), 'src/main/db/migrations.ts');

describe('database migration source', () => {
  const source = fs.readFileSync(migrationSourcePath, 'utf8');

  it('does not comment out CREATE TABLE statements', () => {
    const unsafeLines = source
      .split(/\r?\n/)
      .filter((line) => /--.*CREATE TABLE/i.test(line));

    expect(unsafeLines).toEqual([]);
  });

  it('defines the expected initial tables', () => {
    const tableNames = [
      'projects',
      'chapters',
      'characters',
      'character_relations',
      'outlines',
      'world_settings',
      'foreshadowings',
      'revenues',
      'checkins',
      'storyboards',
      'settings',
    ];

    for (const tableName of tableNames) {
      expect(source).toContain(`CREATE TABLE IF NOT EXISTS ${tableName}`);
    }
  });

  it('does not include known mojibake markers', () => {
    const markers = [
      '\u9345',
      '\u95b8',
      '\u9422',
      '\u7d31',
      '\u93c9',
      '\u6086',
      '\u6b91',
      '\u6391',
      '\u66e0',
    ];

    for (const marker of markers) {
      expect(source).not.toContain(marker);
    }
  });
});
