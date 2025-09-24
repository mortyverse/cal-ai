/**
 * 브라우저에서 실행할 웹훅 테스트 스크립트
 * 브라우저 콘솔에서 실행하여 웹훅 테스트 가능
 */

async function testWebhookInBrowser() {
  console.log('🧪 브라우저에서 웹훅 테스트 시작...\n');

  const WEBHOOK_URL = 'https://leehan.app.n8n.cloud/webhook-test/3f7989cc-4003-4635-a611-33bcdb90ca93';

  try {
    // 1x1 투명 PNG 이미지 (Base64)
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77lQAAAABJRU5ErkJggg==';

    // Base64 디코딩하여 Blob 생성
    const imageData = atob(base64Image);
    const arrayBuffer = new ArrayBuffer(imageData.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < imageData.length; i++) {
      uint8Array[i] = imageData.charCodeAt(i);
    }

    const blob = new Blob([uint8Array], { type: 'image/png' });
    const testFileName = `browser-test-${Date.now()}.png`;

    // FormData 생성
    const formData = new FormData();
    formData.append('image', blob, testFileName);
    formData.append('timestamp', new Date().toISOString());
    formData.append('filename', testFileName);
    formData.append('size', blob.size.toString());
    formData.append('type', 'image/png');

    console.log('📤 전송할 데이터:');
    console.log(`- URL: ${WEBHOOK_URL}`);
    console.log(`- 파일명: ${testFileName}`);
    console.log(`- 파일 크기: ${blob.size} bytes`);
    console.log(`- MIME 타입: image/png`);
    console.log(`- 타임스탬프: ${new Date().toISOString()}\n`);

    console.log('🚀 웹훅 전송 중...');

    // fetch API로 전송
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });

    console.log(`📡 응답 상태: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 웹훅 전송 성공!');
      console.log('📋 응답 데이터:', result);
    } else {
      const errorText = await response.text();
      console.log('❌ 웹훅 전송 실패');
      console.log('📄 에러 응답:', errorText);
    }

  } catch (error) {
    console.error('💥 테스트 중 오류 발생:', error);
  }
}

// 사용법: 브라우저 콘솔에서 testWebhookInBrowser() 실행
console.log('🔧 사용법: testWebhookInBrowser() 함수를 실행하세요');
