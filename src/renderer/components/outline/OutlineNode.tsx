/**
 * 大纲节点组件 — 单行可拖拽的大纲项
 */
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconButton, Tooltip, TextField } from '@mui/material';
import {
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandIcon,
  ChevronRight as CollapseIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import type { Outline } from '../../../shared/types';

interface OutlineNodeProps {
  node: Outline;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onSelect: (node: Outline) => void;
}

export function OutlineNode({
  node,
  depth,
  hasChildren,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onSelect,
}: OutlineNodeProps): React.ReactElement {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    paddingLeft: `${depth * 24 + 8}px`,
  };

  const handleSaveEdit = (): void => {
    if (editTitle.trim() && editTitle !== node.title) {
      onEdit(node.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1 py-1 px-2 hover:bg-[#2a2a3e] cursor-pointer group rounded"
      onClick={() => onSelect(node)}
    >
      {/* 拖拽手柄 */}
      <div {...attributes} {...listeners} className="cursor-grab text-[#6c7086] hover:text-[#a0a0b0]">
        <DragIcon sx={{ fontSize: 16 }} />
      </div>

      {/* 展开/折叠 */}
      {hasChildren ? (
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggleExpand(); }} sx={{ p: 0 }}>
          {isExpanded ? <ExpandIcon sx={{ fontSize: 16, color: '#6c7086' }} /> : <CollapseIcon sx={{ fontSize: 16, color: '#6c7086' }} />}
        </IconButton>
      ) : (
        <span className="w-6" />
      )}

      {/* 类型图标 */}
      <DotIcon
        sx={{
          fontSize: 10,
          color: node.type === 'volume' ? '#7c3aed' : '#06b6d4',
        }}
      />

      {/* 标题 */}
      {isEditing ? (
        <TextField
          size="small"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveEdit();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          autoFocus
          variant="standard"
          InputProps={{ disableUnderline: true, sx: { fontSize: 13, color: '#cdd6f4' } }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className={`text-sm flex-1 truncate ${
            node.type === 'volume' ? 'text-[#cdd6f4] font-semibold' : 'text-[#a0a0b0]'
          }`}
        >
          {node.title}
        </span>
      )}

      {/* 绑定章节指示 */}
      {node.chapterId && (
        <span className="text-xs text-[#7c3aed] px-1">📖</span>
      )}

      {/* 操作按钮 — 悬停显示 */}
      <div className="hidden group-hover:flex items-center gap-0.5">
        <Tooltip title="编辑">
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); setEditTitle(node.title); }}
            sx={{ p: 0.25 }}
          >
            <EditIcon sx={{ fontSize: 14, color: '#6c7086' }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="删除">
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
            sx={{ p: 0.25 }}
          >
            <DeleteIcon sx={{ fontSize: 14, color: '#ef5350' }} />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}
