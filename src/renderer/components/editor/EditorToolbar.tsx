/**
 * TipTap 格式化工具栏
 * 提供加粗、斜体、下划线、标题、引用、列表等格式化操作
 */
import React from 'react';
import { type Editor } from '@tiptap/react';
import { IconButton, Tooltip, Divider } from '@mui/material';
import {
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  Title as H1Icon,
  FormatSize as H2Icon,
  FormatQuote as QuoteIcon,
  FormatListBulleted as BulletListIcon,
  FormatListNumbered as OrderedListIcon,
  HorizontalRule as DividerIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
} from '@mui/icons-material';

interface EditorToolbarProps {
  editor: Editor | null;
}

interface ToolbarButton {
  key: string;
  icon: React.ReactElement;
  title: string;
  action: () => void;
  isActive?: () => boolean;
}

export function EditorToolbar({ editor }: EditorToolbarProps): React.ReactElement {
  if (!editor) {
    return (
      <div
        className="flex items-center gap-0.5 px-2 border-b border-[#2a2a4e] bg-[#0f0f23]"
        style={{ height: 42, minHeight: 42 }}
      >
        <span className="text-xs text-[#6c7086] px-2">编辑器未就绪</span>
      </div>
    );
  }

  const buttons: ToolbarButton[] = [
    { key: 'bold', icon: <BoldIcon fontSize="small" />, title: '加粗 (Ctrl+B)', action: () => editor.chain().focus().toggleBold().run(), isActive: () => editor.isActive('bold') },
    { key: 'italic', icon: <ItalicIcon fontSize="small" />, title: '斜体 (Ctrl+I)', action: () => editor.chain().focus().toggleItalic().run(), isActive: () => editor.isActive('italic') },
    { key: 'underline', icon: <UnderlineIcon fontSize="small" />, title: '下划线', action: () => editor.chain().focus().toggleUnderline().run(), isActive: () => editor.isActive('underline') },
    { key: 'separator1', icon: <span />, title: '', action: () => {}, isActive: undefined },
    { key: 'h1', icon: <H1Icon fontSize="small" />, title: '一级标题', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => editor.isActive('heading', { level: 1 }) },
    { key: 'h2', icon: <H2Icon fontSize="small" />, title: '二级标题', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor.isActive('heading', { level: 2 }) },
    { key: 'separator2', icon: <span />, title: '', action: () => {}, isActive: undefined },
    { key: 'quote', icon: <QuoteIcon fontSize="small" />, title: '引用', action: () => editor.chain().focus().toggleBlockquote().run(), isActive: () => editor.isActive('blockquote') },
    { key: 'bulletList', icon: <BulletListIcon fontSize="small" />, title: '无序列表', action: () => editor.chain().focus().toggleBulletList().run(), isActive: () => editor.isActive('bulletList') },
    { key: 'orderedList', icon: <OrderedListIcon fontSize="small" />, title: '有序列表', action: () => editor.chain().focus().toggleOrderedList().run(), isActive: () => editor.isActive('orderedList') },
    { key: 'divider', icon: <DividerIcon fontSize="small" />, title: '分割线', action: () => editor.chain().focus().setHorizontalRule().run(), isActive: undefined },
    { key: 'separator3', icon: <span />, title: '', action: () => {}, isActive: undefined },
    { key: 'undo', icon: <UndoIcon fontSize="small" />, title: '撤销 (Ctrl+Z)', action: () => editor.chain().focus().undo().run(), isActive: undefined },
    { key: 'redo', icon: <RedoIcon fontSize="small" />, title: '重做 (Ctrl+Shift+Z)', action: () => editor.chain().focus().redo().run(), isActive: undefined },
  ];

  return (
    <div
      className="flex items-center gap-0.5 px-2 border-b border-[#2a2a4e] bg-[#0f0f23] flex-wrap"
      style={{ minHeight: 42 }}
    >
      {buttons.map((btn) => {
        if (btn.key.startsWith('separator')) {
          return (
            <Divider
              key={btn.key}
              orientation="vertical"
              flexItem
              sx={{ borderColor: '#2a2a4e', mx: 0.5 }}
            />
          );
        }

        const active = btn.isActive ? btn.isActive() : false;
        return (
          <Tooltip key={btn.key} title={btn.title}>
            <IconButton
              size="small"
              onClick={btn.action}
              sx={{
                color: active ? '#7c3aed' : '#a0a0b0',
                borderRadius: 1,
                '&:hover': { backgroundColor: '#2a2a3e' },
                backgroundColor: active ? 'rgba(124,58,237,0.15)' : 'transparent',
              }}
            >
              {btn.icon}
            </IconButton>
          </Tooltip>
        );
      })}
    </div>
  );
}
