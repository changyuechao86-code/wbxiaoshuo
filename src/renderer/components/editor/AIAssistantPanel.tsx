/**
 * AI 助手侧面板 — 提供 AI 续写/润色/大纲/对白功能
 */
import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Check as AcceptIcon,
  Clear as RejectIcon,
} from '@mui/icons-material';
import { useAIStore } from '../../stores/useAIStore';
import { useEditorStore } from '../../stores/useEditorStore';
import type { AIAction } from '../../../shared/types';

interface AIAssistantPanelProps {
  contextText: string;
  onAccept: (content: string) => void;
}

interface AIModeOption {
  value: AIAction;
  label: string;
  description: string;
}

const AI_MODES: AIModeOption[] = [
  { value: 'continue', label: '续写', description: '根据上下文续写接下来的内容' },
  { value: 'polish', label: '润色', description: '优化当前选中文本的表达' },
  { value: 'outline', label: '大纲', description: '生成后续情节大纲建议' },
  { value: 'dialogue', label: '对白', description: '生成角色对话' },
];

export function AIAssistantPanel({
  contextText,
  onAccept,
}: AIAssistantPanelProps): React.ReactElement {
  const [selectedMode, setSelectedMode] = useState<AIAction>('continue');
  const [instruction, setInstruction] = useState('');
  const { status, generatedContent, streamRequest, clearGeneratedContent } = useAIStore();
  const { setShowAIPanel } = useEditorStore();

  const handleRequest = async (): Promise<void> => {
    if (!contextText.trim()) return;
    await streamRequest({
      action: selectedMode,
      context: contextText,
      instruction: instruction || undefined,
    });
  };

  const handleAccept = (): void => {
    onAccept(generatedContent);
    clearGeneratedContent();
  };

  const handleReject = (): void => {
    clearGeneratedContent();
  };

  const handleCopy = (): void => {
    navigator.clipboard.writeText(generatedContent);
  };

  const handleClose = (): void => {
    setShowAIPanel(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#16213e] border-l border-[#2a2a4e]">
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a4e]">
        <span className="text-sm font-semibold text-[#cdd6f4]">✨ AI 助手</span>
        <IconButton size="small" onClick={handleClose} sx={{ color: '#6c7086' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>

      {/* 模式选择 */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-[#2a2a4e]">
        {AI_MODES.map((mode) => (
          <Chip
            key={mode.value}
            label={mode.label}
            size="small"
            onClick={() => {
              setSelectedMode(mode.value);
              clearGeneratedContent();
            }}
            variant={selectedMode === mode.value ? 'filled' : 'outlined'}
            color={selectedMode === mode.value ? 'primary' : 'default'}
            sx={{ fontSize: 12 }}
          />
        ))}
      </div>

      {/* 上下文预览 */}
      <div className="px-3 py-2 border-b border-[#2a2a4e]">
        <div className="text-xs text-[#6c7086] mb-1">
          {AI_MODES.find((m) => m.value === selectedMode)?.description}
        </div>
        {contextText && (
          <div className="text-xs text-[#a0a0b0] bg-[#0f0f23] rounded p-2 max-h-20 overflow-y-auto">
            {contextText.slice(0, 300)}
            {contextText.length > 300 && '...'}
          </div>
        )}
      </div>

      {/* 补充指令 */}
      <div className="px-3 py-2">
        <TextField
          fullWidth
          size="small"
          placeholder="补充指令（可选）..."
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          multiline
          maxRows={3}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: 12,
              backgroundColor: '#0f0f23',
            },
          }}
        />
      </div>

      {/* 发送按钮 */}
      <div className="px-3 pb-2">
        <Button
          fullWidth
          variant="contained"
          size="small"
          onClick={handleRequest}
          disabled={status === 'streaming' || !contextText.trim()}
          startIcon={status === 'streaming' ? <CircularProgress size={14} /> : null}
          sx={{ textTransform: 'none', fontSize: 13 }}
        >
          {status === 'streaming' ? '生成中...' : `开始${AI_MODES.find((m) => m.value === selectedMode)?.label}`}
        </Button>
      </div>

      {/* 生成结果 */}
      <div className="flex-1 overflow-y-auto p-3">
        {status === 'streaming' && !generatedContent && (
          <div className="flex items-center justify-center h-full text-sm text-[#6c7086]">
            <CircularProgress size={20} sx={{ mr: 1 }} />
            等待 AI 响应...
          </div>
        )}

        {generatedContent && (
          <div className="text-sm text-[#cdd6f4] whitespace-pre-wrap bg-[#0f0f23] rounded p-3 min-h-[100px]">
            {generatedContent}
          </div>
        )}

        {status === 'error' && (
          <div className="text-sm text-red-400 text-center py-4">
            AI 请求失败，请检查 API 配置
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      {status === 'complete' && generatedContent && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-[#2a2a4e]">
          <Button
            variant="contained"
            size="small"
            startIcon={<AcceptIcon />}
            onClick={handleAccept}
            sx={{ textTransform: 'none', fontSize: 12 }}
          >
            接受
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RejectIcon />}
            onClick={handleReject}
            sx={{ textTransform: 'none', fontSize: 12, color: '#a0a0b0', borderColor: '#3a3a5e' }}
          >
            拒绝
          </Button>
          <div className="flex-1" />
          <Tooltip title="复制">
            <IconButton size="small" onClick={handleCopy} sx={{ color: '#6c7086' }}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
