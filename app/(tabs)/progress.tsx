import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { calculateMetrics } from '@/lib/metrics';
import { COLORS } from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const { user } = useAuthStore();
  const { measurements, loadMeasurements, addMeasurement, getWeightHistory } = useProgressStore();
  const { history, streak, loadHistory } = useWorkoutStore();
  const [showModal, setShowModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newWaist, setNewWaist] = useState('');
  const [newHips, setNewHips] = useState('');

  useEffect(() => {
    if (user) { loadMeasurements(user.id); loadHistory(user.id); }
  }, [user?.id]);

  const weightHistory = getWeightHistory();
  const hasChart = weightHistory.data.length >= 2;

  const metrics = (user?.weight && user?.height && user?.age)
    ? calculateMetrics(user.weight, user.height, user.age, user.activityLevel)
    : null;

  const saveMeasurement = async () => {
    if (!user || !newWeight) { Alert.alert('Peso requerido', 'Ingresa tu peso actual'); return; }
    await addMeasurement(user.id, {
      date: new Date().toISOString(),
      weight: parseFloat(newWeight),
      waist: newWaist ? parseFloat(newWaist) : undefined,
      hips: newHips ? parseFloat(newHips) : undefined,
    });
    await useAuthStore.getState().updateProfile({ weight: parseFloat(newWeight) });
    setShowModal(false); setNewWeight(''); setNewWaist(''); setNewHips('');
  };

  if (!user) return null;

  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient colors={['#0A0A1A', '#12082A']} style={s.bg}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>Mi Progreso 📈</Text>
            <Text style={s.sub}>Registra y visualiza tu transformación</Text>
          </View>
          <TouchableOpacity onPress={() => setShowModal(true)} style={s.addBtn}>
            <LinearGradient colors={['#9333EA', '#EC4899']} style={s.addBtnGrad}>
              <Ionicons name="add" size={22} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Summary cards */}
          {metrics && (
            <View style={s.summaryRow}>
              <SummaryCard label="IMC" value={metrics.bmi.toString()} sub={metrics.bmiCategory} color={metrics.bmiColor} />
              <SummaryCard label="Masa magra" value={`${metrics.leanMass ?? '?'} kg`} sub="masa muscular" color="#10B981" />
              <SummaryCard label="Grasa corp." value={`${metrics.bodyFatEstimate ?? '?'}%`} sub="estimado" color="#EC4899" />
            </View>
          )}

          {/* Workout stats */}
          <View style={s.summaryRow}>
            <SummaryCard label="Racha" value={`${streak}`} sub="días seguidos" color="#F59E0B" />
            <SummaryCard label="Total" value={`${history.length}`} sub="entrenamientos" color="#A855F7" />
            <SummaryCard label="Kcal tot" value={`${history.reduce((a, w) => a + w.calories, 0)}`} sub="quemadas" color="#EF4444" />
          </View>

          {/* Weight chart */}
          <Text style={s.sectionTitle}>Historial de Peso</Text>
          {hasChart ? (
            <View style={s.chartCard}>
              <LineChart
                data={{ labels: weightHistory.labels, datasets: [{ data: weightHistory.data }] }}
                width={width - 48}
                height={180}
                chartConfig={{
                  backgroundGradientFrom: COLORS.card,
                  backgroundGradientTo: COLORS.card,
                  color: (opacity = 1) => `rgba(168,85,247,${opacity})`,
                  labelColor: () => COLORS.textMuted,
                  propsForDots: { r: '5', strokeWidth: '2', stroke: '#9333EA' },
                  propsForBackgroundLines: { stroke: COLORS.border },
                  decimalPlaces: 1,
                }}
                bezier
                style={{ borderRadius: 16 }}
                withInnerLines
                withOuterLines={false}
              />
              <Text style={s.chartLabel}>Peso en kg</Text>
            </View>
          ) : (
            <View style={s.emptyChart}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>📊</Text>
              <Text style={{ color: 'white', fontWeight: '700', marginBottom: 4 }}>Aún no hay datos suficientes</Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 12, textAlign: 'center' }}>Registra al menos 2 mediciones para ver tu gráfica de progreso</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => setShowModal(true)}>
                <Text style={{ color: '#A855F7', fontWeight: '700', fontSize: 13 }}>+ Agregar medición</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Measurement history */}
          {measurements.length > 0 && (
            <>
              <Text style={s.sectionTitle}>Historial de Mediciones</Text>
              {measurements.slice(0, 10).map((m, i) => (
                <View key={m.id} style={s.measCard}>
                  <Text style={s.measDate}>{new Date(m.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</Text>
                  <View style={s.measMetrics}>
                    <MeasItem label="Peso" value={`${m.weight} kg`} />
                    {m.waist && <MeasItem label="Cintura" value={`${m.waist} cm`} />}
                    {m.hips && <MeasItem label="Caderas" value={`${m.hips} cm`} />}
                  </View>
                  {i > 0 && measurements[i - 1] && (
                    <Text style={m.weight < measurements[i - 1].weight ? s.changePos : s.changeNeg}>
                      {m.weight < measurements[i - 1].weight ? '↓' : '↑'} {Math.abs(m.weight - measurements[i - 1].weight).toFixed(1)} kg
                    </Text>
                  )}
                </View>
              ))}
            </>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>

        {/* Add measurement modal */}
        <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
          <LinearGradient colors={['#0A0A1A', '#12082A']} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1, padding: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={26} color="white" /></TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'white', marginLeft: 16 }}>Nueva Medición</Text>
              </View>
              <Text style={s.fieldLabel}>Peso actual (kg) *</Text>
              <View style={s.inputRow}>
                <TextInput style={s.input} placeholder="Ej: 63.5" placeholderTextColor={COLORS.textMuted} value={newWeight} onChangeText={setNewWeight} keyboardType="decimal-pad" />
                <Text style={s.inputUnit}>kg</Text>
              </View>
              <Text style={s.fieldLabel}>Cintura (cm) - opcional</Text>
              <View style={s.inputRow}>
                <TextInput style={s.input} placeholder="Ej: 72" placeholderTextColor={COLORS.textMuted} value={newWaist} onChangeText={setNewWaist} keyboardType="decimal-pad" />
                <Text style={s.inputUnit}>cm</Text>
              </View>
              <Text style={s.fieldLabel}>Caderas (cm) - opcional</Text>
              <View style={s.inputRow}>
                <TextInput style={s.input} placeholder="Ej: 94" placeholderTextColor={COLORS.textMuted} value={newHips} onChangeText={setNewHips} keyboardType="decimal-pad" />
                <Text style={s.inputUnit}>cm</Text>
              </View>
              <TouchableOpacity style={s.saveBtn} onPress={saveMeasurement}>
                <LinearGradient colors={['#9333EA', '#EC4899']} style={s.saveBtnGrad}>
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Guardar Medición</Text>
                </LinearGradient>
              </TouchableOpacity>
            </SafeAreaView>
          </LinearGradient>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <View style={[sc.card, { borderColor: color + '40' }]}>
      <Text style={[sc.value, { color }]}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
      <Text style={sc.sub}>{sub}</Text>
    </View>
  );
}

