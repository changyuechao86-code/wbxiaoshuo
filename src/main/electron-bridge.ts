/**
 * Electron 桥接模块
 * 解决 Electron 28 中 require("electron") 解析到 npm stub 的问题
 * 在 Electron 主进程中，使用内置绑定获取真正的 electron API
 */
const electronModule = (() => {
  // 方法1：尝试标准 require
  try {
    const e = require('electron');
    if (e && typeof e === 'object' && e.app) return e;
  } catch (_) {}

  // 方法2：如果 require 返回了路径字符串（npm stub），
  // 从 require cache 中删除并以不同方式重新加载
  try {
    const m = require.cache[require.resolve('electron')];
    if (m) delete require.cache[require.resolve('electron')];
  } catch (_) {}

  // 方法3：使用 Electron 内置绑定
  try {
    const binding = process._linkedBinding('electron_common_electron');
    if (binding && binding.app) return binding;
  } catch (_) {}

  // 降级：返回空对象
  return {} as any;
})();

export const app = electronModule.app;
export const BrowserWindow = electronModule.BrowserWindow;
export const ipcMain = electronModule.ipcMain;
export const dialog = electronModule.dialog;
export const screen = electronModule.screen;
export const shell = electronModule.shell;
export default electronModule;
