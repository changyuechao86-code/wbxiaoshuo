/**
 * Character IPC 处理器 — 角色 CRUD + 关系管理
 */
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { characterRepo } from '../db/repositories/character.repo';
import { characterRelationRepo } from '../db/repositories/character-relation.repo';
import { logger } from '../utils/logger';
import type { CreateCharacterDTO, UpdateCharacterDTO, CreateCharacterRelationDTO } from '../../shared/types';

export function registerCharacterHandlers(): void {
  // --- Character ---
  ipcMain.handle(IPC_CHANNELS.CHARACTER_LIST, async (_event, projectId: string) => {
    try {
      return characterRepo.listByProject(projectId);
    } catch (err: any) {
      logger.error(`角色列表获取失败: ${err.message}`);
      throw new Error(`获取角色列表失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHARACTER_GET, async (_event, id: string) => {
    try {
      const character = characterRepo.getById(id);
      if (!character) throw new Error(`角色不存在: ${id}`);
      return character;
    } catch (err: any) {
      logger.error(`角色获取失败: ${err.message}`);
      throw new Error(`获取角色失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHARACTER_CREATE, async (_event, data: CreateCharacterDTO) => {
    try {
      if (!data.name?.trim()) throw new Error('角色名称不能为空');
      return characterRepo.create(data);
    } catch (err: any) {
      logger.error(`角色创建失败: ${err.message}`);
      throw new Error(`创建角色失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHARACTER_UPDATE, async (_event, id: string, data: UpdateCharacterDTO) => {
    try {
      return characterRepo.update(id, data);
    } catch (err: any) {
      logger.error(`角色更新失败: ${err.message}`);
      throw new Error(`更新角色失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHARACTER_DELETE, async (_event, id: string) => {
    try {
      characterRepo.delete(id);
    } catch (err: any) {
      logger.error(`角色删除失败: ${err.message}`);
      throw new Error(`删除角色失败: ${err.message}`);
    }
  });

  // --- Character Relation ---
  ipcMain.handle(IPC_CHANNELS.CHAR_RELATION_LIST, async (_event, projectId: string) => {
    try {
      return characterRelationRepo.listByProject(projectId);
    } catch (err: any) {
      logger.error(`角色关系列表获取失败: ${err.message}`);
      throw new Error(`获取角色关系列表失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHAR_RELATION_CREATE, async (_event, data: CreateCharacterRelationDTO) => {
    try {
      return characterRelationRepo.create(data);
    } catch (err: any) {
      logger.error(`角色关系创建失败: ${err.message}`);
      throw new Error(`创建角色关系失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHAR_RELATION_DELETE, async (_event, id: string) => {
    try {
      characterRelationRepo.delete(id);
    } catch (err: any) {
      logger.error(`角色关系删除失败: ${err.message}`);
      throw new Error(`删除角色关系失败: ${err.message}`);
    }
  });
}
