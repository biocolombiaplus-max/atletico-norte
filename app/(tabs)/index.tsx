import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { calculateMetrics, getWaterIntake, getProteinGoal, calculateCalorieGoal } from '@/lib/metrics';
import { COLORS } from '@/constants/colors';
import { ROUTINES } from '@/constants/workouts';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { history, streak, loadHistory, getWeeklyCount } = useWorkoutStore();

  useEffect(() => { if (user) loadHistory(user.id); }, [user?.id]);

  if (!user) return null;

  const metrics = (user.weight && user.height && user.age)
    ? calculateMetrics(user.weight, user.height, user.age, user.activityLevel)
    : null;

  const calorieGoal = metrics ? calculateCalorieGoal(metrics.tdee, user.goal) : 0;
  const waterGoal = getWaterIntake(user.weight || 60);
  const proteinGoal = getProteinGoal(user.weight || 60, user.goal);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';
  const firstName = user.name.split(' ')[0];

  const dayMap: Record<number, string> = { 1: 'glutes_legs', 2: 'upper_body', 3: 'cardio_hiit', 4: 'core_abs', 5: 'glutes_legs', 6: 'full_body' };
  const todayRoutine = ROUTINES.find(r => r.id === dayMap[new Date().getDay()]);
  const weeklyCount = getWeeklyCount();
  const weeklyCalories = history.slice(0, 7).reduce((s, w) => s + w.calories, 0);

  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient colors={['#0A0A1A', '#12082A']} style={s.bg}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.greeting}>{greeting},</Text>
              <Text style={s.userName}>{firstName} 💪</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <LinearGradient colors={['#9333EA', '#EC4899']} style={s.avatar}>
                <Text style={s.avatarText}>{firstName[0]?.toUpperCase()}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {streak > 0 && (
            <LinearGradient colors={['rgba(245,158,11,0.15)', 'rgba(236,72,153,0.15)']} style={s.streakBanner}>
              <Text style={s.streakFire}>🔥</Text>
              <Text style={s.streakText}>{streak} días seguidos. ¡Eres imparable!</Text>
            </LinearGradient>
          )}

          {/* Metrics */}
          {metrics && (
            <>
              <Text style={s.sectionTitle}>Tus Indicadores</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
                <MetricCard icon="body-outline" label="IMC" value={metrics.bmi.toString()} unit="" sub={metrics.bmiCategory} color={metrics.bmiColor} />
                <MetricCard icon="flame-outline" label="Calorías" value={calorieGoal.toString()} unit="kcal" sub="meta diaria" color="#F59E0B" />
                <MetricCard icon="water-outline" label="Agua" value={(waterGoal / 1000).toFixed(1)} unit="L" sub="meta diaria" color="#3B82F6" />
                <MetricCard icon="barbell-outline" label="Proteína" value={proteinGoal.toString()} unit="g" sub="meta diaria" color="#10B981" />
                {metrics.bodyFatEstimate != null && (
                  <MetricCard icon="fitness-outline" label="Grasa Corp." value={metrics.bodyFatEstimate.toString()} unit="%" sub="estimado" color="#EC4899" />
                )}
              </ScrollView>
            </>
          )}

          {/* Today's Workout */}
          <Text style={s.sectionTitle}>Entrenamiento de Hoy</Text>
          {todayRoutine ? (
            <TouchableOpacity onPress={() => router.push('/(tabs)/workout')} style={s.workoutCard}>
              <LinearGradient colors={['#7E22CE', '#9333EA', '#EC4899']} style={s.workoutGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={s.workoutTop}>
                  <Text style={s.workoutEmoji}>{todayRoutine.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.workoutName}>{todayRoutine.name}</Text>
                    <Text style={s.workoutMeta}>{todayRoutine.exercises.length} ejercicios • {todayRoutine.duration} min • {todayRoutine.calories} kcal</Text>
                  </View>
                </View>
                <View style={s.startBtn}>
                  <Ionicons name="play-circle" size={22} color="white" />
                  <Text style={s.startText}>Comenzar Rutina</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={s.restCard}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>😴</Text>
              <Text style={s.restTitle}>Día de descanso</Text>
              <Text style={s.restSub}>Tu cuerpo se recupera y crece durante el descanso.</Text>
            </View>
          )}

          {/* Weekly Summary */}
          <Text style={s.sectionTitle}>Esta Semana</Text>
          <View style={s.weekRow}>
            <StatBox value={weeklyCount} label="Entrenos" color="#A855F7" />
            <StatBox value={streak} label="Días racha" color="#F59E0B" />
            <StatBox value={weeklyCalories} label="Kcal" color="#EC4899" />
          </View>

          {/* Nutrition shortcut */}
          <Text style={s.sectionTitle}>Nutrición</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/nutrition')} style={s.nutriCard}>
            <Text style={{ fontSize: 28, marginRight: 12 }}>🥗</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.nutriTitle}>Plan de Comidas</Text>
              <Text style={s.nutriSub}>Recetas colombianas saludables para hoy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

function MetricCard({ icon, label, value, unit, sub, color }: { icon: any; label: string; value: string; unit: string; sub: string; color: string }) {
  return (
    <View style={[mc.card, { borderColor: color + '40' }]}>
      <View style={[mc.iconBg, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={mc.label}>{label}</Text>
      <Text style={[mc.value, { color }]}>{value}<Text style={mc.unit}> {unit}</Text></Text>
      <Text style={mc.sub}>{sub}</Text>
    </View>
  );
}

function StatBox({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={sb.box}>
      <Text style={[sb.value, { color }]}>{value}</Text>
      <Text style={sb.label}>{label}</Text>
    </View>
  );
}

const mc = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 14, marginRight: 12, width: 118, borderWidth: 1 },
  iconBg: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 10, color: COLORS.textMuted, marginBottom: 2 },
  value: { fontSize: 20, fontWeight: '800' },
  unit: { fontSize: 10, fontWeight: '400', color: COLORS.textSecondary },
  sub: { fontSize: 9, color: COLORS.textMuted, marginTop: 2 },
});

const sb = StyleSheet.create({
  box: { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginHorizontal: 4, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  value: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  label: { fontSize: 10, color: COLORS.textMuted },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  bg: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  greeting: { fontSize: 13, color: COLORS.textSecondary },
  userName: { fontSize: 24, fontWeight: '800', color: 'white' },
  avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 17, fontWeight: '800', color: 'white' },
  streakBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
  streakFire: { fontSize: 18, marginRight: 8 },
  streakText: { color: '#FCD34D', fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: 'white', marginHorizontal: 20, marginBottom: 12, marginTop: 8 },
  hScroll: { paddingLeft: 20, marginBottom: 20 },
  workoutCard: { marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  workoutGrad: { padding: 20 },
  workoutTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  workoutEmoji: { fontSize: 38, marginRight: 14 },
  workoutName: { fontSize: 19, fontWeight: '800', color: 'white', marginBottom: 4 },
  workoutMeta: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, paddingVertical: 12 },
  startText: { color: 'white', fontWeight: '700', marginLeft: 8, fontSize: 14 },
  restCard: { marginHorizontal: 20, backgroundColor: COLORS.card, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  restTitle: { fontSize: 17, fontWeight: '700', color: 'white', marginBottom: 4 },
  restSub: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' },
  weekRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 20 },
  nutriCard: { marginHorizontal: 20, backgroundColor: COLORS.card, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  nutriTitle: { fontSize: 14, fontWeight: '700', color: 'white' },
  nutriSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
});
