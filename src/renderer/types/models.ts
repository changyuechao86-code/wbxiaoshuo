/**
 * 渲染进程数据模型类型（映射到 shared/types）
 * 提供 UI 层常用的辅助类型
 */
import type {
  Project, Chapter, Character, CharacterRelation, Outline,
  WorldSetting, Foreshadowing, Revenue, CheckIn, Storyboard,
  ProjectType, ChapterStatus, OutlineNodeType, ForeshadowStatus,
} from '../../shared/types';

// 重新导出所有数据模型类型
export type {
  Project, Chapter, Character, CharacterRelation, Outline,
  WorldSetting, Foreshadowing, Revenue, CheckIn, Storyboard,
  ProjectType, ChapterStatus, OutlineNodeType, ForeshadowStatus,
};

/** 角色别名（从 JSON 字符串解析后） */
export interface ParsedCharacter extends Omit<Character, 'aliases' | 'tags'> {
  aliases: string[];
  tags: string[];
}

/** 解析角色数据 */
export function parseCharacter(c: Character): ParsedCharacter {
  let aliases: string[] = [];
  let tags: string[] = [];
  try {
    aliases = JSON.parse(c.aliases);
    tags = JSON.parse(c.tags);
  } catch {
    // 忽略解析错误
  }
  return { ...c, aliases, tags };
}

/** 序列化角色数据 */
export function serializeCharacter(c: Partial<ParsedCharacter> & { aliases?: string[]; tags?: string[] }): Partial<Character> {
  const result: any = { ...c };
  if (c.aliases) result.aliases = JSON.stringify(c.aliases);
  if (c.tags) result.tags = JSON.stringify(c.tags);
  return result;
}

/** 大纲树节点 */
export interface OutlineTreeNode extends Outline {
  children: OutlineTreeNode[];
  depth: number;
}

/** 构建大纲树 */
export function buildOutlineTree(outlines: Outline[]): OutlineTreeNode[] {
  const nodeMap = new Map<string, OutlineTreeNode>();
  const roots: OutlineTreeNode[] = [];

  // 初始化节点
  for (const o of outlines) {
    nodeMap.set(o.id, { ...o, children: [], depth: 0 });
  }

  // 建立父子关系
  for (const o of outlines) {
    const node = nodeMap.get(o.id)!;
    if (o.parentId && nodeMap.has(o.parentId)) {
      const parent = nodeMap.get(o.parentId)!;
      node.depth = parent.depth + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
