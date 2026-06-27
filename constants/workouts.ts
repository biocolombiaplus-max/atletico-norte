export type GoalId = 'lose_fat' | 'gain_muscle' | 'tone' | 'endurance' | 'flexibility';
export type Level = 'principiante' | 'intermedio' | 'avanzado';

export interface Exercise {
  id: string;
  nameEs: string;
  sets: number;
  reps: string;
  rest: number;
  muscle: string;
  description: string;
  voiceGuide: string[];
  tip?: string;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  emoji: string;
  goal: GoalId;
  level: Level;
  duration: number;
  calories: number;
  exercises: Exercise[];
  description: string;
}

export const WORKOUT_GOALS = [
  { id: 'lose_fat' as GoalId, label: 'Perder Grasa', icon: '🔥', color: '#EF4444' },
  { id: 'gain_muscle' as GoalId, label: 'Ganar Músculo', icon: '💪', color: '#9333EA' },
  { id: 'tone' as GoalId, label: 'Tonificar', icon: '✨', color: '#EC4899' },
  { id: 'endurance' as GoalId, label: 'Resistencia', icon: '⚡', color: '#F59E0B' },
  { id: 'flexibility' as GoalId, label: 'Flexibilidad', icon: '🧘‍♀️', color: '#10B981' },
];

