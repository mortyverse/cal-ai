# Phase 3: 데이터 조회 및 UI/UX (Data Display & UI/UX)

## 개요
사용자가 기록한 식단 데이터를 조회하고 분석할 수 있는 인터페이스를 구현하는 단계입니다. 자동 분류된 끼니별 데이터를 직관적으로 표시하고, 사용자 경험을 완성합니다.

## 목표
- 식단 기록 조회 및 필터링 기능 구현
- 끼니별, 날짜별 데이터 시각화
- 영양성분 분석 및 통계 제공
- 완성된 사용자 인터페이스 구현

## Task 목록

### 3.1 식단 조회 Server Action 구현
**복잡도**: 🟡 중간  
**예상 시간**: 2시간  
**의존성**: Phase 1, 2 완료

#### 체크리스트
- [ ] 식단 목록 조회 Server Action 구현 (`app/food/actions.ts`)
- [ ] 날짜별 필터링 기능 구현
- [ ] 끼니별 필터링 기능 구현
- [ ] 페이지네이션 구현
- [ ] 정렬 및 검색 기능 구현

#### Server Action 사양
```typescript
// app/food/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'

interface GetLogsParams {
  date?: string;           // YYYY-MM-DD 형식
  mealType?: string;       // '아침' | '점심' | '저녁' | '간식'
  page?: number;           // 기본값: 1
  limit?: number;          // 기본값: 20
  sortBy?: 'created_at' | 'calories';
  sortOrder?: 'asc' | 'desc';
}

export async function getFoodLogsAction(params: GetLogsParams = {}) {
  const supabase = await createClient()
  
  // 인증 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('인증이 필요합니다')
  }

  const {
    date,
    mealType,
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = params

  let query = supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', user.id)

  // 날짜 필터
  if (date) {
    query = query.gte('created_at', `${date}T00:00:00.000Z`)
                 .lt('created_at', `${date}T23:59:59.999Z`)
  }

  // 끼니 필터
  if (mealType && mealType !== 'all') {
    query = query.eq('meal_type', mealType)
  }

  // 정렬
  const orderColumn = sortBy === 'calories' ? 'summary->totalCalories' : sortBy
  query = query.order(orderColumn, { ascending: sortOrder === 'asc' })

  // 페이지네이션
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data: logs, error, count } = await query

  if (error) {
    throw new Error('식단 기록 조회 중 오류가 발생했습니다')
  }

  return {
    logs: logs || [],
    pagination: {
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    },
    summary: calculateDailySummary(logs || [], date)
  }
}
```

#### 데이터 구조
```typescript
interface FoodLog {
  id: string;
  user_id: string;
  image_url: string;
  meal_type: string;
  items: FoodItem[];
  summary: NutritionSummary;
  confidence_score: number;
  created_at: string;
}

interface DailySummary {
  date: string;
  totalCalories: number;
  mealBreakdown: {
    [mealType: string]: {
      calories: number;
      count: number;
    };
  };
  nutrients: NutritionSummary;
}
```

#### 성능 최적화
- 데이터베이스 인덱스 활용
- 필요한 필드만 선택적 조회
- 캐싱 헤더 설정

#### 완료 조건
- 모든 필터링 옵션이 정상 작동
- 페이지네이션이 올바르게 구현됨
- 응답 시간 1초 이내

---

### 3.2 식단 기록 목록 페이지 구현
**복잡도**: 🔴 높음  
**예상 시간**: 3시간  
**의존성**: 3.1 완료 후

#### 체크리스트
- [ ] 식단 목록 페이지 구현 (`app/food/history/page.tsx`)
- [ ] 날짜 선택 캘린더 구현
- [ ] 끼니별 탭 네비게이션 구현
- [ ] 식단 카드 컴포넌트 구현
- [ ] 무한 스크롤 또는 페이지네이션 구현

#### 구현할 컴포넌트
1. `components/food/FoodHistoryPage.tsx`
2. `components/food/DatePicker.tsx`
3. `components/food/MealTabs.tsx`
4. `components/food/FoodLogCard.tsx`
5. `components/food/EmptyState.tsx`

