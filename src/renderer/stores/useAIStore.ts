import { create } from 'zustand';
import type { AIConfig, AIRequest, AIResponse } from '../../shared/types';
import type { AIStreamStatus } from '../types/ai';

const text = {
  loadConfigFailed: '\u52a0\u8f7d AI \u914d\u7f6e\u5931\u8d25',
  requestFailed: 'AI \u8bf7\u6c42\u5931\u8d25',
  saveConfigFailed: '\u4fdd\u5b58 AI \u914d\u7f6e\u5931\u8d25',
};

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
      set({ error: err.message || text.loadConfigFailed, isLoading: false });
    }
  },

  saveConfig: async (config: AIConfig) => {
    set({ error: null });
    try {
      await window.electronAPI.ai.saveConfig(config);
      set({ config });
    } catch (err: any) {
      set({ error: err.message || text.saveConfigFailed });
      throw err;
    }
  },

  validateConfig: async () => {
    try {
      return await window.electronAPI.ai.validateConfig(get().config);
    } catch {
      return false;
    }
  },

  streamRequest: async (request: AIRequest) => {
    set({ status: 'streaming', generatedContent: '', error: null });

    const cleanup: (() => void)[] = [];
    const cleanupListeners = (): void => {
      cleanup.splice(0).forEach((fn) => fn());
    };

    cleanup.push(window.electronAPI.ai.onStreamChunk((chunk: string) => {
      set((s) => ({ generatedContent: s.generatedContent + chunk }));
    }));

    cleanup.push(window.electronAPI.ai.onStreamComplete((response: AIResponse) => {
      set({
        status: 'complete',
        usage: response.usage,
      });
      cleanupListeners();
    }));

    cleanup.push(window.electronAPI.ai.onStreamError((errMsg: string) => {
      set({ status: 'error', error: errMsg });
      cleanupListeners();
    }));

    try {
      await window.electronAPI.ai.stream(get().config, request);
    } catch (err: any) {
      set({ status: 'error', error: err.message || text.requestFailed });
      cleanupListeners();
    }
  },

  setStatus: (status: AIStreamStatus) => set({ status }),
  setGeneratedContent: (generatedContent: string) => set({ generatedContent }),
  appendGeneratedContent: (chunk: string) =>
    set((s) => ({ generatedContent: s.generatedContent + chunk })),
  clearGeneratedContent: () => set({ generatedContent: '', status: 'idle' }),
  clearError: () => set({ error: null }),
}));
