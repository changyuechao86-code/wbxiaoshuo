/**
 * 日期格式化工具（基于 date-fns）
 */
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/** 格式化日期为本地字符串 */
export function formatDate(dateStr: string, fmt: string = 'yyyy-MM-dd HH:mm'): string {
  try {
    return format(parseISO(dateStr), fmt, { locale: zhCN });
  } catch {
    return dateStr;
  }
}

/** 格式化日期为相对时间描述 */
export function formatRelativeTime(dateStr: string): string {
  try {
    if (isToday(parseISO(dateStr))) {
      return `今天 ${format(parseISO(dateStr), 'HH:mm')}`;
    }
    if (isYesterday(parseISO(dateStr))) {
      return `昨天 ${format(parseISO(dateStr), 'HH:mm')}`;
    }
    return formatDistanceToNow(parseISO(dateStr), {
      addSuffix: true,
      locale: zhCN,
    });
  } catch {
    return dateStr;
  }
}

/** 格式化日期为简短形式 */
export function formatDateShort(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return format(d, 'HH:mm');
    return format(d, 'MM-dd HH:mm', { locale: zhCN });
  } catch {
    return dateStr;
  }
}

/** 获取今日日期字符串 (YYYY-MM-DD) */
export function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 获取当前月份 */
export function getCurrentMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}
