import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Divider,
  FormControlLabel,
  Paper,
  Slider,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  Backup as BackupIcon,
  CloudSync as AIIcon,
  Download as ExportIcon,
  SettingsBackupRestore as RestoreIcon,
  Storage as DatabaseIcon,
  Tune as EditorIcon,
  Upload as ImportIcon,
} from '@mui/icons-material';
import type { AIConfig } from '../../shared/types';
import { useAIStore } from '../stores/useAIStore';
import { useAppStore } from '../stores/useAppStore';

const text = {
  aiConfig: '\u0041\u0049 \u914d\u7f6e',
  apiEndpoint: '\u0041\u0050\u0049 \u7aef\u70b9',
  apiKey: '\u0041\u0050\u0049 \u004b\u0065\u0079',
  backupData: '\u5907\u4efd\u6570\u636e',
  backupDone: '\u5907\u4efd\u5b8c\u6210',
  backupFailed: '\u5907\u4efd\u5931\u8d25',
  backupHint: '\u5907\u4efd\u3001\u5bfc\u5165\u548c\u6062\u590d\u4f1a\u76f4\u63a5\u5f71\u54cd\u672c\u5730\u6570\u636e\u5e93\u3002\u6267\u884c\u6062\u590d\u6216\u5bfc\u5165\u540e\uff0c\u8bf7\u91cd\u542f\u5e94\u7528\u4ee5\u786e\u4fdd\u6570\u636e\u91cd\u65b0\u52a0\u8f7d\u3002',
  darkMode: '\u6df1\u8272\u6a21\u5f0f',
  dataManagement: '\u6570\u636e\u7ba1\u7406',
  editor: '\u7f16\u8f91\u5668',
  exportData: '\u5bfc\u51fa\u6570\u636e\u5e93',
  exportDone: '\u5bfc\u51fa\u6210\u529f',
  exportFailed: '\u5bfc\u51fa\u5931\u8d25',
  fontSize: '\u5b57\u4f53\u5927\u5c0f',
  importData: '\u5bfc\u5165\u6570\u636e\u5e93',
  importDone: '\u5bfc\u5165\u6210\u529f\uff0c\u8bf7\u91cd\u542f\u5e94\u7528',
  importFailed: '\u5bfc\u5165\u5931\u8d25',
  lineHeight: '\u884c\u8ddd',
  model: '\u6a21\u578b',
  restoreData: '\u6062\u590d\u6570\u636e',
  restoreDone: '\u6062\u590d\u6210\u529f\uff0c\u8bf7\u91cd\u542f\u5e94\u7528',
  restoreFailed: '\u6062\u590d\u5931\u8d25',
  saveConfig: '\u4fdd\u5b58\u914d\u7f6e',
  saveConfigFailed: '\u4fdd\u5b58\u914d\u7f6e\u5931\u8d25',
  saveConfigSuccess: '\u0041\u0049 \u914d\u7f6e\u5df2\u4fdd\u5b58',
  saving: '\u4fdd\u5b58\u4e2d...',
  testConnection: '\u6d4b\u8bd5\u8fde\u63a5',
  validating: '\u9a8c\u8bc1\u4e2d...',
  validationFailed: '\u0041\u0050\u0049 \u8fde\u63a5\u9a8c\u8bc1\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u914d\u7f6e',
  validationNetworkFailed: '\u9a8c\u8bc1\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u7f51\u7edc\u8fde\u63a5',
  validationSuccess: '\u0041\u0050\u0049 \u8fde\u63a5\u9a8c\u8bc1\u6210\u529f',
};

function formatPathMessage(prefix: string, path: string): string {
  return path ? `${prefix}: ${path}` : prefix;
}

