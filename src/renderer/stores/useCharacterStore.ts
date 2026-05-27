/**
 * 角色状态 Store
 */
import { create } from 'zustand';
import type { Character, CharacterRelation, CreateCharacterDTO, UpdateCharacterDTO, CreateCharacterRelationDTO } from '../../shared/types';

interface CharacterState {
  characters: Character[];
  relations: CharacterRelation[];
  currentCharacter: Character | null;
  isLoading: boolean;
  error: string | null;

  loadCharacters: (projectId: string) => Promise<void>;
  loadRelations: (projectId: string) => Promise<void>;
  createCharacter: (data: CreateCharacterDTO) => Promise<Character>;
  updateCharacter: (id: string, data: UpdateCharacterDTO) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  createRelation: (data: CreateCharacterRelationDTO) => Promise<CharacterRelation>;
  deleteRelation: (id: string) => Promise<void>;
  setCurrentCharacter: (character: Character | null) => void;
  clearError: () => void;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],
  relations: [],
  currentCharacter: null,
  isLoading: false,
  error: null,

  loadCharacters: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const characters = await window.electronAPI.character.list(projectId);
      set({ characters, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || '加载角色列表失败', isLoading: false });
    }
  },

  loadRelations: async (projectId: string) => {
    try {
      const relations = await window.electronAPI.charRelation.list(projectId);
      set({ relations });
    } catch (err: any) {
      set({ error: err.message || '加载角色关系失败' });
    }
  },

  createCharacter: async (data: CreateCharacterDTO) => {
    set({ error: null });
    try {
      const character = await window.electronAPI.character.create(data);
      set((s) => ({ characters: [...s.characters, character] }));
      return character;
    } catch (err: any) {
      set({ error: err.message || '创建角色失败' });
      throw err;
    }
  },

  updateCharacter: async (id: string, data: UpdateCharacterDTO) => {
    set({ error: null });
    try {
      const updated = await window.electronAPI.character.update(id, data);
      set((s) => ({
        characters: s.characters.map((c) => c.id === id ? updated : c),
        currentCharacter: s.currentCharacter?.id === id ? updated : s.currentCharacter,
      }));
    } catch (err: any) {
      set({ error: err.message || '更新角色失败' });
      throw err;
    }
  },

  deleteCharacter: async (id: string) => {
    set({ error: null });
    try {
      await window.electronAPI.character.delete(id);
      set((s) => ({
        characters: s.characters.filter((c) => c.id !== id),
        currentCharacter: s.currentCharacter?.id === id ? null : s.currentCharacter,
        relations: s.relations.filter((r) => r.sourceId !== id && r.targetId !== id),
      }));
    } catch (err: any) {
      set({ error: err.message || '删除角色失败' });
      throw err;
    }
  },

  createRelation: async (data: CreateCharacterRelationDTO) => {
    set({ error: null });
    try {
      const relation = await window.electronAPI.charRelation.create(data);
      set((s) => ({ relations: [...s.relations, relation] }));
      return relation;
    } catch (err: any) {
      set({ error: err.message || '创建角色关系失败' });
      throw err;
    }
  },

  deleteRelation: async (id: string) => {
    set({ error: null });
    try {
      await window.electronAPI.charRelation.delete(id);
      set((s) => ({ relations: s.relations.filter((r) => r.id !== id) }));
    } catch (err: any) {
      set({ error: err.message || '删除角色关系失败' });
      throw err;
    }
  },

  setCurrentCharacter: (currentCharacter: Character | null) => set({ currentCharacter }),
  clearError: () => set({ error: null }),
}));
