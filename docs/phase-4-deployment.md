# Phase 4: 최적화 및 배포 (Optimization & Deployment)

## 개요
MVP의 성능을 최적화하고 프로덕션 환경에 배포하는 단계입니다. 사용자에게 안정적이고 빠른 서비스를 제공하기 위한 마지막 단계입니다.

## 목표
- 애플리케이션 성능 최적화
- 프로덕션 배포 환경 구성
- 모니터링 및 로깅 시스템 설정
- 보안 강화 및 최종 테스트

## Task 목록

### 4.1 성능 최적화
**복잡도**: 🔴 높음  
**예상 시간**: 3시간  
**의존성**: Phase 3 완료

#### 체크리스트
- [ ] Next.js 빌드 최적화 설정
- [ ] 이미지 최적화 구현
- [ ] 코드 스플리팅 및 lazy loading
- [ ] 번들 크기 분석 및 최적화
- [ ] 캐싱 전략 구현

#### 빌드 최적화 설정
```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js']
  },
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  swcMinify: true,
};
```

#### 코드 스플리팅 구현
```typescript
// 동적 import 사용
const FoodDetailModal = dynamic(() => import('@/components/food/FoodDetailModal'), {
  loading: () => <ModalSkeleton />,
  ssr: false
});

const StatsChart = dynamic(() => import('@/components/stats/CalorieChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});
```

#### 이미지 최적화
- Next.js Image 컴포넌트 사용
- WebP/AVIF 형식 지원
- 적절한 크기별 이미지 생성
- Lazy loading 구현

#### 캐싱 전략
1. **API 응답 캐싱**
   ```typescript
   export const revalidate = 300; // 5분
   export const dynamic = 'force-dynamic'; // 사용자별 데이터
   ```

2. **Static Generation 활용**
   - 인증 페이지: SSG
   - 대시보드: ISR (Incremental Static Regeneration)
   - 식단 기록: SSR (Server-Side Rendering)

#### 완료 조건
- Lighthouse 성능 점수 90+ 달성
- 번들 크기 2MB 이하 유지
- 첫 페이지 로딩 시간 3초 이내

---

### 4.2 보안 강화
**복잡도**: 🟡 중간  
**예상 시간**: 2시간  
**의든성**: 4.1 완료 후

#### 체크리스트
- [ ] Content Security Policy (CSP) 설정
- [ ] HTTPS 강제 리디렉션
- [ ] 환경변수 보안 검토
- [ ] API 레이트 리미팅 구현
- [ ] 입력값 검증 강화

#### CSP 헤더 설정
```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: https://your-supabase-project.supabase.co;
      connect-src 'self' https://your-supabase-project.supabase.co https://your-n8n-instance.com;
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

#### API 레이트 리미팅
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 1분에 10회
});
```

#### 입력값 검증
```typescript
// lib/validation.ts
import { z } from 'zod';

export const imageUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, '파일 크기는 10MB 이하여야 합니다')
    .refine(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), '지원하지 않는 파일 형식입니다'),
  userId: z.string().uuid('유효하지 않은 사용자 ID입니다')
});
```

#### 완료 조건
- 모든 보안 헤더가 적절히 설정됨
- API 엔드포인트에 레이트 리미팅 적용
- 입력값 검증이 모든 지점에서 수행됨

---

### 4.3 모니터링 및 로깅 시스템 설정
**복잡도**: 🟡 중간  
**예상 시간**: 2.5시간  
**의존성**: 4.1 완료 후

#### 체크리스트
- [ ] 애플리케이션 로깅 시스템 구현
- [ ] 에러 트래킹 시스템 설정 (Sentry)
- [ ] 성능 모니터링 설정
- [ ] 사용자 분석 도구 연동 (선택사항)
- [ ] 헬스체크 엔드포인트 구현

#### 로깅 시스템 구현
```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

#### Sentry 설정
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

#### 헬스체크 API
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // 데이터베이스 연결 확인
    const { data, error } = await supabase.from('food_logs').select('count').limit(1);
    
    if (error) throw error;
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        storage: 'up'
      }
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 503 });
  }
}
```

#### 완료 조건
- 모든 중요한 이벤트가 로깅됨
- 에러 발생 시 자동 알림 설정
- 성능 메트릭 수집 및 모니터링

---

### 4.4 배포 환경 구성
**복잡도**: 🔴 높음  
**예상 시간**: 3시간  
**의존성**: 4.1, 4.2, 4.3 완료 후

#### 체크리스트
- [ ] Vercel 프로젝트 설정
- [ ] 환경변수 프로덕션 설정
- [ ] 도메인 연결 및 SSL 인증서 설정
- [ ] CI/CD 파이프라인 구성
- [ ] 백업 및 복구 계획 수립

#### Vercel 배포 설정
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