export function SettingsPage(): React.ReactElement {
  const { config, loadConfig, saveConfig } = useAIStore();
  const { theme, toggleTheme } = useAppStore();

  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [model, setModel] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const formConfig: AIConfig = useMemo(
    () => ({
      provider: 'deepseek',
      apiKey,
      apiEndpoint,
      model,
    }),
    [apiEndpoint, apiKey, model],
  );

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    setApiKey(config.apiKey);
    setApiEndpoint(config.apiEndpoint);
    setModel(config.model);
  }, [config]);

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      await saveConfig(formConfig);
      setSnackbar({ open: true, message: text.saveConfigSuccess, severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || text.saveConfigFailed, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async (): Promise<void> => {
    setValidating(true);
    try {
      const valid = await window.electronAPI.ai.validateConfig(formConfig);
      setSnackbar({
        open: true,
        message: valid ? text.validationSuccess : text.validationFailed,
        severity: valid ? 'success' : 'error',
      });
    } catch {
      setSnackbar({ open: true, message: text.validationNetworkFailed, severity: 'error' });
    } finally {
      setValidating(false);
    }
  };

  const handleBackup = async (): Promise<void> => {
    try {
      const path = await window.electronAPI.file.backup();
      setSnackbar({ open: true, message: formatPathMessage(text.backupDone, path), severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || text.backupFailed, severity: 'error' });
    }
  };

  const handleRestore = async (): Promise<void> => {
    try {
      await window.electronAPI.file.restore();
      setSnackbar({ open: true, message: text.restoreDone, severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || text.restoreFailed, severity: 'error' });
    }
  };

  const handleExport = async (): Promise<void> => {
    try {
      const path = await window.electronAPI.file.exportDb();
      setSnackbar({ open: true, message: formatPathMessage(text.exportDone, path), severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || text.exportFailed, severity: 'error' });
    }
  };

  const handleImport = async (): Promise<void> => {
    try {
      await window.electronAPI.file.importDb();
      setSnackbar({ open: true, message: text.importDone, severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || text.importFailed, severity: 'error' });
    }
  };

  return (
    <div className="flex justify-center h-full overflow-y-auto py-8 px-4 bg-[#1a1a2e]">
      <div className="w-full max-w-lg space-y-6">
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: '#16213e',
            border: '1px solid #2a2a4e',
            borderRadius: 2,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AIIcon sx={{ color: '#7c3aed', fontSize: 18 }} />
            <h3 className="text-sm font-semibold text-[#cdd6f4]">{text.aiConfig}</h3>
          </div>
          <div className="space-y-3">
            <TextField
              fullWidth
              size="small"
              label={text.apiEndpoint}
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              placeholder="https://api.siliconflow.cn/v1"
            />
            <TextField
              fullWidth
              size="small"
              label={text.apiKey}
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
            <TextField
              fullWidth
              size="small"
              label={text.model}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="deepseek-ai/DeepSeek-V3"
            />
            <div className="flex gap-2">
              <Button
                size="small"
                variant="outlined"
                onClick={handleValidate}
                disabled={validating || !apiEndpoint.trim() || !model.trim()}
                sx={{ textTransform: 'none', fontSize: 12 }}
              >
                {validating ? text.validating : text.testConnection}
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleSave}
                disabled={saving || !apiEndpoint.trim() || !model.trim()}
                sx={{ textTransform: 'none', fontSize: 12 }}
              >
                {saving ? text.saving : text.saveConfig}
              </Button>
            </div>
          </div>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: '#16213e',
            border: '1px solid #2a2a4e',
            borderRadius: 2,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <EditorIcon sx={{ color: '#7c3aed', fontSize: 18 }} />
            <h3 className="text-sm font-semibold text-[#cdd6f4]">{text.editor}</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Typography variant="caption" sx={{ color: '#6c7086' }}>
                {text.fontSize}: {fontSize}px
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
                {text.lineHeight}: {lineHeight}
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
                  {text.darkMode}
                </Typography>
              }
            />
          </div>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: '#16213e',
            border: '1px solid #2a2a4e',
            borderRadius: 2,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <DatabaseIcon sx={{ color: '#7c3aed', fontSize: 18 }} />
            <h3 className="text-sm font-semibold text-[#cdd6f4]">{text.dataManagement}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="small"
              variant="outlined"
              startIcon={<BackupIcon />}
              onClick={handleBackup}
              sx={{ textTransform: 'none', fontSize: 12 }}
            >
              {text.backupData}
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<RestoreIcon />}
              onClick={handleRestore}
              sx={{ textTransform: 'none', fontSize: 12 }}
            >
              {text.restoreData}
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={handleExport}
              sx={{ textTransform: 'none', fontSize: 12 }}
            >
              {text.exportData}
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ImportIcon />}
              onClick={handleImport}
              sx={{ textTransform: 'none', fontSize: 12 }}
            >
              {text.importData}
            </Button>
          </div>
          <Divider sx={{ borderColor: '#2a2a4e', my: 2 }} />
          <Typography variant="caption" sx={{ color: '#6c7086', display: 'block', lineHeight: 1.8 }}>
            {text.backupHint}
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
