import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Editor } from '@tiptap/react';
import {
  Alert,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as BackIcon,
  AutoAwesome as AIIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { AIAssistantPanel } from '../components/editor/AIAssistantPanel';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EditorStatusBar } from '../components/editor/EditorStatusBar';
import { EditorToolbar } from '../components/editor/EditorToolbar';
import { TipTapEditor } from '../components/editor/TipTapEditor';
import { useAppStore } from '../stores/useAppStore';
import { useChapterStore } from '../stores/useChapterStore';
import { useCharacterStore } from '../stores/useCharacterStore';
import { useEditorStore } from '../stores/useEditorStore';
import { useAutoSave } from '../hooks/useAutoSave';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const EMPTY_DOC = '{"type":"doc","content":[{"type":"paragraph"}]}';

const text = {
  aiAssistant: '\u0041\u0049 \u52a9\u624b (Ctrl+Shift+A)',
  back: '\u8fd4\u56de',
  cancelSwitch: '\u5f53\u524d\u7ae0\u8282\u4fdd\u5b58\u5931\u8d25\uff0c\u6682\u4e0d\u5207\u6362',
  chapterCreated: '\u65b0\u7ae0\u8282\u5df2\u521b\u5efa',
  chapterCreateFailed: '\u521b\u5efa\u7ae0\u8282\u5931\u8d25',
  chapterDeleted: '\u7ae0\u8282\u5df2\u5220\u9664',
  chapterDeleteFailed: '\u5220\u9664\u7ae0\u8282\u5931\u8d25',
  chapterPlaceholder: '\u7ae0\u8282\u6807\u9898...',
  confirmDelete: '\u5220\u9664',
  deleteChapter: '\u5220\u9664\u7ae0\u8282',
  deleteMessagePrefix: '\u786e\u5b9a\u8981\u5220\u9664\u300c',
  deleteMessageSuffix: '\u300d\u5417\uff1f\u6b64\u64cd\u4f5c\u4e0d\u53ef\u64a4\u9500\u3002',
  editorPlaceholder: '\u5f00\u59cb\u521b\u4f5c\u4f60\u7684\u6545\u4e8b...',
  fallbackChapter: '\u6b64\u7ae0\u8282',
  newChapter: '\u65b0\u5efa\u7ae0\u8282 (Ctrl+N)',
  newChapterTitle: '\u65b0\u7ae0\u8282',
  saveFailed: '\u4fdd\u5b58\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5',
  saveNow: '\u7acb\u5373\u4fdd\u5b58 (Ctrl+S)',
  saveSuccess: '\u4fdd\u5b58\u6210\u529f',
  selectChapter: '\u9009\u62e9\u7ae0\u8282...',
};

