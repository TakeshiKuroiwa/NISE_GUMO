import { create } from 'zustand';
import { Schedule } from '../types';
import { apiClient } from '../services/api';

interface ScheduleState {
  schedules: Schedule[];
  isLoading: boolean;

  // Actions
  fetchSchedules: () => Promise<void>;
  createSchedule: (data: {
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    is_all_day: boolean;
  }) => Promise<void>;
  updateSchedule: (id: string, data: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  addSchedule: (schedule: Schedule) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  schedules: [],
  isLoading: false,

  fetchSchedules: async () => {
    set({ isLoading: true });
    try {
      const schedules = await apiClient.getSchedules();
      set({ schedules, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createSchedule: async (data) => {
    set({ isLoading: true });
    try {
      const newSchedule = await apiClient.createSchedule(data);
      set((state) => ({
        schedules: [...state.schedules, newSchedule],
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateSchedule: async (id: string, data: Partial<Schedule>) => {
    set({ isLoading: true });
    try {
      const updated = await apiClient.updateSchedule(id, data as any);
      set((state) => ({
        schedules: state.schedules.map((s) =>
          s.id === id ? updated : s
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteSchedule: async (id: string) => {
    set({ isLoading: true });
    try {
      await apiClient.deleteSchedule(id);
      set((state) => ({
        schedules: state.schedules.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  addSchedule: (schedule: Schedule) => {
    set((state) => ({
      schedules: [...state.schedules, schedule],
    }));
  },
}));
