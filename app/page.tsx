import { Button } from "@/components/ui/button"
import { Camera, Zap, BarChart3, Clock, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              CalAI
            </span>
          </div>
          <Link href="/auth">
            <Button variant="outline" size="sm">
              로그인
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            사진 한 장으로
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              완벽한 식단 기록
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            AI가 자동으로 음식을 인식하고, 칼로리와 영양성분을 분석해드립니다. 
            복잡한 입력 없이 단 한 번의 클릭으로 식단 관리를 시작하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth">
              <Button size="lg" className="px-8 py-4 text-lg">
                <Camera className="w-5 h-5 mr-2" />
                지금 시작하기
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                데모 보기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            왜 CalAI인가요?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            복잡한 식단 기록은 이제 그만. 혁신적인 AI 기술로 누구나 쉽게 사용할 수 있습니다.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">원클릭 기록</h3>
            <p className="text-gray-600 leading-relaxed">
              사진 선택만으로 모든 것이 끝납니다. 끼니 선택, 음식명 입력 등 
              번거로운 과정은 모두 AI가 자동으로 처리합니다.
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">정확한 분석</h3>
            <p className="text-gray-600 leading-relaxed">
              최신 AI 기술로 음식의 종류와 양을 정확히 파악하여 
              칼로리와 주요 영양성분을 자동으로 계산해드립니다.
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">시간 기반 분류</h3>
            <p className="text-gray-600 leading-relaxed">
              업로드 시간을 바탕으로 아침, 점심, 저녁, 간식을 
              자동으로 분류하여 체계적인 식단 관리를 도와드립니다.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              어떻게 작동하나요?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              단 3단계로 완성되는 간단한 프로세스
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold mb-2">사진 업로드</h3>
                <p className="text-gray-600">음식 사진을 촬영하거나 갤러리에서 선택하세요</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold mb-2">AI 분석</h3>
                <p className="text-gray-600">AI가 자동으로 음식을 인식하고 영양성분을 계산합니다</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold mb-2">완료</h3>
                <p className="text-gray-600">결과를 확인하고 나만의 식단 기록을 관리하세요</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              이런 분들께 추천합니다
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">식단 기록의 필요성은 느끼지만 매번 정보 입력이 부담스러운 분</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">가장 직관적이고 빠른 방법으로 칼로리를 추적하고 싶은 분</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">복잡한 앱 사용법을 익히기 어려워하는 분</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">건강한 식습관을 만들고 싶지만 시작이 어려운 분</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">정확한 영양성분 정보를 쉽게 얻고 싶은 분</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">체계적인 식단 관리로 건강 목표를 달성하고 싶은 분</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            지금 바로 시작해보세요
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            복잡한 가입 절차 없이 간단한 이메일 인증만으로 
            혁신적인 AI 식단 관리를 경험해보세요.
          </p>
          <Link href="/auth">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
              <Camera className="w-5 h-5 mr-2" />
              무료로 시작하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-green-600 rounded flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">CalAI</span>
          </div>
          <p className="text-gray-400">
            © 2024 CalAI. 건강한 식습관의 시작.
          </p>
        </div>
      </footer>
    </div>
  )
}