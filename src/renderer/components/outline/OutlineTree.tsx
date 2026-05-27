/**
 * 大纲树形组件 — 封装 dnd-kit 拖拽排序
 */
import React, { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { OutlineNode } from './OutlineNode';
import type { Outline } from '../../../shared/types';
import { useOutlineStore } from '../../stores/useOutlineStore';
import { buildOutlineTree, type OutlineTreeNode } from '../../types/models';

interface OutlineTreeProps {
  outlines: Outline[];
  onSelectNode: (node: Outline) => void;
}

export function OutlineTree({ outlines, onSelectNode }: OutlineTreeProps): React.ReactElement {
  const { updateOutline, deleteOutline } = useOutlineStore();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const tree = buildOutlineTree(outlines);

  // 展平可见节点（考虑折叠状态）
  const flattenVisible = useCallback(
    (nodes: OutlineTreeNode[]): OutlineTreeNode[] => {
      const result: OutlineTreeNode[] = [];
      for (const node of nodes) {
        result.push(node);
        if (expandedIds.has(node.id) && node.children.length > 0) {
          result.push(...flattenVisible(node.children));
        }
      }
      return result;
    },
    [expandedIds],
  );

  const visibleNodes = flattenVisible(tree);
  const visibleIds = visibleNodes.map((n) => n.id);

  const toggleExpand = (id: string): void => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleEdit = async (id: string, title: string): Promise<void> => {
    try {
      await updateOutline(id, { title });
    } catch {
      // 错误已由 store 处理
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteOutline(id);
    } catch {
      // 错误已由 store 处理
    }
  };

  const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // 找到目标位置
    const oldIndex = visibleNodes.findIndex((n) => n.id === active.id);
    let newIndex = visibleNodes.findIndex((n) => n.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const movedNode = visibleNodes[oldIndex];
    const targetNode = visibleNodes[newIndex];

    // 移到目标节点下作为子节点（如果目标是大纲卷类型）
    let newParentId: string | null = targetNode.parentId;
    let newOrder = newIndex;

    if (targetNode.type === 'volume' && oldIndex !== newIndex) {
      // 如果要拖到卷内部作为子节点
      newParentId = targetNode.id;
      newOrder = targetNode.children.length;
    }

    await useOutlineStore.getState().moveNode(movedNode.id as string, newParentId, newOrder);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={visibleIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-0">
          {visibleNodes.map((node) => (
            <OutlineNode
              key={node.id}
              node={node}
              depth={node.depth}
              hasChildren={node.children.length > 0}
              isExpanded={expandedIds.has(node.id)}
              onToggleExpand={() => toggleExpand(node.id)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={onSelectNode}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
