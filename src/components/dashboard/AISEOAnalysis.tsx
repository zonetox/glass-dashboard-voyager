import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Bot, Brain, Target, Search, Sparkles, TrendingUp, MessagesSquare, RotateCcw, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AISEOAnalysis() {
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'google' | 'perplexity' | 'chatgpt'>('google');
  
  // Mock data from last scan
  const mockScanData = {
    h1: "AI-Powered SEO Analysis Tool - Optimize Your Website Rankings",
    paragraphs: [
      "Our advanced SEO analysis tool uses artificial intelligence to identify optimization opportunities and improve your website's search engine visibility.",
      "With real-time scanning and automated recommendations, you can fix SEO issues faster than ever before."
    ],
    faqs: [
      {
        question: "How does AI SEO analysis work?",
        answer: "Our tool crawls your website, analyzes content structure, and uses machine learning to identify SEO improvements."
      },
      {
        question: "What makes this different from other SEO tools?",
        answer: "We provide AI-generated content suggestions and automated optimization workflows that save time."
      }
    ]
  };

  const aiAnswerVariations = {
    google: {
      text: "Dựa trên **AI-Powered SEO Analysis Tool**, đây là công cụ phân tích SEO sử dụng trí tuệ nhân tạo để **tối ưu hóa thứ hạng website**. Công cụ này hoạt động bằng cách **quét website, phân tích cấu trúc nội dung** và sử dụng machine learning để xác định cơ hội cải thiện SEO. Điểm khác biệt là khả năng **đưa ra gợi ý nội dung tự động** và quy trình tối ưu hóa tiết kiệm thời gian.",
      source: "seoautotool.com",
      confidence: "89%"
    },
    perplexity: {
      text: "**AI-Powered SEO Analysis Tool** là giải pháp tối ưu hóa website sử dụng AI để **cải thiện thứ hạng tìm kiếm**. Công cụ này thực hiện **quét thời gian thực và đưa ra khuyến nghị tự động**, giúp sửa lỗi SEO nhanh hơn bao giờ hết. Tính năng nổi bật là **machine learning phân tích cấu trúc nội dung** và tạo ra quy trình tối ưu hóa tự động.",
      source: "Từ phân tích website",
      confidence: "92%"
    },
    chatgpt: {
      text: "Công cụ **AI-Powered SEO Analysis** sử dụng trí tuệ nhân tạo để **tối ưu hóa thứ hạng website**. Hệ thống hoạt động bằng cách **quét và phân tích cấu trúc nội dung**, sau đó áp dụng machine learning để **xác định cơ hội cải thiện SEO**. Điểm mạnh là khả năng **tự động hóa quy trình tối ưu** và đưa ra gợi ý nội dung thông minh.",
      source: "Dựa trên dữ liệu đã huấn luyện",
      confidence: "87%"
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    // Simulate AI regeneration
    setTimeout(() => {
      setIsRegenerating(false);
      toast({
        title: "Đã tạo lại câu trả lời",
        description: "AI đã phân tích và tạo ra phiên bản mới.",
      });
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Nội dung đã được sao chép vào clipboard.",
    });
  };

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
        
        {/* AI Answer Simulation - Enhanced */}
        <Card className="glass-card hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessagesSquare className="h-5 w-5 text-blue-500" />
              AI Answer Simulation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Platform Selector */}
            <div className="flex gap-2 mb-4">
              {(['google', 'perplexity', 'chatgpt'] as const).map((platform) => (
                <Button
                  key={platform}
                  variant={selectedPlatform === platform ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPlatform(platform)}
                  className="text-xs"
                >
                  {platform === 'google' && 'Google SGE'}
                  {platform === 'perplexity' && 'Perplexity'}
                  {platform === 'chatgpt' && 'ChatGPT'}
                </Button>
              ))}
            </div>

            {/* AI Answer Preview */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessagesSquare className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {selectedPlatform === 'google' && 'Google SGE trả lời:'}
                      {selectedPlatform === 'perplexity' && 'Perplexity AI:'}
                      {selectedPlatform === 'chatgpt' && 'ChatGPT phản hồi:'}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(aiAnswerVariations[selectedPlatform].text)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="h-6 w-6 p-0"
                      >
                        <RotateCcw className={`h-3 w-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-background/80 p-3 rounded border text-sm leading-relaxed">
                    <div 
                      className="ai-answer-text"
                      dangerouslySetInnerHTML={{ 
                        __html: aiAnswerVariations[selectedPlatform].text.replace(/\*\*(.*?)\*\*/g, '<mark class="bg-yellow-200/50 dark:bg-yellow-500/20 px-1 rounded">$1</mark>')
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Nguồn: {aiAnswerVariations[selectedPlatform].source}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Độ tin cậy: {aiAnswerVariations[selectedPlatform].confidence}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Source Content Analysis */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Nội dung gốc được trích xuất:</h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="p-2 bg-muted/20 rounded border-l-2 border-blue-500">
                  <span className="text-muted-foreground">H1:</span> {mockScanData.h1}
                </div>
                <div className="p-2 bg-muted/20 rounded border-l-2 border-green-500">
                  <span className="text-muted-foreground">Đoạn văn:</span> {mockScanData.paragraphs[0]}
                </div>
                <div className="p-2 bg-muted/20 rounded border-l-2 border-purple-500">
                  <span className="text-muted-foreground">FAQ:</span> {mockScanData.faqs[0].answer}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Khả năng được trích dẫn
              </p>
              <Progress value={parseInt(aiAnswerVariations[selectedPlatform].confidence)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {aiAnswerVariations[selectedPlatform].confidence} - Tối ưu cho {selectedPlatform.toUpperCase()}
              </p>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Phân tích nội dung
              </Button>
              <Button 
                className="flex-1" 
                variant="outline"
                onClick={handleRegenerate}
                disabled={isRegenerating}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isRegenerating ? 'Đang tạo...' : 'Tạo biến thể'}
              </Button>
            </div>
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