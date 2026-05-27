/**
 * 角色列表组件
 */
import React from 'react';
import { List, ListItemButton, ListItemText, ListItemAvatar, Avatar, Chip } from '@mui/material';
import type { Character } from '../../../shared/types';
import { parseCharacter } from '../../types/models';

interface CharacterListProps {
  characters: Character[];
  selectedId: string | null;
  onSelect: (character: Character) => void;
}

export function CharacterList({ characters, selectedId, onSelect }: CharacterListProps): React.ReactElement {
  return (
    <List dense disablePadding>
      {characters.map((c) => {
        const parsed = parseCharacter(c);
        return (
          <ListItemButton
            key={c.id}
            selected={c.id === selectedId}
            onClick={() => onSelect(c)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(124,58,237,0.15)',
              },
              '&:hover': {
                backgroundColor: '#2a2a3e',
              },
              borderRadius: 1,
              mb: 0.25,
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  fontSize: 14,
                  bgcolor: '#7c3aed',
                }}
              >
                {parsed.name[0]}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={parsed.name}
              secondary={
                <span className="text-xs text-[#6c7086]">
                  {parsed.tags.slice(0, 3).join(' · ')}
                </span>
              }
              primaryTypographyProps={{ fontSize: 13, color: '#cdd6f4', noWrap: true }}
            />
          </ListItemButton>
        );
      })}
    </List>
  );
}
