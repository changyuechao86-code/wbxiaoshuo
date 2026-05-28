export const IPC_CHANNELS = {
  PROJECT_LIST: 'project:list',
  PROJECT_GET: 'project:get',
  PROJECT_CREATE: 'project:create',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',

  CHAPTER_LIST: 'chapter:list',
  CHAPTER_GET: 'chapter:get',
  CHAPTER_CREATE: 'chapter:create',
  CHAPTER_UPDATE: 'chapter:update',
  CHAPTER_DELETE: 'chapter:delete',
  CHAPTER_REORDER: 'chapter:reorder',

  CHARACTER_LIST: 'character:list',
  CHARACTER_GET: 'character:get',
  CHARACTER_CREATE: 'character:create',
  CHARACTER_UPDATE: 'character:update',
  CHARACTER_DELETE: 'character:delete',

  CHAR_RELATION_LIST: 'char-relation:list',
  CHAR_RELATION_CREATE: 'char-relation:create',
  CHAR_RELATION_DELETE: 'char-relation:delete',

  OUTLINE_LIST: 'outline:list',
  OUTLINE_CREATE: 'outline:create',
  OUTLINE_UPDATE: 'outline:update',
  OUTLINE_DELETE: 'outline:delete',
  OUTLINE_REORDER: 'outline:reorder',

  WORLD_SETTING_LIST: 'world-setting:list',
  WORLD_SETTING_CREATE: 'world-setting:create',
  WORLD_SETTING_UPDATE: 'world-setting:update',
  WORLD_SETTING_DELETE: 'world-setting:delete',

  FORESHADOWING_LIST: 'foreshadowing:list',
  FORESHADOWING_CREATE: 'foreshadowing:create',
  FORESHADOWING_UPDATE: 'foreshadowing:update',
  FORESHADOWING_DELETE: 'foreshadowing:delete',

  REVENUE_LIST: 'revenue:list',
  REVENUE_CREATE: 'revenue:create',
  REVENUE_DELETE: 'revenue:delete',

  CHECKIN_TODAY: 'checkin:today',
  CHECKIN_MONTHLY: 'checkin:monthly',

  STORYBOARD_LIST: 'storyboard:list',
  STORYBOARD_CREATE: 'storyboard:create',
  STORYBOARD_UPDATE: 'storyboard:update',
  STORYBOARD_DELETE: 'storyboard:delete',

  AI_STREAM: 'ai:stream',
  AI_CONFIG: 'ai:config',

  FILE_BACKUP: 'file:backup',
  FILE_RESTORE: 'file:restore',
  FILE_EXPORT: 'file:export',
  FILE_IMPORT: 'file:import',

  APP_GET_PATH: 'app:get-path',
} as const;
