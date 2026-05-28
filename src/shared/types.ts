export type ProjectType = 'novel' | 'script';
export type ChapterStatus = 'draft' | 'writing' | 'completed';
export type OutlineNodeType = 'volume' | 'chapter';
export type ForeshadowStatus = 'planted' | 'hinted' | 'resolved';
export type WorldCategory = 'geography' | 'faction' | 'history' | 'magic' | 'culture' | 'creature' | 'other';
export type RelationType = 'friend' | 'enemy' | 'family' | 'lover' | 'master_student' | 'colleague' | 'other';
export type AIAction = 'continue' | 'polish' | 'outline' | 'dialogue';
export type AIProvider = 'deepseek';

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  dailyGoal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  projectId: string;
  title: string;
  content: string;
  plainText: string;
  wordCount: number;
  status: ChapterStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  aliases: string;
  appearance: string;
  personality: string;
  background: string;
  tags: string;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterRelation {
  id: string;
  projectId: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  description: string;
}

export interface Outline {
  id: string;
  projectId: string;
  title: string;
  type: OutlineNodeType;
  parentId: string | null;
  chapterId: string | null;
  order: number;
  note: string;
}

export interface WorldSetting {
  id: string;
  projectId: string;
  name: string;
  category: WorldCategory;
  parentId: string | null;
  content: string;
  order: number;
}

export interface Foreshadowing {
  id: string;
  projectId: string;
  title: string;
  description: string;
  plantedChapterId: string;
  resolvedChapterId: string | null;
  status: ForeshadowStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Revenue {
  id: string;
  projectId: string;
  date: string;
  amount: number;
  platform: string;
  note: string;
}

export interface CheckIn {
  id: string;
  projectId: string;
  date: string;
  wordCount: number;
  goalMet: boolean;
}

export interface Storyboard {
  id: string;
  projectId: string;
  chapterId: string;
  sceneNumber: number;
  shotNumber: number;
  shotType: string;
  cameraMovement: string;
  duration: number;
  description: string;
  prompt: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  fontSize: number;
  lineHeight: number;
  autoSaveDelay: number;
}

export interface OutlineReorderItem {
  id: string;
  parentId: string | null;
  order: number;
}

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  apiEndpoint: string;
  model: string;
}

export interface AIRequest {
  action: AIAction;
  context: string;
  instruction?: string;
}

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface AIStreamChunk {
  content: string;
  done: boolean;
}

export type CreateProjectDTO = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProjectDTO = Partial<Pick<Project, 'name' | 'type' | 'dailyGoal'>>;

export type CreateChapterDTO = Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateChapterDTO = Partial<Pick<Chapter, 'title' | 'content' | 'plainText' | 'wordCount' | 'status' | 'order'>>;

export type CreateCharacterDTO = Omit<Character, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCharacterDTO = Partial<Omit<Character, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>;

export type CreateCharacterRelationDTO = Omit<CharacterRelation, 'id'>;
export type UpdateCharacterRelationDTO = Partial<Omit<CharacterRelation, 'id' | 'projectId'>>;

export type CreateOutlineDTO = Omit<Outline, 'id'>;
export type UpdateOutlineDTO = Partial<Omit<Outline, 'id' | 'projectId'>>;

export type CreateWorldSettingDTO = Omit<WorldSetting, 'id'>;
export type UpdateWorldSettingDTO = Partial<Omit<WorldSetting, 'id' | 'projectId'>>;

export type CreateForeshadowingDTO = Omit<Foreshadowing, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateForeshadowingDTO = Partial<Omit<Foreshadowing, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>;

export type CreateRevenueDTO = Omit<Revenue, 'id'>;
export type UpdateRevenueDTO = Partial<Omit<Revenue, 'id' | 'projectId'>>;

export type CreateCheckInDTO = Omit<CheckIn, 'id'>;
export type UpdateCheckInDTO = Partial<Omit<CheckIn, 'id' | 'projectId'>>;

export type CreateStoryboardDTO = Omit<Storyboard, 'id'>;
export type UpdateStoryboardDTO = Partial<Omit<Storyboard, 'id' | 'projectId'>>;
