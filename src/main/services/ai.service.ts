/**
 * AI Service — DeepSeek API 调用（流式）
 * 通过硅基流动 OpenAI 兼容接口调用 DeepSeek 模型
 */
import OpenAI from 'openai';
import type { AIConfig, AIRequest, AIResponse } from '../../shared/types';
import { logger } from '../utils/logger';

/** AI 操作对应的 System Prompt */
const SYSTEM_PROMPTS: Record<string, string> = {
  continue: '你是一位专业的小说续写助手。请根据上下文，以一致的文风和角色性格续写接下来的内容。直接输出续写内容，不要添加额外解释。',
  polish: '你是一位专业的文字润色编辑。请对以下内容进行润色，保持原意不变，优化表达、节奏和文采。直接输出润色后的内容，不要添加额外解释。',
  outline: '你是一位专业的小说大纲策划师。请根据当前内容生成后续可能的情节发展大纲，包含关键情节点和转折。',
  dialogue: '你是一位专业的对白设计师。请根据上下文和角色性格，生成自然生动的角色对话。直接输出对话内容。',
};

/** 构建请求消息 */
function buildMessages(action: string, context: string, instruction?: string): Array<{ role: 'system' | 'user'; content: string }> {
  const systemPrompt = SYSTEM_PROMPTS[action] || SYSTEM_PROMPTS.continue;
  let userPrompt = context;
  if (instruction) {
    userPrompt = `补充要求：${instruction}\n\n上下文内容：\n${context}`;
  }
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}

/** 验证 AI 配置是否可用 */
export async function validateAIConfig(config: AIConfig): Promise<boolean> {
  try {
    const client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.apiEndpoint,
      timeout: 10000,
    });

    const response = await client.chat.completions.create({
      model: config.model,
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 5,
    });

    return response.choices.length > 0;
  } catch (err: any) {
    logger.warn(`AI 配置验证失败: ${err.message}`);
    return false;
  }
}

/** 流式 AI 请求 — 返回一个 async generator */
export async function* streamAIRequest(
  config: AIConfig,
  request: AIRequest,
): AsyncGenerator<string, AIResponse, void> {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.apiEndpoint,
  });

  const messages = buildMessages(request.action, request.context, request.instruction);
  let fullContent = '';
  let promptTokens = 0;
  let completionTokens = 0;

  logger.info(`开始 AI 流式请求 — action: ${request.action}, model: ${config.model}`);

  try {
    const stream = await client.chat.completions.create({
      model: config.model,
      messages,
      stream: true,
      max_tokens: 4096,
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullContent += delta;
        yield delta;
      }
      // 记录 usage（在最后一个 chunk 中）
      if (chunk.usage) {
        promptTokens = chunk.usage.prompt_tokens;
        completionTokens = chunk.usage.completion_tokens;
      }
    }

    logger.info(`AI 流式请求完成 — 输出 ${fullContent.length} 字符`);

    return {
      content: fullContent,
      usage: {
        promptTokens,
        completionTokens,
      },
    };
  } catch (err: any) {
    logger.error(`AI 请求失败: ${err.message}`);
    throw new Error(`AI 请求失败: ${err.message}`);
  }
}
