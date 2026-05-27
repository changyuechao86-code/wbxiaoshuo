import { describe, it, expect } from 'vitest';
import { formatDate, formatDateShort, getTodayStr, getCurrentMonth } from '../../renderer/utils/date';

describe('formatDate', () => {
  it('格式化 ISO 日期字符串', () => {
    const result = formatDate('2024-01-15T10:30:00.000Z');
    expect(result).toContain('2024');
    expect(result).toContain('01');
    expect(result).toContain('15');
  });

  it('使用自定义格式', () => {
    const result = formatDate('2024-01-15T10:30:00.000Z', 'MM-dd');
    expect(result).toBe('01-15');
  });

  it('无效日期返回原字符串', () => {
    expect(formatDate('invalid')).toBe('invalid');
  });

  it('默认格式 yyyy-MM-dd HH:mm', () => {
    const result = formatDate('2024-01-15T10:30:00.000Z');
    // Should contain both date and time parts
    expect(result.length).toBeGreaterThan(10);
  });
});

describe('formatDateShort', () => {
  it('格式化简短形式', () => {
    const result = formatDateShort('2024-01-15T10:30:00.000Z');
    expect(result).toContain('01-15');
  });

  it('无效日期返回原字符串', () => {
    expect(formatDateShort('bad-date')).toBe('bad-date');
  });
});

describe('getTodayStr', () => {
  it('返回 YYYY-MM-DD 格式', () => {
    const today = getTodayStr();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('getCurrentMonth', () => {
  it('返回当前年月', () => {
    const { year, month } = getCurrentMonth();
    expect(year).toBeGreaterThanOrEqual(2025);
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
  });
});
