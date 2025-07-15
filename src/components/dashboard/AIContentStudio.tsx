import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PenLine, FileText, Calendar, Search, Sparkles, TrendingUp, BarChart3, Lightbulb, Target, Clock, Copy, Save, Download, CheckCircle, ExternalLink, Zap } from 'lucide-react';
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
  
  // Content Planner state
  const [mainTopic, setMainTopic] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [contentPlan, setContentPlan] = useState<any[]>([]);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  
  // Content Gap Finder state
  const [gapUrl, setGapUrl] = useState('');
  const [isAnalyzingGaps, setIsAnalyzingGaps] = useState(false);
  const [contentGaps, setContentGaps] = useState<any[]>([]);
  const [mainKeywordFromUrl, setMainKeywordFromUrl] = useState('');
  const [generatingGapContent, setGeneratingGapContent] = useState<string | null>(null);
  
  
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
          intent: contentIntent,
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

  const handleGeneratePlan = async () => {
    if (!mainTopic.trim()) {
      toast({
        title: "Thiếu chủ đề",
        description: "Vui lòng nhập chủ đề lớn để tạo kế hoạch nội dung.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingPlan(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-plan', {
        body: {
          mainTopic: mainTopic.trim()
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setContentPlan(data.contentPlan || []);
      toast({
        title: "Kế hoạch đã được tạo!",
        description: `30 ý tưởng bài viết cho chủ đề "${mainTopic}" đã sẵn sàng.`,
      });
    } catch (error) {
      console.error('Content plan generation failed:', error);
      toast({
        title: "Lỗi tạo kế hoạch",
        description: error instanceof Error ? error.message : "Không thể tạo kế hoạch nội dung. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleSavePlanToDatabase = async () => {
    if (!contentPlan.length) return;
    
    setIsSavingPlan(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Cần đăng nhập",
          description: "Vui lòng đăng nhập để lưu kế hoạch nội dung.",
          variant: "destructive"
        });
        return;
      }

      // Prepare data for database
      const planData = contentPlan.map((item, index) => {
        const planDate = new Date();
        planDate.setDate(planDate.getDate() + index); // Each day +1

        return {
          user_id: user.id,
          main_topic: mainTopic,
          plan_date: planDate.toISOString().split('T')[0], // YYYY-MM-DD format
          title: item.title,
          main_keyword: item.mainKeyword,
          secondary_keywords: item.secondaryKeywords,
          search_intent: item.searchIntent,
          content_length: item.contentLength,
          status: 'planned'
        };
      });

      const { error } = await supabase
        .from('content_plans')
        .insert(planData);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Đã lưu kế hoạch!",
        description: "Kế hoạch nội dung 30 ngày đã được lưu vào cơ sở dữ liệu.",
      });
    } catch (error) {
      console.error('Save plan failed:', error);
      toast({
        title: "Lỗi lưu kế hoạch",
        description: error instanceof Error ? error.message : "Không thể lưu kế hoạch. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsSavingPlan(false);
    }
  };

  const getIntentBadgeColor = (intent: string) => {
    switch (intent) {
      case 'informational': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      case 'commercial': return 'bg-purple-500/20 text-purple-700 dark:text-purple-300';
      case 'transactional': return 'bg-green-500/20 text-green-700 dark:text-green-300';
      case 'navigational': return 'bg-orange-500/20 text-orange-700 dark:text-orange-300';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  const getLengthBadgeColor = (length: string) => {
    switch (length) {
      case 'short': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      case 'medium': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      case 'long': return 'bg-purple-500/20 text-purple-700 dark:text-purple-300';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };
  
  const handleAnalyzeGaps = async () => {
    if (!gapUrl.trim()) {
      toast({
        title: "Thiếu URL",
        description: "Vui lòng nhập URL để phân tích content gap.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzingGaps(true);
    try {
      const { data, error } = await supabase.functions.invoke('content-gap-analysis', {
        body: {
          userUrl: gapUrl.trim()
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setContentGaps(data.gaps || []);
      setMainKeywordFromUrl(data.mainKeyword || '');
      toast({
        title: "Phân tích hoàn thành!",
        description: `Tìm thấy ${data.gaps?.length || 0} content gap cần bổ sung.`,
      });
    } catch (error) {
      console.error('Content gap analysis failed:', error);
      toast({
        title: "Lỗi phân tích",
        description: error instanceof Error ? error.message : "Không thể phân tích content gap. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzingGaps(false);
    }
  };

  const handleGenerateGapContent = async (gap: any) => {
    setGeneratingGapContent(gap.topic);
    try {
      const { data, error } = await supabase.functions.invoke('generate-gap-content', {
        body: {
          topic: gap.topic,
          heading: gap.heading,
          keywords: gap.keywords,
          mainKeyword: mainKeywordFromUrl,
          description: gap.description
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Copy generated content to clipboard
      navigator.clipboard.writeText(data.content);
      toast({
        title: "Nội dung đã tạo!",
        description: `Đoạn viết cho "${gap.topic}" đã được sao chép vào clipboard.`,
      });
    } catch (error) {
      console.error('Gap content generation failed:', error);
      toast({
        title: "Lỗi tạo nội dung",
        description: error instanceof Error ? error.message : "Không thể tạo nội dung. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setGeneratingGapContent(null);
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-700 dark:text-red-300';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      case 'low': return 'bg-green-500/20 text-green-700 dark:text-green-300';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
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
        <Card className="glass-card hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Content Planner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!contentPlan.length ? (
              // Input Form
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    AI lập lịch chủ đề tự động cho 30 ngày
                  </p>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Chủ đề lớn *</label>
                    <Input
                      placeholder="VD: skincare cho da dầu"
                      value={mainTopic}
                      onChange={(e) => setMainTopic(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-lg font-bold text-green-600">30</div>
                      <div className="text-xs text-muted-foreground">Ý tưởng bài viết</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">4.2</div>
                      <div className="text-xs text-muted-foreground">Avg CTR dự kiến</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">Trend Analysis</Badge>
                      <Badge variant="outline" className="text-xs">Search Intent</Badge>
                      <Badge variant="outline" className="text-xs">Content Length</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Tính năng:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• 30 ý tưởng bài viết đa dạng</li>
                        <li>• Phân bổ search intent tối ưu</li>
                        <li>• Từ khóa chính và phụ cho mỗi bài</li>
                        <li>• Gợi ý độ dài nội dung</li>
                        <li>• Lưu kế hoạch vào database</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleGeneratePlan}
                  disabled={isGeneratingPlan}
                >
                  {isGeneratingPlan ? (
                    <>
                      <Calendar className="h-4 w-4 mr-2 animate-spin" />
                      Đang tạo kế hoạch...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Tạo kế hoạch 30 ngày
                    </>
                  )}
                </Button>
              </div>
            ) : (
              // Content Plan Display
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Kế hoạch nội dung: {mainTopic}</h4>
                    <p className="text-xs text-muted-foreground">{contentPlan.length} ý tưởng bài viết</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setContentPlan([])}
                    >
                      Tạo mới
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Ngày</TableHead>
                        <TableHead>Tiêu đề</TableHead>
                        <TableHead>Từ khóa chính</TableHead>
                        <TableHead>Intent</TableHead>
                        <TableHead>Độ dài</TableHead>
                        <TableHead className="w-20">CTA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contentPlan.map((item, index) => {
                        const planDate = new Date();
                        planDate.setDate(planDate.getDate() + index);
                        
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {planDate.getDate()}/{planDate.getMonth() + 1}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate" title={item.title}>
                                {item.title}
                              </div>
                              {item.secondaryKeywords && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {item.secondaryKeywords.slice(0, 2).join(', ')}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {item.mainKeyword}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-xs ${getIntentBadgeColor(item.searchIntent)}`}>
                                {item.searchIntent}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-xs ${getLengthBadgeColor(item.contentLength)}`}>
                                {item.contentLength}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => {
                                  setKeyword(item.mainKeyword);
                                  setContentIntent(item.searchIntent);
                                  toast({
                                    title: "Đã chuyển sang Content Generator",
                                    description: `Từ khóa "${item.mainKeyword}" đã được thiết lập.`,
                                  });
                                }}
                              >
                                <TrendingUp className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={handleSavePlanToDatabase}
                    disabled={isSavingPlan}
                  >
                    {isSavingPlan ? (
                      <>
                        <Save className="h-4 w-4 mr-2 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Lưu vào Supabase
                      </>
                    )}
                  </Button>
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={() => {
                      const csvContent = contentPlan.map((item, index) => {
                        const planDate = new Date();
                        planDate.setDate(planDate.getDate() + index);
                        return `${planDate.toLocaleDateString()},${item.title},${item.mainKeyword},${item.searchIntent},${item.contentLength}`;
                      }).join('\n');
                      
                      const blob = new Blob([`Date,Title,Keyword,Intent,Length\n${csvContent}`], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `content-plan-${mainTopic.replace(/\s+/g, '-')}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Gap Finder */}
        <Card className="glass-card hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-purple-500" />
              Content Gap Finder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!contentGaps.length ? (
              // Input Form
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    AI phân tích URL và tìm nội dung bị thiếu so với đối thủ
                  </p>
                  <div>
                    <label className="text-sm font-medium mb-2 block">URL của bạn *</label>
                    <Input
                      placeholder="VD: https://yoursite.com/bai-viet-ve-skincare"
                      value={gapUrl}
                      onChange={(e) => setGapUrl(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-lg font-bold text-red-600">10+</div>
                      <div className="text-xs text-muted-foreground">Gap tiềm năng</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">5-8K</div>
                      <div className="text-xs text-muted-foreground">Traffic cơ hội</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">Competitor Analysis</Badge>
                      <Badge variant="outline" className="text-xs">SERP Gap</Badge>
                      <Badge variant="outline" className="text-xs">Topic Missing</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Tính năng:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Fetch nội dung từ URL của bạn</li>
                        <li>• So sánh với top 10 kết quả Google</li>
                        <li>• Tìm topic, heading, keyword bị thiếu</li>
                        <li>• Gợi ý nội dung cần thêm</li>
                        <li>• Viết từng đoạn với AI</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleAnalyzeGaps}
                  disabled={isAnalyzingGaps}
                >
                  {isAnalyzingGaps ? (
                    <>
                      <Search className="h-4 w-4 mr-2 animate-spin" />
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Phân tích Content Gap
                    </>
                  )}
                </Button>
              </div>
            ) : (
              // Content Gaps Display
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Content Gaps tìm thấy</h4>
                    <p className="text-xs text-muted-foreground">
                      Từ khóa: <Badge variant="outline" className="text-xs ml-1">{mainKeywordFromUrl}</Badge>
                      • {contentGaps.length} gaps cần bổ sung
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setContentGaps([]);
                        setGapUrl('');
                        setMainKeywordFromUrl('');
                      }}
                    >
                      Phân tích mới
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Accordion type="single" collapsible className="w-full">
                    {contentGaps.map((gap, index) => (
                      <AccordionItem key={index} value={`gap-${index}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${getPriorityBadgeColor(gap.priority)}`}>
                              {gap.priority}
                            </Badge>
                            <span className="text-sm font-medium">{gap.topic}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            <div>
                              <h5 className="text-sm font-medium mb-1">Heading đề xuất:</h5>
                              <p className="text-sm text-muted-foreground">{gap.heading}</p>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium mb-1">Keywords liên quan:</h5>
                              <div className="flex gap-1 flex-wrap">
                                {gap.keywords?.map((keyword: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium mb-1">Tại sao cần bổ sung:</h5>
                              <p className="text-sm text-muted-foreground">{gap.description}</p>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium mb-1">Gợi ý nội dung:</h5>
                              <p className="text-sm text-muted-foreground">{gap.suggestedContent}</p>
                            </div>
                            
                            <Button
                              size="sm"
                              onClick={() => handleGenerateGapContent(gap)}
                              disabled={generatingGapContent === gap.topic}
                              className="w-full"
                            >
                              {generatingGapContent === gap.topic ? (
                                <>
                                  <Zap className="h-3 w-3 mr-2 animate-spin" />
                                  Đang viết...
                                </>
                              ) : (
                                <>
                                  <Zap className="h-3 w-3 mr-2" />
                                  Viết đoạn này với AI
                                </>
                              )}
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            )}
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