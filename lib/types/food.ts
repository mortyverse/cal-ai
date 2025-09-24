export interface FoodItem {
  foodName: string;
  confidence: number; // 0.0 ~ 1.0
  quantity: string;
  calories: number;
  nutrients: {
    carbohydrates: { value: number; unit: string };
    protein: { value: number; unit: string };
    fat: { value: number; unit: string };
    sugars: { value: number; unit: string };
    sodium: { value: number; unit: string };
  };
}

export interface NutritionSummary {
  totalCalories: number;
  totalCarbohydrates: { value: number; unit: string };
  totalProtein: { value: number; unit: string };
  totalFat: { value: number; unit: string };
}

export interface FoodLog {
  id: string;
  user_id: string;
  image_url: string;
  meal_type: '아침' | '점심' | '저녁' | '간식';
  items: FoodItem[];
  summary: NutritionSummary;
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  mealBreakdown: {
    [mealType: string]: {
      calories: number;
      count: number;
    };
  };
  nutrients: NutritionSummary;
}

export interface AnalyzeResult {
  success: boolean;
  data?: {
    items: FoodItem[];
    summary: NutritionSummary;
    mealType: string;
    imageUrl: string;
    webhookResponse?: any;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  webhookResponse?: any;
  error?: string;
  details?: string;
}

export interface WebhookPayload {
  image: File;
  timestamp: string;
  filename: string;
  size: number;
  type: string;
}
