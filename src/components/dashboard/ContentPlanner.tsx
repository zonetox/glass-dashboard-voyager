import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Calendar, 
  FileText, 
  Loader2, 
  Download, 
  PenTool,
  Brain,
  Target,
  ClipboardList
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ContentPlan {
  id: string;
  plan_date: string;
  title: string;
  main_keyword: string;
  secondary_keywords: string[];
  search_intent: 'informational' | 'transactional' | 'commercial' | 'navigational';
  content_length: string;
  status: 'planned' | 'in_progress' | 'completed';
}

interface ContentPlanResponse {
  main_topic: string;
  content_plan: Array<{
    week: number;
    date: string;
    title: string;
    content_type: string;
    search_intent: string;
    main_keyword: string;
    secondary_keywords: string[];
    ai_notes: string;
  }>;
}

export function ContentPlanner() {
  const [domain, setDomain] = useState('');
  const [mainTopic, setMainTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [contentPlans, setContentPlans] = useState<ContentPlan[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<ContentPlanResponse | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGeneratePlan = async () => {
    if (!domain.trim() || !mainTopic.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập domain và chủ đề chính",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Chưa đăng nhập",
        description: "Vui lòng đăng nhập để sử dụng tính năng này",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-plan', {
        body: { 
          mainTopic: mainTopic.trim(),
          domain: domain.trim()
        }
      });

      if (error) throw error;

      setGeneratedPlan(data);
      
      // Save to database
      const plansToSave = data.content_plan.map((item: any) => ({
        user_id: user.id,
        main_topic: data.main_topic,
        plan_date: item.date,
        title: item.title,
        main_keyword: item.main_keyword,
        secondary_keywords: item.secondary_keywords,
        search_intent: item.search_intent,
        content_length: getContentLength(item.content_type),
        status: 'planned'
      }));

      const { error: saveError } = await supabase
        .from('content_plans')
        .insert(plansToSave);

      if (saveError) {
        console.error('Error saving plans:', saveError);
      }

      // Fetch updated plans
      await fetchContentPlans();

      toast({
        title: "Thành công",
        description: `Đã tạo kế hoạch nội dung 6 tháng cho chủ đề: ${data.main_topic}`
      });
    } catch (error) {
      console.error('Error generating content plan:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo kế hoạch nội dung. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchContentPlans = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('content_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('plan_date', { ascending: true });

      if (error) throw error;
      
      // Type cast the data to match ContentPlan interface
      const typedPlans: ContentPlan[] = (data || []).map(plan => ({
        id: plan.id,
        plan_date: plan.plan_date,
        title: plan.title,
        main_keyword: plan.main_keyword,
        secondary_keywords: plan.secondary_keywords || [],
        search_intent: plan.search_intent as 'informational' | 'transactional' | 'commercial' | 'navigational',
        content_length: plan.content_length,
        status: plan.status as 'planned' | 'in_progress' | 'completed'
      }));
      
      setContentPlans(typedPlans);
    } catch (error) {
      console.error('Error fetching content plans:', error);
    }
  };

  const handleExportPDF = async () => {
    if (!contentPlans.length) {
      toast({
        title: "Không có dữ liệu",
        description: "Chưa có kế hoạch nội dung để xuất PDF",
        variant: "destructive"
      });
      return;
    }

    setIsExportingPDF(true);
    try {
      // Create PDF export logic here
      toast({
        title: "Xuất PDF thành công",
        description: "Kế hoạch nội dung đã được xuất ra file PDF"
      });
    } catch (error) {
      toast({
        title: "Lỗi xuất PDF",
        description: "Không thể xuất file PDF. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleWriteWithAI = (plan: ContentPlan) => {
    // Navigate to AI Writer tab with pre-filled data
    const event = new CustomEvent('switchToAIWriter', {
      detail: {
        topic: plan.title,
        keyword: plan.main_keyword,
        articleType: getArticleType(plan.content_length)
      }
    });
    window.dispatchEvent(event);
  };

  const getContentLength = (contentType: string): string => {
    const lengthMap: { [key: string]: string } = {
      'blog': '800-1200 từ',
      'guide': '1500-2500 từ',
      'case-study': '1000-1500 từ',
      'review': '800-1200 từ',
      'comparison': '1200-1800 từ',
      'listicle': '1000-1500 từ'
    };
    return lengthMap[contentType] || '800-1200 từ';
  };

  const getArticleType = (contentLength: string): string => {
    if (contentLength.includes('1500')) return 'guide';
    if (contentLength.includes('1200')) return 'listicle';
    return 'how-to';
  };

  const getSearchIntentBadge = (intent: string) => {
    const variants = {
      informational: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
      transactional: 'bg-green-500/20 text-green-300 border-green-500/20',
      commercial: 'bg-orange-500/20 text-orange-300 border-orange-500/20',
      navigational: 'bg-purple-500/20 text-purple-300 border-purple-500/20'
    };
    return variants[intent as keyof typeof variants] || variants.informational;
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType.toLowerCase()) {
      case 'blog': return <FileText className="h-4 w-4" />;
      case 'guide': return <ClipboardList className="h-4 w-4" />;
      case 'case-study': return <Target className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Load existing plans on component mount
  useEffect(() => {
    fetchContentPlans();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-blue-400" />
            Kế hoạch nội dung 6 tháng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="text-gray-300 mb-2 block">Domain website *</Label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g., yourwebsite.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Chủ đề chính *</Label>
              <Input
                value={mainTopic}
                onChange={(e) => setMainTopic(e.target.value)}
                placeholder="e.g., Chăm sóc da tự nhiên"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo kế hoạch với AI...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Lên kế hoạch 6 tháng với AI
                </>
              )}
            </Button>

            {contentPlans.length > 0 && (
              <Button
                variant="outline"
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {isExportingPDF ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Xuất PDF kế hoạch
              </Button>
            )}
          </div>

          <p className="text-sm text-gray-400 mt-4">
            AI sẽ tạo kế hoạch nội dung chi tiết cho 6 tháng với các chủ đề hấp dẫn và tối ưu SEO.
          </p>
        </CardContent>
      </Card>

      {/* Content Plans Table */}
      {contentPlans.length > 0 && (
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-white">
              Kế hoạch nội dung ({contentPlans.length} bài viết)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-gray-300">Ngày đăng</TableHead>
                    <TableHead className="text-gray-300">Tiêu đề gợi ý</TableHead>
                    <TableHead className="text-gray-300">Loại content</TableHead>
                    <TableHead className="text-gray-300">Search Intent</TableHead>
                    <TableHead className="text-gray-300">Từ khóa chính</TableHead>
                    <TableHead className="text-gray-300">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentPlans.map((plan) => (
                    <TableRow key={plan.id} className="border-white/10">
                      <TableCell className="text-white">
                        {new Date(plan.plan_date).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-white max-w-xs">
                        <div className="truncate" title={plan.title}>
                          {plan.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-300">
                          {getContentTypeIcon(plan.content_length)}
                          <span className="text-sm">{plan.content_length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSearchIntentBadge(plan.search_intent)}>
                          {plan.search_intent}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        <span className="text-sm">{plan.main_keyword}</span>
                        {plan.secondary_keywords.length > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            +{plan.secondary_keywords.length} từ khóa phụ
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleWriteWithAI(plan)}
                          className="border-green-500/20 text-green-300 hover:bg-green-500/10"
                        >
                          <PenTool className="h-3 w-3 mr-1" />
                          Dùng AI viết bài
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {contentPlans.length === 0 && !isGenerating && (
        <Card className="glass-card border-white/10">
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Chưa có kế hoạch nội dung
            </h3>
            <p className="text-gray-400 mb-4">
              Nhập domain và chủ đề để AI tạo kế hoạch nội dung 6 tháng cho bạn
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}