#### 환경변수 설정
```bash
# 프로덕션 환경변수
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/food-analysis
SENTRY_DSN=https://your-sentry-dsn
UPSTASH_REDIS_REST_URL=https://your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

#### GitHub Actions CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Build application
        run: pnpm build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

#### 완료 조건
- 프로덕션 환경에서 애플리케이션이 정상 작동
- 자동 배포 파이프라인이 구성됨
- SSL 인증서가 적용됨

---

## Phase 4 완료 조건

### 성능 요구사항
- [ ] Lighthouse 점수: 성능 90+, 접근성 95+, 모범 사례 90+, SEO 90+
- [ ] 첫 페이지 로딩 시간 3초 이내
- [ ] 이미지 로딩 시간 2초 이내
- [ ] API 응답 시간 1초 이내

### 보안 요구사항
- [ ] HTTPS 강제 적용
- [ ] CSP 헤더 올바르게 설정
- [ ] API 레이트 리미팅 적용
- [ ] 모든 입력값 검증 완료

### 모니터링 요구사항
- [ ] 에러 트래킹 시스템 작동
- [ ] 성능 모니터링 대시보드 설정
- [ ] 로그 수집 및 분석 가능
- [ ] 알림 시스템 구성 완료

### 배포 요구사항
- [ ] 프로덕션 환경에서 안정적 작동
- [ ] CI/CD 파이프라인 자동화
- [ ] 롤백 계획 수립
- [ ] 백업 시스템 구축

## 최종 테스트 시나리오

### 4.1 성능 테스트
1. **로딩 속도**: 다양한 네트워크 환경에서 테스트
2. **동시 사용자**: 100명 동시 접속 테스트
3. **메모리 사용량**: 메모리 누수 확인
4. **배터리 소모**: 모바일 기기에서 배터리 영향 측정

### 4.2 보안 테스트
1. **SQL 인젝션**: 모든 입력 필드 테스트
2. **XSS 공격**: 스크립트 삽입 시도
3. **CSRF 공격**: 크로스 사이트 요청 위조 테스트
4. **인증 우회**: 권한 없는 접근 시도

### 4.3 장애 복구 테스트
1. **데이터베이스 연결 실패**: Supabase 서비스 중단 시나리오
2. **n8n 서비스 중단**: 웹훅 응답 없음 상황
3. **이미지 저장 실패**: Storage 서비스 오류
4. **네트워크 불안정**: 간헐적 연결 끊김

### 4.4 사용자 승인 테스트
1. **전체 플로우**: 회원가입부터 식단 조회까지
2. **다양한 기기**: iOS, Android, Desktop 브라우저
3. **접근성**: 스크린 리더 사용자 테스트
4. **사용성**: 일반 사용자 피드백 수집

## 배포 후 체크리스트

### 즉시 확인 사항 (배포 후 30분 이내)
- [ ] 메인 페이지 정상 로딩
- [ ] 회원가입/로그인 기능 작동
- [ ] 식단 기록 기능 작동
- [ ] 이미지 업로드 및 분석 정상
- [ ] 모든 API 엔드포인트 응답 정상

### 24시간 모니터링 사항
- [ ] 에러율 5% 이하 유지
- [ ] 평균 응답 시간 2초 이하
- [ ] 사용자 이탈률 30% 이하
- [ ] 시스템 리소스 사용률 80% 이하

### 일주일 후 평가 사항
- [ ] 사용자 피드백 수집 및 분석
- [ ] 성능 메트릭 분석
- [ ] 에러 로그 분석 및 개선점 도출
- [ ] 다음 버전 개발 계획 수립

## 트러블슈팅 가이드

### 배포 관련 문제
1. **빌드 실패**
   - 의존성 버전 충돌 확인
   - TypeScript 에러 해결
   - 환경변수 누락 확인

2. **런타임 에러**
   - 서버 로그 확인
   - 환경변수 값 검증
   - 외부 서비스 연결 상태 확인

3. **성능 저하**
   - 번들 크기 재검토
   - 불필요한 리렌더링 확인
   - 데이터베이스 쿼리 최적화

### 모니터링 알림 대응
1. **높은 에러율**: 즉시 로그 확인 후 핫픽스 배포
2. **느린 응답**: 서버 리소스 확인 후 스케일링
3. **사용자 신고**: 우선순위에 따라 24시간 내 대응

## 향후 개선 계획

### 단기 개선 사항 (1-2주)
- 사용자 피드백 기반 UI/UX 개선
- 성능 최적화 추가 작업
- 버그 수정 및 안정성 향상

### 중기 개선 사항 (1-3개월)
- 새로운 기능 추가 (목표 칼로리 설정, 운동 기록 등)
- 다국어 지원
- PWA(Progressive Web App) 변환

### 장기 개선 사항 (6개월 이상)
- 네이티브 앱 개발
- AI 모델 자체 구축
- 소셜 기능 추가 (친구, 공유 등)

---

**🎉 Phase 4 완료 시 MVP 개발이 완전히 완료됩니다!**

사용자는 이제 원클릭으로 식단을 기록하고, AI 분석 결과를 확인하며, 자신의 식습관을 추적할 수 있는 완성된 서비스를 이용할 수 있습니다.
