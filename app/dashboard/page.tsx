import { Button } from "@/components/ui/button"
import { Camera, BarChart3, History, User, Plus } from "lucide-react"
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                CalAI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                내 계정
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            안녕하세요! 👋
          </h1>
          <p className="text-gray-600">
            오늘도 건강한 식단 관리를 시작해보세요.
          </p>
        </div>

        {/* Quick Action Card */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 mb-8 text-white">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">식단 기록하기</h2>
            <p className="text-blue-100 mb-6">
              음식 사진을 업로드하면 AI가 자동으로 분석하여 칼로리와 영양성분을 계산해드립니다.
            </p>
            <Button size="lg" variant="secondary" className="px-8">
              <Camera className="w-5 h-5 mr-2" />
              사진 업로드
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">오늘 섭취 칼로리</h3>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">0 kcal</div>
            <p className="text-sm text-gray-500">목표: 2,000 kcal</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">오늘 기록한 끼니</h3>
              <History className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">0개</div>
            <p className="text-sm text-gray-500">목표: 3개</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">연속 기록일</h3>
              <Plus className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">0일</div>
            <p className="text-sm text-gray-500">목표: 7일</p>
          </div>
        </div>

        {/* Recent Records */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">최근 기록</h2>
              <Link href="/history">
                <Button variant="outline" size="sm">
                  전체 보기
                </Button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">아직 기록된 식단이 없습니다</h3>
              <p className="text-gray-500 mb-6">첫 번째 식단을 기록해보세요!</p>
              <Button>
                <Camera className="w-4 h-4 mr-2" />
                식단 기록하기
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="grid grid-cols-3 py-2">
          <Link href="/dashboard" className="flex flex-col items-center py-2 text-blue-600">
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs mt-1">홈</span>
          </Link>
          <button className="flex flex-col items-center py-2 text-gray-400">
            <Camera className="w-6 h-6" />
            <span className="text-xs mt-1">기록</span>
          </button>
          <Link href="/history" className="flex flex-col items-center py-2 text-gray-400">
            <History className="w-6 h-6" />
            <span className="text-xs mt-1">기록보기</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
