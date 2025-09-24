// 개발용 로그인 bypass 기능
// 실제 프로덕션에서는 제거해야 함

import { User } from './types/auth';

const MOCK_USER: User = {
  id: 'mock-user-id',
  email: 'demo@calai.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function bypassLogin(): User {
  // 로컬 스토리지에 사용자 정보 저장
  if (typeof window !== 'undefined') {
    localStorage.setItem('calai-mock-user', JSON.stringify(MOCK_USER));
  }
  return MOCK_USER;
}

export function getMockUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('calai-mock-user');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function bypassLogout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('calai-mock-user');
  }
}

export function isLoggedIn(): boolean {
  return getMockUser() !== null;
}
