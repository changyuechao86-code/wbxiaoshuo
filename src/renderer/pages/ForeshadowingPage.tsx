/**
 * 伏笔管理页面
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
import { useForeshadowingStore } from '../stores/useForeshadowingStore';
import { useAppStore } from '../stores/useAppStore';
import type { Foreshadowing, ForeshadowStatus, CreateForeshadowingDTO } from '../../shared/types';

const STATUS_LABELS: Record<ForeshadowStatus, { label: string; color: string }> = {
  planted: { label: '已埋设', color: '#ff9800' },
  hinted: { label: '已暗示', color: '#2196f3' },
  resolved: { label: '已回收', color: '#4caf50' },
};

export function ForeshadowingPage(): React.ReactElement {
  const { projectId } = useParams<{ projectId: string }>();
  const { foreshadowings, isLoading, loadForeshadowings, createForeshadowing, updateForeshadowing, deleteForeshadowing } =
    useForeshadowingStore();
  const { setCurrentProjectId } = useAppStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Foreshadowing | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<ForeshadowStatus>('planted');
  const [formPlantedChapterId, setFormPlantedChapterId] = useState('');

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  useEffect(() => {
    if (projectId) {
      setCurrentProjectId(projectId);
      loadForeshadowings(projectId);
    }
  }, [projectId, loadForeshadowings, setCurrentProjectId]);

  const handleOpenDialog = (item?: Foreshadowing): void => {
    if (item) {
      setEditingItem(item);
      setFormTitle(item.title);
      setFormDescription(item.description);
      setFormStatus(item.status);
      setFormPlantedChapterId(item.plantedChapterId);
    } else {
      setEditingItem(null);
      setFormTitle('');
      setFormDescription('');
      setFormStatus('planted');
      setFormPlantedChapterId('');
    }
    setDialogOpen(true);
  };

  const handleSave = async (): Promise<void> => {
    if (!projectId || !formTitle.trim()) return;
    try {
      if (editingItem) {
        await updateForeshadowing(editingItem.id, {
          title: formTitle.trim(),
          description: formDescription,
          status: formStatus,
          plantedChapterId: formPlantedChapterId,
        });
        setSnackbar({ open: true, message: '伏笔已更新', severity: 'success' });
      } else {
        await createForeshadowing({
          projectId,
          title: formTitle.trim(),
          description: formDescription,
          plantedChapterId: formPlantedChapterId,
          resolvedChapterId: null,
          status: 'planted',
        });
        setSnackbar({ open: true, message: '伏笔已创建', severity: 'success' });
      }
      setDialogOpen(false);
    } catch {
      setSnackbar({ open: true, message: '保存失败', severity: 'error' });
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteForeshadowing(id);
      setSnackbar({ open: true, message: '伏笔已删除', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: '删除失败', severity: 'error' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 顶部操作栏 */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2a2a4e] bg-[#0f0f23]">
        <h2 className="text-sm font-semibold text-[#cdd6f4]">🎭 伏笔追踪</h2>
        <div className="flex-1" />
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ textTransform: 'none', fontSize: 12 }}
        >
          新增伏笔
        </Button>
        <Tooltip title="刷新">
          <IconButton
            size="small"
            onClick={() => projectId && loadForeshadowings(projectId)}
            sx={{ color: '#6c7086' }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      {/* 伏笔列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-sm text-[#6c7086]">加载中...</div>
        ) : foreshadowings.length === 0 ? (
          <EmptyState
            icon="🎭"
            title="暂无伏笔"
            description="创建伏笔来追踪故事中的暗线和铺垫"
            actionLabel="创建首条伏笔"
            onAction={() => handleOpenDialog()}
          />
        ) : (
          <div className="space-y-3">
            {foreshadowings.map((f) => {
              const status = STATUS_LABELS[f.status];
              return (
                <div
                  key={f.id}
                  className="bg-[#16213e] border border-[#2a2a4e] rounded-lg p-4 hover:border-[#3a3a5e] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-[#cdd6f4]">{f.title}</h4>
                        <Chip
                          label={status.label}
                          size="small"
                          sx={{
                            fontSize: 10,
                            height: 20,
                            backgroundColor: `${status.color}20`,
                            color: status.color,
                          }}
                        />
                      </div>
                      <p className="text-sm text-[#a0a0b0] whitespace-pre-wrap mb-2">
                        {f.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-[#6c7086]">
                        {f.plantedChapterId && <span>📖 埋设章节: {f.plantedChapterId}</span>}
                        {f.resolvedChapterId && <span>✅ 回收章节: {f.resolvedChapterId}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconButton size="small" onClick={() => handleOpenDialog(f)}>
                        <EditIcon sx={{ fontSize: 16, color: '#6c7086' }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(f.id)}>
                        <DeleteIcon sx={{ fontSize: 16, color: '#ef5350' }} />
                      </IconButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 编辑对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#e0e0e0', fontSize: 16 }}>
          {editingItem ? '编辑伏笔' : '新增伏笔'}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-3 mt-2">
            <TextField
              fullWidth
              size="small"
              label="标题"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />
            <TextField
              fullWidth
              size="small"
              label="描述"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              multiline
              minRows={4}
              maxRows={10}
            />
            <FormControl fullWidth size="small">
              <InputLabel>状态</InputLabel>
              <Select
                value={formStatus}
                label="状态"
                onChange={(e) => setFormStatus(e.target.value as ForeshadowStatus)}
              >
                <MenuItem value="planted">已埋设</MenuItem>
                <MenuItem value="hinted">已暗示</MenuItem>
                <MenuItem value="resolved">已回收</MenuItem>
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#a0a0b0' }}>取消</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formTitle.trim()}>
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
