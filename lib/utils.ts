import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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