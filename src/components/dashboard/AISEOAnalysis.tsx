import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bot, Brain, Target, Search, Sparkles, TrendingUp, MessagesSquare, RotateCcw, Copy, Info, Link, Settings, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Cell, PieChart, Pie, ResponsiveContainer } from 'recharts';

export function AISEOAnalysis() {
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'google' | 'perplexity' | 'chatgpt'>('google');
  
  // Calculate AI Visibility Score
  const calculateAIVisibilityScore = () => {
    const metrics = {
      structuredData: 85, // FAQ, HowTo, Article structured data
      directAnswers: 72,  // Plain, direct answers
      nlpKeywords: 68,    // NLP keyword coverage  
      semanticDensity: 74 // Semantic density
    };
    
    const weights = {
      structuredData: 0.3,
      directAnswers: 0.25,
      nlpKeywords: 0.25,
      semanticDensity: 0.2
    };
    
    const score = Math.round(
      metrics.structuredData * weights.structuredData +
      metrics.directAnswers * weights.directAnswers +
      metrics.nlpKeywords * weights.nlpKeywords +
      metrics.semanticDensity * weights.semanticDensity
    );
    
    return { score, metrics };
  };
  
  
  const { score: aiVisibilityScore, metrics } = calculateAIVisibilityScore();
  
  // Mock entity data from last scan
  const mockEntities = [
    {
      id: 1,
      name: "SEO Analysis Tool",
      type: "Product",
      importance: 9,
      context: "Main product offering",
      suggestions: ["Add Product schema", "Create internal linking hub"]
    },
    {
      id: 2,
      name: "Artificial Intelligence",
      type: "Technology",
      importance: 8,
      context: "Core technology",
      suggestions: ["Add Technology schema", "Link to AI-related pages"]
    },
    {
      id: 3,
      name: "Website Optimization",
      type: "Service",
      importance: 7,
      context: "Primary service",
      suggestions: ["Add Service schema", "Create service landing pages"]
    },
    {
      id: 4,
      name: "Google",
      type: "Organization",
      importance: 6,
      context: "Search engine focus",
      suggestions: ["Add Organization context", "Reference in authority content"]
    },
    {
      id: 5,
      name: "Machine Learning",
      type: "Technology",
      importance: 5,
      context: "Supporting technology",
      suggestions: ["Add Technology schema", "Create ML content cluster"]
    }
  ];
  
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
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                AI Visibility Score
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-64">
                    <p className="text-sm">
                      Điểm số dựa trên: Structured data (30%), Câu trả lời trực tiếp (25%), 
                      Từ khóa NLP (25%), Mật độ semantic (20%)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Gauge Chart */}
            <div className="relative w-32 h-32 mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { value: aiVisibilityScore, fill: 'hsl(var(--primary))' },
                      { value: 100 - aiVisibilityScore, fill: 'hsl(var(--muted))' }
                    ]}
                    cx="50%"
                    cy="50%"
                    startAngle={90}
                    endAngle={-270}
                    innerRadius={35}
                    outerRadius={45}
                    dataKey="value"
                  >
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--muted))" opacity={0.2} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">{aiVisibilityScore}</div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm font-medium">
                Cơ hội nội dung của bạn được AI hiển thị trong câu trả lời: 
                <span className="text-primary font-bold"> {aiVisibilityScore}%</span>
              </p>
              <div className="flex justify-center">
                <Badge 
                  variant={aiVisibilityScore >= 80 ? "default" : aiVisibilityScore >= 60 ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {aiVisibilityScore >= 80 ? "Xuất sắc" : aiVisibilityScore >= 60 ? "Tốt" : "Cần cải thiện"}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Chi tiết điểm số:</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Structured Data</span>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.structuredData} className="w-16 h-2" />
                    <Badge variant="outline" className="text-xs">{metrics.structuredData}%</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Direct Answers</span>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.directAnswers} className="w-16 h-2" />
                    <Badge variant="outline" className="text-xs">{metrics.directAnswers}%</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>NLP Keywords</span>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.nlpKeywords} className="w-16 h-2" />
                    <Badge variant="outline" className="text-xs">{metrics.nlpKeywords}%</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Semantic Density</span>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.semanticDensity} className="w-16 h-2" />
                    <Badge variant="outline" className="text-xs">{metrics.semanticDensity}%</Badge>
                  </div>
                </div>
              </div>
            </div>

            <Button className="w-full" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Cải thiện điểm số
            </Button>
          </CardContent>
        </Card>

        {/* Entity Optimization */}
        <Card className="glass-card hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Entity Optimization
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-64">
                    <p className="text-sm">
                      Entities được AI nhận diện trong nội dung và gợi ý tối ưu hóa 
                      để tăng khả năng hiển thị trong kết quả tìm kiếm AI
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Đã phát hiện {mockEntities.length} entities chính trong nội dung của bạn
              </p>
              <Badge variant="secondary" className="text-xs">
                NLP Analysis
              </Badge>
            </div>

            {/* Entities Table */}
            <div className="border rounded-lg bg-background/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="w-[200px]">Entity</TableHead>
                    <TableHead className="w-[120px]">Type</TableHead>
                    <TableHead className="w-[100px] text-center">Score</TableHead>
                    <TableHead>Optimization Suggestions</TableHead>
                    <TableHead className="w-[100px] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEntities.map((entity) => (
                    <TableRow key={entity.id} className="border-border/30 hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                            {entity.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {entity.context}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            entity.type === 'Product' ? 'border-blue-500/50 text-blue-600' :
                            entity.type === 'Technology' ? 'border-purple-500/50 text-purple-600' :
                            entity.type === 'Service' ? 'border-green-500/50 text-green-600' :
                            'border-orange-500/50 text-orange-600'
                          }`}
                        >
                          {entity.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="text-sm font-medium">{entity.importance}</div>
                          <div className="w-8">
                            <Progress 
                              value={entity.importance * 10} 
                              className="h-1"
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {entity.suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="w-1 h-1 bg-muted-foreground rounded-full flex-shrink-0"></div>
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => toast({
                                    title: "AI Fix",
                                    description: `Đang tối ưu entity "${entity.name}"...`,
                                  })}
                                >
                                  <Wand2 className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Fix with AI</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => toast({
                                    title: "Schema Generated",
                                    description: `Schema markup cho "${entity.name}" đã được tạo.`,
                                  })}
                                >
                                  <Link className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Generate Schema</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/30">
              <div className="text-center space-y-1">
                <div className="text-lg font-bold text-blue-600">2</div>
                <div className="text-xs text-muted-foreground">Products</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-lg font-bold text-purple-600">2</div>
                <div className="text-xs text-muted-foreground">Technologies</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-lg font-bold text-green-600">1</div>
                <div className="text-xs text-muted-foreground">Services</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-lg font-bold text-orange-600">1</div>
                <div className="text-xs text-muted-foreground">Organizations</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Cấu hình entities
              </Button>
              <Button className="flex-1" variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                Tối ưu tất cả
              </Button>
            </div>
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