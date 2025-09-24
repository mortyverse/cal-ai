# Phase 2: 핵심 기능 개발 (Core Features)

## 개요
AI 식단 관리 서비스의 핵심인 "원클릭 식단 기록" 기능을 구현하는 단계입니다. 사용자가 사진을 선택하면 자동으로 분석되고 저장되는 전체 플로우를 완성합니다.

## 목표
- 이미지 업로드 인터페이스 구현
- n8n 웹훅과의 연동 구현
- 자동화된 식단 기록 플로우 완성
- 사용자 피드백 시스템 구현

## Task 목록

### 2.1 메인 대시보드 구현
**복잡도**: 🟡 중간  
**예상 시간**: 2시간  
**의존성**: Phase 1 완료

#### 체크리스트
- [ ] 대시보드 레이아웃 구현 (`app/dashboard/page.tsx`)
- [ ] 식단 기록 버튼 구현
- [ ] 최근 기록 요약 카드 구현
- [ ] 네비게이션 헤더 구현
- [ ] 모바일 반응형 디자인 적용

#### 주요 컴포넌트
1. `components/dashboard/DashboardHeader.tsx`
2. `components/dashboard/QuickRecordButton.tsx`
3. `components/dashboard/RecentSummary.tsx`
4. `components/layout/Navigation.tsx`

#### UI 요구사항
- **중앙 집중형 레이아웃**: 화면 중앙에 큰 "식단 기록하기" 버튼
- **미니멀 디자인**: 불필요한 요소 제거, 핵심 기능에 집중
- **모바일 최적화**: 터치하기 쉬운 버튼 크기 (최소 44px)

#### 완료 조건
- 대시보드가 깔끔하고 직관적으로 구현됨
- 모든 기기에서 반응형으로 작동
- 접근성 기준 충족

---

### 2.2 이미지 업로드 인터페이스 구현
**복잡도**: 🔴 높음  
**예상 시간**: 3시간  
**의존성**: 2.1 완료 후

#### 체크리스트
- [ ] 파일 선택 컴포넌트 구현
- [ ] 드래그 앤 드롭 기능 구현
- [ ] 이미지 미리보기 기능 구현
- [ ] 파일 유효성 검사 구현
- [ ] 업로드 진행률 표시 구현

#### 구현할 컴포넌트
1. `components/food/ImageUploader.tsx`
2. `components/food/ImagePreview.tsx`
3. `components/food/UploadProgress.tsx`

#### 기능 요구사항
```typescript
interface ImageUploaderProps {
  onUpload: (file: File) => Promise<void>;
  maxSize?: number; // MB 단위, 기본값: 10MB
  acceptedTypes?: string[]; // 기본값: ['image/jpeg', 'image/png', 'image/webp']
  disabled?: boolean;
}
```

#### 유효성 검사 규칙
- **파일 크기**: 최대 10MB
- **파일 형식**: JPEG, PNG, WebP만 허용
- **이미지 해상도**: 최소 300x300px
- **파일 개수**: 한 번에 하나의 이미지만

#### 사용자 경험 고려사항
- 카메라와 갤러리 모두 접근 가능
- 업로드 중 취소 기능 제공
- 명확한 에러 메시지 표시

#### 완료 조건
- 모바일 기기에서 카메라/갤러리 접근 가능
- 파일 유효성 검사가 올바르게 작동
- 직관적이고 반응성 좋은 UI

---

### 2.3 n8n 웹훅 연동 API 구현
**복잡도**: 🔴 높음  
**예상 시간**: 2.5시간  
**의존성**: 2.2 완료 후

#### 체크리스트
- [ ] API 라우트 핸들러 구현 (`app/api/food/analyze/route.ts`)
- [ ] multipart/form-data 처리 구현
- [ ] n8n 웹훅 호출 로직 구현
- [ ] 응답 데이터 타입 정의
- [ ] 에러 처리 및 재시도 로직 구현

