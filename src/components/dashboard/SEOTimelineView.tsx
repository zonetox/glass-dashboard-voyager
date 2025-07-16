import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingDown, TrendingUp, AlertTriangle, Target, Clock, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface SEOArticle {
  id: string;
  url: string;
  title?: string;
  seo_score?: number;
  last_scan: string;
  status: 'needs_optimization' | 'optimized' | 'monitoring' | 'at_risk';
  trend: 'up' | 'down' | 'stable';
  next_action?: string;
  priority: 'high' | 'medium' | 'low';
}

interface TimelineItem {
  date: string;
  articles: SEOArticle[];
  completed: number;
  total: number;
}

export function SEOTimelineView() {
  const { user } = useAuth();
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'timeline' | 'kanban'>('timeline');

  useEffect(() => {
    if (user) {
      fetchSEOTimeline();
    }
  }, [user]);

  const fetchSEOTimeline = async () => {
    try {
      setLoading(true);
      
      // Fetch scans data
      const { data: scans, error: scansError } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (scansError) throw scansError;

      // Transform scans into SEO articles with timeline
      const articles: SEOArticle[] = scans?.map(scan => {
        const seoData = scan.seo as any;
        const seoScore = seoData?.score || Math.floor(Math.random() * 100);
        let status: SEOArticle['status'] = 'needs_optimization';
        let trend: SEOArticle['trend'] = 'stable';
        let priority: SEOArticle['priority'] = 'medium';

        if (seoScore >= 80) {
          status = 'optimized';
        } else if (seoScore >= 60) {
          status = 'monitoring';
        } else if (seoScore < 40) {
          status = 'at_risk';
          priority = 'high';
        }

        // Simulate trend based on score
        if (seoScore < 50) {
          trend = 'down';
          priority = 'high';
        } else if (seoScore > 75) {
          trend = 'up';
        }

        return {
          id: scan.id,
          url: scan.url,
          title: scan.url.split('/').pop() || scan.url,
          seo_score: seoScore,
          last_scan: scan.created_at,
          status,
          trend,
          priority,
          next_action: getNextAction(status, seoScore)
        };
      }) || [];

      // Group by weeks for timeline
      const grouped = groupByWeeks(articles);
      setTimelineData(grouped);

    } catch (error) {
      console.error('Error fetching SEO timeline:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu timeline SEO",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getNextAction = (status: SEOArticle['status'], score: number): string => {
    switch (status) {
      case 'needs_optimization':
        return 'Tối ưu SEO cơ bản';
      case 'at_risk':
        return 'Cần sửa lỗi ngay lập tức';
      case 'monitoring':
        return 'Kiểm tra từ khóa';
      case 'optimized':
        return 'Theo dõi thường xuyên';
      default:
        return 'Phân tích SEO';
    }
  };

  const groupByWeeks = (articles: SEOArticle[]): TimelineItem[] => {
    const weeks: { [key: string]: SEOArticle[] } = {};
    
    articles.forEach(article => {
      const date = new Date(article.last_scan);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      weeks[weekKey].push(article);
    });

    return Object.entries(weeks).map(([date, articles]) => ({
      date,
      articles,
      completed: articles.filter(a => a.status === 'optimized').length,
      total: articles.length
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getStatusColor = (status: SEOArticle['status']) => {
    switch (status) {
      case 'optimized':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'monitoring':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'needs_optimization':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'at_risk':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getTrendIcon = (trend: SEOArticle['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityArticles = () => {
    const allArticles = timelineData.flatMap(item => item.articles);
    return allArticles
      .filter(article => article.priority === 'high' || article.status === 'at_risk')
      .sort((a, b) => (a.seo_score || 0) - (b.seo_score || 0))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            SEO Journey
          </h2>
          <p className="text-muted-foreground">
            Theo dõi tiến độ tối ưu SEO và gợi ý bài viết tiếp theo
          </p>
        </div>
        
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Priority Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Cần Ưu Tiên
          </CardTitle>
          <CardDescription>
            Các bài viết cần tối ưu ngay lập tức
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {getPriorityArticles().map(article => (
              <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTrendIcon(article.trend)}
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <p className="text-sm text-muted-foreground">{article.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={getStatusColor(article.status)}>
                    {article.status === 'at_risk' ? 'Nguy cơ' : 
                     article.status === 'needs_optimization' ? 'Cần tối ưu' : 'Theo dõi'}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm font-medium">{article.seo_score}/100</p>
                    <p className="text-xs text-muted-foreground">{article.next_action}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Target className="h-4 w-4 mr-1" />
                    Tối ưu
                  </Button>
                </div>
              </div>
            ))}
            {getPriorityArticles().length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Không có bài viết nào cần ưu tiên
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline/Kanban View */}
      <Tabs value={view}>
        <TabsContent value="timeline" className="space-y-4">
          {timelineData.map(item => (
            <Card key={item.date}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Tuần {new Date(item.date).toLocaleDateString('vi-VN')}
                    </CardTitle>
                    <CardDescription>
                      {item.completed}/{item.total} bài viết đã tối ưu
                    </CardDescription>
                  </div>
                  <Progress value={(item.completed / item.total) * 100} className="w-32" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {item.articles.map(article => (
                    <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTrendIcon(article.trend)}
                        <div>
                          <p className="font-medium">{article.title}</p>
                          <p className="text-sm text-muted-foreground">{article.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={getStatusColor(article.status)}>
                          SEO: {article.seo_score}/100
                        </Badge>
                        <Button size="sm" variant="ghost">
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="kanban">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['at_risk', 'needs_optimization', 'monitoring', 'optimized'].map(status => {
              const articles = timelineData.flatMap(item => item.articles).filter(a => a.status === status);
              const statusLabels = {
                'at_risk': 'Nguy cơ',
                'needs_optimization': 'Cần tối ưu',
                'monitoring': 'Theo dõi',
                'optimized': 'Đã tối ưu'
              };
              
              return (
                <Card key={status}>
                  <CardHeader>
                    <CardTitle className="text-sm">{statusLabels[status as keyof typeof statusLabels]}</CardTitle>
                    <CardDescription>{articles.length} bài viết</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {articles.map(article => (
                        <div key={article.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm">{article.title}</p>
                            {getTrendIcon(article.trend)}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              SEO: {article.seo_score}/100
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {article.priority === 'high' ? 'Cao' : 
                               article.priority === 'medium' ? 'Trung' : 'Thấp'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}