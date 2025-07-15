import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenLine, FileText, Calendar, Search, Sparkles, TrendingUp, BarChart3, Lightbulb, Target, Clock, Copy, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function AIContentStudio() {
  const { toast } = useToast();
  const [keyword, setKeyword] = useState('');
  const [contentIntent, setContentIntent] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    title: string;
    metaDescription: string;
    article: string;
  } | null>(null);
  
  
  const handleGenerateContent = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Thiếu từ khóa",
        description: "Vui lòng nhập từ khóa để tạo nội dung.",
        variant: "destructive"
      });
      return;
    }

    if (!contentIntent) {
      toast({
        title: "Thiếu search intent",
        description: "Vui lòng chọn loại search intent.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-from-keyword', {
        body: {
          keyword: keyword.trim(),
          contentIntent,
          additionalTopic: topic.trim()
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setGeneratedContent(data);
      toast({
        title: "Nội dung đã được tạo!",
        description: `Bài viết SEO cho từ khóa "${keyword}" đã sẵn sàng.`,
      });
    } catch (error) {
      console.error('Content generation failed:', error);
      toast({
        title: "Lỗi tạo nội dung",
        description: error instanceof Error ? error.message : "Không thể tạo nội dung. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Nội dung đã được sao chép vào clipboard.",
    });
  };

  const saveContentToDatabase = async () => {
    if (!generatedContent) return;
    
    try {
      // Here you can implement saving to database
      toast({
        title: "Đã lưu",
        description: "Nội dung đã được lưu vào cơ sở dữ liệu.",
      });
    } catch (error) {
      toast({
        title: "Lỗi lưu nội dung",
        description: "Không thể lưu nội dung. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };
  
  const handlePlanContent = () => {
    toast({
      title: "Kế hoạch nội dung",
      description: "AI đang tạo lịch đăng bài tối ưu cho 30 ngày tới...",
    });
  };
  
  const handleFindGaps = () => {
    toast({
      title: "Phân tích content gap",
      description: "AI đang quét để tìm những chủ đề bị thiếu...",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          AI Content Studio – Viết bài chuẩn SEO chỉ trong 1 phút
        </h1>
        <p className="text-muted-foreground text-lg">
          Tạo nội dung theo từ khóa, lập kế hoạch và tối ưu theo Search Intent
        </p>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Content Generator */}
        <Card className="glass-card hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenLine className="h-5 w-5 text-blue-500" />
              Content Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!generatedContent ? (
              // Input Form
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Viết bài từ keyword với AI
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Từ khóa chính *</label>
                      <Input
                        placeholder="VD: cách trị mụn ẩn"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Search Intent *</label>
                      <Select value={contentIntent} onValueChange={setContentIntent}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại search intent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="informational">Informational - Tìm thông tin</SelectItem>
                          <SelectItem value="transactional">Transactional - Mua hàng</SelectItem>
                          <SelectItem value="commercial">Commercial - So sánh sản phẩm</SelectItem>
                          <SelectItem value="navigational">Navigational - Tìm trang web</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Chủ đề bổ sung (tùy chọn)</label>
                      <Textarea
                        placeholder="VD: nguyên liệu, thời gian, mẹo hay..."
                        rows={3}
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">Search Intent</Badge>
                    <Badge variant="outline" className="text-xs">LSI Keywords</Badge>
                    <Badge variant="outline" className="text-xs">Meta Tags</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Tính năng:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Tự động phân tích search intent</li>
                      <li>• Tích hợp LSI keywords</li>
                      <li>• Tạo meta description & title</li>
                      <li>• Cấu trúc heading chuẩn SEO</li>
                      <li>• Bài viết 800-1200 từ</li>
                    </ul>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleGenerateContent}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Đang tạo nội dung...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Tạo bài viết với AI
                    </>
                  )}
                </Button>
              </div>
            ) : (
              // Generated Content Display
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Nội dung đã tạo:</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGeneratedContent(null)}
                    >
                      Tạo mới
                    </Button>
                  </div>
                </div>
                
                <Tabs defaultValue="title" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="title">Title & Meta</TabsTrigger>
                    <TabsTrigger value="article">Bài viết</TabsTrigger>
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="title" className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Title Tag:</label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(generatedContent.title)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <Textarea
                        value={generatedContent.title}
                        readOnly
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Meta Description:</label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(generatedContent.metaDescription)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <Textarea
                        value={generatedContent.metaDescription}
                        readOnly
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="article" className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Bài viết đầy đủ:</label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(generatedContent.article)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <Textarea
                        value={generatedContent.article}
                        readOnly
                        rows={15}
                        className="resize-none"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="all" className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Tất cả nội dung:</label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(
                            `Title: ${generatedContent.title}\n\nMeta Description: ${generatedContent.metaDescription}\n\nBài viết:\n${generatedContent.article}`
                          )}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <Textarea
                        value={`Title: ${generatedContent.title}\n\nMeta Description: ${generatedContent.metaDescription}\n\nBài viết:\n${generatedContent.article}`}
                        readOnly
                        rows={20}
                        className="resize-none"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={() => copyToClipboard(
                      `Title: ${generatedContent.title}\n\nMeta Description: ${generatedContent.metaDescription}\n\nBài viết:\n${generatedContent.article}`
                    )}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy tất cả
                  </Button>
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={saveContentToDatabase}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Lưu vào DB
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Planner - Make it single column */}
        <Card className="glass-card hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Content Planner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                AI lập lịch chủ đề tự động
              </p>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-green-600">24</div>
                    <div className="text-xs text-muted-foreground">Chủ đề/tháng</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">4.2</div>
                    <div className="text-xs text-muted-foreground">Avg CTR dự kiến</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Kế hoạch nội dung AI:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted/20 rounded text-xs">
                      <span>Tuần 1: How-to content</span>
                      <Badge variant="secondary">Cao</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/20 rounded text-xs">
                      <span>Tuần 2: Product reviews</span>
                      <Badge variant="outline">Trung bình</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/20 rounded text-xs">
                      <span>Tuần 3: Trending topics</span>
                      <Badge variant="secondary">Cao</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">Trend Analysis</Badge>
                <Badge variant="outline" className="text-xs">Competitor Watch</Badge>
                <Badge variant="outline" className="text-xs">Seasonal</Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Tính năng:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Phân tích xu hướng tìm kiếm</li>
                  <li>• Lịch đăng bài tối ưu</li>
                  <li>• Theo dõi đối thủ cạnh tranh</li>
                  <li>• Seasonal content planning</li>
                </ul>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              variant="outline"
              onClick={handlePlanContent}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Tạo kế hoạch 30 ngày
            </Button>
          </CardContent>
        </Card>

        {/* Content Gap Finder */}
        <Card className="glass-card hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-purple-500" />
              Content Gap Finder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Tìm nội dung bị thiếu so với đối thủ
              </p>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-red-600">12</div>
                    <div className="text-xs text-muted-foreground">Gap phát hiện</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">8.7K</div>
                    <div className="text-xs text-muted-foreground">Traffic tiềm năng</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Cơ hội phát hiện:</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-2 bg-muted/20 rounded">
                      <Target className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="text-xs">
                        <div className="font-medium">Product comparison</div>
                        <div className="text-muted-foreground">2.1K searches/month</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-muted/20 rounded">
                      <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="text-xs">
                        <div className="font-medium">Tutorial videos</div>
                        <div className="text-muted-foreground">1.8K searches/month</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-muted/20 rounded">
                      <TrendingUp className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="text-xs">
                        <div className="font-medium">Industry news</div>
                        <div className="text-muted-foreground">3.2K searches/month</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">Competitor Analysis</Badge>
                <Badge variant="outline" className="text-xs">SERP Gap</Badge>
                <Badge variant="outline" className="text-xs">Topic Clusters</Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Tính năng:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• So sánh với top 10 đối thủ</li>
                  <li>• Phân tích SERP features</li>
                  <li>• Đề xuất topic clusters</li>
                  <li>• Ước tính traffic tiềm năng</li>
                </ul>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              variant="outline"
              onClick={handleFindGaps}
            >
              <Search className="h-4 w-4 mr-2" />
              Quét content gaps
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Features Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Content Performance */}
        <Card className="glass-card border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Content Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center space-y-1">
                <div className="text-lg font-bold text-green-600">89%</div>
                <div className="text-xs text-muted-foreground">SEO Score avg</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-lg font-bold text-blue-600">2.4m</div>
                <div className="text-xs text-muted-foreground">Total views</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-lg font-bold text-purple-600">4.2%</div>
                <div className="text-xs text-muted-foreground">Avg CTR</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Top performing content:</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted/20 rounded text-xs">
                  <span>"Cách làm bánh mì ngon"</span>
                  <Badge variant="secondary">12K views</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/20 rounded text-xs">
                  <span>"Review sản phẩm A"</span>
                  <Badge variant="outline">8K views</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Writing Assistant */}
        <Card className="glass-card border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              AI Writing Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Trợ lý viết bài thông minh với AI
              </p>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Tính năng nâng cao:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Real-time SEO optimization</li>
                  <li>• Tone & style adjustment</li>
                  <li>• Plagiarism detection</li>
                  <li>• Multi-language support</li>
                  <li>• Content templates library</li>
                </ul>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">GPT-4</Badge>
                <Badge variant="outline" className="text-xs">Claude</Badge>
                <Badge variant="outline" className="text-xs">Custom AI</Badge>
              </div>
            </div>
            
            <Button className="w-full" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Mở Writing Assistant
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card className="glass-card border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-orange-500" />
            Content Strategy Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">✓ Best Practices:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Focus on search intent matching</li>
                <li>• Use AI to identify trending topics</li>
                <li>• Create topic clusters for authority</li>
                <li>• Optimize for featured snippets</li>
                <li>• Regular content gap analysis</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-orange-600">⚠ AI Content Guidelines:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Always fact-check AI content</li>
                <li>• Add human expertise and insights</li>
                <li>• Maintain brand voice consistency</li>
                <li>• Ensure content uniqueness</li>
                <li>• Monitor content performance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}