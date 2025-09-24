'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Camera, Upload, CheckCircle, AlertCircle, TestTube } from "lucide-react"

export default function WebhookDebugPage() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const testWebhook = async () => {
    setStatus('testing')
    setResult(null)
    setError('')

    try {
      // 1x1 투명 PNG 이미지 (Base64)
      const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77lQAAAABJRU5ErkJggg=='

      // Base64 디코딩하여 Blob 생성
      const imageData = atob(base64Image)
      const arrayBuffer = new ArrayBuffer(imageData.length)
      const uint8Array = new Uint8Array(arrayBuffer)
      for (let i = 0; i < imageData.length; i++) {
        uint8Array[i] = imageData.charCodeAt(i)
      }

      const blob = new Blob([uint8Array], { type: 'image/png' })
      const testFileName = `debug-test-${Date.now()}.png`

      // FormData 생성
      const formData = new FormData()
      formData.append('image', blob, testFileName)
      formData.append('timestamp', new Date().toISOString())
      formData.append('filename', testFileName)
      formData.append('size', blob.size.toString())
      formData.append('type', 'image/png')

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setStatus('success')
        setResult(result)
      } else {
        setStatus('error')
        setError(result.error || '알 수 없는 오류')
      }

    } catch (error) {
      setStatus('error')
      setError(error instanceof Error ? error.message : '테스트 중 오류 발생')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TestTube className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">웹훅 디버깅</h1>
              <p className="text-gray-600">
                실제로 n8n 웹훅으로 이미지가 전송되는지 테스트합니다.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">테스트 정보</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 웹훅 URL: https://leehan.app.n8n.cloud/webhook-test/...</li>
                  <li>• 테스트 이미지: 1x1 투명 PNG (68 bytes)</li>
                  <li>• 전송 데이터: image, timestamp, filename, size, type</li>
                </ul>
              </div>

              <Button
                onClick={testWebhook}
                disabled={status === 'testing'}
                size="lg"
                className="w-full"
              >
                {status === 'testing' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    웹훅 테스트 중...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    웹훅 테스트 실행
                  </>
                )}
              </Button>

              {status === 'success' && result && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-green-800">테스트 성공!</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-green-700">응답 메시지</p>
                      <p className="text-sm text-green-600">{result.message}</p>
                    </div>

                    {result.debug && (
                      <div>
                        <p className="text-sm font-medium text-green-700">디버그 정보</p>
                        <pre className="text-xs text-green-600 bg-green-100 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(result.debug, null, 2)}
                        </pre>
                      </div>
                    )}

                    {result.webhookResponse && (
                      <div>
                        <p className="text-sm font-medium text-green-700">웹훅 응답</p>
                        <pre className="text-xs text-green-600 bg-green-100 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(result.webhookResponse, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <h3 className="font-semibold text-red-800">테스트 실패</h3>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-red-700">오류 메시지</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">다음 단계</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 개발자 도구 콘솔에서 로그 확인</li>
                  <li>• n8n 워크플로우에서 웹훅 수신 확인</li>
                  <li>• 실제 이미지 업로드 페이지에서 테스트</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
