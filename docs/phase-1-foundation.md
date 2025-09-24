# Phase 1: 기반 설정 및 인증 (Foundation & Authentication)

## 개요
프로젝트의 기반 환경을 설정하고 사용자 인증 시스템을 구현하는 단계입니다. 모든 후속 개발의 기초가 되는 중요한 단계입니다.

## 목표
- Next.js 프로젝트 환경 완전 설정
- Supabase 프로젝트 설정 및 연동
- 사용자 인증 시스템 구현
- 보안 설정 완료

## Task 목록

### 1.1 의존성 패키지 설치 및 설정
**복잡도**: 🟢 낮음  
**예상 시간**: 30분  
**의존성**: 없음

#### 체크리스트
- [ ] Supabase 클라이언트 라이브러리 설치 (`@supabase/supabase-js`)
- [ ] TypeScript 타입 정의 설치 (`@supabase/auth-helpers-nextjs`)
- [ ] UI 컴포넌트 라이브러리 설치 (shadcn/ui 기본 컴포넌트)
- [ ] 폼 처리 라이브러리 설치 (`react-hook-form`, `zod`)
- [ ] 아이콘 라이브러리 설치 (`lucide-react`)

#### 실행 명령어
```bash
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
pnpm add react-hook-form zod @hookform/resolvers
pnpm add lucide-react
pnpm dlx shadcn-ui@latest init
pnpm dlx shadcn-ui@latest add button input card form
```

#### 완료 조건
- `package.json`에 모든 필요한 의존성이 추가됨
- `components.json` 파일이 생성됨
- 기본 shadcn/ui 컴포넌트가 설치됨

---

### 1.2 Supabase 프로젝트 설정
**복잡도**: 🟡 중간  
**예상 시간**: 1시간  
**의존성**: 1.1 완료 후

#### 체크리스트
- [ ] Supabase 계정 생성 및 새 프로젝트 생성
- [ ] 프로젝트 URL 및 anon key 확인
- [ ] Authentication 설정에서 이메일 인증 활성화
- [ ] Storage 버킷 생성 (`food-images`)
- [ ] Storage 버킷 공개 정책 설정

#### 상세 작업
1. **Supabase 프로젝트 생성**
   - [Supabase Dashboard](https://app.supabase.com) 접속
   - 새 프로젝트 생성 (이름: `cal-ai-mvp`)
   - 데이터베이스 비밀번호 설정

2. **Authentication 설정**
   - Settings > Authentication 이동
   - Email confirmations 활성화
   - Site URL 설정 (개발: `http://localhost:3000`)

3. **Storage 설정**
   - Storage 메뉴에서 새 버킷 생성: `food-images`
   - 버킷을 public으로 설정
   - 이미지 파일 업로드 정책 설정

#### 완료 조건
- Supabase 프로젝트가 정상적으로 생성됨
- 필요한 설정이 모두 완료됨
- API 키와 URL을 확보함

---

### 1.3 환경변수 구성
**복잡도**: 🟢 낮음  
**예상 시간**: 15분  
**의존성**: 1.2 완료 후

#### 체크리스트
- [ ] `.env.local` 파일 생성
- [ ] Supabase 환경변수 설정
- [ ] n8n 웹훅 URL 환경변수 설정 (추후 사용)
- [ ] `.env.example` 파일 생성

#### 환경변수 목록
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# n8n Webhook (추후 설정)
N8N_WEBHOOK_URL=your_n8n_webhook_url
```

#### 완료 조건
- `.env.local` 파일이 생성되고 올바른 값으로 설정됨
- `.env.example` 파일이 생성됨
- `.gitignore`에 `.env.local`이 포함됨

---

### 1.4 Supabase 클라이언트 설정
**복잡도**: 🟡 중간  
**예상 시간**: 45분  
**의존성**: 1.1, 1.3 완료 후

#### 체크리스트
- [ ] Supabase 클라이언트 인스턴스 생성 (`lib/supabase.ts`)
- [ ] 서버 컴포넌트용 클라이언트 설정
- [ ] 클라이언트 컴포넌트용 클라이언트 설정
- [ ] 미들웨어 설정 (`middleware.ts`)

#### 생성할 파일들
1. `lib/supabase/client.ts` - 클라이언트용
2. `lib/supabase/server.ts` - 서버용
3. `middleware.ts` - 인증 미들웨어

#### 완료 조건
- Supabase 클라이언트가 올바르게 설정됨
- 서버/클라이언트 환경 모두에서 사용 가능
- 미들웨어가 인증 상태를 올바르게 처리

---

### 1.5 데이터베이스 스키마 설계 및 생성
**복잡도**: 🔴 높음  
**예상 시간**: 2시간  
**의존성**: 1.2, 1.4 완료 후

#### 체크리스트
- [ ] `food_logs` 테이블 스키마 설계
- [ ] SQL 마이그레이션 파일 작성
- [ ] 테이블 생성 실행
- [ ] 인덱스 생성
- [ ] RLS(Row Level Security) 정책 설정

#### 테이블 구조: `food_logs`
```sql
CREATE TABLE food_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('아침', '점심', '저녁', '간식')),
  items JSONB NOT NULL,
  summary JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### RLS 정책
