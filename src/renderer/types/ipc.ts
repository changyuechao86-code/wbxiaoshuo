/**
 * IPC 通信类型定义
 */
import type { IPC_CHANNELS } from '../../shared/ipc-channels';

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

/** IPC 响应包装 */
export interface IpcResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** IPC 调用超时时间（毫秒） */
export const IPC_TIMEOUT = 30000;
