import { NextRequest, NextResponse } from 'next/server'
import { parseWebhookResponse, type AnalyzeResult } from '@/lib/utils'

const WEBHOOK_URL = 'https://leehan.app.n8n.cloud/webhook-test/3f7989cc-4003-4635-a611-33bcdb90ca93'

export async function POST(request: NextRequest) {
  try {
    console.log('🖼️ 이미지 업로드 API 호출됨')

    const formData = await request.formData()
    const file = formData.get('image') as File

    console.log('📁 수신된 파일 정보:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
    })

    if (!file) {
      console.error('❌ 파일이 제공되지 않음')
      return NextResponse.json(
        { error: '이미지 파일이 필요합니다.' },
        { status: 400 }
      )
    }

    // 파일 유효성 검사
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ 지원하지 않는 파일 형식:', file.type)
      return NextResponse.json(
        { error: '지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP만 지원)' },
        { status: 400 }
      )
    }

    // 파일 크기 검사 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      console.error('❌ 파일 크기 초과:', file.size)
      return NextResponse.json(
        { error: '파일 크기가 10MB를 초과합니다.' },
        { status: 400 }
      )
    }

    console.log('✅ 파일 검증 통과, 웹훅 전송 시작')

    // 웹훅으로 이미지 전송
    const webhookFormData = new FormData()
    webhookFormData.append('image', file)
    webhookFormData.append('timestamp', new Date().toISOString())
    webhookFormData.append('filename', file.name)
    webhookFormData.append('size', file.size.toString())
    webhookFormData.append('type', file.type)

    console.log('🚀 웹훅 전송 시작:', {
      url: WEBHOOK_URL,
      filename: file.name,
      size: file.size,
      type: file.type,
    })

    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: webhookFormData,
    })

    console.log('📡 웹훅 응답 상태:', {
      status: webhookResponse.status,
      statusText: webhookResponse.statusText,
      headers: Object.fromEntries(webhookResponse.headers.entries()),
    })

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error('❌ 웹훅 전송 실패:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        response: errorText,
      })
      throw new Error(`웹훅 전송 실패: ${webhookResponse.status} - ${errorText}`)
    }

    const webhookResult = await webhookResponse.json()

    console.log('✅ 웹훅 전송 성공:', {
      success: true,
      webhookResponse: webhookResult,
    })

    // 웹훅 응답을 분석 결과로 변환
    const analyzeResult = parseWebhookResponse(webhookResult)

    if (!analyzeResult.success) {
      console.error('❌ 웹훅 응답 파싱 실패:', analyzeResult.error)
      return NextResponse.json({
        success: false,
        error: analyzeResult.error?.message || '분석 결과를 처리할 수 없습니다.',
        details: '웹훅 응답을 분석하는 중 오류가 발생했습니다.',
        debug: {
          originalFile: {
            name: file.name,
            size: file.size,
            type: file.type,
          },
          webhookUrl: WEBHOOK_URL,
          responseStatus: webhookResponse.status,
          webhookResponse: webhookResult,
        }
      }, { status: 422 })
    }

    console.log('✅ 분석 결과 변환 완료:', analyzeResult.data)

    return NextResponse.json({
      success: true,
      message: '이미지가 성공적으로 분석되었습니다.',
      data: analyzeResult.data,
      debug: {
        originalFile: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
        webhookUrl: WEBHOOK_URL,
        responseStatus: webhookResponse.status,
      }
    })

  } catch (error) {
    console.error('💥 이미지 업로드 오류:', error)
    return NextResponse.json(
      {
        error: '이미지 업로드 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        debug: {
          webhookUrl: WEBHOOK_URL,
          timestamp: new Date().toISOString(),
        }
      },
      { status: 500 }
    )
  }
}
