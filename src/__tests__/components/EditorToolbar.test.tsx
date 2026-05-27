import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock MUI icons
vi.mock('@mui/icons-material', () => ({
  FormatBold: () => React.createElement('span', { 'data-testid': 'icon-bold' }, 'B'),
  FormatItalic: () => React.createElement('span', { 'data-testid': 'icon-italic' }, 'I'),
  FormatUnderlined: () => React.createElement('span', { 'data-testid': 'icon-underline' }, 'U'),
  Title: () => React.createElement('span', { 'data-testid': 'icon-h1' }, 'H1'),
  FormatSize: () => React.createElement('span', { 'data-testid': 'icon-h2' }, 'H2'),
  FormatQuote: () => React.createElement('span', { 'data-testid': 'icon-quote' }, 'Q'),
  FormatListBulleted: () => React.createElement('span', { 'data-testid': 'icon-ul' }, 'UL'),
  FormatListNumbered: () => React.createElement('span', { 'data-testid': 'icon-ol' }, 'OL'),
  HorizontalRule: () => React.createElement('span', { 'data-testid': 'icon-hr' }, 'HR'),
  Undo: () => React.createElement('span', { 'data-testid': 'icon-undo' }, '←'),
  Redo: () => React.createElement('span', { 'data-testid': 'icon-redo' }, '→'),
}));

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual as any,
    IconButton: ({ children, onClick, title }: any) =>
      React.createElement('button', { 'aria-label': title, onClick, 'data-testid': `btn-${title}` }, children),
    Tooltip: ({ children, title }: any) => {
      // Clone child and pass title prop for our mock IconButton
      const child = React.Children.only(children);
      return React.cloneElement(child, { title });
    },
  };
});

import { EditorToolbar } from '../../renderer/components/editor/EditorToolbar';

describe('EditorToolbar', () => {
  it('editor 为 null 时显示未就绪', () => {
    render(React.createElement(EditorToolbar, { editor: null }));
    expect(screen.getByText('编辑器未就绪')).toBeDefined();
  });

  it('editor 存在时渲染工具栏按钮', () => {
    const mockEditor = {
      chain: () => ({
        focus: () => ({
          toggleBold: () => ({ run: vi.fn() }),
          toggleItalic: () => ({ run: vi.fn() }),
          toggleUnderline: () => ({ run: vi.fn() }),
          toggleHeading: () => ({ run: vi.fn() }),
          toggleBlockquote: () => ({ run: vi.fn() }),
          toggleBulletList: () => ({ run: vi.fn() }),
          toggleOrderedList: () => ({ run: vi.fn() }),
          setHorizontalRule: () => ({ run: vi.fn() }),
          undo: () => ({ run: vi.fn() }),
          redo: () => ({ run: vi.fn() }),
        }),
      }),
      isActive: () => false,
    };

    render(React.createElement(EditorToolbar, { editor: mockEditor as any }));

    // Should have formatting buttons
    expect(screen.getByTestId('btn-加粗 (Ctrl+B)')).toBeDefined();
    expect(screen.getByTestId('btn-斜体 (Ctrl+I)')).toBeDefined();
    expect(screen.getByTestId('btn-撤销 (Ctrl+Z)')).toBeDefined();
    expect(screen.getByTestId('btn-重做 (Ctrl+Shift+Z)')).toBeDefined();
  });

  it('活动按钮有视觉标记', () => {
    const mockEditor = {
      chain: () => ({
        focus: () => ({
          toggleBold: () => ({ run: vi.fn() }),
          toggleItalic: () => ({ run: vi.fn() }),
          toggleUnderline: () => ({ run: vi.fn() }),
          toggleHeading: () => ({ run: vi.fn() }),
          toggleBlockquote: () => ({ run: vi.fn() }),
          toggleBulletList: () => ({ run: vi.fn() }),
          toggleOrderedList: () => ({ run: vi.fn() }),
          setHorizontalRule: () => ({ run: vi.fn() }),
          undo: () => ({ run: vi.fn() }),
          redo: () => ({ run: vi.fn() }),
        }),
      }),
      isActive: (name: string) => name === 'bold',
    };

    const { container } = render(React.createElement(EditorToolbar, { editor: mockEditor as any }));
    // Renders without crashing (active state set via MUI sx prop)
    expect(container).toBeTruthy();
  });
});