function MeasItem({ label, value }: { label: string; value: string }) {
  return <View style={{ marginRight: 16 }}><Text style={{ color: COLORS.textMuted, fontSize: 10 }}>{label}</Text><Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>{value}</Text></View>;
}

const sc = StyleSheet.create({
  card: { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginHorizontal: 4, borderWidth: 1, alignItems: 'center' },
  value: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  label: { fontSize: 11, color: 'white', fontWeight: '600' },
  sub: { fontSize: 9, color: COLORS.textMuted, marginTop: 2 },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  bg: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: 'white' },
  sub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  addBtn: { borderRadius: 22, overflow: 'hidden' },
  addBtnGrad: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  summaryRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: 'white', marginHorizontal: 20, marginBottom: 12, marginTop: 4 },
  chartCard: { marginHorizontal: 20, backgroundColor: COLORS.card, borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  chartLabel: { textAlign: 'center', color: COLORS.textMuted, fontSize: 11, marginTop: 8 },
  emptyChart: { marginHorizontal: 20, backgroundColor: COLORS.card, borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  emptyBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#9333EA' },
  measCard: { marginHorizontal: 20, backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center' },
  measDate: { color: COLORS.textSecondary, fontSize: 12, width: 50, fontWeight: '600' },
  measMetrics: { flex: 1, flexDirection: 'row', marginLeft: 8 },
  changePos: { color: '#10B981', fontSize: 12, fontWeight: '700' },
  changeNeg: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
  fieldLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingHorizontal: 16, marginBottom: 16, height: 52, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  input: { flex: 1, color: 'white', fontSize: 15 },
  inputUnit: { color: COLORS.textMuted, fontSize: 13 },
  saveBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  saveBtnGrad: { paddingVertical: 16, alignItems: 'center' },
});
