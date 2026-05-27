/**
 * 全局快捷键 Hook
 * 应用级键盘快捷键处理
 */
import { useEffect } from 'react';

interface ShortcutHandlers {
  /** Ctrl+S 保存 */
  onSave?: () => void;
  /** Ctrl+B 加粗 */
  onBold?: () => void;
  /** Ctrl+I 斜体 */
  onItalic?: () => void;
  /** Ctrl+Z 撤销 */
  onUndo?: () => void;
  /** Ctrl+Shift+Z 重做 */
  onRedo?: () => void;
  /** Ctrl+N 新建 */
  onNew?: () => void;
  /** Ctrl+Shift+A AI 面板 */
  onAIPanel?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      if (ctrl && e.key === 's') {
        e.preventDefault();
        handlers.onSave?.();
      } else if (ctrl && e.key === 'b') {
        // 编辑器内部由 TipTap 处理
        if (!(e.target as HTMLElement)?.closest?.('.tiptap-editor')) {
          e.preventDefault();
          handlers.onBold?.();
        }
      } else if (ctrl && e.key === 'i' && !shift) {
        if (!(e.target as HTMLElement)?.closest?.('.tiptap-editor')) {
          e.preventDefault();
          handlers.onItalic?.();
        }
      } else if (ctrl && e.key === 'z' && !shift) {
        if (!(e.target as HTMLElement)?.closest?.('.tiptap-editor')) {
          e.preventDefault();
          handlers.onUndo?.();
        }
      } else if (ctrl && e.key === 'z' && shift) {
        if (!(e.target as HTMLElement)?.closest?.('.tiptap-editor')) {
          e.preventDefault();
          handlers.onRedo?.();
        }
      } else if (ctrl && e.key === 'n') {
        e.preventDefault();
        handlers.onNew?.();
      } else if (ctrl && shift && e.key === 'A') {
        e.preventDefault();
        handlers.onAIPanel?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