export const ROUTINES: WorkoutRoutine[] = [
  {
    id: 'glutes_legs',
    name: 'Glúteos & Piernas',
    emoji: '🏆',
    goal: 'tone',
    level: 'principiante',
    duration: 45,
    calories: 280,
    description: 'Rutina enfocada en glúteos y piernas para tonificar y levantar.',
    exercises: [
      {
        id: 'squat',
        nameEs: 'Sentadilla',
        sets: 4,
        reps: '12-15',
        rest: 60,
        muscle: 'Glúteos, Cuádriceps',
        description: 'Ejercicio rey para glúteos y piernas',
        tip: 'Mantén los talones en el piso y rodillas alineadas con los pies.',
        voiceGuide: [
          'Vamos con la sentadilla. Pies al ancho de los hombros, puntas ligeramente hacia afuera.',
          'Inhala y baja como si fueras a sentarte, mantén la espalda recta.',
          'Exhala y empuja con los talones para subir. Aprieta los glúteos arriba.',
          'Excelente serie. Descansa 60 segundos antes de continuar.',
        ],
      },
      {
        id: 'hip_thrust',
        nameEs: 'Empuje de Cadera',
        sets: 4,
        reps: '12-15',
        rest: 60,
        muscle: 'Glúteos',
        description: 'El mejor ejercicio para activar y crecer el glúteo',
        tip: 'Aprieta los glúteos en la parte superior por 1 segundo.',
        voiceGuide: [
          'Empuje de cadera. Apoya la espalda alta en el banco, pies planos en el piso.',
          'Sube las caderas hasta que queden paralelas al piso, aprieta los glúteos fuerte.',
          'Baja controladamente sin tocar el piso completamente.',
          'Increíble trabajo. Tus glúteos están encendidos.',
        ],
      },
      {
        id: 'lunge',
        nameEs: 'Zancada',
        sets: 3,
        reps: '10 cada pierna',
        rest: 45,
        muscle: 'Cuádriceps, Glúteos',
        description: 'Tonifica piernas y mejora equilibrio',
        tip: 'La rodilla delantera no debe pasar la punta del pie.',
        voiceGuide: [
          'Zancadas. Mantén el torso erguido y el core activado.',
          'Da un paso adelante y baja hasta que la rodilla trasera casi toque el piso.',
          'Vuelve a la posición inicial empujando con el talón. Alterna las piernas.',
          'Hermoso movimiento. Sigue igual.',
        ],
      },
      {
        id: 'sumo_squat',
        nameEs: 'Sentadilla Sumo',
        sets: 3,
        reps: '15',
        rest: 45,
        muscle: 'Glúteos, Aductores',
        description: 'Activa aductores y glúteos internos',
        tip: 'Puntas de pies a 45 grados, rodillas siguen la dirección de los pies.',
        voiceGuide: [
          'Sentadilla sumo. Pies más anchos que los hombros, puntas hacia afuera.',
          'Baja manteniendo el pecho arriba y las rodillas abiertas.',
          'Aprieta los glúteos al subir. Tu parte interna de muslos va a sentirlo.',
        ],
      },
      {
        id: 'donkey_kick',
        nameEs: 'Patada de Burro',
        sets: 3,
        reps: '15 cada lado',
        rest: 30,
        muscle: 'Glúteo Mayor',
        description: 'Aísla y activa el glúteo mayor perfectamente',
        tip: 'Mantén la espalda plana, no arquees la zona lumbar.',
        voiceGuide: [
          'Patada de burro. En cuatro puntos, muñecas bajo hombros, rodillas bajo caderas.',
          'Lleva el talón hacia el techo apretando el glúteo, rodilla a 90 grados.',
          'Controla la bajada. Cada repetición cuenta. Eres una guerrera.',
        ],
      },
    ],
  },
  {
    id: 'upper_body',
    name: 'Tren Superior',
    emoji: '💪',
    goal: 'tone',
    level: 'principiante',
    duration: 40,
    calories: 220,
    description: 'Define brazos, espalda y hombros con ejercicios efectivos.',
    exercises: [
      {
        id: 'push_up',
        nameEs: 'Flexión de Brazos',
        sets: 3,
        reps: '10-12',
        rest: 60,
        muscle: 'Pecho, Tríceps, Hombros',
        description: 'Ejercicio completo para el tren superior',
        tip: 'Si es muy difícil, hazlo apoyando las rodillas.',
        voiceGuide: [
          'Flexiones. Manos al ancho de hombros, cuerpo en línea recta.',
          'Baja el pecho al piso manteniendo el abdomen activado.',
          'Empuja fuerte. Puedes hacerlo en rodillas si lo necesitas, no hay problema.',
        ],
      },
      {
        id: 'dumbbell_row',
        nameEs: 'Remo con Mancuerna',
        sets: 3,
        reps: '12 cada lado',
        rest: 60,
        muscle: 'Espalda, Bíceps',
        description: 'Fortalece la espalda y mejora la postura',
        tip: 'Jala desde el codo, no desde la muñeca.',
        voiceGuide: [
          'Remo. Apoya una mano y rodilla en la silla o banco. Espalda paralela al piso.',
          'Jala la mancuerna hacia tu cadera, codo cerca del cuerpo.',
          'Baja controladamente. Excelente postura.',
        ],
      },
      {
        id: 'shoulder_press',
        nameEs: 'Press de Hombros',
        sets: 3,
        reps: '12',
        rest: 60,
        muscle: 'Hombros, Tríceps',
        description: 'Define y fortalece los hombros',
        tip: 'No bloquees los codos completamente arriba.',
        voiceGuide: [
          'Press de hombros. Mancuernas a nivel de hombros, codos a 90 grados.',
          'Empuja hacia arriba sin arquear la espalda baja.',
          'Baja con control. Tus hombros se van a ver increíbles.',
        ],
      },
      {
        id: 'bicep_curl',
        nameEs: 'Curl de Bíceps',
        sets: 3,
        reps: '12-15',
        rest: 45,
        muscle: 'Bíceps',
        description: 'Define los bíceps y brazos',
        tip: 'Codos fijos a los costados, solo mueve el antebrazo.',
        voiceGuide: [
          'Curl de bíceps. Codos pegados al cuerpo, palmas hacia arriba.',
          'Sube las mancuernas apretando los bíceps.',
          'Baja lento. El movimiento de bajada también trabaja el músculo.',
        ],
      },
      {
        id: 'tricep_dip',
        nameEs: 'Fondos de Tríceps',
        sets: 3,
        reps: '12',
        rest: 45,
        muscle: 'Tríceps',
        description: 'Elimina la flacidez de los brazos',
        tip: 'Espalda cerca de la silla o banco, codos apuntan hacia atrás.',
        voiceGuide: [
          'Fondos de tríceps. Manos en el borde de la silla, pies al frente.',
          'Baja doblando los codos hasta 90 grados.',
          'Sube empujando con los tríceps. Adíos flacidez.',
        ],
      },
    ],
  },
  {
    id: 'cardio_hiit',
    name: 'Cardio HIIT',
    emoji: '🔥',
    goal: 'lose_fat',
    level: 'intermedio',
    duration: 30,
    calories: 380,
    description: 'Quema grasa rápidamente con intervalos de alta intensidad.',
    exercises: [
      {
        id: 'jumping_jacks',
        nameEs: 'Saltos de Tijera',
        sets: 3,
        reps: '45 segundos',
        rest: 15,
        muscle: 'Cuerpo completo',
        description: 'Activa todo el cuerpo y eleva el ritmo cardíaco',
        voiceGuide: [
          'Vamos con saltos de tijera. 45 segundos. Empieza cuando estés lista.',
          'Mantén el ritmo, respira profundo. Ya llevas la mitad.',
          'Últimos 10 segundos. Tú puedes. Eres increíble.',
        ],
      },
      {
        id: 'burpee',
        nameEs: 'Burpee',
        sets: 3,
        reps: '10',
        rest: 30,
        muscle: 'Cuerpo completo',
        description: 'El ejercicio más completo para quemar grasa',
        tip: 'Modifica quitando el salto si lo necesitas.',
        voiceGuide: [
          '10 burpees. El ejercicio más poderoso para quemar grasa.',
          'Plancha, flexión, salta con los pies al pecho y sube con los brazos al aire.',
          'Cada burpee quema más que cualquier otro ejercicio. Sigue.',
        ],
      },
      {
        id: 'mountain_climbers',
        nameEs: 'Escalador',
        sets: 3,
        reps: '45 segundos',
        rest: 15,
        muscle: 'Core, Cardio',
        description: 'Quema grasa y fortalece el core simultáneamente',
        voiceGuide: [
          'Escaladores. En posición de plancha. Alterna las rodillas al pecho rápido.',
          'Caderas abajo, ritmo constante. Tu core está trabajando fuerte.',
          'Últimos 10 segundos. Dálo todo. Casi terminas.',
        ],
      },
      {
        id: 'squat_jump',
        nameEs: 'Sentadilla con Salto',
        sets: 3,
        reps: '12',
        rest: 30,
        muscle: 'Piernas, Glúteos, Cardio',
        description: 'Combinación explosiva de fuerza y cardio',
        voiceGuide: [
          'Sentadilla con salto. Baja en sentadilla y explota hacia arriba.',
          'Aterriza suave doblando las rodillas para protegerlas.',
          'Potencia pura. Estás quemando grasa y tonificando al mismo tiempo.',
        ],
      },
    ],
  },
  {
    id: 'core_abs',
    name: 'Core & Abdomen',
    emoji: '✨',
    goal: 'tone',
    level: 'principiante',
    duration: 25,
    calories: 150,
    description: 'Define el abdomen y fortalece el core para una cintura más marcada.',
    exercises: [
      {
        id: 'plank',
        nameEs: 'Plancha',
        sets: 3,
        reps: '30-45 segundos',
        rest: 45,
        muscle: 'Core completo',
        description: 'El rey del core. Estabiliza todo el tronco',
        voiceGuide: [
          'Plancha. Cuerpo en línea recta, activa el abdomen como si fueras a recibir un golpe.',
          'Respira profundo. No aguantes la respiración. Cada segundo cuenta.',
          'Ya casi. Eres una guerrera. Tu core se está fortaleciendo.',
        ],
      },
      {
        id: 'crunch',
        nameEs: 'Abdominal',
        sets: 3,
        reps: '20',
        rest: 30,
        muscle: 'Recto abdominal',
        description: 'Define el abdomen superior',
        tip: 'No jales el cuello. La fuerza viene del abdomen.',
        voiceGuide: [
          'Abdominales. Acostada, rodillas dobladas, manos detrás de la cabeza suavemente.',
          'Sube despacio exhalando, baja sin llegar completamente al piso.',
          'Perfecto. Tu abdomen está trabajando duro.',
        ],
      },
      {
        id: 'russian_twist',
        nameEs: 'Giro Ruso',
        sets: 3,
        reps: '20 total',
        rest: 30,
        muscle: 'Oblicuos',
        description: 'Trabaja los oblicuos para definir la cintura',
        voiceGuide: [
          'Giro ruso. Sentada a 45 grados, pies levantados si puedes.',
          'Gira de lado a lado tocando el piso con las manos.',
          'Tu cintura se está definiendo con cada repetición. Sigue.',
        ],
      },
      {
        id: 'leg_raise',
        nameEs: 'Elevación de Piernas',
        sets: 3,
        reps: '12-15',
        rest: 30,
        muscle: 'Abdomen inferior',
        description: 'Trabaja el abdomen bajo, difícil de tonificar',
        tip: 'Baja las piernas lentamente para mayor efectividad.',
        voiceGuide: [
          'Elevación de piernas. Acostada, manos debajo de los glúteos.',
          'Sube las piernas rectas hasta 90 grados y baja lentamente sin tocar el piso.',
          'Excelente. El abdomen bajo es uno de los más difíciles. Tú lo estás logrando.',
        ],
      },
    ],
  },
  {
    id: 'full_body',
    name: 'Cuerpo Completo',
    emoji: '💯',
    goal: 'tone',
    level: 'intermedio',
    duration: 50,
    calories: 320,
    description: 'Rutina completa que trabaja todos los músculos en una sesión.',
    exercises: [
      {
        id: 'deadlift',
        nameEs: 'Peso Muerto',
        sets: 3,
        reps: '12',
        rest: 60,
        muscle: 'Glúteos, Isquiotibiales, Espalda',
        description: 'Ejercicio fundamental para glúteos y espalda',
        tip: 'Espalda siempre recta, empuja las caderas hacia atrás al bajar.',
        voiceGuide: [
          'Peso muerto. Pies al ancho de caderas, barra o mancuernas frente a ti.',
          'Baja manteniendo la espalda recta, empuja las caderas hacia atrás.',
          'Sube empujando los talones y apretando los glúteos arriba. Perfecto.',
        ],
      },
      {
        id: 'goblet_squat',
        nameEs: 'Sentadilla Goblet',
        sets: 3,
        reps: '12',
        rest: 45,
        muscle: 'Piernas, Glúteos, Core',
        description: 'Sentadilla con mancuerna para mayor activación',
        voiceGuide: [
          'Sentadilla goblet. Sostiene la mancuerna con ambas manos frente al pecho.',
          'Baja profundo manteniendo los codos dentro de las rodillas.',
          'Esta variante activa más el core y glutes. Excelente elección.',
        ],
      },
      {
        id: 'bent_over_row',
        nameEs: 'Remo Inclinado',
        sets: 3,
        reps: '12',
        rest: 60,
        muscle: 'Espalda, Bíceps',
        description: 'Construye una espalda fuerte y mejor postura',
        voiceGuide: [
          'Remo inclinado. Caderas hacia atrás, espalda a 45 grados, rodillas ligeramente dobladas.',
          'Jala las mancuernas hacia las caderas apretando los omoplatos.',
          'Increíble. Tu postura va a mejorar notablemente.',
        ],
      },
    ],
  },
];

export const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const WEEKLY_PLAN: Record<string, string> = {
  Mon: 'glutes_legs',
  Tue: 'upper_body',
  Wed: 'cardio_hiit',
  Thu: 'core_abs',
  Fri: 'glutes_legs',
  Sat: 'full_body',
  Sun: 'rest',
};
