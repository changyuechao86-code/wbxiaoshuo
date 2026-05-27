/**
 * 章节编辑器页面
 * 集成 TipTap 编辑器、工具栏、状态栏、AI 助手面板
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Editor } from '@tiptap/react';
import {
  Button,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AutoAwesome as AIIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { TipTapEditor } from '../components/editor/TipTapEditor';
import { EditorToolbar } from '../components/editor/EditorToolbar';
import { EditorStatusBar } from '../components/editor/EditorStatusBar';
import { AIAssistantPanel } from '../components/editor/AIAssistantPanel';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useChapterStore } from '../stores/useChapterStore';
import { useEditorStore } from '../stores/useEditorStore';
import { useCharacterStore } from '../stores/useCharacterStore';
import { useAppStore } from '../stores/useAppStore';
import { useAutoSave } from '../hooks/useAutoSave';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export function EditorPage(): React.ReactElement {
  const { projectId, chapterId } = useParams<{ projectId: string; chapterId?: string }>();
  const navigate = useNavigate();

  const { chapters, currentChapter, loadChapters, loadChapter, createChapter, deleteChapter, setCurrentChapter } =
    useChapterStore();
  const { showAIPanel, toggleAIPanel, isDirty, wordCount } = useEditorStore();
  const { loadCharacters, characters } = useCharacterStore();
  const { setCurrentProjectId } = useAppStore();

  const [chapterTitle, setChapterTitle] = useState('');
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const { triggerSave, saveNow } = useAutoSave();
  const editorRef = useRef<{ content: string; plainText: string; wordCount: number }>({
    content: '',
    plainText: '',
    wordCount: 0,
  });

  // 初始化
  useEffect(() => {
    if (projectId) {
      setCurrentProjectId(projectId);
      loadChapters(projectId);
      loadCharacters(projectId);
    }
  }, [projectId, loadChapters, loadCharacters, setCurrentProjectId]);

  // 加载选中章节
  useEffect(() => {
    if (chapterId) {
      loadChapter(chapterId);
    } else if (chapters.length > 0) {
      loadChapter(chapters[0].id);
    }
  }, [chapterId, chapters, loadChapter]);

  // 同步章节标题
  useEffect(() => {
    if (currentChapter) {
      setChapterTitle(currentChapter.title);
    }
  }, [currentChapter]);

  // 编辑器内容更新回调
  const handleEditorUpdate = useCallback(
    (json: string, plainText: string, wc: number) => {
      editorRef.current = { content: json, plainText, wordCount: wc };
      if (currentChapter) {
        triggerSave(currentChapter.id, json, plainText, wc);
      }
    },
    [currentChapter, triggerSave],
  );

  // 手动保存
  const handleManualSave = useCallback(async () => {
    if (!currentChapter) return;
    const { content, plainText, wordCount: wc } = editorRef.current;
    try {
      await saveNow(currentChapter.id, content, plainText, wc);
      setSnackbar({ open: true, message: '保存成功', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: '保存失败', severity: 'error' });
    }
  }, [currentChapter, saveNow]);

  // 新建章节
  const handleCreateChapter = async (): Promise<void> => {
    if (!projectId) return;
    const order = chapters.length;
    try {
      const chapter = await createChapter({
        projectId,
        title: `新章节 ${order + 1}`,
        content: '{"type":"doc","content":[{"type":"paragraph"}]}',
        plainText: '',
        wordCount: 0,
        status: 'draft',
        order,
      });
      setChapterTitle(chapter.title);
      setSnackbar({ open: true, message: '新章节已创建', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: '创建章节失败', severity: 'error' });
    }
  };

  // 删除章节
  const handleDeleteChapter = async (): Promise<void> => {
    if (!currentChapter) return;
    try {
      await deleteChapter(currentChapter.id);
      setShowDeleteConfirm(false);
      setSnackbar({ open: true, message: '章节已删除', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: '删除章节失败', severity: 'error' });
    }
  };

  // AI 面板：接受内容
  const handleAcceptAI = useCallback(
    (aiContent: string) => {
      // 将 AI 生成的内容追加到编辑器
      const editor = document.querySelector('.tiptap-editor');
      if (editor) {
        const p = document.createElement('p');
        p.textContent = aiContent;
        editor.appendChild(p);
      }
    },
    [],
  );

  // 获取上下文文本（选中文本或最近1000字符）
  const getContextText = useCallback((): string => {
    if (!currentChapter) return '';
    return currentChapter.plainText.slice(-1000);
  }, [currentChapter]);

  // 快捷键
  useKeyboardShortcuts({
    onSave: handleManualSave,
    onAIPanel: toggleAIPanel,
    onNew: handleCreateChapter,
  });

  return (
    <div className="flex flex-col h-full">
      {/* 顶部：章节标题和操作栏 */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#2a2a4e] bg-[#0f0f23]">
        <Tooltip title="返回">
          <IconButton size="small" onClick={() => navigate(-1)} sx={{ color: '#6c7086' }}>
            <BackIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* 章节标题输入 */}
        <input
          type="text"
          value={chapterTitle}
          onChange={(e) => setChapterTitle(e.target.value)}
          onBlur={() => {
            if (currentChapter && chapterTitle !== currentChapter.title) {
              useChapterStore.getState().saveChapter(currentChapter.id, { title: chapterTitle });
            }
          }}
          className="bg-transparent text-sm text-[#cdd6f4] border-none outline-none flex-1 min-w-0"
          placeholder="章节标题..."
        />

        {/* 章节切换 */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={currentChapter?.id || ''}
            onChange={(e) => {
              const id = e.target.value;
              if (id) {
                navigate(`/editor/${projectId}/${id}`);
              }
            }}
            displayEmpty
            sx={{ fontSize: 12, color: '#cdd6f4' }}
          >
            <MenuItem value="" disabled>
              选择章节...
            </MenuItem>
            {chapters.map((ch) => (
              <MenuItem key={ch.id} value={ch.id} sx={{ fontSize: 13 }}>
                {ch.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 操作按钮 */}
        <Tooltip title="新建章节 (Ctrl+N)">
          <IconButton size="small" onClick={handleCreateChapter} sx={{ color: '#7c3aed' }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="AI 助手 (Ctrl+Shift+A)">
          <IconButton
            size="small"
            onClick={toggleAIPanel}
            sx={{ color: showAIPanel ? '#7c3aed' : '#6c7086' }}
          >
            <AIIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="立即保存 (Ctrl+S)">
          <IconButton size="small" onClick={handleManualSave} sx={{ color: '#4caf50' }}>
            <SaveIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="删除章节">
          <IconButton
            size="small"
            onClick={() => setShowDeleteConfirm(true)}
            sx={{ color: '#ef5350' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      {/* 工具栏 */}
      <EditorToolbar editor={editorInstance} />

      {/* 编辑器 + AI 面板 */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 min-w-0">
          <TipTapEditor
            content={currentChapter?.content || '{"type":"doc","content":[{"type":"paragraph"}]}'}
            onUpdate={handleEditorUpdate}
            onEditorReady={setEditorInstance}
            placeholder="开始创作你的故事..."
          />
        </div>

        {/* AI 助手侧面板 */}
        {showAIPanel && (
          <div style={{ width: 320, minWidth: 320 }}>
            <AIAssistantPanel
              contextText={getContextText()}
              onAccept={handleAcceptAI}
            />
          </div>
        )}
      </div>

      {/* 状态栏 */}
      <EditorStatusBar />

      {/* 删除确认 */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="删除章节"
        message={`确定要删除「${currentChapter?.title || '此章节'}」吗？此操作不可撤销。`}
        confirmLabel="删除"
        confirmColor="error"
        onConfirm={handleDeleteChapter}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* 消息提示 */}
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