#### API 엔드포인트 사양
```typescript
// POST /api/food/analyze
interface AnalyzeRequest {
  image: File;
  userId: string;
}

interface AnalyzeResponse {
  success: boolean;
  data?: {
    items: FoodItem[];
    summary: NutritionSummary;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

#### 구현할 타입 정의
```typescript
interface FoodItem {
  foodName: string;
  confidence: number;
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

interface NutritionSummary {
  totalCalories: number;
  totalCarbohydrates: { value: number; unit: string };
  totalProtein: { value: number; unit: string };
  totalFat: { value: number; unit: string };
}
```

#### 에러 처리 시나리오
1. **네트워크 오류**: 재시도 로직 (최대 3회)
2. **n8n 서버 오류**: 사용자에게 명확한 메시지 전달
3. **AI 분석 실패**: "음식을 인식할 수 없습니다" 메시지
4. **파일 업로드 실패**: Storage 관련 에러 처리

#### 완료 조건
- n8n 웹훅과 정상적으로 통신
- 모든 에러 시나리오에 대한 적절한 처리
- TypeScript 타입 안정성 확보

---

### 2.4 식단 기록 플로우 구현
**복잡도**: 🔴 높음  
**예상 시간**: 3시간  
**의존성**: 2.2, 2.3 완료 후

#### 체크리스트
- [ ] 식단 기록 페이지 구현 (`app/food/record/page.tsx`)
- [ ] 상태 관리 로직 구현
- [ ] 로딩 상태 UI 구현
- [ ] 성공/실패 피드백 UI 구현
- [ ] 기록 완료 후 리디렉션 구현

#### 상태 관리 구조
```typescript
type RecordState = 
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'analyzing' }
  | { status: 'success'; data: AnalyzeResponse['data'] }
  | { status: 'error'; error: string };