#### 페이지 레이아웃
```
┌─────────────────────────────────────┐
│ Header (날짜 선택, 필터)              │
├─────────────────────────────────────┤
│ 끼니 탭 (아침|점심|저녁|간식|전체)    │
├─────────────────────────────────────┤
│ 식단 카드 목록                       │
│ ┌─────────────────────────────────┐ │
│ │ [이미지] 음식명 | 칼로리 | 시간  │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ [이미지] 음식명 | 칼로리 | 시간  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### 상태 관리
```typescript
interface HistoryState {
  logs: FoodLog[];
  filters: {
    date: string;
    mealType: string;
  };
  loading: boolean;
  hasMore: boolean;
  error: string | null;
}
```

#### 완료 조건
- 모든 필터가 실시간으로 작동
- 로딩 상태가 적절히 표시됨
- 빈 상태에 대한 안내 메시지 제공

---

### 3.3 식단 상세 보기 모달 구현
**복잡도**: 🟡 중간  
**예상 시간**: 2시간  
**의존성**: 3.2 완료 후

#### 체크리스트
- [ ] 모달 컴포넌트 구현
- [ ] 이미지 확대 보기 기능
- [ ] 상세 영양성분 표시
- [ ] 음식별 세부 정보 표시
- [ ] 기록 수정/삭제 기능 (선택사항)

#### 구현할 컴포넌트
1. `components/food/FoodDetailModal.tsx`
2. `components/food/ImageViewer.tsx`
3. `components/food/DetailedNutrition.tsx`
4. `components/food/FoodItemDetails.tsx`

#### 모달 구성
```typescript
interface FoodDetailModalProps {
  log: FoodLog;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (log: FoodLog) => void;
  onDelete?: (logId: string) => void;
}
```

#### 기능 요구사항
- 이미지 핀치 줌 지원 (모바일)
- 영양성분 차트 표시
- 신뢰도별 색상 구분
- 접근성 고려 (키보드 네비게이션)

#### 완료 조건
- 모든 정보가 읽기 쉽게 표시됨
- 모바일에서 터치 제스처 지원
- 성능상 문제없이 작동

---

### 3.4 일간/주간 통계 대시보드 구현
**복잡도**: 🔴 높음  
**예상 시간**: 3.5시간  
**의존성**: 3.1 완료 후

#### 체크리스트
- [ ] 통계 데이터 조회 Server Action 구현 (`app/food/actions.ts`)
- [ ] 일간 칼로리 차트 구현
- [ ] 주간 영양성분 분석 구현
- [ ] 끼니별 분포 차트 구현
- [ ] 목표 대비 진행률 표시

#### 통계 Server Action 사양
```typescript
// app/food/actions.ts
'use server'

interface GetStatsParams {
  period: 'day' | 'week' | 'month';
  startDate: string;
  endDate?: string;
}

