/**
 * 标签输入组件
 */
import React, { useState } from 'react';
import { Chip, TextField } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

export function TagInput({
  tags,
  onChange,
  placeholder = '输入标签后按回车添加',
  suggestions = [],
}: TagInputProps): React.ReactElement {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = (): void => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleDelete = (tag: string): void => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleSuggestionClick = (tag: string): void => {
    if (!tags.includes(tag)) {
      onChange([...tags, tag]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 min-h-[32px]">
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            onDelete={() => handleDelete(tag)}
            sx={{
              fontSize: 12,
              backgroundColor: 'rgba(124,58,237,0.15)',
              color: '#a78bfa',
            }}
          />
        ))}
        <TextField
          size="small"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : '添加更多...'}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: { fontSize: 12, color: '#cdd6f4', minWidth: 120 },
          }}
        />
      </div>
      {suggestions.length > 0 && inputValue && (
        <div className="flex flex-wrap gap-1">
          {suggestions
            .filter((s) => s.includes(inputValue) && !tags.includes(s))
            .slice(0, 5)
            .map((s) => (
              <Chip
                key={s}
                label={s}
                size="small"
                variant="outlined"
                onClick={() => handleSuggestionClick(s)}
                icon={<AddIcon sx={{ fontSize: 14 }} />}
                sx={{
                  fontSize: 11,
                  color: '#6c7086',
                  borderColor: '#3a3a5e',
                  cursor: 'pointer',
                }}
              />
            ))}
        </div>
      )}
    </div>
  );
}
