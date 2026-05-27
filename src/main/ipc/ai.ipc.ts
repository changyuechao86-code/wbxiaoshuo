/**
 * AI IPC 处理器 — AI 请求代理（流式）
 * 主进程发起 API 调用，通过 IPC 事件流式推送结果到渲染进程
 */
import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { streamAIRequest, validateAIConfig } from '../services/ai.service';
import { getDb } from '../db/connection';
import { logger } from '../utils/logger';
import type { AIConfig, AIRequest } from '../../shared/types';

export function registerAIHandlers(): void {
  // 获取 AI 配置
  ipcMain.handle(IPC_CHANNELS.AI_CONFIG + ':get', async () => {
    try {
      const db = getDb();
      const rows = db.prepare('SELECT key, value FROM settings WHERE key LIKE ?').all('ai_%') as { key: string; value: string }[];
      const config: AIConfig = {
        provider: 'deepseek',
        apiKey: rows.find(r => r.key === 'ai_api_key')?.value || '',
        apiEndpoint: rows.find(r => r.key === 'ai_endpoint')?.value || 'https://api.siliconflow.cn/v1',
        model: rows.find(r => r.key === 'ai_model')?.value || 'deepseek-ai/DeepSeek-V3',
      };
      return config;
    } catch (err: any) {
      logger.error(`AI 配置获取失败: ${err.message}`);
      throw new Error(`获取 AI 配置失败: ${err.message}`);
    }
  });

  // 保存 AI 配置
  ipcMain.handle(IPC_CHANNELS.AI_CONFIG + ':save', async (_event, config: AIConfig) => {
    try {
      const db = getDb();
      const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
      stmt.run('ai_provider', config.provider);
      stmt.run('ai_api_key', config.apiKey);
      stmt.run('ai_endpoint', config.apiEndpoint);
      stmt.run('ai_model', config.model);
    } catch (err: any) {
      logger.error(`AI 配置保存失败: ${err.message}`);
      throw new Error(`保存 AI 配置失败: ${err.message}`);
    }
  });

  // 验证 AI 配置
  ipcMain.handle(IPC_CHANNELS.AI_CONFIG + ':validate', async (_event, config: AIConfig) => {
    try {
      return await validateAIConfig(config);
    } catch (err: any) {
      logger.error(`AI 配置验证失败: ${err.message}`);
      return false;
    }
  });

  // 流式 AI 请求
  ipcMain.handle(IPC_CHANNELS.AI_STREAM, async (event, config: AIConfig, request: AIRequest) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      throw new Error('无法获取窗口实例');
    }

    try {
      const generator = streamAIRequest(config, request);

      for await (const chunk of generator) {
        // 流式推送每个 chunk
        if (typeof chunk === 'string') {
          win.webContents.send('ai:stream-chunk', chunk);
        } else {
          // 最后一个值是 AIResponse
          win.webContents.send('ai:stream-complete', chunk);
        }
      }
    } catch (err: any) {
      logger.error(`AI 流式请求失败: ${err.message}`);
      win.webContents.send('ai:stream-error', err.message);
      throw new Error(`AI 请求失败: ${err.message}`);
    }
  });
}
