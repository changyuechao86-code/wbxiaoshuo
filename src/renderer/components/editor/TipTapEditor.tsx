/**
 * TipTap 编辑器封装
 * 集成 StarterKit 扩展、字符计数、占位文本、@角色提及
 */
import React, { useCallback, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { createCharacterMentionExtension } from './extensions/CharacterMention';
import { useCharacterStore } from '../../stores/useCharacterStore';
import { countWords, extractPlainText } from '../../utils/word-counter';

interface TipTapEditorProps {
  content: string;
  onUpdate: (json: string, plainText: string, wordCount: number) => void;
  onEditorReady?: (editor: ReturnType<typeof import('@tiptap/react').useEditor>) => void;
  onSave?: () => void;
  editable?: boolean;
  placeholder?: string;
}

export function TipTapEditor({
  content,
  onUpdate,
  onEditorReady,
  editable = true,
  placeholder = '开始创作你的故事...',
}: TipTapEditorProps): React.ReactElement {
  const { characters } = useCharacterStore();

  const getCharacters = useCallback(
    () => characters.map((c) => ({ id: c.id, name: c.name })),
    [characters],
  );

  const CharacterMention = useMemo(
    () => createCharacterMentionExtension(getCharacters),
    [getCharacters],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: 50000,
      }),
      CharacterMention,
    ],
    content: (() => {
      try {
        return JSON.parse(content);
      } catch {
        return { type: 'doc', content: [{ type: 'paragraph' }] };
      }
    })(),
    editable,
    onUpdate: ({ editor }) => {
      const json = JSON.stringify(editor.getJSON());
      const plainText = editor.getText();
      const wordCount = countWords(plainText);
      onUpdate(json, plainText, wordCount);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor text-selectable',
      },
      handleKeyDown: (_view, event) => {
        // Ctrl+S 由 useKeyboardShortcuts 处理
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
          return false; // 让快捷键 hook 处理
        }
        return false;
      },
    },
  });

  // 当外部 content 改变时更新编辑器
  React.useEffect(() => {
    if (editor && content) {
      try {
        const newJson = JSON.parse(content);
        const currentJson = editor.getJSON();
        if (JSON.stringify(newJson) !== JSON.stringify(currentJson)) {
          editor.commands.setContent(newJson);
        }
      } catch {
        // 忽略解析错误
      }
    }
  }, [editor, content]);

  // 编辑器销毁清理
  React.useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  // 通知父组件编辑器就绪
  React.useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#1a1a2e]">
      <EditorContent editor={editor} className="min-h-full" />
    </div>
  );
}
