/**
 * 角色编辑表单
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { TagInput } from '../common/TagInput';
import { parseCharacter, serializeCharacter } from '../../types/models';
import { RELATION_TYPES } from '../../utils/constants';
import type { Character, CharacterRelation, CreateCharacterRelationDTO } from '../../../shared/types';

interface CharacterFormProps {
  open: boolean;
  character: Character | null;
  onSave: (data: Partial<Character>) => Promise<void>;
  onClose: () => void;
}

export function CharacterForm({
  open,
  character,
  onSave,
  onClose,
}: CharacterFormProps): React.ReactElement {
  const [name, setName] = useState('');
  const [aliases, setAliases] = useState<string[]>([]);
  const [appearance, setAppearance] = useState('');
  const [personality, setPersonality] = useState('');
  const [background, setBackground] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (character) {
      const parsed = parseCharacter(character);
      setName(parsed.name);
      setAliases(parsed.aliases);
      setAppearance(parsed.appearance);
      setPersonality(parsed.personality);
      setBackground(parsed.background);
      setTags(parsed.tags);
    } else {
      setName('');
      setAliases([]);
      setAppearance('');
      setPersonality('');
      setBackground('');
      setTags([]);
    }
  }, [character, open]);

  const handleSave = async (): Promise<void> => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        aliases: JSON.stringify(aliases),
        appearance,
        personality,
        background,
        tags: JSON.stringify(tags),
      });
      onClose();
    } catch {
      // 错误已由 store 处理
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: '#e0e0e0', fontSize: 16 }}>
        {character ? '编辑角色' : '新建角色'}
      </DialogTitle>
      <DialogContent>
        <div className="space-y-3 mt-2">
          <TextField
            fullWidth
            label="角色名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            required
          />
          <div>
            <label className="text-xs text-[#6c7086] block mb-1">别名</label>
            <TagInput
              tags={aliases}
              onChange={setAliases}
              placeholder="输入别名后按回车"
            />
          </div>
          <TextField
            fullWidth
            label="外貌特征"
            value={appearance}
            onChange={(e) => setAppearance(e.target.value)}
            size="small"
            multiline
            maxRows={3}
          />
          <TextField
            fullWidth
            label="性格"
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            size="small"
            multiline
            maxRows={3}
          />
          <TextField
            fullWidth
            label="背景故事"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            size="small"
            multiline
            maxRows={5}
          />
          <div>
            <label className="text-xs text-[#6c7086] block mb-1">标签</label>
            <TagInput
              tags={tags}
              onChange={setTags}
              placeholder="输入标签后按回车"
              suggestions={['主角', '配角', '反派', '女性', '男性', '长辈', '少年', '神秘']}
            />
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#a0a0b0' }}>取消</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!name.trim() || saving}
        >
          {saving ? '保存中...' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
