/**
 * 设置页面
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Snackbar,
  Alert,
  Paper,
  Typography,
  Divider,
  Slider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useAIStore } from '../stores/useAIStore';
import { useAppStore } from '../stores/useAppStore';
import type { AIConfig } from '../../shared/types';

export function SettingsPage(): React.ReactElement {
  const navigate = useNavigate();
  const { config, loadConfig, saveConfig, validateConfig } = useAIStore();
  const { theme, toggleTheme } = useAppStore();

  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [model, setModel] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    setApiKey(config.apiKey);
    setApiEndpoint(config.apiEndpoint);
    setModel(config.model);
  }, [config]);

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      await saveConfig({
        provider: 'deepseek',
        apiKey,
        apiEndpoint,
        model,
      });
      setSnackbar({ open: true, message: 'AI 配置已保存', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: '保存配置失败', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async (): Promise<void> => {
    setValidating(true);
    try {
      const valid = await validateConfig();
      setSnackbar({
        open: true,
        message: valid ? 'API 连接验证成功' : 'API 连接验证失败，请检查配置',
        severity: valid ? 'success' : 'error',
      });
    } catch {
      setSnackbar({ open: true, message: '验证失败，请检查网络连接', severity: 'error' });
    } finally {
      setValidating(false);
    }
  };

  const handleBackup = async (): Promise<void> => {
    try {
      const path = await window.electronAPI.file.backup();
      setSnackbar({ open: true, message: `备份完成: ${path}`, severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: '备份失败', severity: 'error' });
    }
  };

  const handleRestore = async (): Promise<void> => {
    try {
      await window.electronAPI.file.restore();
      setSnackbar({ open: true, message: '恢复成功，请重启应用', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: '恢复失败', severity: 'error' });
    }
  };

  const handleExport = async (): Promise<void> => {
    try {
      const path = await window.electronAPI.file.exportDb();
      setSnackbar({ open: true, message: `导出成功: ${path}`, severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: '导出失败', severity: 'error' });
    }
  };

  const handleImport = async (): Promise<void> => {
    try {
      await window.electronAPI.file.importDb();
      setSnackbar({ open: true, message: '导入成功，请重启应用', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: '导入失败', severity: 'error' });
    }
  };

  return (
    <div className="flex justify-center h-full overflow-y-auto py-8 bg-[#1a1a2e]">
      <div className="w-full max-w-lg space-y-6">
        {/* AI 配置 */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: '#16213e',
            border: '1px solid #2a2a4e',
            borderRadius: 2,
          }}
        >
          <h3 className="text-sm font-semibold text-[#cdd6f4] mb-4">🤖 AI 配置</h3>
          <div className="space-y-3">
            <TextField
              fullWidth
              size="small"
              label="API 端点"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              placeholder="https://api.siliconflow.cn/v1"
            />
            <TextField
              fullWidth
              size="small"
              label="API Key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
            <TextField
              fullWidth
              size="small"
              label="模型"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="deepseek-ai/DeepSeek-V3"
            />
            <div className="flex gap-2">
              <Button
                size="small"
                variant="outlined"
                onClick={handleValidate}
                disabled={validating}
                sx={{ textTransform: 'none', fontSize: 12 }}
              >
                {validating ? '验证中...' : '测试连接'}
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                sx={{ textTransform: 'none', fontSize: 12 }}
              >
                {saving ? '保存中...' : '保存配置'}
              </Button>
            </div>
          </div>
        </Paper>

        {/* 编辑器设置 */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: '#16213e',
            border: '1px solid #2a2a4e',
            borderRadius: 2,
          }}
        >
          <h3 className="text-sm font-semibold text-[#cdd6f4] mb-4">📝 编辑器</h3>
          <div className="space-y-4">
            <div>
              <Typography variant="caption" sx={{ color: '#6c7086' }}>
                字体大小: {fontSize}px
              </Typography>
              <Slider
                value={fontSize}
                onChange={(_e, v) => setFontSize(v as number)}
                min={12}
                max={24}
                step={1}
                valueLabelDisplay="auto"
                sx={{ color: '#7c3aed' }}
              />
            </div>
            <div>
              <Typography variant="caption" sx={{ color: '#6c7086' }}>
                行距: {lineHeight}
              </Typography>
              <Slider
                value={lineHeight}
                onChange={(_e, v) => setLineHeight(v as number)}
                min={1.2}
                max={3.0}
                step={0.1}
                valueLabelDisplay="auto"
                sx={{ color: '#7c3aed' }}
              />
            </div>
            <FormControlLabel
              control={
                <Switch
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  size="small"
                />
              }
              label={
                <Typography variant="caption" sx={{ color: '#a0a0b0' }}>
                  深色模式
                </Typography>
              }
            />
          </div>
        </Paper>

        {/* 数据管理 */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: '#16213e',
            border: '1px solid #2a2a4e',
            borderRadius: 2,
          }}
        >
          <h3 className="text-sm font-semibold text-[#cdd6f4] mb-4">💾 数据管理</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              size="small"
              variant="outlined"
              onClick={handleBackup}
              sx={{ textTransform: 'none', fontSize: 12 }}
            >
              备份数据
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={handleRestore}
              sx={{ textTransform: 'none', fontSize: 12 }}
            >
              恢复数据
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={handleExport}
              sx={{ textTransform: 'none', fontSize: 12 }}
            >
              导出数据库
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={handleImport}
              sx={{ textTransform: 'none', fontSize: 12 }}
            >
              导入数据库
            </Button>
          </div>
          <Typography variant="caption" sx={{ color: '#6c7086', mt: 1, display: 'block' }}>
            备份文件存储在应用数据目录下的 backups 文件夹中
          </Typography>
        </Paper>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
