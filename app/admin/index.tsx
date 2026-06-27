import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore, UserProfile } from '@/store/authStore';
import { COLORS } from '@/constants/colors';

export default function AdminScreen() {
  const { user, logout, getAllUsers } = useAuthStore();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers().then(u => { setUsers(u); setLoading(false); });
  }, []);

  if (!user || user.role !== 'admin') return null;

  const totalComplete = users.filter(u => u.profileComplete).length;

  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient colors={['#0A0A1A', '#12082A']} style={s.bg}>
        {/* Header */}
        <LinearGradient colors={['#7E22CE', '#9333EA']} style={s.header}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.adminBadge}>PANEL ADMIN</Text>
              <Text style={s.headerTitle}>BIOfit</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert('Cerrar sesión', '¿Salir?', [{ text: 'Cancelar' }, { text: 'Salir', onPress: logout, style: 'destructive' }])}>
              <Ionicons name="log-out-outline" size={26} color="white" />
            </TouchableOpacity>
          </View>

          {/* Admin stats */}
          <View style={s.statsRow}>
            <StatCard value={users.length} label="Usuarias" icon="👩" />
            <StatCard value={totalComplete} label="Perfiles completos" icon="✅" />
            <StatCard value={users.length - totalComplete} label="Sin completar" icon="⏳" />
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <Text style={s.sectionTitle}>👥 Usuarias registradas ({users.length})</Text>

          {loading && <Text style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: 40 }}>Cargando...</Text>}

          {!loading && users.length === 0 && (
            <View style={s.emptyState}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>👩‍💻</Text>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Aún no hay usuarias</Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 4, textAlign: 'center' }}>Cuando las usuarias se registren aparecerán aquí</Text>
            </View>
          )}

          {users.map((u, i) => (
            <View key={u.id} style={s.userCard}>
              <LinearGradient colors={u.profileComplete ? ['rgba(147,51,234,0.2)', 'rgba(236,72,153,0.1)'] : ['rgba(30,30,60,0.5)', 'rgba(20,20,40,0.5)']} style={s.userCardGrad}>
                <View style={s.userTop}>
                  <View style={[s.userAvatar, { backgroundColor: u.profileComplete ? '#9333EA' : COLORS.surfaceLight }]}>
                    <Text style={s.userAvatarText}>{u.name[0]?.toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.userName}>{u.name}</Text>
                    <Text style={s.userEmail}>{u.email}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: u.profileComplete ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)' }]}>
                    <Text style={{ fontSize: 10, color: u.profileComplete ? '#10B981' : '#F59E0B', fontWeight: '700' }}>
                      {u.profileComplete ? 'Activa' : 'Incompleto'}
                    </Text>
                  </View>
                </View>

                {u.profileComplete && (
                  <View style={s.userMetrics}>
                    {[
                      { label: 'Peso', value: `${u.weight}kg` },
                      { label: 'Altura', value: `${u.height}cm` },
                      { label: 'Edad', value: `${u.age}años` },
                      { label: 'Nivel', value: u.level },
                      { label: 'Objetivo', value: u.goal },
                    ].map(m => (
                      <View key={m.label} style={s.userMetricItem}>
                        <Text style={s.userMetricLabel}>{m.label}</Text>
                        <Text style={s.userMetricValue}>{m.value}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <Text style={s.userDate}>
                  Registrada: {new Date(u.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </LinearGradient>
            </View>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

function StatCard({ value, label, icon }: { value: number; label: string; icon: string }) {
  return (
    <View style={sc.card}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={sc.value}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
    </View>
  );
}

const sc = StyleSheet.create({
  card: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 12, marginHorizontal: 4 },
  value: { fontSize: 28, fontWeight: '900', color: 'white', marginTop: 4 },
  label: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2, textAlign: 'center' },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  bg: { flex: 1 },
  header: { padding: 20, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  adminBadge: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 2, marginBottom: 2 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: 'white' },
  statsRow: { flexDirection: 'row' },
  scroll: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: 'white', marginBottom: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  userCard: { marginBottom: 14, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  userCardGrad: { padding: 16 },
  userTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userAvatarText: { fontSize: 18, fontWeight: '800', color: 'white' },
  userName: { fontSize: 15, fontWeight: '700', color: 'white' },
  userEmail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  userMetrics: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 12, marginBottom: 10 },
  userMetricItem: { width: '33%', marginBottom: 8 },
  userMetricLabel: { fontSize: 9, color: COLORS.textMuted, marginBottom: 2 },
  userMetricValue: { fontSize: 12, color: 'white', fontWeight: '600', textTransform: 'capitalize' },
  userDate: { fontSize: 11, color: COLORS.textMuted },
});
