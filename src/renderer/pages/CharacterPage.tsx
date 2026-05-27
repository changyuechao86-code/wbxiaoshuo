/**
 * 角色管理页面
 */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { CharacterList } from '../components/character/CharacterList';
import { CharacterDetail } from '../components/character/CharacterDetail';
import { CharacterForm } from '../components/character/CharacterForm';
import { SearchInput } from '../components/common/SearchInput';
import { EmptyState } from '../components/common/EmptyState';
import { useCharacterStore } from '../stores/useCharacterStore';
import { useAppStore } from '../stores/useAppStore';
import type { Character } from '../../shared/types';

export function CharacterPage(): React.ReactElement {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    characters, relations, currentCharacter, isLoading,
    loadCharacters, loadRelations, createCharacter, updateCharacter, deleteCharacter,
    setCurrentCharacter,
  } = useCharacterStore();
  const { setCurrentProjectId } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingChar, setEditingChar] = useState<Character | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  useEffect(() => {
    if (projectId) {
      setCurrentProjectId(projectId);
      loadCharacters(projectId);
      loadRelations(projectId);
    }
  }, [projectId, loadCharacters, loadRelations, setCurrentProjectId]);

  const filtered = searchQuery
    ? characters.filter((c) => c.name.includes(searchQuery))
    : characters;

  const handleSelect = (character: Character): void => {
    setCurrentCharacter(character);
  };

  const handleCreate = (): void => {
    setEditingChar(null);
    setShowForm(true);
  };

  const handleSave = async (data: Partial<Character>): Promise<void> => {
    if (!projectId) return;
    try {
      if (editingChar) {
        await updateCharacter(editingChar.id, data as any);
        setSnackbar({ open: true, message: '角色已更新', severity: 'success' });
      } else {
        await createCharacter({
          projectId,
          name: data.name || '',
          aliases: data.aliases || '[]',
          appearance: data.appearance || '',
          personality: data.personality || '',
          background: data.background || '',
          tags: data.tags || '[]',
          avatar: data.avatar || null,
        });
        setSnackbar({ open: true, message: '角色已创建', severity: 'success' });
      }
    } catch {
      setSnackbar({ open: true, message: '保存角色失败', severity: 'error' });
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteCharacter(id);
      setSnackbar({ open: true, message: '角色已删除', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: '删除角色失败', severity: 'error' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 顶部操作栏 */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2a2a4e] bg-[#0f0f23]">
        <h2 className="text-sm font-semibold text-[#cdd6f4]">👤 角色管理</h2>
        <div className="flex-1" />
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={{ textTransform: 'none', fontSize: 12 }}
        >
          新建角色
        </Button>
        <Tooltip title="刷新">
          <IconButton
            size="small"
            onClick={() => {
              if (projectId) {
                loadCharacters(projectId);
                loadRelations(projectId);
              }
            }}
            sx={{ color: '#6c7086' }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      {/* 主内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧角色列表 */}
        <div
          className="flex flex-col border-r border-[#2a2a4e] bg-[#16213e]"
          style={{ width: 240, minWidth: 240 }}
        >
          <div className="p-2 border-b border-[#2a2a4e]">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="搜索角色..."
            />
          </div>
          <div className="flex-1 overflow-y-auto p-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-sm text-[#6c7086]">加载中...</div>
            ) : filtered.length === 0 ? (
              <EmptyState icon="👤" title="暂无角色" description="创建你的第一个角色" />
            ) : (
              <CharacterList
                characters={filtered}
                selectedId={currentCharacter?.id || null}
                onSelect={handleSelect}
              />
            )}
          </div>
        </div>

        {/* 右侧角色详情 */}
        <div className="flex-1 overflow-y-auto">
          {currentCharacter ? (
            <>
              <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-[#2a2a4e]">
                <Button
                  size="small"
                  onClick={() => {
                    setEditingChar(currentCharacter);
                    setShowForm(true);
                  }}
                  sx={{ textTransform: 'none', fontSize: 12, color: '#a0a0b0' }}
                >
                  编辑
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(currentCharacter.id)}
                  sx={{ textTransform: 'none', fontSize: 12 }}
                >
                  删除
                </Button>
              </div>
              <CharacterDetail character={currentCharacter} relations={relations} />
            </>
          ) : (
            <EmptyState
              icon="👈"
              title="选择一个角色"
              description="从左侧列表选择角色查看详情"
            />
          )}
        </div>
      </div>

      {/* 角色编辑表单 */}
      <CharacterForm
        open={showForm}
        character={editingChar}
        onSave={handleSave}
        onClose={() => setShowForm(false)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
