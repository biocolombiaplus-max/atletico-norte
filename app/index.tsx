import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { user } = useAuthStore();
  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role === 'admin') return <Redirect href="/admin" />;
  if (!user.profileComplete) return <Redirect href="/(auth)/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
