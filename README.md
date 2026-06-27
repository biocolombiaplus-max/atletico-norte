# BIOfit 💪

> App premium de fitness personalizado para mujeres colombianas

## Características

- **Entrenadora virtual con voz** — Guia de ejercicios en español colombiano vía altavoz/audífonos
- **Indicadores corporales** — IMC, masa magra, grasa corporal, peso ideal, TMB, TDEE, proteina y agua diaria
- **Rutinas de gimnasio** — Glúteos, tren superior, HIIT, core, cuerpo completo
- **Nutrición colombiana** — Recetas de desayuno, almuerzo, cena y snacks con ingredientes de D1, Ara y Dolarciyt
- **Seguimiento de progreso** — Gráficas de peso, medidas corporales y rachas
- **Panel de administrador** — Visualiza todas las usuarias registradas
- **Tema oscuro premium** — Degradados púrpura/rosa, animaciones fluidas

## Credenciales

### Administrador
```
Email:      admin@biofit.com
Contraseña: BIOfit2024!
```

### Usuaria normal
Registro libre desde la app con cualquier correo y contraseña (mín. 6 caracteres).

## Instalación rápida

```bash
# 1. Clona el repositorio
git clone https://github.com/biocolombiaplus-max/registro-evento.git
cd registro-evento
git checkout claude/biofit-fitness-app-7csnt2

# 2. Instala dependencias
npm install

# 3. Inicia Expo
npx expo start
```

Luego escanea el QR con **Expo Go** (disponible en App Store y Google Play).

## Requisitos

- Node.js 18+
- npm o yarn
- Expo Go en tu teléfono Android/iOS

## Estructura del proyecto

```
biofit/
├── app/
│   ├── _layout.tsx          # Layout raíz con inicialización de auth
│   ├── index.tsx            # Redirect inteligente según estado
│   ├── (auth)/
│   │   ├── login.tsx         # Inicio de sesión premium
│   │   ├── register.tsx      # Registro de nueva usuaria
│   │   └── onboarding.tsx    # Setup inicial (peso, talla, objetivo)
│   ├── (tabs)/
│   │   ├── index.tsx         # Dashboard principal
│   │   ├── workout.tsx       # Rutinas + entrenamiento con voz
│   │   ├── nutrition.tsx     # Recetas colombianas saludables
│   │   ├── progress.tsx      # Gráficas y mediciones
│   │   └── profile.tsx       # Perfil y datos personales
│   └── admin/
│       └── index.tsx         # Panel de administrador
├── constants/
│   ├── colors.ts            # Paleta de colores premium
│   ├── workouts.ts          # 5 rutinas completas con guía de voz
│   └── nutrition.ts         # 10 recetas colombianas con macro-nutrientes
├── lib/
│   └── metrics.ts           # Cálculos: IMC, TMB, TDEE, grasa corporal
├── store/
│   ├── authStore.ts         # Autenticación con AsyncStorage
│   ├── workoutStore.ts      # Historial y rachas de entrenamientos
│   └── progressStore.ts     # Mediciones corporales y gráficas
└── supabase/
    └── schema.sql           # Schema para migrar a Supabase (opcional)
```

## Rutinas disponibles

| Rutina | Objetivo | Duración | Kcal |
|--------|----------|----------|------|
| Glúteos & Piernas | Tonificar | 45 min | 280 |
| Tren Superior | Tonificar | 40 min | 220 |
| Cardio HIIT | Perder grasa | 30 min | 380 |
| Core & Abdomen | Tonificar | 25 min | 150 |
| Cuerpo Completo | Tonificar | 50 min | 320 |

## Nutrición: Tiendas de ingredientes

- **D1** — Avena, huevos, lácteos, enlatados, condimentos
- **Ara** — Verduras, yogurt, granola, pasta
- **Dolarciyt** — Leche de coco, salsa soya, productos especiales

## Indicadores corporales calculados

1. **IMC** — Índice de Masa Corporal con categoría y color
2. **Peso ideal** — Rango saludable según estatura
3. **TMB** — Tasa Metabólica Basal (Harris-Benedict femenino)
4. **TDEE** — Gasto caloríco total según nivel de actividad
5. **Grasa corporal %** — Estimación Deurenberg
6. **Masa magra (kg)** — Masa muscular estimada
7. **Meta calorías** — Ajustada según objetivo (-20% perder, +10% ganar)
8. **Agua diaria (L)** — 35ml por kg de peso
9. **Proteína diaria (g)** — 1.6-2.0g por kg según objetivo

## Próximas mejoras (roadmap)

- [ ] Integración con Supabase (backend en la nube)
- [ ] Timer de descanso animado
- [ ] Fotos de antes/después
- [ ] Plan semanal personalizado con IA
- [ ] Notificaciones de recordatorio
- [ ] Modo oscuro/claro
- [ ] Versión en App Store y Google Play

## Construido con

- **React Native + Expo** — Multiplataforma iOS/Android
- **Expo Router** — Navegación basada en archivos
- **Expo Speech** — Guía de voz en español colombiano
- **Zustand** — Estado global
- **AsyncStorage** — Persistencia local
- **react-native-chart-kit** — Gráficas de progreso
- **expo-linear-gradient** — UI premium
