import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GitCompare,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SEOComparisonToolProps {
  className?: string;
}

export function SEOComparisonTool({ className }: SEOComparisonToolProps) {
  const { toast } = useToast();
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadComparisons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Group by domain for comparison
      const domainGroups: { [key: string]: any[] } = {};
      data?.forEach(scan => {
        try {
          const domain = new URL(scan.url).hostname;
          if (!domainGroups[domain]) {
            domainGroups[domain] = [];
          }
          domainGroups[domain].push(scan);
        } catch (e) {
          console.error('Invalid URL:', scan.url);
        }
      });

      // Create comparisons for domains with multiple scans
      const comparisonData = Object.entries(domainGroups)
        .filter(([_, scans]) => scans.length >= 2)
        .map(([domain, scans]) => {
          const latest = scans[0];
          const previous = scans[1];
          return {
            domain,
            latest,
            previous,
            scoreDiff: latest.seo_score - previous.seo_score,
            timeDiff: new Date(latest.created_at).getTime() - new Date(previous.created_at).getTime()
          };
        });

      setComparisons(comparisonData);
    } catch (error) {
      console.error('Error loading comparisons:', error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể tải dữ liệu so sánh.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadComparisons();
  }, []);

  const getTrendIcon = (diff: number) => {
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (diff < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (diff: number) => {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatTimeDiff = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    return 'Vừa xong';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-blue-600" />
            So Sánh Hiệu Suất SEO Theo Thời Gian
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground mt-2">Đang tải dữ liệu so sánh...</p>
            </div>
          ) : comparisons.length > 0 ? (
            <div className="space-y-4">
              {comparisons.map((comparison, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{comparison.domain}</h4>
                      <p className="text-sm text-muted-foreground">
                        So sánh với lần phân tích {formatTimeDiff(comparison.timeDiff)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(comparison.scoreDiff)}
                      <span className={`font-medium ${getTrendColor(comparison.scoreDiff)}`}>
                        {comparison.scoreDiff > 0 ? '+' : ''}{comparison.scoreDiff}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Điểm Hiện Tại</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {comparison.latest.seo_score}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(comparison.latest.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Điểm Trước Đó</div>
                      <div className="text-2xl font-bold text-gray-600">
                        {comparison.previous.seo_score}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(comparison.previous.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-center">
                    <Badge variant={
                      comparison.scoreDiff > 5 ? 'default' :
                      comparison.scoreDiff < -5 ? 'destructive' : 'secondary'
                    }>
                      {comparison.scoreDiff > 5 ? 'Cải thiện đáng kể' :
                       comparison.scoreDiff < -5 ? 'Giảm đáng kể' : 'Thay đổi nhỏ'}
                    </Badge>
                  </div>
                </div>
              ))}
              
              <div className="text-center pt-4">
                <Button variant="outline" onClick={loadComparisons}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Làm Mới Dữ Liệu
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <GitCompare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-600 mb-2">Chưa Có Dữ Liệu So Sánh</h3>
              <p className="text-sm text-muted-foreground">
                Thực hiện nhiều lần phân tích cùng một website để xem xu hướng thay đổi.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}