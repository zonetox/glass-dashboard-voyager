import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, Target, LineChart, Sparkles, Shield } from "lucide-react";

export function PredictiveDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          AI Predictive SEO – Dự đoán biến động thứ hạng & xu hướng
        </h2>
        <p className="text-muted-foreground">
          Công cụ AI dự đoán thứ hạng từ khóa, search trend và rủi ro SEO
        </p>
      </div>

      {/* Three Main Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Keyword Ranking Forecast */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Keyword Ranking Forecast
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Dự đoán thứ hạng từ khóa trong 3-6 tháng tới
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div>
                  <div className="font-medium">Target Keywords</div>
                  <div className="text-xs text-muted-foreground">24 từ khóa theo dõi</div>
                </div>
                <Target className="h-4 w-4 text-primary" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <div>
                  <div className="font-medium text-green-700 dark:text-green-400">Trending Up</div>
                  <div className="text-xs text-muted-foreground">12 từ khóa có xu hướng tăng</div>
                </div>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                <div>
                  <div className="font-medium text-yellow-700 dark:text-yellow-400">Stable</div>
                  <div className="text-xs text-muted-foreground">8 từ khóa ổn định</div>
                </div>
                <LineChart className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            
            <div className="pt-2">
              <button className="w-full text-sm bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md transition-colors">
                Xem chi tiết dự đoán
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Trend Momentum Detector */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Trend Momentum Detector
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Phát hiện xu hướng tìm kiếm và cơ hội từ khóa mới
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                <div>
                  <div className="font-medium text-blue-700 dark:text-blue-400">Hot Trends</div>
                  <div className="text-xs text-muted-foreground">5 xu hướng đang nóng</div>
                </div>
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                <div>
                  <div className="font-medium text-purple-700 dark:text-purple-400">Emerging Keywords</div>
                  <div className="text-xs text-muted-foreground">18 từ khóa tiềm năng mới</div>
                </div>
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-indigo-500/10 rounded-lg">
                <div>
                  <div className="font-medium text-indigo-700 dark:text-indigo-400">Seasonal Patterns</div>
                  <div className="text-xs text-muted-foreground">3 mùa vụ được phát hiện</div>
                </div>
                <LineChart className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
            
            <div className="pt-2">
              <button className="w-full text-sm bg-blue-500 text-white hover:bg-blue-600 py-2 px-4 rounded-md transition-colors">
                Khám phá xu hướng
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Risk Warning System */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-red-500" />
              Risk Warning System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Cảnh báo sớm về rủi ro SEO và biến động thuật toán
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                <div>
                  <div className="font-medium text-red-700 dark:text-red-400">High Risk</div>
                  <div className="text-xs text-muted-foreground">2 từ khóa có nguy cơ giảm rank</div>
                </div>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg">
                <div>
                  <div className="font-medium text-orange-700 dark:text-orange-400">Medium Risk</div>
                  <div className="text-xs text-muted-foreground">6 từ khóa cần theo dõi</div>
                </div>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <div>
                  <div className="font-medium text-green-700 dark:text-green-400">Safe Zone</div>
                  <div className="text-xs text-muted-foreground">16 từ khóa an toàn</div>
                </div>
                <Shield className="h-4 w-4 text-green-600" />
              </div>
            </div>
            
            <div className="pt-2">
              <button className="w-full text-sm bg-red-500 text-white hover:bg-red-600 py-2 px-4 rounded-md transition-colors">
                Xem cảnh báo chi tiết
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}