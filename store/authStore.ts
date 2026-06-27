import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  weight: number;
  height: number;
  age: number;
  goal: string;
  level: 'principiante' | 'intermedio' | 'avanzado';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  waist?: number;
  hips?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  createdAt: string;
  profileComplete: boolean;
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  getAllUsers: () => Promise<UserProfile[]>;
}

const ADMIN_PROFILE: UserProfile = {
  id: 'admin-001',
  email: 'admin@biofit.com',
  name: 'Administrador BIOfit',
  role: 'admin',
  weight: 65,
  height: 165,
  age: 30,
  goal: 'tone',
  level: 'avanzado',
  activityLevel: 'active',
  createdAt: new Date().toISOString(),
  profileComplete: true,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  initialize: async () => {
    try {
      const raw = await AsyncStorage.getItem('biofit_session');
      if (raw) set({ user: JSON.parse(raw) });
    } catch {}
    set({ isLoading: false });
  },

  login: async (email, password) => {
    const e = email.toLowerCase().trim();
    if (e === 'admin@biofit.com' && password === 'BIOfit2024!') {
      await AsyncStorage.setItem('biofit_session', JSON.stringify(ADMIN_PROFILE));
      set({ user: ADMIN_PROFILE });
      return { success: true };
    }
    const raw = await AsyncStorage.getItem('biofit_users');
    const users: Array<UserProfile & { password: string }> = raw ? JSON.parse(raw) : [];
    const match = users.find(u => u.email === e && u.password === password);
    if (!match) return { success: false, error: 'Correo o contraseña incorrectos' };
    const { password: _, ...profile } = match;
    await AsyncStorage.setItem('biofit_session', JSON.stringify(profile));
    set({ user: profile });
    return { success: true };
  },

  register: async (email, password, name) => {
    const e = email.toLowerCase().trim();
    const raw = await AsyncStorage.getItem('biofit_users');
    const users: Array<UserProfile & { password: string }> = raw ? JSON.parse(raw) : [];
    if (users.find(u => u.email === e)) return { success: false, error: 'Este correo ya está registrado' };
    const newUser: UserProfile & { password: string } = {
      id: `user-${Date.now()}`,
      email: e,
      name: name.trim(),
      role: 'user',
      weight: 0, height: 0, age: 0,
      goal: '', level: 'principiante', activityLevel: 'moderate',
      createdAt: new Date().toISOString(),
      profileComplete: false,
      password,
    };
    users.push(newUser);
    await AsyncStorage.setItem('biofit_users', JSON.stringify(users));
    const { password: _, ...profile } = newUser;
    await AsyncStorage.setItem('biofit_session', JSON.stringify(profile));
    set({ user: profile });
    return { success: true };
  },

  logout: async () => {
    await AsyncStorage.removeItem('biofit_session');
    set({ user: null });
  },

  updateProfile: async (data) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...data };
    await AsyncStorage.setItem('biofit_session', JSON.stringify(updated));
    if (current.role !== 'admin') {
      const raw = await AsyncStorage.getItem('biofit_users');
      const users: any[] = raw ? JSON.parse(raw) : [];
      const idx = users.findIndex(u => u.id === current.id);
      if (idx >= 0) users[idx] = { ...users[idx], ...data };
      await AsyncStorage.setItem('biofit_users', JSON.stringify(users));
    }
    set({ user: updated });
  },

  getAllUsers: async () => {
    const raw = await AsyncStorage.getItem('biofit_users');
    const users: Array<UserProfile & { password?: string }> = raw ? JSON.parse(raw) : [];
    return users.map(({ password: _, ...u }) => u as UserProfile);
  },
}));
