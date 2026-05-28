import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  TextField,
  Typography,
} from '@mui/material';
import { MenuBook as NovelIcon, Movie as ScriptIcon } from '@mui/icons-material';
import type { ProjectType } from '../../shared/types';
import { useProjectStore } from '../stores/useProjectStore';
import { DEFAULT_DAILY_GOAL } from '../utils/constants';

const text = {
  cancel: '\u53d6\u6d88',
  create: '\u521b\u5efa\u9879\u76ee',
  creating: '\u521b\u5efa\u4e2d...',
  createFailed: '\u521b\u5efa\u9879\u76ee\u5931\u8d25',
  dailyGoal: '\u6bcf\u65e5\u5b57\u6570\u76ee\u6807',
  nameLabel: '\u9879\u76ee\u540d\u79f0',
  namePlaceholder: '\u7ed9\u4f60\u7684\u4f5c\u54c1\u8d77\u4e2a\u540d\u5b57...',
  nameRequired: '\u8bf7\u8f93\u5165\u9879\u76ee\u540d\u79f0',
  novel: '\u5c0f\u8bf4',
  script: '\u5267\u672c',
  title: '\u65b0\u5efa\u9879\u76ee',
  typeLabel: '\u9879\u76ee\u7c7b\u578b',
};

export function ProjectCreatePage(): React.ReactElement {
  const navigate = useNavigate();
  const { createProject } = useProjectStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<ProjectType>('novel');
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_DAILY_GOAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (): Promise<void> => {
    if (!name.trim()) {
      setError(text.nameRequired);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const project = await createProject({
        name: name.trim(),
        type,
        dailyGoal,
      });
      navigate(`/editor/${project.id}`);
    } catch (err: any) {
      setError(err.message || text.createFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-[#1a1a2e] px-4">
      <Paper
        elevation={0}
        sx={{
          width: 480,
          p: 4,
          backgroundColor: '#16213e',
          border: '1px solid #2a2a4e',
          borderRadius: 2,
        }}
      >
        <h2 className="text-lg font-semibold text-[#cdd6f4] mb-6 text-center">
          {text.title}
        </h2>

        <div className="space-y-4">
          <TextField
            fullWidth
            label={text.nameLabel}
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            placeholder={text.namePlaceholder}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void handleSubmit();
              }
            }}
          />

          <FormControl fullWidth size="small">
            <InputLabel>{text.typeLabel}</InputLabel>
            <Select
              value={type}
              label={text.typeLabel}
              onChange={(e) => setType(e.target.value as ProjectType)}
            >
              <MenuItem value="novel">
                <span className="inline-flex items-center gap-2">
                  <NovelIcon fontSize="small" /> {text.novel}
                </span>
              </MenuItem>
              <MenuItem value="script">
                <span className="inline-flex items-center gap-2">
                  <ScriptIcon fontSize="small" /> {text.script}
                </span>
              </MenuItem>
            </Select>
          </FormControl>

          <div>
            <Typography variant="caption" sx={{ color: '#6c7086' }}>
              {text.dailyGoal}
            </Typography>
            <div className="flex items-center gap-3">
              <Slider
                value={dailyGoal}
                onChange={(_e, val) => setDailyGoal(val as number)}
                min={500}
                max={20000}
                step={100}
                valueLabelDisplay="auto"
                sx={{ color: '#7c3aed' }}
              />
              <span className="text-sm font-mono text-[#cdd6f4] min-w-[60px] text-right">
                {dailyGoal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#6c7086]">
              <span>500</span>
              <span>20,000</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{ textTransform: 'none', color: '#a0a0b0', borderColor: '#3a3a5e' }}
            >
              {text.cancel}
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting || !name.trim()}
              sx={{ textTransform: 'none' }}
            >
              {submitting ? text.creating : text.create}
            </Button>
          </div>
        </div>
      </Paper>
    </div>
  );
}
