import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RECIPES, MEAL_TYPES, STORES, Recipe } from '@/constants/nutrition';
import { COLORS } from '@/constants/colors';

export default function NutritionScreen() {
  const [activeTab, setActiveTab] = useState('desayuno');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const filtered = RECIPES.filter(r => r.mealType === activeTab);

  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient colors={['#0A0A1A', '#12082A']} style={s.bg}>
        <View style={s.header}>
          <Text style={s.title}>Nutrición 🥗</Text>
          <Text style={s.sub}>Recetas colombianas saludables</Text>
        </View>

        {/* Store badges */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.storeScroll}>
          {STORES.map(st => (
            <View key={st.name} style={[s.storeBadge, { borderColor: st.color + '60' }]}>
              <View style={[s.storeDot, { backgroundColor: st.color }]} />
              <Text style={s.storeName}>{st.name}</Text>
            </View>
          ))}
          <Text style={s.storeNote}>Ingredientes disponibles en tiendas de barrio</Text>
        </ScrollView>

        {/* Meal type tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabScroll}>
          {MEAL_TYPES.map(t => (
            <TouchableOpacity key={t.id} style={[s.tab, activeTab === t.id && s.tabActive]} onPress={() => setActiveTab(t.id)}>
              <Text style={s.tabEmoji}>{t.emoji}</Text>
              <Text style={[s.tabLabel, activeTab === t.id && s.tabLabelActive]}>{t.label}</Text>
              <Text style={s.tabTime}>{t.time}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recipe cards */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.recipeList}>
          {filtered.map(r => (
            <TouchableOpacity key={r.id} style={s.recipeCard} onPress={() => setSelectedRecipe(r)}>
              <View style={s.recipeTop}>
                <Text style={s.recipeEmoji}>{r.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.recipeName}>{r.name}</Text>
                  <View style={s.recipeTagRow}>
                    {r.portableForWork && <View style={s.portableTag}><Ionicons name="briefcase-outline" size={10} color="#10B981" /><Text style={s.portableText}> Para llevar</Text></View>}
                    <View style={s.timeTag}><Ionicons name="time-outline" size={10} color={COLORS.textMuted} /><Text style={s.timeText}> {r.prepTime} min</Text></View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </View>
              <View style={s.macroRow}>
                <MacroPill label="Cal" value={`${r.calories}`} color="#F59E0B" />
                <MacroPill label="Prot" value={`${r.protein}g`} color="#10B981" />
                <MacroPill label="Carb" value={`${r.carbs}g`} color="#3B82F6" />
                <MacroPill label="Grasas" value={`${r.fat}g`} color="#EC4899" />
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 30 }} />
        </ScrollView>

        {/* Recipe detail modal */}
        <Modal visible={!!selectedRecipe} animationType="slide" presentationStyle="pageSheet">
          {selectedRecipe && (
            <LinearGradient colors={['#0A0A1A', '#12082A']} style={{ flex: 1 }}>
              <SafeAreaView style={{ flex: 1 }}>
                <View style={s.modalHeader}>
                  <TouchableOpacity onPress={() => setSelectedRecipe(null)}>
                    <Ionicons name="close" size={26} color="white" />
                  </TouchableOpacity>
                  <Text style={s.modalTitle}>{selectedRecipe.name}</Text>
                  <View style={{ width: 26 }} />
                </View>
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                  <Text style={{ fontSize: 60, textAlign: 'center', marginBottom: 16 }}>{selectedRecipe.emoji}</Text>
                  <View style={s.macroRowLg}>
                    <MacroPillLg label="Calorías" value={`${selectedRecipe.calories}`} color="#F59E0B" />
                    <MacroPillLg label="Proteína" value={`${selectedRecipe.protein}g`} color="#10B981" />
                    <MacroPillLg label="Carbohidratos" value={`${selectedRecipe.carbs}g`} color="#3B82F6" />
                    <MacroPillLg label="Grasas" value={`${selectedRecipe.fat}g`} color="#EC4899" />
                  </View>

                  <View style={s.infoRow}>
                    <View style={s.infoChip}><Ionicons name="time-outline" size={14} color={COLORS.textSecondary} /><Text style={s.infoText}>{selectedRecipe.prepTime} min</Text></View>
                    <View style={s.infoChip}><Ionicons name="people-outline" size={14} color={COLORS.textSecondary} /><Text style={s.infoText}>{selectedRecipe.servings} porción</Text></View>
                    {selectedRecipe.portableForWork && <View style={s.infoChip}><Ionicons name="briefcase-outline" size={14} color="#10B981" /><Text style={[s.infoText, { color: '#10B981' }]}>Para llevar</Text></View>}
                  </View>

                  <Text style={s.sectionLbl}>Ingredientes</Text>
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <View key={i} style={s.ingRow}>
                      <Text style={s.ingDot}>•</Text>
                      <Text style={s.ingName}>{ing.name}</Text>
                      <Text style={s.ingAmount}>{ing.amount}</Text>
                      <View style={[s.storeTag, { borderColor: STORES.find(st => st.name === ing.store)?.color + '60' || COLORS.border }]}>
                        <Text style={{ fontSize: 9, color: STORES.find(st => st.name === ing.store)?.color || COLORS.textMuted, fontWeight: '700' }}>{ing.store}</Text>
                      </View>
                    </View>
                  ))}

                  <Text style={s.sectionLbl}>Preparación</Text>
                  {selectedRecipe.steps.map((step, i) => (
                    <View key={i} style={s.stepRow}>
                      <View style={s.stepNum}><Text style={{ color: '#A855F7', fontWeight: '800', fontSize: 12 }}>{i + 1}</Text></View>
                      <Text style={s.stepText}>{step}</Text>
                    </View>
                  ))}

                  <View style={s.tipCard}>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>💡</Text>
                    <Text style={{ color: '#FCD34D', fontSize: 13, flex: 1, lineHeight: 19 }}>{selectedRecipe.tip}</Text>
                  </View>
                  <View style={{ height: 40 }} />
                </ScrollView>
              </SafeAreaView>
            </LinearGradient>
          )}
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

function MacroPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ backgroundColor: color + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6 }}>
      <Text style={{ fontSize: 9, color: color, fontWeight: '700' }}>{label}</Text>
      <Text style={{ fontSize: 12, color: 'white', fontWeight: '800' }}>{value}</Text>
    </View>
  );
}

function MacroPillLg({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: color + '18', borderRadius: 12, padding: 10, margin: 3, alignItems: 'center' }}>
      <Text style={{ fontSize: 16, color, fontWeight: '800' }}>{value}</Text>
      <Text style={{ fontSize: 9, color: COLORS.textMuted, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  bg: { flex: 1 },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: 'white' },
  sub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  storeScroll: { paddingHorizontal: 20, marginBottom: 12 },
  storeBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, marginRight: 8, backgroundColor: COLORS.card },
  storeDot: { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  storeName: { fontSize: 11, color: 'white', fontWeight: '700' },
  storeNote: { alignSelf: 'center', fontSize: 10, color: COLORS.textMuted, marginLeft: 4 },
  tabScroll: { paddingHorizontal: 20, marginBottom: 14 },
  tab: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, marginRight: 10, backgroundColor: COLORS.card, minWidth: 88 },
  tabActive: { borderColor: '#9333EA', backgroundColor: 'rgba(147,51,234,0.18)' },
  tabEmoji: { fontSize: 20, marginBottom: 2 },
  tabLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  tabLabelActive: { color: '#A855F7' },
  tabTime: { fontSize: 9, color: COLORS.textMuted, marginTop: 2 },
  recipeList: { paddingHorizontal: 20, paddingTop: 4 },
  recipeCard: { backgroundColor: COLORS.card, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  recipeTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  recipeEmoji: { fontSize: 32, marginRight: 12 },
  recipeName: { fontSize: 15, fontWeight: '700', color: 'white', marginBottom: 4 },
  recipeTagRow: { flexDirection: 'row', gap: 8 },
  portableTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  portableText: { fontSize: 10, color: '#10B981', fontWeight: '600' },
  timeTag: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 10, color: COLORS.textMuted },
  macroRow: { flexDirection: 'row' },
  // Modal
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: 'white', flex: 1, textAlign: 'center' },
  macroRowLg: { flexDirection: 'row', marginBottom: 16 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  infoChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  infoText: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 4 },
  sectionLbl: { fontSize: 16, fontWeight: '700', color: 'white', marginBottom: 12, marginTop: 4 },
  ingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  ingDot: { color: COLORS.textMuted, marginRight: 8 },
  ingName: { flex: 1, color: 'white', fontSize: 13 },
  ingAmount: { color: COLORS.textSecondary, fontSize: 12, marginRight: 8 },
  storeTag: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  stepRow: { flexDirection: 'row', marginBottom: 12 },
  stepNum: { width: 26, height: 26, borderRadius: 8, backgroundColor: 'rgba(147,51,234,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  stepText: { flex: 1, color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
  tipCard: { flexDirection: 'row', backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 14, padding: 14, marginTop: 20, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
});
