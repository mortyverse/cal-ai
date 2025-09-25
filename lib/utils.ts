import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type AnalyzeResult, type FoodItem, type NutritionSummary } from "@/lib/types/food"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형태로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 이미지 파일 유효성 검사
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: '지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP만 지원)'
    }
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: '파일 크기가 10MB를 초과합니다.'
    }
  }

  return { isValid: true }
}

/**
 * 이미지 미리보기 URL 생성
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * 이미지 미리보기 URL 정리
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url)
}

/**
 * 웹훅 응답을 분석 결과로 변환
 */
export function parseWebhookResponse(webhookResponse: any): AnalyzeResult {
  console.log('🔄 웹훅 응답 파싱:', webhookResponse)

  // 웹훅 응답이 없거나 오류인 경우
  if (!webhookResponse || webhookResponse.error) {
    return {
      success: false,
      error: {
        code: webhookResponse?.error?.code || 'WEBHOOK_ERROR',
        message: webhookResponse?.error?.message || '웹훅 응답을 처리할 수 없습니다.'
      }
    }
  }

  try {
    // 웹훅 응답 구조에 따라 데이터 변환
    let items: FoodItem[] = []
    let summary: NutritionSummary = {
      totalCalories: 0,
      totalCarbohydrates: { value: 0, unit: 'g' },
      totalProtein: { value: 0, unit: 'g' },
      totalFat: { value: 0, unit: 'g' }
    }

    // 웹훅 응답에서 음식 분석 결과 추출
    if (webhookResponse.items && Array.isArray(webhookResponse.items)) {
      items = webhookResponse.items.map((item: any) => ({
        foodName: item.name || item.food_name || '알 수 없는 음식',
        confidence: item.confidence || 0.8,
        quantity: item.quantity || item.amount || '1인분',
        calories: item.calories || 0,
        nutrients: {
          carbohydrates: {
            value: item.nutrients?.carbohydrates || item.carbs || 0,
            unit: 'g'
          },
          protein: {
            value: item.nutrients?.protein || item.protein || 0,
            unit: 'g'
          },
          fat: {
            value: item.nutrients?.fat || item.fat || 0,
            unit: 'g'
          },
          sugars: {
            value: item.nutrients?.sugars || item.sugar || 0,
            unit: 'g'
          },
          sodium: {
            value: item.nutrients?.sodium || item.sodium || 0,
            unit: 'mg'
          }
        }
      }))
    } else if (webhookResponse.foods || webhookResponse.detected_foods) {
      // 다른 형태의 응답 처리
      const foods = webhookResponse.foods || webhookResponse.detected_foods
      items = foods.map((food: any) => ({
        foodName: food.name || food.food_name || '음식',
        confidence: food.confidence || 0.8,
        quantity: food.quantity || '1인분',
        calories: food.calories || 0,
        nutrients: {
          carbohydrates: { value: food.carbs || 0, unit: 'g' },
          protein: { value: food.protein || 0, unit: 'g' },
          fat: { value: food.fat || 0, unit: 'g' },
          sugars: { value: food.sugar || 0, unit: 'g' },
          sodium: { value: food.sodium || 0, unit: 'mg' }
        }
      }))
    }

    // 요약 정보 계산 또는 웹훅 응답에서 가져오기
    if (webhookResponse.summary || webhookResponse.total || webhookResponse.nutrition) {
      const nutrition = webhookResponse.summary || webhookResponse.total || webhookResponse.nutrition
      summary = {
        totalCalories: nutrition.calories || nutrition.total_calories || 0,
        totalCarbohydrates: {
          value: nutrition.carbohydrates || nutrition.carbs || 0,
          unit: 'g'
        },
        totalProtein: {
          value: nutrition.protein || 0,
          unit: 'g'
        },
        totalFat: {
          value: nutrition.fat || 0,
          unit: 'g'
        }
      }
    } else {
      // 개별 아이템에서 요약 계산
      summary = items.reduce((acc, item) => ({
        totalCalories: acc.totalCalories + item.calories,
        totalCarbohydrates: {
          value: acc.totalCarbohydrates.value + item.nutrients.carbohydrates.value,
          unit: 'g'
        },
        totalProtein: {
          value: acc.totalProtein.value + item.nutrients.protein.value,
          unit: 'g'
        },
        totalFat: {
          value: acc.totalFat.value + item.nutrients.fat.value,
          unit: 'g'
        }
      }), summary)
    }

    const mealType = webhookResponse.meal_type || webhookResponse.mealType || '점심'
    const imageUrl = webhookResponse.image_url || webhookResponse.imageUrl || ''

    console.log('✅ 웹훅 응답 파싱 완료:', { items, summary, mealType, imageUrl })

    return {
      success: true,
      data: {
        items,
        summary,
        mealType,
        imageUrl,
        webhookResponse
      }
    }
  } catch (error) {
    console.error('❌ 웹훅 응답 파싱 오류:', error)
    return {
      success: false,
      error: {
        code: 'PARSING_ERROR',
        message: '웹훅 응답을 처리할 수 없습니다.'
      }
    }
  }
}