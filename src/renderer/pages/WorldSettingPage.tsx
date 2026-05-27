/**
 * 世界观设定管理页面
 */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  IconButton,
  Tooltip,
  TextField,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { EmptyState } from '../components/common/EmptyState';
import { useWorldSettingStore } from '../stores/useWorldSettingStore';
import { useAppStore } from '../stores/useAppStore';
import { WORLD_SETTING_CATEGORIES } from '../utils/constants';
import type { WorldSetting, CreateWorldSettingDTO, UpdateWorldSettingDTO } from '../../shared/types';

export function WorldSettingPage(): React.ReactElement {
  const { projectId } = useParams<{ projectId: string }>();
  const { worldSettings, isLoading, loadWorldSettings, createWorldSetting, updateWorldSetting, deleteWorldSetting } =
    useWorldSettingStore();
  const { setCurrentProjectId } = useAppStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorldSetting | null>(null);

  // 表单字段
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('other');
  const [formContent, setFormContent] = useState('');
  const [formParentId, setFormParentId] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  useEffect(() => {
    if (projectId) {
      setCurrentProjectId(projectId);
      loadWorldSettings(projectId);
    }
  }, [projectId, loadWorldSettings, setCurrentProjectId]);

  const selected = worldSettings.find((w) => w.id === selectedId) || null;

  const handleOpenDialog = (item?: WorldSetting): void => {
    if (item) {
      setEditingItem(item);
      setFormName(item.name);
      setFormCategory(item.category);
      setFormContent(item.content);
      setFormParentId(item.parentId);
    } else {
      setEditingItem(null);
      setFormName('');
      setFormCategory('other');
      setFormContent('');
      setFormParentId(null);
    }
    setDialogOpen(true);
  };

  const handleSave = async (): Promise<void> => {
    if (!projectId || !formName.trim()) return;
    try {
      if (editingItem) {
        await updateWorldSetting(editingItem.id, {
          name: formName.trim(),
          category: formCategory,
          content: formContent,
          parentId: formParentId,
        });
        setSnackbar({ open: true, message: '设定已更新', severity: 'success' });
      } else {
        const order = worldSettings.length;
        await createWorldSetting({
          projectId,
          name: formName.trim(),
          category: formCategory,
          parentId: formParentId,
          content: formContent,
          order,
        });
        setSnackbar({ open: true, message: '设定已创建', severity: 'success' });
      }
      setDialogOpen(false);
    } catch {
      setSnackbar({ open: true, message: '保存失败', severity: 'error' });
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteWorldSetting(id);
      if (selectedId === id) setSelectedId(null);
      setSnackbar({ open: true, message: '设定已删除', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: '删除失败', severity: 'error' });
    }
  };

  const getCategoryLabel = (cat: string): string => {
    return WORLD_SETTING_CATEGORIES.find((c) => c.value === cat)?.label || cat;
  };

  return (
    <div className="flex flex-col h-full">
      {/* 顶部操作栏 */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2a2a4e] bg-[#0f0f23]">
        <h2 className="text-sm font-semibold text-[#cdd6f4]">🌍 世界观设定</h2>
        <div className="flex-1" />
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ textTransform: 'none', fontSize: 12 }}
        >
          新增设定
        </Button>
        <Tooltip title="刷新">
          <IconButton
            size="small"
            onClick={() => projectId && loadWorldSettings(projectId)}
            sx={{ color: '#6c7086' }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      {/* 主内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧列表 */}
        <div
          className="flex flex-col border-r border-[#2a2a4e] bg-[#16213e] overflow-y-auto"
          style={{ width: 260, minWidth: 260 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-sm text-[#6c7086]">加载中...</div>
          ) : worldSettings.length === 0 ? (
            <EmptyState icon="🌍" title="暂无世界观设定" />
          ) : (
            <div className="p-2 space-y-1">
              {worldSettings.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => setSelectedId(ws.id)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    selectedId === ws.id
                      ? 'bg-[#3a3a5e]'
                      : 'hover:bg-[#2a2a3e]'
                  }`}
                >
                  <Chip
                    label={getCategoryLabel(ws.category)}
                    size="small"
                    sx={{
                      fontSize: 10,
                      height: 20,
                      backgroundColor: 'rgba(6,182,212,0.15)',
                      color: '#22d3ee',
                    }}
                  />
                  <span className="text-sm text-[#cdd6f4] truncate flex-1">{ws.name}</span>
                  <div className="flex opacity-0 hover:opacity-100">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(ws);
                      }}
                      sx={{ p: 0.25 }}
                    >
                      <EditIcon sx={{ fontSize: 14, color: '#6c7086' }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(ws.id);
                      }}
                      sx={{ p: 0.25 }}
                    >
                      <DeleteIcon sx={{ fontSize: 14, color: '#ef5350' }} />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 右侧详情 */}
        <div className="flex-1 overflow-y-auto p-4">
          {selected ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#cdd6f4]">{selected.name}</h3>
              <Chip
                label={getCategoryLabel(selected.category)}
                size="small"
                sx={{
                  backgroundColor: 'rgba(6,182,212,0.15)',
                  color: '#22d3ee',
                }}
              />
              <div className="mt-4 text-sm text-[#a0a0b0] whitespace-pre-wrap leading-relaxed">
                {selected.content || '暂无详细说明'}
              </div>
            </div>
          ) : (
            <EmptyState icon="👈" title="选择一个设定" description="从左侧列表选择世界观设定查看详情" />
          )}
        </div>
      </div>

      {/* 编辑对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#e0e0e0', fontSize: 16 }}>
          {editingItem ? '编辑设定' : '新增设定'}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-3 mt-2">
            <TextField
              fullWidth
              size="small"
              label="名称"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <FormControl fullWidth size="small">
              <InputLabel>分类</InputLabel>
              <Select
                value={formCategory}
                label="分类"
                onChange={(e) => setFormCategory(e.target.value)}
              >
                {WORLD_SETTING_CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="详细说明"
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              multiline
              minRows={5}
              maxRows={15}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#a0a0b0' }}>取消</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formName.trim()}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

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
