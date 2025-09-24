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

      // 실제 웹훅 응답 데이터 사용
      if (!result.data) {
        throw new Error('분석 데이터를 받을 수 없습니다.')
      }

      console.log('✅ 실제 웹훅 데이터 수신:', result.data)
      console.log('📊 분석된 음식:', result.data.items.length, '개')
      console.log('🔥 총 칼로리:', result.data.summary.totalCalories)

      setState({ status: 'success', data: result.data })
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


          {state.status === 'success' && (
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">분석 완료!</h2>
              <p className="text-gray-600 mb-2">음식이 성공적으로 인식되었습니다.</p>
              <p className="text-sm text-blue-600 mb-8 font-medium">
                총 {state.data.items.length}개 음식 • {state.data.mealType} • {state.data.summary.totalCalories} kcal
              </p>
              
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
                    <div key={index} className="flex justify-between items-start py-3 border-b last:border-b-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{item.foodName}</p>
                          {item.confidence && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              {(item.confidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.quantity}</p>

                        {/* 영양성분 정보 */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <div>탄수화물: {item.nutrients.carbohydrates.value}{item.nutrients.carbohydrates.unit}</div>
                          <div>단백질: {item.nutrients.protein.value}{item.nutrients.protein.unit}</div>
                          <div>지방: {item.nutrients.fat.value}{item.nutrients.fat.unit}</div>
                          <div>당류: {item.nutrients.sugars.value}{item.nutrients.sugars.unit}</div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-lg text-blue-600">{item.calories}</p>
                        <p className="text-sm text-gray-500">kcal</p>
                      </div>
                    </div>
                  ))}

                  {/* 요약 정보 */}
                  <div className="border-t pt-4 mt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">탄수화물</p>
                        <p className="font-semibold text-blue-600">
                          {state.data.summary.totalCarbohydrates.value}{state.data.summary.totalCarbohydrates.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">단백질</p>
                        <p className="font-semibold text-blue-600">
                          {state.data.summary.totalProtein.value}{state.data.summary.totalProtein.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">지방</p>
                        <p className="font-semibold text-blue-600">
                          {state.data.summary.totalFat.value}{state.data.summary.totalFat.unit}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-center items-center mt-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-600">총 칼로리</p>
                        <p className="text-2xl font-bold text-blue-600">{state.data.summary.totalCalories} kcal</p>
                      </div>
                    </div>
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
