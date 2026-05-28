import { create } from 'zustand';
import type { CheckIn } from '../../shared/types';

const text = {
  loadMonthlyFailed: '\u52a0\u8f7d\u6708\u5ea6\u6253\u5361\u5931\u8d25',
  loadTodayFailed: '\u52a0\u8f7d\u4eca\u65e5\u6253\u5361\u5931\u8d25',
};

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
      set({ error: err.message || text.loadTodayFailed, isLoading: false });
    }
  },

  loadMonthlyCheckins: async (projectId: string, year: number, month: number) => {
    set({ isLoading: true, error: null });
    try {
      const monthlyCheckins = await window.electronAPI.checkin.monthly(projectId, year, month);
      set({ monthlyCheckins, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || text.loadMonthlyFailed, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
