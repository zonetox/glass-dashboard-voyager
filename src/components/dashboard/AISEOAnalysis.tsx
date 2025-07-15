import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Bot, Brain, Target, Search, Sparkles, TrendingUp } from 'lucide-react';

export function AISEOAnalysis() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          AI SEO Search Optimization
        </h1>
        <p className="text-muted-foreground text-lg">
          Chuẩn hóa nội dung để được AI trích dẫn trên Google SGE, Perplexity, ChatGPT,...
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* AI Answer Simulation */}
        <Card className="glass-card hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-500" />
              AI Answer Simulation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Preview câu trả lời AI:
                  </p>
                  <div className="bg-background/80 p-3 rounded border text-sm">
                    "Theo <strong>website của bạn</strong>, tính năng này giúp tối ưu nội dung để AI có thể trích dẫn chính xác..."
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    SGE Ready
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Khả năng được trích dẫn
              </p>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-muted-foreground">
                75% - Cần cải thiện cấu trúc dữ liệu
              </p>
            </div>

            <Button className="w-full" variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Phân tích nội dung
            </Button>
          </CardContent>
        </Card>

        {/* AI Visibility Score */}
        <Card className="glass-card hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              AI Visibility Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Gauge Chart Simulation */}
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                  className="opacity-20"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeDasharray={`${68 * 2.83} ${282.74 - 68 * 2.83}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">68</div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span>ChatGPT Readiness</span>
                <Badge variant="secondary">72%</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>SGE Compatibility</span>
                <Badge variant="secondary">65%</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Perplexity Index</span>
                <Badge variant="secondary">71%</Badge>
              </div>
            </div>

            <Button className="w-full" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Cải thiện điểm số
            </Button>
          </CardContent>
        </Card>

        {/* Entity Optimization */}
        <Card className="glass-card hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Entity Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Semantic Map Simulation */}
            <div className="relative h-32 bg-muted/20 rounded-lg border border-border/30 overflow-hidden">
              <div className="absolute inset-0 p-3">
                <div className="grid grid-cols-3 gap-2 h-full">
                  <div className="space-y-2">
                    <div className="h-4 bg-primary/30 rounded animate-pulse"></div>
                    <div className="h-3 bg-blue-500/20 rounded"></div>
                    <div className="h-3 bg-green-500/20 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 bg-purple-500/30 rounded"></div>
                    <div className="h-2 bg-orange-500/20 rounded"></div>
                    <div className="h-4 bg-pink-500/20 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-cyan-500/20 rounded"></div>
                    <div className="h-5 bg-red-500/20 rounded"></div>
                    <div className="h-2 bg-yellow-500/20 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-2 right-2">
                <Badge variant="outline" className="text-xs bg-background/80">
                  Entity Map
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Entities được phát hiện:</h4>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">SEO Tool</Badge>
                <Badge variant="secondary" className="text-xs">AI Analysis</Badge>
                <Badge variant="secondary" className="text-xs">Web Optimization</Badge>
                <Badge variant="outline" className="text-xs">+12 more</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Semantic completeness
              </p>
              <Progress value={82} className="h-2" />
              <p className="text-xs text-muted-foreground">
                82% - Entities được kết nối tốt
              </p>
            </div>

            <Button className="w-full" variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              Tối ưu entities
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info Section */}
      <Card className="glass-card border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-indigo-500" />
            AI Search Engine Optimization Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">✓ Được khuyến nghị:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Sử dụng structured data (JSON-LD)</li>
                <li>• Tạo nội dung FAQ với câu trả lời súc tích</li>
                <li>• Tối ưu featured snippets</li>
                <li>• Xây dựng entities mạnh mẽ</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-orange-600">⚠ Cần cải thiện:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Tránh nội dung quá phức tạp</li>
                <li>• Giảm thiểu duplicate content</li>
                <li>• Cải thiện semantic relationships</li>
                <li>• Tăng cường E-A-T signals</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}