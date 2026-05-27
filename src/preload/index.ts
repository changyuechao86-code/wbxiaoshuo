/**
 * Preload 脚本 — 使用 contextBridge 暴露类型安全的 API 给渲染进程
 * 仅做桥接，不包含业务逻辑
 */
import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import type {
  Project, Chapter, Character, CharacterRelation, Outline,
  WorldSetting, Foreshadowing, Revenue, CheckIn, Storyboard,
  AIConfig, AIRequest, AIResponse, AppSettings,
  CreateProjectDTO, UpdateProjectDTO,
  CreateChapterDTO, UpdateChapterDTO,
  CreateCharacterDTO, UpdateCharacterDTO,
  CreateCharacterRelationDTO,
  CreateOutlineDTO, UpdateOutlineDTO, OutlineReorderItem,
  CreateWorldSettingDTO, UpdateWorldSettingDTO,
  CreateForeshadowingDTO, UpdateForeshadowingDTO,
  CreateRevenueDTO,
  CreateStoryboardDTO, UpdateStoryboardDTO,
} from '../shared/types';

/**
 * 类型安全的 electronAPI 接口
 */
export interface ElectronAPI {
  // Project
  project: {
    list(): Promise<Project[]>;
    get(id: string): Promise<Project | null>;
    create(data: CreateProjectDTO): Promise<Project>;
    update(id: string, data: UpdateProjectDTO): Promise<Project>;
    delete(id: string): Promise<void>;
  };

  // Chapter
  chapter: {
    list(projectId: string): Promise<Chapter[]>;
    get(id: string): Promise<Chapter | null>;
    create(data: CreateChapterDTO): Promise<Chapter>;
    update(id: string, data: UpdateChapterDTO): Promise<Chapter>;
    delete(id: string): Promise<void>;
    reorder(projectId: string, ids: string[]): Promise<void>;
  };

  // Character
  character: {
    list(projectId: string): Promise<Character[]>;
    get(id: string): Promise<Character | null>;
    create(data: CreateCharacterDTO): Promise<Character>;
    update(id: string, data: UpdateCharacterDTO): Promise<Character>;
    delete(id: string): Promise<void>;
  };

  // CharacterRelation
  charRelation: {
    list(projectId: string): Promise<CharacterRelation[]>;
    create(data: CreateCharacterRelationDTO): Promise<CharacterRelation>;
    delete(id: string): Promise<void>;
  };

  // Outline
  outline: {
    list(projectId: string): Promise<Outline[]>;
    create(data: CreateOutlineDTO): Promise<Outline>;
    update(id: string, data: UpdateOutlineDTO): Promise<Outline>;
    delete(id: string): Promise<void>;
    reorder(items: OutlineReorderItem[]): Promise<void>;
  };

  // WorldSetting
  worldSetting: {
    list(projectId: string): Promise<WorldSetting[]>;
    create(data: CreateWorldSettingDTO): Promise<WorldSetting>;
    update(id: string, data: UpdateWorldSettingDTO): Promise<WorldSetting>;
    delete(id: string): Promise<void>;
  };

  // Foreshadowing
  foreshadowing: {
    list(projectId: string): Promise<Foreshadowing[]>;
    create(data: CreateForeshadowingDTO): Promise<Foreshadowing>;
    update(id: string, data: UpdateForeshadowingDTO): Promise<Foreshadowing>;
    delete(id: string): Promise<void>;
  };

  // Revenue
  revenue: {
    list(projectId: string): Promise<Revenue[]>;
    create(data: CreateRevenueDTO): Promise<Revenue>;
    delete(id: string): Promise<void>;
  };

  // CheckIn
  checkin: {
    today(projectId: string): Promise<CheckIn | null>;
    monthly(projectId: string, year: number, month: number): Promise<CheckIn[]>;
  };

  // Storyboard
  storyboard: {
    list(projectId: string): Promise<Storyboard[]>;
    create(data: CreateStoryboardDTO): Promise<Storyboard>;
    update(id: string, data: UpdateStoryboardDTO): Promise<Storyboard>;
    delete(id: string): Promise<void>;
  };

