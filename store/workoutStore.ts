import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CompletedWorkout {
  id: string;
  userId: string;
  routineId: string;
  routineName: string;
  date: string;
  duration: number;
  calories: number;
  exercisesCompleted: number;
  totalExercises: number;
}

interface WorkoutState {
  history: CompletedWorkout[];
  streak: number;
  loadHistory: (userId: string) => Promise<void>;
  addWorkout: (workout: CompletedWorkout) => Promise<void>;
  getWeeklyCount: () => number;
  getTotalCalories: () => number;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  history: [],
  streak: 0,

  loadHistory: async (userId) => {
    const raw = await AsyncStorage.getItem(`biofit_workouts_${userId}`);
    const history: CompletedWorkout[] = raw ? JSON.parse(raw) : [];
    const streak = calculateStreak(history);
    set({ history, streak });
  },

  addWorkout: async (workout) => {
    const current = get().history;
    const updated = [workout, ...current];
    await AsyncStorage.setItem(`biofit_workouts_${workout.userId}`, JSON.stringify(updated));
    const streak = calculateStreak(updated);
    set({ history: updated, streak });
  },

  getWeeklyCount: () => {
    const history = get().history;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return history.filter(w => new Date(w.date) >= weekAgo).length;
  },

  getTotalCalories: () => {
    return get().history.reduce((sum, w) => sum + w.calories, 0);
  },
}));

function calculateStreak(history: CompletedWorkout[]): number {
  if (!history.length) return 0;
  const dates = [...new Set(history.map(w => w.date.split('T')[0]))].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let current = new Date(today);
  for (const date of dates) {
    const d = new Date(date);
    const diff = Math.floor((current.getTime() - d.getTime()) / 86400000);
    if (diff <= 1) { streak++; current = d; }
    else break;
  }
  return streak;
}
