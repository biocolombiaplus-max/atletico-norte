import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Measurement {
  id: string;
  date: string;
  weight: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  chest?: number;
  notes?: string;
}

interface ProgressState {
  measurements: Measurement[];
  loadMeasurements: (userId: string) => Promise<void>;
  addMeasurement: (userId: string, m: Omit<Measurement, 'id'>) => Promise<void>;
  getWeightHistory: () => { labels: string[]; data: number[] };
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  measurements: [],

  loadMeasurements: async (userId) => {
    const raw = await AsyncStorage.getItem(`biofit_progress_${userId}`);
    set({ measurements: raw ? JSON.parse(raw) : [] });
  },

  addMeasurement: async (userId, m) => {
    const current = get().measurements;
    const newM: Measurement = { ...m, id: `m-${Date.now()}` };
    const updated = [newM, ...current].slice(0, 90);
    await AsyncStorage.setItem(`biofit_progress_${userId}`, JSON.stringify(updated));
    set({ measurements: updated });
  },

  getWeightHistory: () => {
    const measurements = get().measurements
      .filter(m => m.weight > 0)
      .slice(0, 8)
      .reverse();
    return {
      labels: measurements.map(m => {
        const d = new Date(m.date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      }),
      data: measurements.map(m => m.weight),
    };
  },
}));
