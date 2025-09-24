import { FoodLog, FoodItem, NutritionSummary } from './types/food';

// 샘플 음식 데이터
const sampleFoodItems: FoodItem[] = [
  {
    foodName: "김치볶음밥",
    confidence: 0.95,
    quantity: "1 그릇 (300g)",
    calories: 520,
    nutrients: {
      carbohydrates: { value: 78.2, unit: "g" },
      protein: { value: 12.5, unit: "g" },
      fat: { value: 15.8, unit: "g" },
      sugars: { value: 4.2, unit: "g" },
      sodium: { value: 1200.0, unit: "mg" }
    }
  },
  {
    foodName: "계란말이",
    confidence: 0.92,
    quantity: "1 접시 (150g)",
    calories: 280,
    nutrients: {
      carbohydrates: { value: 3.1, unit: "g" },
      protein: { value: 20.5, unit: "g" },
      fat: { value: 20.1, unit: "g" },
      sugars: { value: 1.5, unit: "g" },
      sodium: { value: 450.0, unit: "mg" }
    }
  },
  {
    foodName: "된장찌개",
    confidence: 0.88,
    quantity: "1 그릇 (400g)",
    calories: 180,
    nutrients: {
      carbohydrates: { value: 12.5, unit: "g" },
      protein: { value: 8.2, unit: "g" },
      fat: { value: 6.8, unit: "g" },
      sugars: { value: 3.1, unit: "g" },
      sodium: { value: 950.0, unit: "mg" }
    }
  },
  {
    foodName: "현미밥",
    confidence: 0.98,
    quantity: "1 공기 (210g)",
    calories: 310,
    nutrients: {
      carbohydrates: { value: 68.5, unit: "g" },
      protein: { value: 6.2, unit: "g" },
      fat: { value: 1.5, unit: "g" },
      sugars: { value: 0.5, unit: "g" },
      sodium: { value: 8.0, unit: "mg" }
    }
  },
  {
    foodName: "불고기",
    confidence: 0.94,
    quantity: "1 인분 (120g)",
    calories: 320,
    nutrients: {
      carbohydrates: { value: 8.5, unit: "g" },
      protein: { value: 28.2, unit: "g" },
      fat: { value: 18.5, unit: "g" },
      sugars: { value: 6.2, unit: "g" },
      sodium: { value: 850.0, unit: "mg" }
    }
  }
];

// 샘플 영양성분 요약
const sampleSummary: NutritionSummary = {
  totalCalories: 1610,
  totalCarbohydrates: { value: 170.8, unit: "g" },
  totalProtein: { value: 75.6, unit: "g" },
  totalFat: { value: 62.7, unit: "g" }
};

// 샘플 식단 기록 생성
export function generateMockFoodLogs(): FoodLog[] {
  const logs: FoodLog[] = [];
  const today = new Date();
  
  // 최근 7일간의 데이터 생성
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // 각 날짜별로 1-3개의 식단 기록 생성
    const recordCount = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < recordCount; j++) {
      const mealTypes: ('아침' | '점심' | '저녁' | '간식')[] = ['아침', '점심', '저녁', '간식'];
      const mealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];
      
      // 랜덤하게 음식 아이템 선택 (1-3개)
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const selectedItems = sampleFoodItems
        .sort(() => 0.5 - Math.random())
        .slice(0, itemCount);
      
      // 선택된 아이템들의 총 칼로리 계산
      const totalCalories = selectedItems.reduce((sum, item) => sum + item.calories, 0);
      
      // 영양성분 요약 계산
      const summary: NutritionSummary = {
        totalCalories,
        totalCarbohydrates: {
          value: selectedItems.reduce((sum, item) => sum + item.nutrients.carbohydrates.value, 0),
          unit: "g"
        },
        totalProtein: {
          value: selectedItems.reduce((sum, item) => sum + item.nutrients.protein.value, 0),
          unit: "g"
        },
        totalFat: {
          value: selectedItems.reduce((sum, item) => sum + item.nutrients.fat.value, 0),
          unit: "g"
        }
      };
      
      const log: FoodLog = {
        id: `log-${date.getTime()}-${j}`,
        user_id: 'mock-user-id',
        image_url: `/api/placeholder/400/300?text=${encodeURIComponent(selectedItems[0].foodName)}`,
        meal_type: mealType,
        items: selectedItems,
        summary,
        confidence_score: selectedItems.reduce((sum, item) => sum + item.confidence, 0) / selectedItems.length,
        created_at: new Date(date.getTime() + j * 3600000).toISOString(), // 시간차를 두고 생성
        updated_at: new Date().toISOString()
      };
      
      logs.push(log);
    }
  }
  
  return logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// 오늘의 요약 데이터 생성
export function generateTodaySummary(logs: FoodLog[]): {
  totalCalories: number;
  mealCount: number;
  streak: number;
} {
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(log => 
    log.created_at.startsWith(today)
  );
  
  const totalCalories = todayLogs.reduce((sum, log) => sum + log.summary.totalCalories, 0);
  const mealCount = todayLogs.length;
  
  // 연속 기록일 계산 (간단한 로직)
  const streak = Math.min(7, Math.floor(Math.random() * 8));
  
  return {
    totalCalories,
    mealCount,
    streak
  };
}
