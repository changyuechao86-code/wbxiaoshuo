export const DEFAULT_DAILY_GOAL = 4100;
export const AUTO_SAVE_DELAY = 2000;
export const MAX_AUTO_SAVE_RETRIES = 3;
export const AI_REQUEST_TIMEOUT = 60000;
export const SIDEBAR_WIDTH = 240;
export const TITLEBAR_HEIGHT = 38;
export const BOTTOMNAV_HEIGHT = 44;
export const TOOLBAR_HEIGHT = 42;
export const STATUSBAR_HEIGHT = 32;
export const PAGE_SIZE = 50;
export const MAX_OUTLINE_DEPTH = 5;

export const SUPPORTED_EXPORT_FORMATS = ['txt', 'markdown', 'html'] as const;

export const WORLD_SETTING_CATEGORIES = [
  { value: 'geography', label: '\u5730\u7406' },
  { value: 'faction', label: '\u52bf\u529b' },
  { value: 'history', label: '\u5386\u53f2' },
  { value: 'magic', label: '\u9b54\u6cd5/\u80fd\u529b' },
  { value: 'culture', label: '\u6587\u5316' },
  { value: 'creature', label: '\u751f\u7269/\u79cd\u65cf' },
  { value: 'other', label: '\u5176\u4ed6' },
] as const;

export const RELATION_TYPES = [
  { value: 'friend', label: '\u670b\u53cb' },
  { value: 'enemy', label: '\u654c\u4eba' },
  { value: 'family', label: '\u5bb6\u4eba' },
  { value: 'lover', label: '\u604b\u4eba' },
  { value: 'master_student', label: '\u5e08\u5f92' },
  { value: 'colleague', label: '\u540c\u95e8/\u540c\u4e8b' },
  { value: 'other', label: '\u5176\u4ed6' },
] as const;
