import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { COLORS } from '@/constants/colors';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();

  const handleRegister = async () => {
    if (!name || !email || !password) { Alert.alert('Campos requeridos', 'Completa todos los campos'); return; }
    if (password.length < 6) { Alert.alert('Contraseña débil', 'Mínimo 6 caracteres'); return; }
    setLoading(true);
    const { success, error } = await register(email, password, name);
    setLoading(false);
    if (!success) Alert.alert('Error', error || 'No se pudo crear la cuenta');
  };

  return (
    <LinearGradient colors={['#0A0A1A', '#12082A', '#0A0A1A']} style={s.bg}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.bg}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={s.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>

          <View style={s.logoArea}>
            <LinearGradient colors={['#9333EA', '#EC4899']} style={s.logoCircle}>
              <Text style={s.logoText}>BIO</Text>
            </LinearGradient>
            <Text style={s.appName}>BIOfit</Text>
          </View>

          <View style={s.card}>
            <Text style={s.title}>Crea tu cuenta 🌟</Text>
            <Text style={s.sub}>Empieza tu transformación hoy</Text>

            <View style={s.inputRow}>
              <Ionicons name="person-outline" size={18} color={COLORS.textMuted} style={s.icon} />
              <TextInput style={s.input} placeholder="Tu nombre" placeholderTextColor={COLORS.textMuted}
                value={name} onChangeText={setName} autoCapitalize="words" />
            </View>

            <View style={s.inputRow}>
              <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={s.icon} />
              <TextInput style={s.input} placeholder="Correo electrónico" placeholderTextColor={COLORS.textMuted}
                value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={s.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={s.icon} />
              <TextInput style={[s.input, { flex: 1 }]} placeholder="Contraseña (mín. 6 caracteres)" placeholderTextColor={COLORS.textMuted}
                value={password} onChangeText={setPassword} secureTextEntry={!showPw} />
              <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                <Ionicons name={showPw ? 'eye-outline' : 'eye-off-outline'} size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
              <LinearGradient colors={['#9333EA', '#EC4899']} style={s.btnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={s.btnText}>{loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={s.link} onPress={() => router.back()}>
              <Text style={s.linkText}>¿Ya tienes cuenta? <Text style={s.linkHL}>Inicia sesión</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  back: { marginBottom: 16 },
  logoArea: { alignItems: 'center', marginBottom: 28 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  logoText: { fontSize: 26, fontWeight: '900', color: 'white' },
  appName: { fontSize: 30, fontWeight: '800', color: 'white', letterSpacing: 3 },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  title: { fontSize: 21, fontWeight: '700', color: 'white', marginBottom: 4 },
  sub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 24 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingHorizontal: 14, marginBottom: 12, height: 52, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  icon: { marginRight: 10 },
  input: { flex: 1, color: 'white', fontSize: 14 },
  btn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  btnGrad: { paddingVertical: 15, alignItems: 'center' },
  btnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: COLORS.textSecondary, fontSize: 13 },
  linkHL: { color: '#A855F7', fontWeight: '600' },
});
