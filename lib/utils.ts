import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

interface Food {
  calories: number;
  protein: number;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
  sugar?: number | null;
  sodium?: number | null;
}

export function calculateCalories(food: Food, quantity: number) {
  return (food.calories * quantity) / 100;
}

export function calculateNutrients(food: Food, quantity: number) {
  const factor = quantity / 100;
  return {
    calories: food.calories * factor,
    protein: food.protein * factor,
    carbs: food.carbs ? food.carbs * factor : 0,
    fat: food.fat ? food.fat * factor : 0,
    fiber: food.fiber ? food.fiber * factor : 0,
    sugar: food.sugar ? food.sugar * factor : 0,
    sodium: food.sodium ? food.sodium * factor : 0,
  };
}

export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female"
) {
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

export function calculateTDEE(bmr: number, activityLevel: string) {
  const activityFactors = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  };
  return (
    bmr *
    (activityFactors[activityLevel as keyof typeof activityFactors] || 1.2)
  );
}
