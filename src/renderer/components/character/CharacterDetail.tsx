/**
 * 角色详情面板
 */
import React from 'react';
import { Chip, Divider } from '@mui/material';
import { parseCharacter } from '../../types/models';
import { RELATION_TYPES } from '../../utils/constants';
import type { Character, CharacterRelation } from '../../../shared/types';
import { useCharacterStore } from '../../stores/useCharacterStore';

interface CharacterDetailProps {
  character: Character;
  relations: CharacterRelation[];
}

export function CharacterDetail({ character, relations }: CharacterDetailProps): React.ReactElement {
  const parsed = parseCharacter(character);
  const { characters } = useCharacterStore();

  const charRelations = relations.filter(
    (r) => r.sourceId === character.id || r.targetId === character.id,
  );

  const getRelationLabel = (type: string): string => {
    return RELATION_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getCharName = (id: string): string => {
    return characters.find((c) => c.id === id)?.name || '未知角色';
  };

  return (
    <div className="p-4 space-y-4">
      {/* 基本信息 */}
      <div>
        <h2 className="text-lg font-semibold text-[#cdd6f4] mb-1">{parsed.name}</h2>
        {parsed.aliases.length > 0 && (
          <p className="text-sm text-[#6c7086]">
            别名：{parsed.aliases.join('、')}
          </p>
        )}
      </div>

      {/* 标签 */}
      {parsed.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {parsed.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                fontSize: 11,
                backgroundColor: 'rgba(124,58,237,0.15)',
                color: '#a78bfa',
              }}
            />
          ))}
        </div>
      )}

      <Divider sx={{ borderColor: '#2a2a4e' }} />

      {/* 外貌 */}
      {parsed.appearance && (
        <Section title="外貌特征" content={parsed.appearance} />
      )}

      {/* 性格 */}
      {parsed.personality && (
        <Section title="性格" content={parsed.personality} />
      )}

      {/* 背景故事 */}
      {parsed.background && (
        <Section title="背景故事" content={parsed.background} />
      )}

      {/* 关系 */}
      {charRelations.length > 0 && (
        <>
          <Divider sx={{ borderColor: '#2a2a4e' }} />
          <div>
            <h4 className="text-xs font-semibold text-[#6c7086] uppercase mb-2">
              角色关系 ({charRelations.length})
            </h4>
            <div className="space-y-2">
              {charRelations.map((rel) => {
                const isSource = rel.sourceId === character.id;
                const otherName = getCharName(isSource ? rel.targetId : rel.sourceId);
                return (
                  <div
                    key={rel.id}
                    className="flex items-center gap-2 text-sm bg-[#0f0f23] rounded p-2"
                  >
                    <Chip
                      label={getRelationLabel(rel.type)}
                      size="small"
                      sx={{ fontSize: 10, backgroundColor: 'rgba(6,182,212,0.15)', color: '#22d3ee' }}
                    />
                    <span className="text-[#a0a0b0]">
                      {isSource ? '→' : '←'} {otherName}
                    </span>
                    {rel.description && (
                      <span className="text-xs text-[#6c7086]">— {rel.description}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }): React.ReactElement {
  return (
    <div>
      <h4 className="text-xs font-semibold text-[#6c7086] uppercase mb-1">{title}</h4>
      <p className="text-sm text-[#a0a0b0] whitespace-pre-wrap leading-relaxed">{content}</p>
    </div>
  );
}
