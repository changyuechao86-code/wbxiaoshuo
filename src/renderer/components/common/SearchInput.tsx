/**
 * 搜索输入组件
 */
import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = '搜索...',
}: SearchInputProps): React.ReactElement {
  return (
    <TextField
      fullWidth
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" sx={{ color: '#6c7086' }} />
          </InputAdornment>
        ),
        sx: {
          fontSize: 13,
          backgroundColor: '#0f0f23',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2a2a4e' },
        },
      }}
    />
  );
}
