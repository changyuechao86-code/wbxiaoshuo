/**
 * 小说转剧本页面 (P2 Stub)
 * 骨架实现 — 完整剧本转换和格式导出留待 P2 阶段
 */
import React from 'react';
import { EmptyState } from '../components/common/EmptyState';

export function ScriptConverterPage(): React.ReactElement {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2a2a4e] bg-[#0f0f23]">
        <h2 className="text-sm font-semibold text-[#cdd6f4]">📜 小说转剧本</h2>
      </div>
      <div className="flex-1">
        <EmptyState
          icon="📜"
          title="小说转剧本 (P2)"
          description="自动将小说章节转换为剧本格式（场景、对白、动作描述），支持一键导出标准剧本格式。此功能将在后续版本中实现。"
        />
      </div>
    </div>
  );
}
