/**
 * 渲染进程常量
 */

/** 默认日更目标字数 */
export const DEFAULT_DAILY_GOAL = 4100;

/** 自动保存防抖间隔（毫秒） */
export const AUTO_SAVE_DELAY = 2000;

/** 最大自动保存重试次数 */
export const MAX_AUTO_SAVE_RETRIES = 3;

/** AI 请求超时（毫秒） */
export const AI_REQUEST_TIMEOUT = 60000;

/** 侧边栏宽度 */
export const SIDEBAR_WIDTH = 240;

/** 标题栏高度 */
export const TITLEBAR_HEIGHT = 38;

/** 底部导航栏高度 */
export const BOTTOMNAV_HEIGHT = 44;

/** 编辑器工具栏高度 */
export const TOOLBAR_HEIGHT = 42;

/** 编辑器状态栏高度 */
export const STATUSBAR_HEIGHT = 32;

/** 分页大小（章节列表等） */
export const PAGE_SIZE = 50;

/** 大纲最大深度 */
export const MAX_OUTLINE_DEPTH = 5;

/** 支持的文件格式 */
export const SUPPORTED_EXPORT_FORMATS = ['txt', 'markdown', 'html'] as const;

/** 世界观设定分类 */
export const WORLD_SETTING_CATEGORIES = [
  { value: 'geography', label: '地理' },
  { value: 'faction', label: '势力' },
  { value: 'history', label: '历史' },
  { value: 'magic', label: '魔法/能力' },
  { value: 'culture', label: '文化' },
  { value: 'creature', label: '生物/种族' },
  { value: 'other', label: '其他' },
] as const;

/** 角色关系类型 */
export const RELATION_TYPES = [
  { value: 'friend', label: '朋友' },
  { value: 'enemy', label: '敌人' },
  { value: 'family', label: '家人' },
  { value: 'lover', label: '恋人' },
  { value: 'master_student', label: '师徒' },
  { value: 'colleague', label: '同门/同事' },
  { value: 'other', label: '其他' },
] as const;
