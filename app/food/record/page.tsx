'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Camera, ArrowLeft, Upload, CheckCircle, AlertCircle } from "lucide-react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getMockUser } from '@/lib/auth-bypass'
import { useEffect } from 'react'
import { validateImageFile, createImagePreview, revokeImagePreview, formatFileSize } from '@/lib/utils'

type RecordState = 
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'analyzing' }
  | { status: 'success'; data: any }
  | { status: 'error'; error: string }

export default function FoodRecordPage() {
  const router = useRouter()
  const [state, setState] = useState<RecordState>({ status: 'idle' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const user = getMockUser()
    if (!user) {
      router.push('/')
    }
  }, [router])

  // 컴포넌트 언마운트 시 미리보기 URL 정리
  useEffect(() => {
    return () => {
      if (previewUrl) {
        revokeImagePreview(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 파일 유효성 검사
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      setState({ status: 'error', error: validation.error! })
      return
    }

    setSelectedFile(file)
    setState({ status: 'idle' })
    
    // 미리보기 URL 생성
    const url = createImagePreview(file)
    setPreviewUrl(url)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setState({ status: 'uploading', progress: 0 })
      
      // FormData 생성
      const formData = new FormData()
      formData.append('image', selectedFile)

      // 진행률 시뮬레이션 시작
      const progressInterval = setInterval(() => {
        setState(prev => {
          if (prev.status === 'uploading' && prev.progress < 90) {
            return { ...prev, progress: prev.progress + 10 }
          }
          return prev
        })
      }, 200)

      // API 호출
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      // 진행률 완료
      clearInterval(progressInterval)
      setState({ status: 'uploading', progress: 100 })
      await new Promise(resolve => setTimeout(resolve, 500))

      if (!response.ok) {
        throw new Error(result.error || '업로드 실패')
      }

      // 분석 시뮬레이션 (웹훅에서 처리된 결과를 기다리는 시간)
      setState({ status: 'analyzing' })
      await new Promise(resolve => setTimeout(resolve, 3000))

      // 웹훅 응답에서 결과 추출 (실제 구현에서는 웹훅 응답을 기반으로 함)
      const mockResult = {
        items: [
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
          }
        ],
        summary: {
          totalCalories: 520,
          totalCarbohydrates: { value: 78.2, unit: "g" },
          totalProtein: { value: 12.5, unit: "g" },
          totalFat: { value: 15.8, unit: "g" }
        },
        mealType: "점심",
        webhookResponse: result.webhookResponse
      }

      setState({ status: 'success', data: mockResult })
    } catch (error) {
      console.error('업로드 오류:', error)
      setState({ 
        status: 'error', 
        error: error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.' 
      })
    }
  }

  const handleRetry = () => {
    // 미리보기 URL 정리
    if (previewUrl) {
      revokeImagePreview(previewUrl)
    }
    setState({ status: 'idle' })
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const handleConfirm = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  뒤로
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">식단 기록</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {state.status === 'idle' && (
            <div className="text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">음식 사진을 업로드하세요</h2>
                <p className="text-gray-600 mb-8">
                  AI가 자동으로 음식을 인식하고 칼로리와 영양성분을 분석해드립니다.
                </p>
              </div>

              {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      사진을 선택하거나 드래그하세요
                    </p>
                    <p className="text-sm text-gray-500">
                      JPEG, PNG, WebP 형식 (최대 10MB)
                    </p>
                  </label>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <img
                      src={previewUrl!}
                      alt="선택된 이미지"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        if (previewUrl) {
                          revokeImagePreview(previewUrl)
                        }
                        setSelectedFile(null)
                        setPreviewUrl(null)
                      }}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                    >
                      ×
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      선택된 파일: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                    <Button onClick={handleUpload} size="lg" className="px-8">
                      <Camera className="w-5 h-5 mr-2" />
                      분석 시작하기
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {state.status === 'uploading' && (
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-12 h-12 text-blue-600 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">업로드 중...</h2>
              <p className="text-gray-600 mb-8">파일을 서버에 전송하고 있습니다.</p>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">{state.progress}% 완료</p>
            </div>
          )}

          {state.status === 'analyzing' && (
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI 분석 중...</h2>
              <p className="text-gray-600 mb-8">음식을 인식하고 영양성분을 계산하고 있습니다.</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  💡 분석에는 약 10-15초가 소요됩니다.
                </p>
              </div>
            </div>
          )}

          {state.status === 'success' && (
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">분석 완료!</h2>
              <p className="text-gray-600 mb-8">음식이 성공적으로 인식되었습니다.</p>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">분석 결과</h3>

                {/* 디버그 정보 */}
                {state.data.webhookResponse && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">웹훅 응답:</p>
                    <pre className="text-xs text-gray-600 bg-white p-2 rounded border overflow-x-auto">
                      {JSON.stringify(state.data.webhookResponse, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="space-y-3">
                  {state.data.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium text-gray-900">{item.foodName}</p>
                        <p className="text-sm text-gray-600">{item.quantity}</p>
                      </div>
                      <p className="font-semibold text-blue-600">{item.calories} kcal</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 font-bold text-lg">
                    <span>총 칼로리</span>
                    <span className="text-blue-600">{state.data.summary.totalCalories} kcal</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleConfirm} size="lg" className="px-8">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  기록 완료
                </Button>
                <Button onClick={handleRetry} variant="outline" size="lg" className="px-8">
                  다시 시도
                </Button>
              </div>
            </div>
          )}

          {state.status === 'error' && (
            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h2>
              <p className="text-gray-600 mb-8">{state.error}</p>
              
              <Button onClick={handleRetry} size="lg" className="px-8">
                다시 시도
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
