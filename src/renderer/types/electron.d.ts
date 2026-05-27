/**
 * window.electronAPI 类型声明
 * 扩展 Window 接口，使 TypeScript 能识别 window.electronAPI
 */
import type { ElectronAPI } from '../../preload/index';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