export async function getFoodStatsAction(params: GetStatsParams) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('인증이 필요합니다')
  }

  const { period, startDate, endDate } = params
  const actualEndDate = endDate || new Date().toISOString().split('T')[0]

  const { data: logs, error } = await supabase
    .from('food_logs')
    .select('created_at, meal_type, summary')
    .eq('user_id', user.id)
    .gte('created_at', `${startDate}T00:00:00.000Z`)
    .lte('created_at', `${actualEndDate}T23:59:59.999Z`)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error('통계 데이터 조회 중 오류가 발생했습니다')
  }

  // 통계 데이터 계산
  return calculateStats(logs || [], period)
}
```

#### 차트 라이브러리
- Chart.js 또는 Recharts 사용
- 반응형 차트 구현
- 다크모드 지원

#### 구현할 컴포넌트
1. `components/stats/StatsOverview.tsx`
2. `components/stats/CalorieChart.tsx`
3. `components/stats/NutritionChart.tsx`
4. `components/stats/MealDistributionChart.tsx`

#### 완료 조건
- 모든 차트가 정확한 데이터를 표시
- 인터랙티브한 차트 기능
- 모바일에서도 읽기 쉬운 크기

---

### 3.5 전체 UI/UX 개선 및 통합
**복잡도**: 🟡 중간  
**예상 시간**: 2.5시간  
**의존성**: 3.2, 3.3, 3.4 완료 후

#### 체크리스트
- [ ] 일관된 디자인 시스템 적용
- [ ] 로딩 스켈레톤 UI 구현
- [ ] 애니메이션 및 트랜지션 추가
- [ ] 다크모드 지원 (선택사항)
- [ ] 접근성 개선

#### 디자인 시스템 요소
1. **컬러 팔레트**
   ```css
   :root {
     --primary: #10b981;    /* 녹색 - 건강 */
     --secondary: #f59e0b;  /* 주황 - 에너지 */
     --accent: #3b82f6;     /* 파랑 - 정보 */
     --danger: #ef4444;     /* 빨강 - 경고 */
     --gray-50: #f9fafb;
     --gray-900: #111827;
   }
   ```

2. **타이포그래피**
   - 제목: font-weight: 700, line-height: 1.2
   - 본문: font-weight: 400, line-height: 1.6
   - 캡션: font-size: 0.875rem

3. **스페이싱**
   - 기본 단위: 0.25rem (4px)
   - 컴포넌트 간격: 1rem (16px)
   - 섹션 간격: 2rem (32px)

#### 애니메이션 가이드라인
- 페이지 전환: 300ms ease-in-out
- 호버 효과: 150ms ease
- 로딩 애니메이션: 1s infinite

#### 접근성 체크리스트
- [ ] 키보드 네비게이션 지원
- [ ] 스크린 리더 호환성
- [ ] 색상 대비 4.5:1 이상
- [ ] 포커스 인디케이터 명확히 표시
- [ ] alt 텍스트 제공

#### 완료 조건
- 모든 페이지가 일관된 디자인
- 부드러운 사용자 경험 제공
- WCAG 2.1 AA 수준 접근성 달성

---

## Phase 3 완료 조건

### 기능적 요구사항
- [ ] 사용자가 과거 식단 기록을 조회할 수 있음
- [ ] 날짜별, 끼니별 필터링이 가능함
- [ ] 영양성분 통계를 확인할 수 있음
- [ ] 모든 기능이 모바일에서 정상 작동함

### 기술적 요구사항
- [ ] 데이터 조회 성능 최적화 완료
- [ ] 반응형 디자인 완전 구현
- [ ] 접근성 기준 충족
- [ ] 일관된 디자인 시스템 적용

### 사용자 경험 요구사항
- [ ] 직관적인 네비게이션
- [ ] 빠른 응답 시간 (< 2초)
- [ ] 명확한 정보 표시
- [ ] 에러 상황 적절한 처리

## 테스트 시나리오

### 3.1 데이터 조회 테스트
1. **기본 조회**: 전체 식단 기록 목록 표시
2. **날짜 필터**: 특정 날짜의 기록만 표시
3. **끼니 필터**: 아침 식사만 필터링
4. **빈 데이터**: 기록이 없는 경우 적절한 메시지

### 3.2 상세 보기 테스트
1. **모달 열기**: 식단 카드 클릭 시 상세 정보 표시
2. **이미지 확대**: 음식 사진 확대 보기
3. **영양성분**: 모든 영양성분이 정확히 표시
4. **모달 닫기**: ESC 키 또는 외부 클릭으로 닫기

### 3.3 통계 차트 테스트
1. **칼로리 차트**: 일주일간 칼로리 변화 표시
2. **영양성분 차트**: 탄수화물/단백질/지방 비율
3. **끼니 분포**: 각 끼니별 칼로리 분포
4. **반응형**: 화면 크기 변화에 따른 차트 적응

### 3.4 모바일 UX 테스트
1. **터치 인터페이스**: 모든 버튼이 터치하기 쉬움
2. **스와이프 제스처**: 좌우 스와이프로 날짜 변경
3. **핀치 줌**: 이미지 확대/축소
4. **키보드**: 가상 키보드 표시 시 레이아웃 유지

## 성능 최적화 요구사항

### 데이터베이스 최적화
```sql
-- 필요한 인덱스 생성
CREATE INDEX idx_food_logs_user_date ON food_logs(user_id, created_at DESC);
CREATE INDEX idx_food_logs_meal_type ON food_logs(user_id, meal_type);
CREATE INDEX idx_food_logs_calories ON food_logs(user_id, (summary->>'totalCalories')::numeric);
```

### 프론트엔드 최적화
- 이미지 lazy loading 구현
- 가상 스크롤링 (대량 데이터 처리)
- 컴포넌트 메모이제이션
- 번들 크기 최적화

### 캐싱 전략
- API 응답 캐싱 (5분)
- 이미지 브라우저 캐싱
- 통계 데이터 캐싱 (1시간)

## 다음 단계
Phase 3 완료 후 [Phase 4: 최적화 및 배포](./phase-4-deployment.md)로 진행합니다.

## 트러블슈팅

### 자주 발생하는 문제들
1. **차트 렌더링 오류**: 데이터 형식 확인 및 예외 처리
2. **모바일 스크롤 문제**: CSS overflow 속성 조정
3. **이미지 로딩 실패**: 대체 이미지 및 에러 처리
4. **날짜 필터 버그**: 시간대 처리 및 날짜 형식 통일
