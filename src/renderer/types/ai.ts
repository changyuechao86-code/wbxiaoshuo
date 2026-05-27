/**
 * AI 相关类型定义（渲染进程专用）
 */
import type { AIConfig, AIRequest, AIResponse, AIAction } from '../../shared/types';

export type { AIConfig, AIRequest, AIResponse, AIAction };

/** AI 流式请求状态 */
export type AIStreamStatus = 'idle' | 'streaming' | 'complete' | 'error';

/** AI 助手面板模式 */
export type AIAssistantMode = 'continue' | 'polish' | 'outline' | 'dialogue';

export const AI_MODE_LABELS: Record<AIAssistantMode, string> = {
  continue: 'AI 续写',
  polish: 'AI 润色',
  outline: 'AI 大纲',
  dialogue: 'AI 对白',
};

export const AI_MODE_ICONS: Record<AIAssistantMode, string> = {
  continue: '✏️',
  polish: '✨',
  outline: '🗺️',
  dialogue: '💬',
};