  // AI
  ai: {
    stream(config: AIConfig, request: AIRequest): Promise<void>;
    onStreamChunk(callback: (chunk: string) => void): () => void;
    onStreamComplete(callback: (response: AIResponse) => void): () => void;
    onStreamError(callback: (error: string) => void): () => void;
    getConfig(): Promise<AIConfig>;
    saveConfig(config: AIConfig): Promise<void>;
    validateConfig(config: AIConfig): Promise<boolean>;
  };

  // File
  file: {
    backup(): Promise<string>;
    restore(filePath?: string): Promise<void>;
    exportDb(): Promise<string>;
    importDb(filePath?: string): Promise<void>;
  };

  // App
  app: {
    getPath(): Promise<string>;
    minimize(): void;
    maximize(): void;
    close(): void;
  };
}

// ==================== 工具函数 ====================

/** 包装 ipcRenderer.invoke，统一错误处理 */
function createInvoker<T>(channel: string): (...args: any[]) => Promise<T> {
  return (...args: any[]) => {
    return ipcRenderer.invoke(channel, ...args) as Promise<T>;
  };
}

/** 创建流式 AI 调用 */
function createAIStreamCaller(): {
  stream: (config: AIConfig, request: AIRequest) => Promise<void>;
  onStreamChunk: (callback: (chunk: string) => void) => () => void;
  onStreamComplete: (callback: (response: AIResponse) => void) => () => void;
  onStreamError: (callback: (error: string) => void) => () => void;
} {
  return {
    stream: (config: AIConfig, request: AIRequest) => {
      return ipcRenderer.invoke(IPC_CHANNELS.AI_STREAM, config, request);
    },

    onStreamChunk: (callback: (chunk: string) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, chunk: string) => callback(chunk);
      ipcRenderer.on('ai:stream-chunk', handler);
      return () => ipcRenderer.removeListener('ai:stream-chunk', handler);
    },

    onStreamComplete: (callback: (response: AIResponse) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, response: AIResponse) => callback(response);
      ipcRenderer.on('ai:stream-complete', handler);
      return () => ipcRenderer.removeListener('ai:stream-complete', handler);
    },

    onStreamError: (callback: (error: string) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, error: string) => callback(error);
      ipcRenderer.on('ai:stream-error', handler);
      return () => ipcRenderer.removeListener('ai:stream-error', handler);
    },
  };
}

const aiStreamCaller = createAIStreamCaller();

// ==================== 暴露 API ====================

