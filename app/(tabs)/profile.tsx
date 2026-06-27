import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { calculateMetrics, getWaterIntake, getProteinGoal, calculateCalorieGoal } from '@/lib/metrics';
import { WORKOUT_GOALS } from '@/constants/workouts';
import { COLORS } from '@/constants/colors';

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuthStore();
  const [showEdit, setShowEdit] = useState(false);
  const [editWeight, setEditWeight] = useState(user?.weight?.toString() || '');
  const [editHeight, setEditHeight] = useState(user?.height?.toString() || '');
  const [editAge, setEditAge] = useState(user?.age?.toString() || '');
  const [editGoal, setEditGoal] = useState(user?.goal || '');

  if (!user) return null;

  const metrics = (user.weight && user.height && user.age)
    ? calculateMetrics(user.weight, user.height, user.age, user.activityLevel)
    : null;

  const goalInfo = WORKOUT_GOALS.find(g => g.id === user.goal);

  const saveEdit = async () => {
    if (!editWeight || !editHeight || !editAge) { Alert.alert('Completa todos los campos'); return; }
    await updateProfile({
      weight: parseFloat(editWeight),
      height: parseFloat(editHeight),
      age: parseInt(editAge),
      goal: editGoal,
    });
    setShowEdit(false);
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás segura?', [
      { text: 'Cancelar' },
      { text: 'Salir', onPress: logout, style: 'destructive' },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient colors={['#0A0A1A', '#12082A']} style={s.bg}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile header */}
          <LinearGradient colors={['#7E22CE', '#9333EA', '#EC4899']} style={s.profileBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <LinearGradient colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']} style={s.avatarLg}>
              <Text style={s.avatarLgText}>{user.name[0].toUpperCase()}</Text>
            </LinearGradient>
            <Text style={s.profileName}>{user.name}</Text>
            <Text style={s.profileEmail}>{user.email}</Text>
            <View style={s.goalBadge}>
              <Text style={{ fontSize: 14, marginRight: 4 }}>{goalInfo?.icon}</Text>
              <Text style={s.goalBadgeText}>{goalInfo?.label || 'Sin objetivo'}</Text>
            </View>
          </LinearGradient>

          {/* Body metrics */}
          {metrics && (
            <>
              <Text style={s.sectionTitle}>Indicadores Corporales</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
                <InfoCard icon="📊" label="IMC" value={metrics.bmi.toString()} sub={metrics.bmiCategory} color={metrics.bmiColor} />
                <InfoCard icon="⚖️" label="Peso ideal" value={`${metrics.idealWeight.min}-${metrics.idealWeight.max}`} sub="kg rango" color="#10B981" />
                <InfoCard icon="🔥" label="TMB" value={metrics.bmr.toString()} sub="kcal base" color="#F59E0B" />
                <InfoCard icon="⚡" label="TDEE" value={metrics.tdee.toString()} sub="kcal totales" color="#A855F7" />
                <InfoCard icon="💪" label="Masa magra" value={`${metrics.leanMass ?? '?'}`} sub="kg" color="#3B82F6" />
              </ScrollView>
            </>
          )}

          {/* Physical data */}
          <Text style={s.sectionTitle}>Mis Datos</Text>
          <View style={s.dataCard}>
            <DataRow icon="⚖️" label="Peso" value={`${user.weight} kg`} />
            <DataRow icon="📏" label="Estatura" value={`${user.height} cm`} />
            <DataRow icon="🎂" label="Edad" value={`${user.age} años`} />
            <DataRow icon="🏋️" label="Nivel" value={user.level} />
            <DataRow icon="🌟" label="Actividad" value={user.activityLevel} last />
          </View>

          <TouchableOpacity style={s.editBtn} onPress={() => setShowEdit(true)}>
            <Ionicons name="create-outline" size={18} color="#A855F7" />
            <Text style={s.editBtnText}>Editar mis datos</Text>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text style={s.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Edit modal */}
        <Modal visible={showEdit} animationType="slide" presentationStyle="pageSheet">
          <LinearGradient colors={['#0A0A1A', '#12082A']} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1, padding: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <TouchableOpacity onPress={() => setShowEdit(false)}><Ionicons name="close" size={26} color="white" /></TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'white', marginLeft: 16 }}>Editar datos</Text>
              </View>
              <ScrollView>
                {[
                  { label: 'Peso (kg)', value: editWeight, set: setEditWeight, unit: 'kg', kb: 'decimal-pad' as const },
                  { label: 'Estatura (cm)', value: editHeight, set: setEditHeight, unit: 'cm', kb: 'number-pad' as const },
                  { label: 'Edad', value: editAge, set: setEditAge, unit: 'años', kb: 'number-pad' as const },
                ].map(f => (
                  <View key={f.label} style={{ marginBottom: 16 }}>
                    <Text style={s.fieldLabel}>{f.label}</Text>
                    <View style={s.inputRow}>
                      <TextInput style={s.input} value={f.value} onChangeText={f.set} keyboardType={f.kb} placeholderTextColor={COLORS.textMuted} placeholder="" />
                      <Text style={s.inputUnit}>{f.unit}</Text>
                    </View>
                  </View>
                ))}
                <Text style={s.fieldLabel}>Objetivo</Text>
                {WORKOUT_GOALS.map(g => (
                  <TouchableOpacity key={g.id} style={[s.goalOption, editGoal === g.id && s.goalOptionActive]} onPress={() => setEditGoal(g.id)}>
                    <Text style={{ marginRight: 8 }}>{g.icon}</Text>
                    <Text style={[s.goalOptionText, editGoal === g.id && { color: '#A855F7' }]}>{g.label}</Text>
                    {editGoal === g.id && <Ionicons name="checkmark-circle" size={18} color="#9333EA" style={{ marginLeft: 'auto' }} />}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={s.saveBtn} onPress={saveEdit}>
                  <LinearGradient colors={['#9333EA', '#EC4899']} style={s.saveBtnGrad}>
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Guardar cambios</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <View style={{ height: 40 }} />
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

function InfoCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub: string; color: string }) {
  return (
    <View style={[ic.card, { borderColor: color + '40' }]}>
      <Text style={ic.icon}>{icon}</Text>
      <Text style={ic.label}>{label}</Text>
      <Text style={[ic.value, { color }]}>{value}</Text>
      <Text style={ic.sub}>{sub}</Text>
    </View>
  );
}

function DataRow({ icon, label, value, last }: { icon: string; label: string; value: string | number; last?: boolean }) {
  return (
    <View style={[dr.row, !last && { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}>
      <Text style={dr.icon}>{icon}</Text>
      <Text style={dr.label}>{label}</Text>
      <Text style={dr.value}>{value}</Text>
    </View>
  );
}

const ic = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginRight: 10, width: 112, borderWidth: 1, alignItems: 'center' },
  icon: { fontSize: 20, marginBottom: 6 },
  label: { fontSize: 10, color: COLORS.textMuted, marginBottom: 2 },
  value: { fontSize: 17, fontWeight: '800', marginBottom: 2 },
  sub: { fontSize: 9, color: COLORS.textMuted },
});

