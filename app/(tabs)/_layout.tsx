import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: s.tabBar,
        tabBarActiveTintColor: '#A855F7',
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: s.label,
        tabBarBackground: () => (
          <View style={s.tabBg} />
        ),
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="workout" options={{ title: 'Entrena', tabBarIcon: ({ color, size }) => <Ionicons name="barbell" size={size} color={color} /> }} />
      <Tabs.Screen name="nutrition" options={{ title: 'Nutri', tabBarIcon: ({ color, size }) => <Ionicons name="leaf" size={size} color={color} /> }} />
      <Tabs.Screen name="progress" options={{ title: 'Progreso', tabBarIcon: ({ color, size }) => <Ionicons name="trending-up" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  tabBar: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    paddingBottom: 4,
    height: 64,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  tabBg: { flex: 1, backgroundColor: '#0F0F25' },
  label: { fontSize: 10, fontWeight: '600' },
});
