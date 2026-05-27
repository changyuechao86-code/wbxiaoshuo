/**
 * 新建项目页面
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Paper,
} from '@mui/material';
import { useProjectStore } from '../stores/useProjectStore';
import type { ProjectType } from '../../shared/types';
import { DEFAULT_DAILY_GOAL } from '../utils/constants';

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
      setError('请输入项目名称');
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
      setError(err.message || '创建项目失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-[#1a1a2e]">
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
          📝 新建项目
        </h2>

        <div className="space-y-4">
          <TextField
            fullWidth
            label="项目名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            placeholder="给你的作品起个名字..."
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />

          <FormControl fullWidth size="small">
            <InputLabel>项目类型</InputLabel>
            <Select
              value={type}
              label="项目类型"
              onChange={(e) => setType(e.target.value as ProjectType)}
            >
              <MenuItem value="novel">📖 小说</MenuItem>
              <MenuItem value="script">🎬 剧本</MenuItem>
            </Select>
          </FormControl>

          <div>
            <Typography variant="caption" sx={{ color: '#6c7086' }}>
              每日字数目标
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
              取消
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting || !name.trim()}
              sx={{ textTransform: 'none' }}
            >
              {submitting ? '创建中...' : '创建项目'}
            </Button>
          </div>
        </div>
      </Paper>
    </div>
  );
}