const dr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  icon: { fontSize: 18, marginRight: 12, width: 28, textAlign: 'center' },
  label: { flex: 1, color: COLORS.textSecondary, fontSize: 14 },
  value: { color: 'white', fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  bg: { flex: 1 },
  profileBanner: { alignItems: 'center', padding: 32, paddingBottom: 28 },
  avatarLg: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarLgText: { fontSize: 34, fontWeight: '900', color: 'white' },
  profileName: { fontSize: 22, fontWeight: '800', color: 'white', marginBottom: 2 },
  profileEmail: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 12 },
  goalBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  goalBadgeText: { color: 'white', fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: 'white', marginHorizontal: 20, marginTop: 20, marginBottom: 12 },
  hScroll: { paddingLeft: 20, marginBottom: 4 },
  dataCard: { marginHorizontal: 20, backgroundColor: COLORS.card, borderRadius: 18, paddingHorizontal: 18, borderWidth: 1, borderColor: COLORS.border },
  editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(147,51,234,0.4)', backgroundColor: 'rgba(147,51,234,0.1)' },
  editBtnText: { color: '#A855F7', fontWeight: '700', fontSize: 14, marginLeft: 8 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 12, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.08)' },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 14, marginLeft: 8 },
  fieldLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  input: { flex: 1, color: 'white', fontSize: 15 },
  inputUnit: { color: COLORS.textMuted, fontSize: 13 },
  goalOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  goalOptionActive: { borderColor: '#9333EA', backgroundColor: 'rgba(147,51,234,0.15)' },
  goalOptionText: { fontSize: 14, fontWeight: '600', color: 'white' },
  saveBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 20 },
  saveBtnGrad: { paddingVertical: 16, alignItems: 'center' },
});
