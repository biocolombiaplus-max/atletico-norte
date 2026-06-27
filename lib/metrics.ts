export interface BodyMetrics {
  bmi: number;
  bmiCategory: string;
  bmiColor: string;
  idealWeight: { min: number; max: number };
  bmr: number;
  tdee: number;
  bodyFatEstimate?: number;
  leanMass?: number;
}

export function calculateMetrics(
  weight: number,
  height: number,
  age: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' = 'moderate'
): BodyMetrics {
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);

  let bmiCategory = '';
  let bmiColor = '';
  if (bmi < 18.5) { bmiCategory = 'Bajo peso'; bmiColor = '#3B82F6'; }
  else if (bmi < 25) { bmiCategory = 'Peso normal'; bmiColor = '#10B981'; }
  else if (bmi < 30) { bmiCategory = 'Sobrepeso'; bmiColor = '#F59E0B'; }
  else { bmiCategory = 'Obesidad'; bmiColor = '#EF4444'; }

  // Ideal weight (BMI 18.5-24.9)
  const idealWeight = {
    min: Math.round(18.5 * heightM * heightM * 10) / 10,
    max: Math.round(24.9 * heightM * heightM * 10) / 10,
  };

  // Harris-Benedict BMR (female)
  const bmr = Math.round(655 + (9.563 * weight) + (1.850 * height) - (4.676 * age));

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };
  const tdee = Math.round(bmr * activityMultipliers[activityLevel]);

  // Rough body fat estimate for women (Deurenberg formula)
  const bodyFatEstimate = Math.round((1.20 * bmi + 0.23 * age - 5.4) * 10) / 10;
  const leanMass = Math.round((weight * (1 - bodyFatEstimate / 100)) * 10) / 10;

  return { bmi: Math.round(bmi * 10) / 10, bmiCategory, bmiColor, idealWeight, bmr, tdee, bodyFatEstimate, leanMass };
}

export function calculateCalorieGoal(tdee: number, goal: string): number {
  switch (goal) {
    case 'lose_fat': return Math.round(tdee * 0.8);
    case 'gain_muscle': return Math.round(tdee * 1.1);
    default: return tdee;
  }
}

export function getWaterIntake(weight: number): number {
  return Math.round(weight * 35); // ml per day
}

export function getProteinGoal(weight: number, goal: string): number {
  const multiplier = goal === 'gain_muscle' ? 2.0 : goal === 'lose_fat' ? 1.8 : 1.6;
  return Math.round(weight * multiplier);
}
