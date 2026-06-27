import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { COLORS } from '@/constants/colors';
import { WORKOUT_GOALS } from '@/constants/workouts';

const { width } = Dimensions.get('window');

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentaria', sub: 'Poco o ningún ejercicio', icon: '🛋️' },
  { id: 'light', label: 'Ligera', sub: '1-3 días por semana', icon: '🚶‍♀️' },
  { id: 'moderate', label: 'Moderada', sub: '3-5 días por semana', icon: '🏃‍♀️' },
  { id: 'active', label: 'Muy Activa', sub: '6-7 días por semana', icon: '⚡' },
];

const LEVELS = [
  { id: 'principiante', label: 'Principiante', sub: 'Menos de 6 meses entrenando', icon: '🌱' },
  { id: 'intermedio', label: 'Intermedio', sub: '6 meses a 2 años', icon: '🌿' },
  { id: 'avanzado', label: 'Avanzado', sub: 'Más de 2 años', icon: '🌳' },
];

export default function OnboardingScreen() {
  const { updateProfile } = useAuthStore();
  const [step, setStep] = useState(0);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [goal, setGoal] = useState('');
  const [activity, setActivity] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const totalSteps = 3;
  const progress = (step + 1) / totalSteps;

  const goNext = () => {
    if (step === 0) {
      if (!weight || !height || !age) { Alert.alert('Completa los datos', 'Todos los campos son necesarios'); return; }
      if (parseFloat(weight) < 30 || parseFloat(weight) > 200) { Alert.alert('Peso inválido', 'Ingresa un peso entre 30 y 200 kg'); return; }
      if (parseFloat(height) < 140 || parseFloat(height) > 220) { Alert.alert('Estatura inválida', 'Ingresa una estatura entre 140 y 220 cm'); return; }
    }
    if (step === 1 && !goal) { Alert.alert('Selecciona un objetivo', 'Elige qué quieres lograr'); return; }
    if (step === 2 && (!activity || !level)) { Alert.alert('Completa la información', 'Selecciona nivel y actividad'); return; }
    if (step < totalSteps - 1) { setStep(step + 1); return; }
    handleFinish();
  };

  const handleFinish = async () => {
    setLoading(true);
    await updateProfile({
      weight: parseFloat(weight),
      height: parseFloat(height),
      age: parseInt(age),
      goal,
      activityLevel: activity as any,
      level: level as any,
      profileComplete: true,
    });
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient colors={['#0A0A1A', '#12082A']} style={s.bg}>
        {/* Progress */}
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${progress * 100}%` as any }]} />
        </View>
        <Text style={s.stepText}>Paso {step + 1} de {totalSteps}</Text>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {step === 0 && (
            <View>
              <Text style={s.stepTitle}>Cuéntanos sobre ti 📏</Text>
              <Text style={s.stepSub}>Esta información nos ayuda a calcular tus indicadores corporales y personalizar tu plan.</Text>

              <View style={s.fieldGroup}>
                <Text style={s.fieldLabel}>Peso actual (kg)</Text>
                <View style={s.inputRow}>
                  <Ionicons name="fitness-outline" size={18} color={COLORS.textMuted} style={s.icon} />
                  <TextInput style={s.input} placeholder="Ej: 65" placeholderTextColor={COLORS.textMuted}
                    value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
                  <Text style={s.unit}>kg</Text>
                </View>
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.fieldLabel}>Estatura (cm)</Text>
                <View style={s.inputRow}>
                  <Ionicons name="resize-outline" size={18} color={COLORS.textMuted} style={s.icon} />
                  <TextInput style={s.input} placeholder="Ej: 162" placeholderTextColor={COLORS.textMuted}
                    value={height} onChangeText={setHeight} keyboardType="number-pad" />
                  <Text style={s.unit}>cm</Text>
                </View>
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.fieldLabel}>Edad</Text>
                <View style={s.inputRow}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} style={s.icon} />
                  <TextInput style={s.input} placeholder="Ej: 28" placeholderTextColor={COLORS.textMuted}
                    value={age} onChangeText={setAge} keyboardType="number-pad" />
                  <Text style={s.unit}>años</Text>
                </View>
              </View>
            </View>
          )}

          {step === 1 && (
            <View>
              <Text style={s.stepTitle}>¿Qué quieres lograr? 🎯</Text>
              <Text style={s.stepSub}>Selecciona tu objetivo principal. Puedes cambiarlo después.</Text>
              {WORKOUT_GOALS.map(g => (
                <TouchableOpacity key={g.id} style={[s.optionCard, goal === g.id && s.optionSelected]}
                  onPress={() => setGoal(g.id)}>
                  <Text style={s.optionIcon}>{g.icon}</Text>
                  <Text style={s.optionLabel}>{g.label}</Text>
                  {goal === g.id && <Ionicons name="checkmark-circle" size={22} color="#9333EA" style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={s.stepTitle}>Tu experiencia 💪</Text>
              <Text style={s.stepSub}>Esto nos ayuda a adaptar la dificultad de tus rutinas.</Text>

              <Text style={s.groupLabel}>Nivel de entrenamiento</Text>
              {LEVELS.map(l => (
                <TouchableOpacity key={l.id} style={[s.optionCard, level === l.id && s.optionSelected]}
                  onPress={() => setLevel(l.id)}>
                  <Text style={s.optionIcon}>{l.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.optionLabel}>{l.label}</Text>
                    <Text style={s.optionSub}>{l.sub}</Text>
                  </View>
                  {level === l.id && <Ionicons name="checkmark-circle" size={22} color="#9333EA" />}
                </TouchableOpacity>
              ))}

              <Text style={[s.groupLabel, { marginTop: 20 }]}>Nivel de actividad</Text>
              {ACTIVITY_LEVELS.map(a => (
                <TouchableOpacity key={a.id} style={[s.optionCard, activity === a.id && s.optionSelected]}
                  onPress={() => setActivity(a.id)}>
                  <Text style={s.optionIcon}>{a.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.optionLabel}>{a.label}</Text>
                    <Text style={s.optionSub}>{a.sub}</Text>
                  </View>
                  {activity === a.id && <Ionicons name="checkmark-circle" size={22} color="#9333EA" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={s.nextBtn} onPress={goNext} disabled={loading}>
            <LinearGradient colors={['#9333EA', '#EC4899']} style={s.nextGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={s.nextText}>
                {loading ? 'Guardando...' : step === totalSteps - 1 ? '¡Comenzar mi plan! 🚀' : 'Continuar'}
              </Text>
              {!loading && <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  bg: { flex: 1 },
  progressBar: { height: 4, backgroundColor: COLORS.border, marginHorizontal: 0 },
  progressFill: { height: 4, backgroundColor: '#9333EA', borderRadius: 2 },
  stepText: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12, paddingTop: 10 },
  scroll: { padding: 24, paddingTop: 16 },
  stepTitle: { fontSize: 26, fontWeight: '800', color: 'white', marginBottom: 8 },
  stepSub: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 28, lineHeight: 20 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8, fontWeight: '600' },
  groupLabel: { fontSize: 15, color: 'white', fontWeight: '700', marginBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingHorizontal: 14, height: 52, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  icon: { marginRight: 10 },
  input: { flex: 1, color: 'white', fontSize: 16 },
  unit: { color: COLORS.textMuted, fontSize: 13 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  optionSelected: { borderColor: '#9333EA', backgroundColor: 'rgba(147,51,234,0.12)' },
  optionIcon: { fontSize: 24, marginRight: 14 },
  optionLabel: { fontSize: 15, fontWeight: '700', color: 'white' },
  optionSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  nextBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 28 },
  nextGrad: { paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  nextText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
