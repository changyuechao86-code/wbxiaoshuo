/**
 * 渲染进程类型导出汇总
 */
export type {
  Project, Chapter, Character, CharacterRelation, Outline,
  WorldSetting, Foreshadowing, Revenue, CheckIn, Storyboard,
  AIConfig, AIRequest, AIResponse, AIAction, AppSettings,
  ProjectType, ChapterStatus, OutlineNodeType, ForeshadowStatus,
  CreateProjectDTO, UpdateProjectDTO,
  CreateChapterDTO, UpdateChapterDTO,
  CreateCharacterDTO, UpdateCharacterDTO,
  CreateCharacterRelationDTO,
  CreateOutlineDTO, UpdateOutlineDTO, OutlineReorderItem,
  CreateWorldSettingDTO, UpdateWorldSettingDTO,
  CreateForeshadowingDTO, UpdateForeshadowingDTO,
  CreateRevenueDTO,
  CreateStoryboardDTO, UpdateStoryboardDTO,
} from '../../shared/types';

export { IPC_CHANNELS } from '../../shared/ipc-channels';
