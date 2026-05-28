import { create } from 'zustand';
import type {
  Character,
  CharacterRelation,
  CreateCharacterDTO,
  CreateCharacterRelationDTO,
  UpdateCharacterDTO,
} from '../../shared/types';

const text = {
  createCharacterFailed: '\u521b\u5efa\u89d2\u8272\u5931\u8d25',
  createRelationFailed: '\u521b\u5efa\u89d2\u8272\u5173\u7cfb\u5931\u8d25',
  deleteCharacterFailed: '\u5220\u9664\u89d2\u8272\u5931\u8d25',
  deleteRelationFailed: '\u5220\u9664\u89d2\u8272\u5173\u7cfb\u5931\u8d25',
  loadCharactersFailed: '\u52a0\u8f7d\u89d2\u8272\u5217\u8868\u5931\u8d25',
  loadRelationsFailed: '\u52a0\u8f7d\u89d2\u8272\u5173\u7cfb\u5931\u8d25',
  updateCharacterFailed: '\u66f4\u65b0\u89d2\u8272\u5931\u8d25',
};

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

export const useCharacterStore = create<CharacterState>((set) => ({
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
      set({ error: err.message || text.loadCharactersFailed, isLoading: false });
    }
  },

  loadRelations: async (projectId: string) => {
    try {
      const relations = await window.electronAPI.charRelation.list(projectId);
      set({ relations });
    } catch (err: any) {
      set({ error: err.message || text.loadRelationsFailed });
    }
  },

  createCharacter: async (data: CreateCharacterDTO) => {
    set({ error: null });
    try {
      const character = await window.electronAPI.character.create(data);
      set((s) => ({ characters: [...s.characters, character] }));
      return character;
    } catch (err: any) {
      set({ error: err.message || text.createCharacterFailed });
      throw err;
    }
  },

  updateCharacter: async (id: string, data: UpdateCharacterDTO) => {
    set({ error: null });
    try {
      const updated = await window.electronAPI.character.update(id, data);
      set((s) => ({
        characters: s.characters.map((c) => (c.id === id ? updated : c)),
        currentCharacter: s.currentCharacter?.id === id ? updated : s.currentCharacter,
      }));
    } catch (err: any) {
      set({ error: err.message || text.updateCharacterFailed });
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
      set({ error: err.message || text.deleteCharacterFailed });
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
      set({ error: err.message || text.createRelationFailed });
      throw err;
    }
  },

  deleteRelation: async (id: string) => {
    set({ error: null });
    try {
      await window.electronAPI.charRelation.delete(id);
      set((s) => ({ relations: s.relations.filter((r) => r.id !== id) }));
    } catch (err: any) {
      set({ error: err.message || text.deleteRelationFailed });
      throw err;
    }
  },

  setCurrentCharacter: (currentCharacter: Character | null) => set({ currentCharacter }),
  clearError: () => set({ error: null }),
}));