export function EditorPage(): React.ReactElement {
  const { projectId, chapterId } = useParams<{ projectId: string; chapterId?: string }>();
  const navigate = useNavigate();

  const { chapters, currentChapter, loadChapters, loadChapter, createChapter, deleteChapter } =
    useChapterStore();
  const { showAIPanel, toggleAIPanel, isDirty } = useEditorStore();
  const { loadCharacters } = useCharacterStore();
  const { setCurrentProjectId } = useAppStore();

  const [chapterTitle, setChapterTitle] = useState('');
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { triggerSave, saveNow, cleanup } = useAutoSave();
  const editorRef = useRef<{ content: string; plainText: string; wordCount: number }>({
    content: '',
    plainText: '',
    wordCount: 0,
  });
  const lastEditedChapterIdRef = useRef<string | null>(null);

  const saveCurrentDraft = useCallback(async (): Promise<void> => {
    if (!lastEditedChapterIdRef.current || !isDirty) return;

    const { content, plainText, wordCount } = editorRef.current;
    await saveNow(lastEditedChapterIdRef.current, content, plainText, wordCount);
  }, [isDirty, saveNow]);

  useEffect(() => {
    if (projectId) {
      setCurrentProjectId(projectId);
      loadChapters(projectId);
      loadCharacters(projectId);
    }
  }, [projectId, loadChapters, loadCharacters, setCurrentProjectId]);

  useEffect(() => {
    if (chapterId) {
      loadChapter(chapterId);
    } else if (chapters.length > 0) {
      loadChapter(chapters[0].id);
    }
  }, [chapterId, chapters, loadChapter]);

  useEffect(() => {
    if (currentChapter) {
      setChapterTitle(currentChapter.title);
      lastEditedChapterIdRef.current = currentChapter.id;
      editorRef.current = {
        content: currentChapter.content,
        plainText: currentChapter.plainText,
        wordCount: currentChapter.wordCount,
      };
    }
  }, [currentChapter]);

  useEffect(() => cleanup, [cleanup]);

  const handleEditorUpdate = useCallback(
    (json: string, plainText: string, wordCount: number) => {
      editorRef.current = { content: json, plainText, wordCount };
      if (currentChapter) {
        lastEditedChapterIdRef.current = currentChapter.id;
        triggerSave(currentChapter.id, json, plainText, wordCount);
      }
    },
    [currentChapter, triggerSave],
  );

  const handleManualSave = useCallback(async () => {
    try {
      await saveCurrentDraft();
      setSnackbar({ open: true, message: text.saveSuccess, severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: text.saveFailed, severity: 'error' });
    }
  }, [saveCurrentDraft]);

  const handleCreateChapter = async (): Promise<void> => {
    if (!projectId) return;
    const order = chapters.length;

    try {
      await saveCurrentDraft();
      const chapter = await createChapter({
        projectId,
        title: `${text.newChapterTitle} ${order + 1}`,
        content: EMPTY_DOC,
        plainText: '',
        wordCount: 0,
        status: 'draft',
        order,
      });
      setChapterTitle(chapter.title);
      setSnackbar({ open: true, message: text.chapterCreated, severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: text.chapterCreateFailed, severity: 'error' });
    }
  };

  const handleDeleteChapter = async (): Promise<void> => {
    if (!currentChapter) return;

    try {
      await deleteChapter(currentChapter.id);
      setShowDeleteConfirm(false);
      setSnackbar({ open: true, message: text.chapterDeleted, severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: text.chapterDeleteFailed, severity: 'error' });
    }
  };

  const handleChapterSwitch = async (id: string): Promise<void> => {
    if (!id || id === currentChapter?.id) return;

    try {
      await saveCurrentDraft();
      navigate(`/editor/${projectId}/${id}`);
    } catch {
      setSnackbar({ open: true, message: text.cancelSwitch, severity: 'error' });
    }
  };

  const handleAcceptAI = useCallback((aiContent: string) => {
    const editor = document.querySelector('.tiptap-editor');
    if (editor) {
      const p = document.createElement('p');
      p.textContent = aiContent;
      editor.appendChild(p);
    }
  }, []);

  const getContextText = useCallback((): string => {
    if (!currentChapter) return '';
    return currentChapter.plainText.slice(-1000);
  }, [currentChapter]);

  useKeyboardShortcuts({
    onSave: handleManualSave,
    onAIPanel: toggleAIPanel,
    onNew: handleCreateChapter,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#2a2a4e] bg-[#0f0f23]">
        <Tooltip title={text.back}>
          <IconButton size="small" onClick={() => navigate(-1)} sx={{ color: '#6c7086' }}>
            <BackIcon fontSize="small" />
          </IconButton>
        </Tooltip>

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
          placeholder={text.chapterPlaceholder}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={currentChapter?.id || ''}
            onChange={(e) => {
              void handleChapterSwitch(e.target.value);
            }}
            displayEmpty
            sx={{ fontSize: 12, color: '#cdd6f4' }}
          >
            <MenuItem value="" disabled>
              {text.selectChapter}
            </MenuItem>
            {chapters.map((ch) => (
              <MenuItem key={ch.id} value={ch.id} sx={{ fontSize: 13 }}>
                {ch.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Tooltip title={text.newChapter}>
          <IconButton size="small" onClick={handleCreateChapter} sx={{ color: '#7c3aed' }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={text.aiAssistant}>
          <IconButton
            size="small"
            onClick={toggleAIPanel}
            sx={{ color: showAIPanel ? '#7c3aed' : '#6c7086' }}
          >
            <AIIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={text.saveNow}>
          <span>
            <IconButton size="small" onClick={handleManualSave} disabled={!isDirty} sx={{ color: '#4caf50' }}>
              <SaveIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={text.deleteChapter}>
          <IconButton
            size="small"
            onClick={() => setShowDeleteConfirm(true)}
            sx={{ color: '#ef5350' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      <EditorToolbar editor={editorInstance} />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 min-w-0">
          <TipTapEditor
            content={currentChapter?.content || EMPTY_DOC}
            onUpdate={handleEditorUpdate}
            onEditorReady={setEditorInstance}
            placeholder={text.editorPlaceholder}
          />
        </div>

        {showAIPanel && (
          <div style={{ width: 320, minWidth: 320 }}>
            <AIAssistantPanel
              contextText={getContextText()}
              onAccept={handleAcceptAI}
            />
          </div>
        )}
      </div>

      <EditorStatusBar />

      <ConfirmDialog
        open={showDeleteConfirm}
        title={text.deleteChapter}
        message={`${text.deleteMessagePrefix}${currentChapter?.title || text.fallbackChapter}${text.deleteMessageSuffix}`}
        confirmLabel={text.confirmDelete}
        confirmColor="error"
        onConfirm={handleDeleteChapter}
        onCancel={() => setShowDeleteConfirm(false)}
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
