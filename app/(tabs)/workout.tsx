import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { ROUTINES, WORKOUT_GOALS, WorkoutRoutine } from '@/constants/workouts';
import { COLORS } from '@/constants/colors';

type WState = 'list' | 'detail' | 'active' | 'rest' | 'complete';

export default function WorkoutScreen() {
  const { user } = useAuthStore();
  const { addWorkout } = useWorkoutStore();
  const [filterGoal, setFilterGoal] = useState('all');
  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null);
  const [wState, setWState] = useState<WState>('list');
  const [exIdx, setExIdx] = useState(0);
  const [setNum, setSetNum] = useState(1);
  const [restSecs, setRestSecs] = useState(0);
  const [voiceOn, setVoiceOn] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [vgIdx, setVgIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filtered = filterGoal === 'all' ? ROUTINES : ROUTINES.filter(r => r.goal === filterGoal);
  const curEx = routine?.exercises[exIdx];

  useEffect(() => () => { timerRef.current && clearInterval(timerRef.current); Speech.stop(); }, []);

  const speak = (text: string) => {
    if (!voiceOn) return;
    Speech.stop();
    Speech.speak(text, { language: 'es-CO', pitch: 1.05, rate: 0.85 });
  };

  const startWorkout = (r: WorkoutRoutine) => {
    setRoutine(r); setExIdx(0); setSetNum(1); setVgIdx(0);
    setStartTime(new Date()); setWState('active');
    setTimeout(() => speak(`¡Vamos! Comenzamos con ${r.exercises[0].nameEs}. ${r.exercises[0].voiceGuide[0]}`), 400);
  };

  const nextVoice = () => {
    if (!curEx) return;
    const next = vgIdx + 1;
    if (next < curEx.voiceGuide.length) { speak(curEx.voiceGuide[next]); setVgIdx(next); }
  };

  const completeSet = () => {
    if (!routine || !curEx) return;
    if (setNum < curEx.sets) {
      setRestSecs(curEx.rest);
      setWState('rest');
      speak(`Serie ${setNum} completada. Descansa ${curEx.rest} segundos.`);
      timerRef.current = setInterval(() => {
        setRestSecs(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            const ns = setNum + 1;
            setSetNum(ns); setVgIdx(0); setWState('active');
            speak(`Serie ${ns} de ${curEx.sets}. ${curEx.voiceGuide[0]}`);
            return 0;
          }
          if (prev === 10) speak('Quedan 10 segundos. Prepárate.');
          return prev - 1;
        });
      }, 1000);
    } else {
      const ni = exIdx + 1;
      if (ni < routine.exercises.length) {
        setExIdx(ni); setSetNum(1); setVgIdx(0);
        speak(`Excelente. Siguiente: ${routine.exercises[ni].nameEs}. ${routine.exercises[ni].voiceGuide[0]}`);
      } else { finishWorkout(); }
    }
  };

  const finishWorkout = () => {
    if (!routine || !startTime || !user) return;
    Speech.stop();
    setWState('complete');
    speak('¡Felicitaciones! Completaste el entrenamiento. Eres increíble. Tu cuerpo te lo agradece.');
    const mins = Math.max(1, Math.round((Date.now() - startTime.getTime()) / 60000));
    addWorkout({ id: `w-${Date.now()}`, userId: user.id, routineId: routine.id, routineName: routine.name, date: new Date().toISOString(), duration: mins, calories: routine.calories, exercisesCompleted: routine.exercises.length, totalExercises: routine.exercises.length });
  };

  const reset = () => { timerRef.current && clearInterval(timerRef.current); Speech.stop(); setWState('list'); setRoutine(null); };

  // --- COMPLETE screen ---
  if (wState === 'complete' && routine) {
    return (
      <SafeAreaView style={s.safe}>
        <LinearGradient colors={['#0A0A1A', '#12082A']} style={[s.bg, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
          <Text style={{ fontSize: 80, marginBottom: 20 }}>🏆</Text>
          <Text style={{ fontSize: 28, fontWeight: '900', color: 'white', textAlign: 'center', marginBottom: 8 }}>¡Entrenamiento Completado!</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 32 }}>{routine.name} • {routine.calories} kcal quemadas</Text>
          <TouchableOpacity style={{ width: '100%', borderRadius: 16, overflow: 'hidden' }} onPress={reset}>
            <LinearGradient colors={['#9333EA', '#EC4899']} style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Volver al inicio</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // --- REST screen ---
  if (wState === 'rest') {
    return (
      <SafeAreaView style={s.safe}>
        <LinearGradient colors={['#0A0A1A', '#12082A']} style={[s.bg, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
          <Text style={{ fontSize: 16, color: COLORS.textSecondary, marginBottom: 8 }}>DESCANSO</Text>
          <Text style={{ fontSize: 90, fontWeight: '900', color: '#A855F7', marginBottom: 12 }}>{restSecs}</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 15 }}>segundos</Text>
          {curEx && <Text style={{ color: 'white', fontSize: 16, marginTop: 32, textAlign: 'center' }}>Siguiente: <Text style={{ fontWeight: '700', color: '#A855F7' }}>{curEx.nameEs}</Text></Text>}
          <TouchableOpacity style={{ marginTop: 32, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border }} onPress={() => { timerRef.current && clearInterval(timerRef.current); setSetNum(s => s + 1); setVgIdx(0); setWState('active'); }}>
            <Text style={{ color: 'white', fontWeight: '600' }}>Saltar descanso</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // --- ACTIVE workout screen ---
  if (wState === 'active' && curEx && routine) {
    const progress = (exIdx / routine.exercises.length) + (setNum - 1) / (curEx.sets * routine.exercises.length);
    return (
      <SafeAreaView style={s.safe}>
        <LinearGradient colors={['#0A0A1A', '#12082A']} style={s.bg}>
          {/* Header */}
          <View style={s.activeHeader}>
            <TouchableOpacity onPress={() => Alert.alert('Salir', '¿Deseas terminar el entrenamiento?', [
              { text: 'Cancelar' }, { text: 'Salir', onPress: reset, style: 'destructive' },
            ])}>
              <Ionicons name="close" size={26} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <Text style={s.activeRoutineName}>{routine.name}</Text>
            <TouchableOpacity onPress={() => setVoiceOn(!voiceOn)}>
              <Ionicons name={voiceOn ? 'volume-high' : 'volume-mute'} size={24} color={voiceOn ? '#A855F7' : COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>

          <ScrollView contentContainerStyle={{ padding: 24, flex: 1 }}>
            {/* Exercise info */}
            <View style={s.exCard}>
              <Text style={s.exNum}>Ejercicio {exIdx + 1} / {routine.exercises.length}</Text>
              <Text style={s.exName}>{curEx.nameEs}</Text>
              <Text style={s.exMuscle}>💪 {curEx.muscle}</Text>
              {curEx.tip && <Text style={s.exTip}>💡 {curEx.tip}</Text>}
            </View>

            {/* Set info */}
            <LinearGradient colors={['#9333EA', '#EC4899']} style={s.setCard}>
              <Text style={s.setLabel}>SERIE</Text>
              <Text style={s.setNum}>{setNum} / {curEx.sets}</Text>
              <Text style={s.setReps}>{curEx.reps} repeticiones</Text>
            </LinearGradient>

            {/* Voice guide tip */}
            {voiceOn && vgIdx < curEx.voiceGuide.length && (
              <View style={s.voiceCard}>
                <Ionicons name="mic" size={16} color="#A855F7" style={{ marginRight: 8 }} />
                <Text style={s.voiceText}>{curEx.voiceGuide[vgIdx]}</Text>
              </View>
            )}

            {/* Action buttons */}
            <TouchableOpacity style={s.nextVoiceBtn} onPress={nextVoice}>
              <Ionicons name="mic-outline" size={18} color="#A855F7" />
              <Text style={s.nextVoiceText}>Siguiente indicación de voz</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.completeBtn} onPress={completeSet}>
              <LinearGradient colors={['#9333EA', '#EC4899']} style={s.completeBtnGrad}>
                <Ionicons name="checkmark-circle" size={24} color="white" />
                <Text style={s.completeBtnText}>Serie Completada</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // --- DETAIL view ---
  if (wState === 'detail' && routine) {
    return (
      <SafeAreaView style={s.safe}>
        <LinearGradient colors={['#0A0A1A', '#12082A']} style={s.bg}>
          <View style={s.detailHeader}>
            <TouchableOpacity onPress={() => setWState('list')}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={s.detailTitle}>{routine.name}</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <LinearGradient colors={['#7E22CE', '#9333EA']} style={s.detailBanner}>
              <Text style={{ fontSize: 44 }}>{routine.emoji}</Text>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 18 }}>{routine.name}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4 }}>{routine.duration} min • {routine.calories} kcal • {routine.level}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 4 }}>{routine.description}</Text>
              </View>
            </LinearGradient>

            <Text style={[s.sectionTitle, { marginTop: 20 }]}>Ejercicios</Text>
            {routine.exercises.map((ex, i) => (
              <View key={ex.id} style={s.exListCard}>
                <View style={s.exListNum}><Text style={{ color: '#A855F7', fontWeight: '800', fontSize: 13 }}>{i + 1}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>{ex.nameEs}</Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }}>{ex.sets} series × {ex.reps} • {ex.muscle}</Text>
                </View>
                <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>Descanso {ex.rest}s</Text>
              </View>
            ))}

            <TouchableOpacity style={{ borderRadius: 16, overflow: 'hidden', marginTop: 24 }} onPress={() => startWorkout(routine)}>
              <LinearGradient colors={['#9333EA', '#EC4899']} style={{ paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="play-circle" size={22} color="white" />
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 16, marginLeft: 10 }}>¡Comenzar Ahora!</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // --- LIST view ---
  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient colors={['#0A0A1A', '#12082A']} style={s.bg}>
        <View style={s.listHeader}>
          <Text style={s.listTitle}>Entrenamientos 💪</Text>
          <Text style={s.listSub}>Elige tu rutina de hoy</Text>
        </View>

        {/* Goal filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
          <TouchableOpacity style={[s.filterChip, filterGoal === 'all' && s.filterActive]} onPress={() => setFilterGoal('all')}>
            <Text style={[s.filterText, filterGoal === 'all' && s.filterTextActive]}>Todas</Text>
          </TouchableOpacity>
          {WORKOUT_GOALS.map(g => (
            <TouchableOpacity key={g.id} style={[s.filterChip, filterGoal === g.id && s.filterActive]} onPress={() => setFilterGoal(g.id)}>
              <Text style={{ marginRight: 4 }}>{g.icon}</Text>
              <Text style={[s.filterText, filterGoal === g.id && s.filterTextActive]}>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
          {filtered.map(r => (
            <TouchableOpacity key={r.id} style={s.routineCard} onPress={() => { setRoutine(r); setWState('detail'); }}>
              <View style={s.routineCardInner}>
                <Text style={s.routineEmoji}>{r.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.routineName}>{r.name}</Text>
                  <Text style={s.routineMeta}>{r.exercises.length} ejercicios • {r.duration} min • {r.calories} kcal</Text>
                  <View style={s.levelBadge}>
                    <Text style={s.levelText}>{r.level}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 30 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  bg: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: 'white', marginBottom: 12 },
  // List
  listHeader: { padding: 20, paddingBottom: 12 },
  listTitle: { fontSize: 26, fontWeight: '800', color: 'white' },
  listSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  filterScroll: { paddingHorizontal: 20, marginBottom: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, backgroundColor: COLORS.card },
  filterActive: { borderColor: '#9333EA', backgroundColor: 'rgba(147,51,234,0.18)' },
  filterText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#A855F7' },
  routineCard: { backgroundColor: COLORS.card, borderRadius: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  routineCardInner: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  routineEmoji: { fontSize: 38, marginRight: 14 },
  routineName: { fontSize: 16, fontWeight: '700', color: 'white', marginBottom: 4 },
  routineMeta: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 },
  levelBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(147,51,234,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  levelText: { color: '#A855F7', fontSize: 10, fontWeight: '700' },
  // Detail
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 8 },
  detailTitle: { fontSize: 18, fontWeight: '700', color: 'white' },
  detailBanner: { borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center' },
  exListCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  exListNum: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(147,51,234,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  // Active
  activeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  activeRoutineName: { fontSize: 15, fontWeight: '700', color: 'white' },
  progressBg: { height: 4, backgroundColor: COLORS.border, marginHorizontal: 20, borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: '#9333EA', borderRadius: 2 },
  exCard: { backgroundColor: COLORS.card, borderRadius: 18, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  exNum: { fontSize: 11, color: COLORS.textMuted, marginBottom: 4, fontWeight: '600' },
  exName: { fontSize: 26, fontWeight: '800', color: 'white', marginBottom: 6 },
  exMuscle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  exTip: { fontSize: 12, color: '#FCD34D', backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 8, padding: 8 },
  setCard: { borderRadius: 18, padding: 24, alignItems: 'center', marginBottom: 16 },
  setLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 2 },
  setNum: { fontSize: 56, fontWeight: '900', color: 'white', lineHeight: 68 },
  setReps: { fontSize: 16, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  voiceCard: { flexDirection: 'row', backgroundColor: 'rgba(147,51,234,0.12)', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(147,51,234,0.25)', alignItems: 'flex-start' },
  voiceText: { flex: 1, color: '#C4B5FD', fontSize: 13, lineHeight: 19 },
  nextVoiceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(147,51,234,0.4)', marginBottom: 14 },
  nextVoiceText: { color: '#A855F7', fontWeight: '600', fontSize: 13, marginLeft: 6 },
  completeBtn: { borderRadius: 16, overflow: 'hidden' },
  completeBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18 },
  completeBtnText: { color: 'white', fontWeight: '800', fontSize: 17, marginLeft: 10 },
});
