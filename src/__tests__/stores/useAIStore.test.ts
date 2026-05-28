import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AIConfig, AIRequest, AIResponse } from '../../shared/types';

const defaultConfig: AIConfig = {
  provider: 'deepseek',
  apiKey: 'key',
  apiEndpoint: 'https://api.example.test/v1',
  model: 'deepseek-test',
};

let chunkHandler: ((chunk: string) => void) | null = null;
let completeHandler: ((response: AIResponse) => void) | null = null;
let errorHandler: ((error: string) => void) | null = null;

const cleanupChunk = vi.fn();
const cleanupComplete = vi.fn();
const cleanupError = vi.fn();

const mockApi = {
  ai: {
    stream: vi.fn(),
    onStreamChunk: vi.fn((callback: (chunk: string) => void) => {
      chunkHandler = callback;
      return cleanupChunk;
    }),
    onStreamComplete: vi.fn((callback: (response: AIResponse) => void) => {
      completeHandler = callback;
      return cleanupComplete;
    }),
    onStreamError: vi.fn((callback: (error: string) => void) => {
      errorHandler = callback;
      return cleanupError;
    }),
    getConfig: vi.fn(),
    saveConfig: vi.fn(),
    validateConfig: vi.fn(),
  },
};

if (!window.electronAPI) {
  (window as any).electronAPI = {};
}
Object.assign(window.electronAPI, mockApi);

import { useAIStore } from '../../renderer/stores/useAIStore';

function resetStore(): void {
  useAIStore.setState({
    config: {
      provider: 'deepseek',
      apiKey: '',
      apiEndpoint: 'https://api.siliconflow.cn/v1',
      model: 'deepseek-ai/DeepSeek-V3',
    },
    status: 'idle',
    generatedContent: '',
    usage: null,
    isLoading: false,
    error: null,
  });
}

describe('useAIStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chunkHandler = null;
    completeHandler = null;
    errorHandler = null;
    resetStore();
  });

  it('loads AI config', async () => {
    mockApi.ai.getConfig.mockResolvedValue(defaultConfig);

    await useAIStore.getState().loadConfig();

    expect(useAIStore.getState().config).toEqual(defaultConfig);
    expect(useAIStore.getState().isLoading).toBe(false);
  });

  it('stores fallback load errors', async () => {
    mockApi.ai.getConfig.mockRejectedValue({});

    await useAIStore.getState().loadConfig();

    expect(useAIStore.getState().error).toBe('\u52a0\u8f7d AI \u914d\u7f6e\u5931\u8d25');
    expect(useAIStore.getState().isLoading).toBe(false);
  });

  it('saves AI config', async () => {
    mockApi.ai.saveConfig.mockResolvedValue(undefined);

    await useAIStore.getState().saveConfig(defaultConfig);

    expect(mockApi.ai.saveConfig).toHaveBeenCalledWith(defaultConfig);
    expect(useAIStore.getState().config).toEqual(defaultConfig);
  });

  it('returns false when validation throws', async () => {
    mockApi.ai.validateConfig.mockRejectedValue(new Error('bad config'));

    await expect(useAIStore.getState().validateConfig()).resolves.toBe(false);
  });

  it('streams chunks and cleans listeners on complete', async () => {
    const request: AIRequest = { action: 'continue', context: 'hello' };
    mockApi.ai.stream.mockImplementation(async () => {
      chunkHandler?.('first ');
      chunkHandler?.('second');
      completeHandler?.({
        content: 'first second',
        usage: { promptTokens: 1, completionTokens: 2 },
      });
    });

    await useAIStore.getState().streamRequest(request);

    const state = useAIStore.getState();
    expect(state.generatedContent).toBe('first second');
    expect(state.status).toBe('complete');
    expect(state.usage).toEqual({ promptTokens: 1, completionTokens: 2 });
    expect(cleanupChunk).toHaveBeenCalledTimes(1);
    expect(cleanupComplete).toHaveBeenCalledTimes(1);
    expect(cleanupError).toHaveBeenCalledTimes(1);
  });

  it('stores stream errors and cleans listeners', async () => {
    mockApi.ai.stream.mockImplementation(async () => {
      errorHandler?.('stream failed');
    });

    await useAIStore.getState().streamRequest({ action: 'polish', context: 'draft' });

    expect(useAIStore.getState().status).toBe('error');
    expect(useAIStore.getState().error).toBe('stream failed');
    expect(cleanupChunk).toHaveBeenCalledTimes(1);
    expect(cleanupComplete).toHaveBeenCalledTimes(1);
    expect(cleanupError).toHaveBeenCalledTimes(1);
  });
});