contextBridge.exposeInMainWorld('electronAPI', {
  project: {
    list: createInvoker<Project[]>(IPC_CHANNELS.PROJECT_LIST),
    get: createInvoker<Project | null>(IPC_CHANNELS.PROJECT_GET),
    create: createInvoker<Project>(IPC_CHANNELS.PROJECT_CREATE),
    update: createInvoker<Project>(IPC_CHANNELS.PROJECT_UPDATE),
    delete: createInvoker<void>(IPC_CHANNELS.PROJECT_DELETE),
  },

  chapter: {
    list: createInvoker<Chapter[]>(IPC_CHANNELS.CHAPTER_LIST),
    get: createInvoker<Chapter | null>(IPC_CHANNELS.CHAPTER_GET),
    create: createInvoker<Chapter>(IPC_CHANNELS.CHAPTER_CREATE),
    update: createInvoker<Chapter>(IPC_CHANNELS.CHAPTER_UPDATE),
    delete: createInvoker<void>(IPC_CHANNELS.CHAPTER_DELETE),
    reorder: createInvoker<void>(IPC_CHANNELS.CHAPTER_REORDER),
  },

  character: {
    list: createInvoker<Character[]>(IPC_CHANNELS.CHARACTER_LIST),
    get: createInvoker<Character | null>(IPC_CHANNELS.CHARACTER_GET),
    create: createInvoker<Character>(IPC_CHANNELS.CHARACTER_CREATE),
    update: createInvoker<Character>(IPC_CHANNELS.CHARACTER_UPDATE),
    delete: createInvoker<void>(IPC_CHANNELS.CHARACTER_DELETE),
  },

  charRelation: {
    list: createInvoker<CharacterRelation[]>(IPC_CHANNELS.CHAR_RELATION_LIST),
    create: createInvoker<CharacterRelation>(IPC_CHANNELS.CHAR_RELATION_CREATE),
    delete: createInvoker<void>(IPC_CHANNELS.CHAR_RELATION_DELETE),
  },

  outline: {
    list: createInvoker<Outline[]>(IPC_CHANNELS.OUTLINE_LIST),
    create: createInvoker<Outline>(IPC_CHANNELS.OUTLINE_CREATE),
    update: createInvoker<Outline>(IPC_CHANNELS.OUTLINE_UPDATE),
    delete: createInvoker<void>(IPC_CHANNELS.OUTLINE_DELETE),
    reorder: createInvoker<void>(IPC_CHANNELS.OUTLINE_REORDER),
  },

  worldSetting: {
    list: createInvoker<WorldSetting[]>(IPC_CHANNELS.WORLD_SETTING_LIST),
    create: createInvoker<WorldSetting>(IPC_CHANNELS.WORLD_SETTING_CREATE),
    update: createInvoker<WorldSetting>(IPC_CHANNELS.WORLD_SETTING_UPDATE),
    delete: createInvoker<void>(IPC_CHANNELS.WORLD_SETTING_DELETE),
  },

  foreshadowing: {
    list: createInvoker<Foreshadowing[]>(IPC_CHANNELS.FORESHADOWING_LIST),
    create: createInvoker<Foreshadowing>(IPC_CHANNELS.FORESHADOWING_CREATE),
    update: createInvoker<Foreshadowing>(IPC_CHANNELS.FORESHADOWING_UPDATE),
    delete: createInvoker<void>(IPC_CHANNELS.FORESHADOWING_DELETE),
  },

  revenue: {
    list: createInvoker<Revenue[]>(IPC_CHANNELS.REVENUE_LIST),
    create: createInvoker<Revenue>(IPC_CHANNELS.REVENUE_CREATE),
    delete: createInvoker<void>(IPC_CHANNELS.REVENUE_DELETE),
  },

  checkin: {
    today: createInvoker<CheckIn | null>(IPC_CHANNELS.CHECKIN_TODAY),
    monthly: createInvoker<CheckIn[]>(IPC_CHANNELS.CHECKIN_MONTHLY),
  },

  storyboard: {
    list: createInvoker<Storyboard[]>(IPC_CHANNELS.STORYBOARD_LIST),
    create: createInvoker<Storyboard>(IPC_CHANNELS.STORYBOARD_CREATE),
    update: createInvoker<Storyboard>(IPC_CHANNELS.STORYBOARD_UPDATE),
    delete: createInvoker<void>(IPC_CHANNELS.STORYBOARD_DELETE),
  },

  ai: {
    stream: aiStreamCaller.stream,
    onStreamChunk: aiStreamCaller.onStreamChunk,
    onStreamComplete: aiStreamCaller.onStreamComplete,
    onStreamError: aiStreamCaller.onStreamError,
    getConfig: createInvoker<AIConfig>(IPC_CHANNELS.AI_CONFIG + ':get'),
    saveConfig: createInvoker<void>(IPC_CHANNELS.AI_CONFIG + ':save'),
    validateConfig: createInvoker<boolean>(IPC_CHANNELS.AI_CONFIG + ':validate'),
  },

  file: {
    backup: createInvoker<string>(IPC_CHANNELS.FILE_BACKUP),
    restore: createInvoker<void>(IPC_CHANNELS.FILE_RESTORE),
    exportDb: createInvoker<string>(IPC_CHANNELS.FILE_EXPORT),
    importDb: createInvoker<void>(IPC_CHANNELS.FILE_IMPORT),
  },

  app: {
    getPath: createInvoker<string>(IPC_CHANNELS.APP_GET_PATH),
    minimize: () => ipcRenderer.send('app:minimize'),
    maximize: () => ipcRenderer.send('app:maximize'),
    close: () => ipcRenderer.send('app:close'),
  },
} satisfies ElectronAPI);
