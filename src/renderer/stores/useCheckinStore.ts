/**
 * 打卡状态 Store (P1)
 */
import { create } from 'zustand';
import type { CheckIn } from '../../shared/types';

interface CheckInState {
  todayCheckin: CheckIn | null;
  monthlyCheckins: CheckIn[];
  isLoading: boolean;
  error: string | null;

  loadTodayCheckin: (projectId: string) => Promise<void>;
  loadMonthlyCheckins: (projectId: string, year: number, month: number) => Promise<void>;
  clearError: () => void;
}

export const useCheckinStore = create<CheckInState>((set) => ({
  todayCheckin: null,
  monthlyCheckins: [],
  isLoading: false,
  error: null,

  loadTodayCheckin: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const todayCheckin = await window.electronAPI.checkin.today(projectId);
      set({ todayCheckin, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || '加载今日打卡失败', isLoading: false });
    }
  },

  loadMonthlyCheckins: async (projectId: string, year: number, month: number) => {
    set({ isLoading: true, error: null });
    try {
      const monthlyCheckins = await window.electronAPI.checkin.monthly(projectId, year, month);
      set({ monthlyCheckins, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || '加载月度打卡失败', isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
