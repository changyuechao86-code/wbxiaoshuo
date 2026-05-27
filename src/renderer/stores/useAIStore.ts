/**
 * AI 状态 Store
 * 管理 AI 配置、流式响应状态、生成的文本等
 */
import { create } from 'zustand';
import type { AIConfig, AIRequest, AIResponse } from '../../shared/types';
import type { AIStreamStatus } from '../types/ai';

interface AIState {
  config: AIConfig;
  status: AIStreamStatus;
  generatedContent: string;
  usage: { promptTokens: number; completionTokens: number } | null;
  isLoading: boolean;
  error: string | null;

  loadConfig: () => Promise<void>;
  saveConfig: (config: AIConfig) => Promise<void>;
  validateConfig: () => Promise<boolean>;
  streamRequest: (request: AIRequest) => Promise<void>;
  setStatus: (status: AIStreamStatus) => void;
  setGeneratedContent: (content: string) => void;
  appendGeneratedContent: (chunk: string) => void;
  clearGeneratedContent: () => void;
  clearError: () => void;
}

const DEFAULT_CONFIG: AIConfig = {
  provider: 'deepseek',
  apiKey: '',
  apiEndpoint: 'https://api.siliconflow.cn/v1',
  model: 'deepseek-ai/DeepSeek-V3',
};

export const useAIStore = create<AIState>((set, get) => ({
  config: DEFAULT_CONFIG,
  status: 'idle',
  generatedContent: '',
  usage: null,
  isLoading: false,
  error: null,

  loadConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const config = await window.electronAPI.ai.getConfig();
      set({ config, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || '加载 AI 配置失败', isLoading: false });
    }
  },

  saveConfig: async (config: AIConfig) => {
    set({ error: null });
    try {
      await window.electronAPI.ai.saveConfig(config);
      set({ config });
    } catch (err: any) {
      set({ error: err.message || '保存 AI 配置失败' });
      throw err;
    }
  },

  validateConfig: async () => {
    try {
      const valid = await window.electronAPI.ai.validateConfig(get().config);
      return valid;
    } catch {
      return false;
    }
  },

  streamRequest: async (request: AIRequest) => {
    set({ status: 'streaming', generatedContent: '', error: null });

    const cleanup: (() => void)[] = [];

    // 监听流式数据
    const unsubChunk = window.electronAPI.ai.onStreamChunk((chunk: string) => {
      set((s) => ({ generatedContent: s.generatedContent + chunk }));
    });
    cleanup.push(unsubChunk);

    // 监听完成
    const unsubComplete = window.electronAPI.ai.onStreamComplete((response: AIResponse) => {
      set({
        status: 'complete',
        usage: response.usage,
      });
      cleanup.forEach((fn) => fn());
    });
    cleanup.push(unsubComplete);

    // 监听错误
    const unsubError = window.electronAPI.ai.onStreamError((errMsg: string) => {
      set({ status: 'error', error: errMsg });
      cleanup.forEach((fn) => fn());
    });
    cleanup.push(unsubError);

    try {
      await window.electronAPI.ai.stream(get().config, request);
    } catch (err: any) {
      set({ status: 'error', error: err.message || 'AI 请求失败' });
      cleanup.forEach((fn) => fn());
    }
  },

  setStatus: (status: AIStreamStatus) => set({ status }),
  setGeneratedContent: (generatedContent: string) => set({ generatedContent }),
  appendGeneratedContent: (chunk: string) =>
    set((s) => ({ generatedContent: s.generatedContent + chunk })),
  clearGeneratedContent: () => set({ generatedContent: '', status: 'idle' }),
  clearError: () => set({ error: null }),
}));
