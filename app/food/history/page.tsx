'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Filter, Clock, Camera } from "lucide-react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getMockUser } from '@/lib/auth-bypass'
import { generateMockFoodLogs } from '@/lib/mock-data'
import { FoodLog } from '@/lib/types/food'

type FilterType = 'all' | '아침' | '점심' | '저녁' | '간식'

export default function FoodHistoryPage() {
  const router = useRouter()
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<FoodLog[]>([])
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all')
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    const user = getMockUser()
    if (!user) {
      router.push('/')
      return
    }

    // 목 데이터 생성
    const logs = generateMockFoodLogs()
    setFoodLogs(logs)
    setFilteredLogs(logs)
  }, [router])

  useEffect(() => {
    let filtered = foodLogs

    // 날짜 필터
    const selectedDateObj = new Date(selectedDate)
    filtered = filtered.filter(log => {
      const logDate = new Date(log.created_at)
      return logDate.toDateString() === selectedDateObj.toDateString()
    })

    // 끼니 필터
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(log => log.meal_type === selectedFilter)
    }

    setFilteredLogs(filtered)
  }, [foodLogs, selectedFilter, selectedDate])

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case '아침': return 'bg-yellow-100 text-yellow-800'
      case '점심': return 'bg-orange-100 text-orange-800'
      case '저녁': return 'bg-purple-100 text-purple-800'
      case '간식': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTotalCalories = () => {
    return filteredLogs.reduce((sum, log) => sum + log.summary.totalCalories, 0)
  }

  const getMealCount = () => {
    return filteredLogs.length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  뒤로
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">식단 기록</h1>
            </div>
            <Link href="/food/record">
              <Button size="sm">
                <Camera className="w-4 h-4 mr-2" />
                새 기록
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Date Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                날짜 선택
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Meal Type Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                끼니별 필터
              </label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as FilterType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체</option>
                <option value="아침">아침</option>
                <option value="점심">점심</option>
                <option value="저녁">저녁</option>
                <option value="간식">간식</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">총 칼로리</h3>
              <span className="text-2xl font-bold text-blue-600">
                {getTotalCalories().toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-500">kcal</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">기록된 끼니</h3>
              <span className="text-2xl font-bold text-green-600">
                {getMealCount()}
              </span>
            </div>
            <p className="text-xs text-gray-500">개</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">평균 칼로리</h3>
              <span className="text-2xl font-bold text-purple-600">
                {getMealCount() > 0 ? Math.round(getTotalCalories() / getMealCount()) : 0}
              </span>
            </div>
            <p className="text-xs text-gray-500">kcal/끼니</p>
          </div>
        </div>

        {/* Food Logs List */}
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedFilter === 'all' ? '선택한 날짜에 기록된 식단이 없습니다' : `${selectedFilter} 기록이 없습니다`}
              </h3>
              <p className="text-gray-500 mb-6">
                새로운 식단을 기록해보세요!
              </p>
              <Link href="/food/record">
                <Button>
                  <Camera className="w-4 h-4 mr-2" />
                  식단 기록하기
                </Button>
              </Link>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <img
                    src={log.image_url}
                    alt={log.items[0]?.foodName || '음식'}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMealTypeColor(log.meal_type)}`}>
                        {log.meal_type}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(log.created_at).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {log.items.map(item => item.foodName).join(', ')}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <p>탄수화물: {log.summary.totalCarbohydrates.value.toFixed(1)}g</p>
                        <p>단백질: {log.summary.totalProtein.value.toFixed(1)}g</p>
                        <p>지방: {log.summary.totalFat.value.toFixed(1)}g</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {log.summary.totalCalories}
                        </p>
                        <p className="text-sm text-gray-500">kcal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
