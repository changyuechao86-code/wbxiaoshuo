/**
 * CheckIn IPC 处理器 — 打卡记录
 */
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { checkinRepo } from '../db/repositories/checkin.repo';
import { logger } from '../utils/logger';
import { format } from 'date-fns';

export function registerCheckinHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.CHECKIN_TODAY, async (_event, projectId: string) => {
    try {
      return checkinRepo.getToday(projectId, format(new Date(), 'yyyy-MM-dd'));
    } catch (err: any) {
      logger.error(`今日打卡查询失败: ${err.message}`);
      throw new Error(`查询今日打卡失败: ${err.message}`);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHECKIN_MONTHLY, async (_event, projectId: string, year: number, month: number) => {
    try {
      return checkinRepo.getMonthly(projectId, `${year}-${String(month).padStart(2, '0')}`);
    } catch (err: any) {
      logger.error(`月度打卡查询失败: ${err.message}`);
      throw new Error(`查询月度打卡失败: ${err.message}`);
    }
  });
}