```

#### UI/UX 플로우
1. **초기 상태**: 이미지 업로드 인터페이스 표시
2. **업로드 중**: 진행률 바와 "업로드 중..." 메시지
3. **분석 중**: 로딩 애니메이션과 "AI가 분석 중입니다..." 메시지
4. **성공**: 분석 결과 미리보기와 "기록 완료!" 메시지
5. **실패**: 에러 메시지와 "다시 시도" 버튼

#### 로딩 상태 디자인
- **업로드 중**: 파일 크기 기반 진행률 표시
- **분석 중**: 스켈레톤 UI로 결과 레이아웃 미리보기
- **예상 시간 표시**: "약 10-15초 소요됩니다"

#### 완료 조건
- Server Action 기반 전체 플로우가 끊김 없이 작동
- useActionState를 활용한 적절한 피드백 제공
- 에러 상황에서 복구 가능한 UI
- Server Action 완료 후 자동 revalidation 작동

---

### 2.5 결과 표시 컴포넌트 구현
**복잡도**: 🟡 중간  
**예상 시간**: 2시간  
**의존성**: 2.4 완료 후

#### 체크리스트
- [ ] 음식 분석 결과 카드 구현
- [ ] 영양성분 표시 컴포넌트 구현
- [ ] 신뢰도 표시 UI 구현
- [ ] 총 칼로리 하이라이트 구현
- [ ] 모바일 최적화된 레이아웃 구현

#### 구현할 컴포넌트
1. `components/food/AnalysisResult.tsx`
2. `components/food/FoodItemCard.tsx`
3. `components/food/NutritionSummary.tsx`
4. `components/food/ConfidenceIndicator.tsx`

#### 디자인 요구사항
```typescript
interface AnalysisResultProps {
  items: FoodItem[];
  summary: NutritionSummary;
  mealType: string;
  onConfirm: () => void;
  onRetry: () => void;
}
```

#### UI 구성 요소
1. **음식 목록**: 각 음식별 카드 형태로 표시
2. **영양성분**: 막대 그래프 또는 원형 차트
3. **신뢰도**: 색상 코딩된 배지 (높음: 녹색, 중간: 노란색, 낮음: 빨간색)
4. **총 칼로리**: 큰 글씨로 강조 표시

#### 완료 조건
- 분석 결과가 시각적으로 명확하게 표시됨
- 사용자가 결과의 정확성을 쉽게 판단 가능
- 모바일에서 읽기 쉬운 레이아웃

---

### 2.6 에러 처리 및 사용자 피드백 시스템
**복잡도**: 🟡 중간  
**예상 시간**: 1.5시간  
**의존성**: 2.3, 2.4 완료 후

#### 체크리스트
- [ ] 전역 에러 바운더리 구현
- [ ] 토스트 알림 시스템 구현
- [ ] 에러 메시지 다국어화 (한국어)
- [ ] 네트워크 상태 감지 구현
- [ ] 오프라인 상태 처리 구현

#### 에러 유형별 처리
1. **파일 업로드 에러**
   ```typescript
   const FILE_ERRORS = {
     TOO_LARGE: "파일 크기가 너무 큽니다. (최대 10MB)",
     INVALID_FORMAT: "지원하지 않는 파일 형식입니다.",
     UPLOAD_FAILED: "업로드에 실패했습니다. 다시 시도해주세요."
   };
   ```

2. **AI 분석 에러**
   ```typescript
   const ANALYSIS_ERRORS = {
     NO_FOOD_DETECTED: "이미지에서 음식을 찾을 수 없습니다.",
     LOW_QUALITY: "이미지 품질이 낮습니다. 더 선명한 사진으로 시도해주세요.",
     SERVICE_UNAVAILABLE: "분석 서비스가 일시적으로 이용할 수 없습니다."
   };
   ```

3. **네트워크 에러**
   ```typescript
   const NETWORK_ERRORS = {
     TIMEOUT: "요청 시간이 초과되었습니다.",
     NO_CONNECTION: "인터넷 연결을 확인해주세요.",
     SERVER_ERROR: "서버 오류가 발생했습니다."
   };
   ```

#### 구현할 컴포넌트
1. `components/common/ErrorBoundary.tsx`
2. `components/common/Toast.tsx`
3. `components/common/NetworkStatus.tsx`
4. `hooks/useNetworkStatus.ts`

#### 완료 조건
- 모든 에러 상황에 대한 적절한 사용자 피드백
- 에러 복구 가능한 UI 제공
- 네트워크 상태에 따른 적응적 동작

---

## Phase 2 완료 조건

### 기능적 요구사항
- [ ] 사용자가 사진을 선택하여 식단을 기록할 수 있음
- [ ] 업로드된 이미지가 자동으로 AI 분석됨
- [ ] 분석 결과가 데이터베이스에 저장됨
- [ ] 시간 기반 끼니 분류가 정확히 작동함

### 기술적 요구사항
- [ ] n8n 웹훅과의 안정적인 연동
- [ ] 적절한 에러 처리 및 복구 메커니즘
- [ ] 모바일 최적화된 사용자 인터페이스
- [ ] TypeScript 타입 안정성 확보

### 성능 요구사항
- [ ] 이미지 업로드: 10MB 파일 기준 5초 이내
- [ ] AI 분석 응답: 평균 15초 이내
- [ ] 전체 기록 플로우: 30초 이내 완료

### 사용자 경험 요구사항
- [ ] 직관적이고 단순한 인터페이스
- [ ] 각 단계별 명확한 피드백
- [ ] 에러 상황에서의 복구 가능성

## 테스트 시나리오

### 2.1 정상 플로우 테스트
1. **이미지 선택**: 갤러리에서 음식 사진 선택
2. **업로드 확인**: 진행률이 정상적으로 표시됨
3. **분석 대기**: 로딩 애니메이션이 표시됨
4. **결과 확인**: 음식이 정확히 인식되고 칼로리가 표시됨
5. **저장 확인**: 데이터베이스에 기록이 생성됨

### 2.2 에러 처리 테스트
1. **잘못된 파일 형식**: PDF 파일 업로드 시 에러 메시지
2. **큰 파일**: 15MB 이미지 업로드 시 크기 제한 경고
3. **네트워크 오류**: 인터넷 연결 끊김 시 적절한 메시지
4. **AI 분석 실패**: 음식이 없는 이미지 업로드 시 안내

### 2.3 모바일 테스트
1. **카메라 접근**: 카메라 권한 요청 및 사진 촬영
2. **터치 인터페이스**: 버튼 크기 및 반응성
3. **화면 회전**: 가로/세로 모드에서 정상 작동
4. **키보드 표시**: 입력 필드에서 화면 레이아웃 유지

## n8n 워크플로우 요구사항

Phase 2 완료를 위해 n8n에서 다음 워크플로우가 구현되어야 합니다:

### 워크플로우 단계
1. **웹훅 수신**: multipart/form-data 파싱
2. **시간 기반 끼니 분류**: 현재 시각으로 meal_type 결정
3. **AI 분석 서비스 호출**: 외부 API 연동
4. **이미지 저장**: Supabase Storage 업로드
5. **데이터베이스 기록**: food_logs 테이블에 삽입
6. **응답 반환**: 성공/실패 결과 전송

### 테스트 데이터 예시
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "foodName": "김치볶음밥",
        "confidence": 0.95,
        "quantity": "1 그릇 (300g)",
        "calories": 520,
        "nutrients": {
          "carbohydrates": { "value": 78.2, "unit": "g" },
          "protein": { "value": 12.5, "unit": "g" },
          "fat": { "value": 15.8, "unit": "g" },
          "sugars": { "value": 4.2, "unit": "g" },
          "sodium": { "value": 1200.0, "unit": "mg" }
        }
      }
    ],
    "summary": {
      "totalCalories": 520,
      "totalCarbohydrates": { "value": 78.2, "unit": "g" },
      "totalProtein": { "value": 12.5, "unit": "g" },
      "totalFat": { "value": 15.8, "unit": "g" }
    }
  }
}
```

## 다음 단계
Phase 2 완료 후 [Phase 3: 데이터 조회 및 UI/UX](./phase-3-ui-data.md)로 진행합니다.

## 트러블슈팅

### 자주 발생하는 문제들
1. **CORS 에러**: n8n 웹훅 호출 시 CORS 설정 확인
2. **파일 업로드 실패**: 파일 크기 제한 및 형식 검증
3. **타임아웃**: n8n 응답 시간 초과 시 재시도 로직
4. **모바일 카메라 접근**: 권한 요청 및 HTTPS 필요성
