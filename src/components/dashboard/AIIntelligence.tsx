import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Network, 
  MousePointer, 
  Lightbulb, 
  TrendingUp, 
  Users,
  Target,
  ArrowRight,
  Sparkles,
  Eye,
  CheckCircle2,
  Info,
  Navigation,
  ShoppingCart,
  Briefcase,
  Filter
} from "lucide-react";
import IntentCoverageChart from './IntentCoverageChart';

interface TopicNode {
  id: string;
  label: string;
  type: 'main' | 'sub' | 'related';
  size: number;
  connections: string[];
  suggestedContent: {
    title: string;
    content: string;
    keywords: string[];
    intent: string;
  };
}

interface SemanticTopicMapProps {
  topics: TopicNode[];
  className?: string;
}

interface ContentIntent {
  id: string;
  content_id: string;
  intent_type: 'informational' | 'navigational' | 'transactional' | 'commercial';
  confidence: number;
  generated_at: string;
}

interface ContentWithIntent {
  id: string;
  url: string;
  intent_type: string;
  confidence: number;
  created_at: string;
}

interface AIIntelligenceProps {
  className?: string;
  scanData?: any;
}

export default function AIIntelligence({ className, scanData }: AIIntelligenceProps) {
  const [selectedTopic, setSelectedTopic] = useState<TopicNode | null>(null);
  const [activeTab, setActiveTab] = useState('map');
  const [contentIntent, setContentIntent] = useState<ContentIntent | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [contentWithIntent, setContentWithIntent] = useState<ContentWithIntent[]>([]);
  const [selectedIntentFilter, setSelectedIntentFilter] = useState<string>('all');
  const [loadingContent, setLoadingContent] = useState(false);
  const { toast } = useToast();

  // Fetch intent classification on component mount
  useEffect(() => {
    if (scanData?.id) {
      fetchContentIntent(scanData.id);
    }
    fetchAllContentWithIntent();
  }, [scanData?.id]);

  // Fetch content when filter changes
  useEffect(() => {
    fetchAllContentWithIntent();
  }, [selectedIntentFilter]);

  const fetchContentIntent = async (contentId: string) => {
    try {
      const { data, error } = await supabase
        .from('content_intent')
        .select('*')
        .eq('content_id', contentId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setContentIntent(data as ContentIntent);
      }
    } catch (error) {
      console.error('Error fetching intent:', error);
    }
  };

  const fetchAllContentWithIntent = async () => {
    try {
      setLoadingContent(true);
      
      let query = supabase
        .from('content_intent')
        .select(`
          id,
          content_id,
          intent_type,
          confidence,
          created_at,
          scans!inner(url)
        `)
        .order('created_at', { ascending: false });

      if (selectedIntentFilter !== 'all') {
        query = query.eq('intent_type', selectedIntentFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedData = data?.map(item => ({
        id: item.content_id,
        url: (item as any).scans.url,
        intent_type: item.intent_type,
        confidence: item.confidence,
        created_at: item.created_at
      })) || [];

      setContentWithIntent(formattedData);
    } catch (error) {
      console.error('Error fetching content with intent:', error);
      setContentWithIntent([]);
    } finally {
      setLoadingContent(false);
    }
  };

  const classifyIntent = async () => {
    if (!scanData?.id) {
      toast({
        title: "Lỗi",
        description: "Không có dữ liệu scan để phân tích",
        variant: "destructive"
      });
      return;
    }

    setIsClassifying(true);
    try {
      // Extract content from scan data
      const content = scanData?.seo?.content || scanData?.ai_analysis?.content || '';
      
      if (!content) {
        throw new Error('Không tìm thấy nội dung để phân tích');
      }

      const { data, error } = await supabase.functions.invoke('classify-intent', {
        body: {
          content_id: scanData.id,
          content: content
        }
      });

      if (error) throw error;

      setContentIntent({
        id: data.stored_id,
        content_id: scanData.id,
        intent_type: data.intent_type,
        confidence: data.confidence,
        generated_at: new Date().toISOString()
      });

      toast({
        title: "Phân tích hoàn thành",
        description: `Phân loại intent: ${data.intent_type} (${Math.round(data.confidence * 100)}% confidence)`
      });

    } catch (error) {
      console.error('Intent classification error:', error);
      toast({
        title: "Lỗi phân tích",
        description: error.message || "Không thể phân tích intent",
        variant: "destructive"
      });
    } finally {
      setIsClassifying(false);
    }
  };

  const getIntentIcon = (intentType: string) => {
    switch (intentType) {
      case 'informational': return Info;
      case 'navigational': return Navigation;
      case 'transactional': return ShoppingCart;
      case 'commercial': return Briefcase;
      default: return Brain;
    }
  };

  const getIntentColor = (intentType: string) => {
    switch (intentType) {
      case 'informational': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'navigational': return 'bg-green-100 text-green-700 border-green-200';
      case 'transactional': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'commercial': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getIntentDescription = (intentType: string) => {
    switch (intentType) {
      case 'informational': return 'Cung cấp thông tin, giải đáp câu hỏi';
      case 'navigational': return 'Tìm kiếm website, thương hiệu cụ thể';
      case 'transactional': return 'Thực hiện hành động: mua, đăng ký, tải';
      case 'commercial': return 'So sánh sản phẩm, đánh giá, hướng dẫn mua';
      default: return 'Chưa phân loại';
    }
  };

  // Mock semantic topic data
  const semanticTopics: TopicNode[] = [
    {
      id: 'main-1',
      label: 'SEO Optimization',
      type: 'main',
      size: 100,
      connections: ['sub-1', 'sub-2', 'related-1'],
      suggestedContent: {
        title: 'Complete SEO Optimization Guide',
        content: 'Comprehensive guide covering on-page, off-page, and technical SEO strategies for maximum search engine visibility.',
        keywords: ['SEO optimization', 'search engine ranking', 'website optimization'],
        intent: 'informational'
      }
    },
    {
      id: 'sub-1',
      label: 'On-Page SEO',
      type: 'sub',
      size: 80,
      connections: ['main-1', 'related-2', 'related-3'],
      suggestedContent: {
        title: 'Master On-Page SEO Techniques',
        content: 'Learn how to optimize your website pages for better search rankings with proper title tags, meta descriptions, and content structure.',
        keywords: ['on-page SEO', 'title optimization', 'meta tags'],
        intent: 'informational'
      }
    },
    {
      id: 'sub-2',
      label: 'Technical SEO',
      type: 'sub',
      size: 75,
      connections: ['main-1', 'related-4'],
      suggestedContent: {
        title: 'Technical SEO Best Practices',
        content: 'Optimize your website\'s technical foundation with proper site structure, page speed, and mobile responsiveness.',
        keywords: ['technical SEO', 'site speed', 'mobile optimization'],
        intent: 'informational'
      }
    },
    {
      id: 'related-1',
      label: 'Keyword Research',
      type: 'related',
      size: 60,
      connections: ['main-1', 'sub-1'],
      suggestedContent: {
        title: 'Advanced Keyword Research Strategies',
        content: 'Discover high-value keywords that your competitors are missing using AI-powered research tools.',
        keywords: ['keyword research', 'search intent', 'keyword analysis'],
        intent: 'commercial'
      }
    },
    {
      id: 'related-2',
      label: 'Content Strategy',
      type: 'related',
      size: 65,
      connections: ['sub-1', 'related-3'],
      suggestedContent: {
        title: 'AI-Driven Content Strategy',
        content: 'Create content that ranks higher with AI-assisted topic research and semantic optimization.',
        keywords: ['content strategy', 'semantic SEO', 'AI content'],
        intent: 'commercial'
      }
    },
    {
      id: 'related-3',
      label: 'Link Building',
      type: 'related',
      size: 55,
      connections: ['sub-1', 'related-2'],
      suggestedContent: {
        title: 'Modern Link Building Techniques',
        content: 'Build high-quality backlinks that improve your domain authority and search rankings.',
        keywords: ['link building', 'backlinks', 'domain authority'],
        intent: 'commercial'
      }
    },
    {
      id: 'related-4',
      label: 'Core Web Vitals',
      type: 'related',
      size: 50,
      connections: ['sub-2'],
      suggestedContent: {
        title: 'Optimize Core Web Vitals',
        content: 'Improve your website\'s user experience metrics that Google uses for ranking.',
        keywords: ['core web vitals', 'page speed', 'user experience'],
        intent: 'informational'
      }
    }
  ];

  const getTopicColor = (type: string) => {
    switch (type) {
      case 'main': return 'bg-blue-500';
      case 'sub': return 'bg-green-500';
      case 'related': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getTopicSize = (size: number) => {
    if (size >= 80) return 'w-24 h-24 text-sm';
    if (size >= 60) return 'w-20 h-20 text-xs';
    return 'w-16 h-16 text-xs';
  };

  const handleTopicClick = (topic: TopicNode) => {
    setSelectedTopic(topic);
  };

  // SEO Comparison data
  const seoComparison = {
    traditional: {
      title: 'Traditional SEO',
      metrics: [
        { label: 'Keyword Density', value: '2.5%', status: 'good' },
        { label: 'Meta Tags', value: 'Optimized', status: 'good' },
        { label: 'Page Speed', value: '3.2s', status: 'warning' },
        { label: 'Mobile Score', value: '72/100', status: 'warning' },
        { label: 'Backlinks', value: '156', status: 'good' }
      ]
    },
    ai: {
      title: 'AI-Enhanced SEO',
      metrics: [
        { label: 'Semantic Match', value: '94%', status: 'excellent' },
        { label: 'Intent Alignment', value: '88%', status: 'excellent' },
        { label: 'Content Quality', value: '91/100', status: 'excellent' },
        { label: 'User Experience', value: '96/100', status: 'excellent' },
        { label: 'E-A-T Score', value: '89/100', status: 'excellent' }
      ]
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 dark:bg-green-950/20';
      case 'good': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20';
      case 'warning': return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">🧠 AI Intelligence</h2>
          <p className="text-muted-foreground mt-1">
            Khám phá semantic topic map và so sánh SEO thông minh
          </p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <Sparkles className="h-3 w-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      {/* Intent Classification Section */}
      {scanData && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Phân loại Intent
              </div>
              <Button 
                onClick={classifyIntent} 
                disabled={isClassifying}
                size="sm"
                variant="outline"
              >
                {isClassifying ? 'Đang phân tích...' : 'Phân tích Intent'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contentIntent ? (
              <div className="flex items-center gap-4">
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getIntentColor(contentIntent.intent_type)}`}>
                  {React.createElement(getIntentIcon(contentIntent.intent_type), { className: "h-4 w-4" })}
                  <span className="font-medium capitalize">{contentIntent.intent_type}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Confidence: {Math.round(contentIntent.confidence * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {getIntentDescription(contentIntent.intent_type)}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Chưa có dữ liệu phân loại intent. Nhấn "Phân tích Intent" để bắt đầu.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Semantic Topic Map
          </TabsTrigger>
          <TabsTrigger value="intent" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Search Intent Map
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            SEO Comparison
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Semantic Topic Network
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Nhấn vào từng chủ đề để xem nội dung AI gợi ý
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Topic nodes positioned in a network layout */}
                <div className="absolute inset-4">
                  {/* Main topic - center */}
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    onClick={() => handleTopicClick(semanticTopics[0])}
                  >
                    <div className={`${getTopicSize(semanticTopics[0].size)} ${getTopicColor(semanticTopics[0].type)} rounded-full flex items-center justify-center text-white font-medium shadow-lg hover:scale-110 transition-all duration-200`}>
                      <div className="text-center leading-tight">
                        {semanticTopics[0].label.split(' ').map((word, i) => (
                          <div key={i}>{word}</div>
                        ))}
                      </div>
                    </div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Click để xem gợi ý
                    </div>
                  </div>

                  {/* Sub topics - positioned around main */}
                  <div 
                    className="absolute top-1/4 left-1/4 cursor-pointer group"
                    onClick={() => handleTopicClick(semanticTopics[1])}
                  >
                    <div className={`${getTopicSize(semanticTopics[1].size)} ${getTopicColor(semanticTopics[1].type)} rounded-full flex items-center justify-center text-white font-medium shadow-lg hover:scale-110 transition-all duration-200`}>
                      <div className="text-center leading-tight">
                        {semanticTopics[1].label.split(' ').map((word, i) => (
                          <div key={i}>{word}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div 
                    className="absolute top-1/4 right-1/4 cursor-pointer group"
                    onClick={() => handleTopicClick(semanticTopics[2])}
                  >
                    <div className={`${getTopicSize(semanticTopics[2].size)} ${getTopicColor(semanticTopics[2].type)} rounded-full flex items-center justify-center text-white font-medium shadow-lg hover:scale-110 transition-all duration-200`}>
                      <div className="text-center leading-tight">
                        {semanticTopics[2].label.split(' ').map((word, i) => (
                          <div key={i}>{word}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Related topics - positioned on edges */}
                  {semanticTopics.slice(3).map((topic, index) => {
                    const positions = [
                      'top-1/6 left-1/6',
                      'bottom-1/6 left-1/6', 
                      'top-1/6 right-1/6',
                      'bottom-1/6 right-1/6'
                    ];
                    
                    return (
                      <div 
                        key={topic.id}
                        className={`absolute ${positions[index]} cursor-pointer group`}
                        onClick={() => handleTopicClick(topic)}
                      >
                        <div className={`${getTopicSize(topic.size)} ${getTopicColor(topic.type)} rounded-full flex items-center justify-center text-white font-medium shadow-lg hover:scale-110 transition-all duration-200`}>
                          <div className="text-center leading-tight">
                            {topic.label.split(' ').map((word, i) => (
                              <div key={i}>{word}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                    <defs>
                      <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    {/* Main to sub connections */}
                    <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="url(#connectionGradient)" strokeWidth="2" strokeDasharray="5,5" />
                    <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="url(#connectionGradient)" strokeWidth="2" strokeDasharray="5,5" />
                    {/* Additional connections */}
                    <line x1="25%" y1="25%" x2="16.67%" y2="16.67%" stroke="url(#connectionGradient)" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="25%" y1="25%" x2="16.67%" y2="83.33%" stroke="url(#connectionGradient)" strokeWidth="1" strokeDasharray="3,3" />
                  </svg>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg p-3 shadow-lg">
                  <div className="text-xs font-medium mb-2">Chú thích:</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Chủ đề chính</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Chủ đề phụ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span>Chủ đề liên quan</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Chủ đề chính</p>
                    <p className="text-2xl font-bold">1</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Network className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Chủ đề phụ</p>
                    <p className="text-2xl font-bold">2</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Chủ đề liên quan</p>
                    <p className="text-2xl font-bold">4</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="intent" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Intent Coverage Chart */}
            <IntentCoverageChart />

            {/* Content List with Intent Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Danh sách bài viết
                  </div>
                  <Select value={selectedIntentFilter} onValueChange={setSelectedIntentFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Lọc theo intent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="informational">Thông tin</SelectItem>
                      <SelectItem value="navigational">Điều hướng</SelectItem>
                      <SelectItem value="transactional">Giao dịch</SelectItem>
                      <SelectItem value="commercial">Thương mại</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingContent ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-muted-foreground">Đang tải...</div>
                  </div>
                ) : contentWithIntent.length === 0 ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <div className="mb-2">Không có bài viết nào</div>
                      <div className="text-sm">
                        {selectedIntentFilter === 'all' 
                          ? 'Hãy phân tích intent cho các trang web'
                          : `Không có bài viết với intent "${selectedIntentFilter}"`
                        }
                      </div>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {contentWithIntent.map((content) => {
                        const IconComponent = getIntentIcon(content.intent_type);
                        return (
                          <div key={content.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getIntentColor(content.intent_type)}`}>
                              <IconComponent className="h-3 w-3" />
                              <span className="capitalize">{content.intent_type}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {content.url}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Confidence: {Math.round(content.confidence * 100)}% • 
                                Phân tích: {new Date(content.created_at).toLocaleDateString('vi-VN')}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compare" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traditional SEO */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  {seoComparison.traditional.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Phương pháp SEO truyền thống dựa trên từ khóa và metric cơ bản
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {seoComparison.traditional.metrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{metric.label}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getStatusColor(metric.status)}>
                        {metric.value}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI-Enhanced SEO */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  {seoComparison.ai.title}
                  <Badge variant="outline" className="ml-auto">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  SEO thông minh với AI phân tích semantic và user intent
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {seoComparison.ai.metrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{metric.label}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getStatusColor(metric.status)}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {metric.value}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Comparison Summary */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Kết quả so sánh</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    AI-Enhanced SEO cho thấy hiệu quả vượt trội với semantic understanding và user intent optimization.
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      +34% improvement
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">So với phương pháp truyền thống</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <Dialog open={!!selectedTopic} onOpenChange={() => setSelectedTopic(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Nội dung AI gợi ý cho: {selectedTopic.label}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-2">
                <Badge className={getTopicColor(selectedTopic.type)}>
                  {selectedTopic.type === 'main' ? 'Chủ đề chính' : 
                   selectedTopic.type === 'sub' ? 'Chủ đề phụ' : 'Chủ đề liên quan'}
                </Badge>
                <Badge variant="outline">
                  Relevance: {selectedTopic.size}%
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">📝 Tiêu đề đề xuất</h3>
                <p className="text-lg bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                  {selectedTopic.suggestedContent.title}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">💡 Nội dung gợi ý</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedTopic.suggestedContent.content}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">🎯 Từ khóa target</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTopic.suggestedContent.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">🧭 Search Intent</h3>
                <Badge className="capitalize">
                  {selectedTopic.suggestedContent.intent}
                </Badge>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedTopic(null)}>
                  Đóng
                </Button>
                <Button>
                  <Eye className="h-4 w-4 mr-2" />
                  Tạo nội dung
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}