- 사용자는 자신의 기록만 조회/수정 가능
- 인증된 사용자만 새로운 기록 생성 가능

#### 완료 조건
- 테이블이 올바르게 생성됨
- RLS 정책이 적용됨
- 필요한 인덱스가 생성됨

---

### 1.6 인증 컴포넌트 구현
**복잡도**: 🔴 높음  
**예상 시간**: 3시간  
**의존성**: 1.4, 1.5 완료 후

#### 체크리스트
- [ ] 로그인 폼 컴포넌트 구현
- [ ] 회원가입 폼 컴포넌트 구현
- [ ] 인증 상태 관리 훅 구현
- [ ] 로그아웃 기능 구현
- [ ] 폼 유효성 검사 구현

#### 구현할 컴포넌트들
1. `components/auth/LoginForm.tsx`
2. `components/auth/SignUpForm.tsx`
3. `components/auth/AuthProvider.tsx`
4. `hooks/useAuth.ts`

#### 기능 요구사항
- 이메일/비밀번호 기반 인증 (Server Actions 활용)
- Zod를 활용한 서버사이드 폼 유효성 검사
- useActionState를 통한 로딩 상태 표시
- Server Action 에러 메시지 표시
- Server Action 완료 후 자동 리디렉션

#### 완료 조건
- 로그인/회원가입이 정상 작동
- 인증 상태가 올바르게 관리됨
- 사용자 친화적인 UI/UX

---

### 1.7 인증 페이지 구현
**복잡도**: 🟡 중간  
**예상 시간**: 1.5시간  
**의존성**: 1.6 완료 후

#### 체크리스트
- [ ] 로그인 페이지 구현 (`app/auth/login/page.tsx`)
- [ ] 회원가입 페이지 구현 (`app/auth/signup/page.tsx`)
- [ ] 인증 레이아웃 구현 (`app/auth/layout.tsx`)
- [ ] 페이지 간 네비게이션 구현

#### 페이지 구조
```
app/auth/
├── layout.tsx          # 인증 페이지 공통 레이아웃
├── login/
│   └── page.tsx       # 로그인 페이지
└── signup/
    └── page.tsx       # 회원가입 페이지
```

#### 완료 조건
- 모든 인증 페이지가 구현됨
- 반응형 디자인 적용
- 접근성 고려

---

### 1.8 보호된 라우트 설정
**복잡도**: 🟡 중간  
**예상 시간**: 1시간  
**의존성**: 1.6, 1.7 완료 후

#### 체크리스트
- [ ] 미들웨어에서 인증 체크 로직 구현
- [ ] 보호된 라우트 목록 정의
- [ ] 인증되지 않은 사용자 리디렉션 처리
- [ ] 인증된 사용자의 auth 페이지 접근 제한

#### 보호된 라우트
- `/dashboard` - 메인 대시보드
- `/food/record` - 식단 기록
- `/food/history` - 식단 조회

#### 완료 조건
- 인증되지 않은 사용자는 보호된 페이지에 접근할 수 없음
- 인증된 사용자는 자동으로 대시보드로 리디렉션
- 매끄러운 사용자 경험 제공

---

## Phase 1 완료 조건

### 기능적 요구사항
- [ ] 사용자가 이메일로 회원가입할 수 있음
- [ ] 사용자가 로그인/로그아웃할 수 있음
- [ ] 인증 상태에 따른 페이지 접근 제어가 작동함
- [ ] 데이터베이스가 올바르게 설정됨

### 기술적 요구사항
- [ ] TypeScript 타입 안정성 확보
- [ ] 환경변수가 올바르게 설정됨
- [ ] 보안 정책(RLS)이 적용됨
- [ ] 코드 품질 기준 충족

### 테스트 시나리오
1. **회원가입 테스트**
   - 새 이메일로 회원가입
   - 이메일 인증 확인
   - 자동 로그인 확인

2. **로그인 테스트**
   - 올바른 자격증명으로 로그인
   - 잘못된 자격증명 처리
   - 로그인 후 대시보드 리디렉션

3. **보안 테스트**
   - 인증되지 않은 상태에서 보호된 페이지 접근
   - 로그아웃 후 세션 정리

## 다음 단계
Phase 1 완료 후 [Phase 2: 핵심 기능 개발](./phase-2-core-features.md)로 진행합니다.

## 트러블슈팅

### 자주 발생하는 문제들
1. **Supabase 연결 오류**
   - 환경변수 확인
   - 프로젝트 URL과 키 재확인

2. **인증 리디렉션 루프**
   - 미들웨어 설정 확인
   - 보호된 라우트 목록 검토

3. **RLS 정책 오류**
   - 정책 문법 확인
   - 사용자 권한 검토
