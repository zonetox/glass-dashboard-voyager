import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Calendar as CalendarIcon, 
  FileText, 
  Loader2, 
  Download, 
  PenTool,
  Brain,
  Target,
  ClipboardList,
  TableIcon,
  Filter,
  UserPlus,
  Users
} from 'lucide-react';
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface ContentPlan {
  id: string;
  plan_date: string;
  title: string;
  main_keyword: string;
  secondary_keywords: string[];
  search_intent: 'informational' | 'transactional' | 'commercial' | 'navigational';
  content_length: string;
  status: 'planned' | 'in_progress' | 'completed';
  main_topic: string;
}

interface ContentAssignment {
  id: string;
  content_plan_id: string;
  writer_id: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  due_date?: string;
  created_at: string;
  content_plan?: ContentPlan;
  writer_email?: string;
}

interface Writer {
  id: string;
  email: string;
  display_name?: string;
}

interface SavedTopic {
  main_topic: string;
  count: number;
  latest_date: string;
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
  const [savedTopics, setSavedTopics] = useState<SavedTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [generatedPlan, setGeneratedPlan] = useState<ContentPlanResponse | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [filterIntent, setFilterIntent] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<ContentPlan | null>(null);
  const [assignments, setAssignments] = useState<ContentAssignment[]>([]);
  const [writers, setWriters] = useState<Writer[]>([]);
  const [assignmentDialog, setAssignmentDialog] = useState<{ open: boolean; plan: ContentPlan | null }>({ open: false, plan: null });
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [selectedWriter, setSelectedWriter] = useState('');
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
      
      // Save individual content plans to the existing table
      const plansToSave = data.content_plan.map((item: any) => ({
        user_id: user.id,
        main_topic: mainTopic.trim(),
        plan_date: item.date,
        title: item.title,
        main_keyword: item.main_keyword,
        secondary_keywords: item.secondary_keywords || [],
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
      await fetchSavedTopics();

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
      const query = supabase
        .from('content_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('plan_date', { ascending: true });

      // If a topic is selected, filter by that topic
      if (selectedTopic) {
        query.eq('main_topic', selectedTopic);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const typedPlans: ContentPlan[] = (data || []).map(plan => ({
        id: plan.id,
        plan_date: plan.plan_date,
        title: plan.title,
        main_keyword: plan.main_keyword,
        secondary_keywords: plan.secondary_keywords || [],
        search_intent: plan.search_intent as 'informational' | 'transactional' | 'commercial' | 'navigational',
        content_length: plan.content_length,
        status: plan.status as 'planned' | 'in_progress' | 'completed',
        main_topic: plan.main_topic
      }));
      
      setContentPlans(typedPlans);
    } catch (error) {
      console.error('Error fetching content plans:', error);
    }
  };

  const fetchSavedTopics = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('content_plans')
        .select('main_topic, created_at')
        .eq('user_id', user.id);

      if (error) throw error;

      // Group by main_topic and count
      const topicMap = new Map<string, { count: number; latest_date: string }>();
      
      data?.forEach(plan => {
        const existing = topicMap.get(plan.main_topic);
        if (existing) {
          existing.count++;
          if (plan.created_at > existing.latest_date) {
            existing.latest_date = plan.created_at;
          }
        } else {
          topicMap.set(plan.main_topic, {
            count: 1,
            latest_date: plan.created_at
          });
        }
      });

      const topics: SavedTopic[] = Array.from(topicMap.entries()).map(([topic, info]) => ({
        main_topic: topic,
        count: info.count,
        latest_date: info.latest_date
      }));

      // Sort by latest date descending
      topics.sort((a, b) => new Date(b.latest_date).getTime() - new Date(a.latest_date).getTime());
      
      setSavedTopics(topics);
    } catch (error) {
      console.error('Error fetching saved topics:', error);
    }
  };

  const handleTopicSelection = async (topic: string) => {
    setSelectedTopic(topic);
    setMainTopic(topic);
    // Fetch plans for this topic
    await fetchContentPlans();
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

    if (!user) {
      toast({
        title: "Chưa đăng nhập",
        description: "Vui lòng đăng nhập để xuất PDF",
        variant: "destructive"
      });
      return;
    }

    setIsExportingPDF(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
        body: { 
          user_id: user.id,
          report_type: 'content-plan',
          main_topic: mainTopic
        }
      });

      if (error) throw error;

      // Open the PDF file in a new tab
      if (data?.file_url) {
        window.open(data.file_url, '_blank');
        toast({
          title: "Xuất PDF thành công",
          description: `Kế hoạch nội dung đã được xuất thành PDF (${data.total_articles} bài viết)`
        });
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
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

  const fetchWriters = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, tier')
        .neq('user_id', user.id);

      if (error) throw error;

      // Get user emails from auth.users would require admin access
      // For now, we'll use a simplified approach
      const writers: Writer[] = (data || []).map(profile => ({
        id: profile.user_id,
        email: `user-${profile.user_id.slice(0, 8)}@example.com`, // Placeholder
        display_name: `Writer ${profile.user_id.slice(0, 8)}`
      }));

      setWriters(writers);
    } catch (error) {
      console.error('Error fetching writers:', error);
    }
  };

  const fetchAssignments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('content_assignments')
        .select(`
          *,
          content_plan:content_plans(*)
        `)
        .or(`content_plan_id.in.(${contentPlans.map(p => p.id).join(',')}),writer_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const assignments: ContentAssignment[] = (data || []).map(assignment => ({
        id: assignment.id,
        content_plan_id: assignment.content_plan_id,
        writer_id: assignment.writer_id,
        status: assignment.status as 'assigned' | 'in_progress' | 'completed' | 'cancelled',
        notes: assignment.notes,
        due_date: assignment.due_date,
        created_at: assignment.created_at,
        content_plan: assignment.content_plan ? {
          id: assignment.content_plan.id,
          plan_date: assignment.content_plan.plan_date,
          title: assignment.content_plan.title,
          main_keyword: assignment.content_plan.main_keyword,
          secondary_keywords: assignment.content_plan.secondary_keywords || [],
          search_intent: assignment.content_plan.search_intent as 'informational' | 'transactional' | 'commercial' | 'navigational',
          content_length: assignment.content_plan.content_length,
          status: assignment.content_plan.status as 'planned' | 'in_progress' | 'completed',
          main_topic: assignment.content_plan.main_topic
        } : undefined
      }));

      setAssignments(assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleAssignWriter = async () => {
    if (!assignmentDialog.plan || !selectedWriter) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn người viết",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('content_assignments')
        .insert({
          content_plan_id: assignmentDialog.plan.id,
          writer_id: selectedWriter,
          notes: assignmentNotes,
          due_date: assignmentDueDate || null,
          status: 'assigned'
        });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã giao bài cho writer"
      });

      setAssignmentDialog({ open: false, plan: null });
      setAssignmentNotes('');
      setAssignmentDueDate('');
      setSelectedWriter('');
      await fetchAssignments();
    } catch (error) {
      console.error('Error assigning writer:', error);
      toast({
        title: "Lỗi",
        description: "Không thể giao bài. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const updateAssignmentStatus = async (assignmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('content_assignments')
        .update({ status: newStatus })
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Cập nhật thành công",
        description: `Trạng thái đã được thay đổi thành: ${newStatus}`
      });

      await fetchAssignments();
    } catch (error) {
      console.error('Error updating assignment status:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái",
        variant: "destructive"
      });
    }
  };

  // Load existing plans on component mount
  useEffect(() => {
    fetchSavedTopics();
    fetchContentPlans();
    fetchWriters();
  }, [user]);

  // Update plans when topic selection changes
  useEffect(() => {
    if (selectedTopic) {
      fetchContentPlans();
    }
  }, [selectedTopic]);

  // Fetch assignments when content plans change
  useEffect(() => {
    if (contentPlans.length > 0) {
      fetchAssignments();
    }
  }, [contentPlans]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <CalendarIcon className="h-5 w-5 text-blue-400" />
            Kế hoạch nội dung 6 tháng
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Dropdown for saved topics */}
          {savedTopics.length > 0 && (
            <div className="mb-6">
              <Label className="text-gray-300 mb-2 block">Chọn kế hoạch đã lưu</Label>
              <Select value={selectedTopic} onValueChange={handleTopicSelection}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Chọn chủ đề cũ hoặc tạo mới" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả kế hoạch</SelectItem>
                  {savedTopics.map((topic) => (
                    <SelectItem key={topic.main_topic} value={topic.main_topic}>
                      {topic.main_topic} ({topic.count} bài viết - {new Date(topic.latest_date).toLocaleDateString('vi-VN')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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

      {contentPlans.length > 0 && (
        <Tabs defaultValue="content-plans" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border-white/10">
            <TabsTrigger value="content-plans" className="text-white data-[state=active]:bg-blue-600">
              Kế hoạch nội dung
            </TabsTrigger>
            <TabsTrigger value="assignments" className="text-white data-[state=active]:bg-blue-600">
              <Users className="h-4 w-4 mr-2" />
              Bài được giao ({assignments.filter(a => a.writer_id === user?.id).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content-plans" className="space-y-4">
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">
                    Kế hoạch nội dung {selectedTopic && `(${selectedTopic})`} - {contentPlans.length} bài viết
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className="border-white/20"
                    >
                      <TableIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'calendar' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('calendar')}
                      className="border-white/20"
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === 'table' ? (
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
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleWriteWithAI(plan)}
                                  className="border-green-500/20 text-green-300 hover:bg-green-500/10"
                                >
                                  <PenTool className="h-3 w-3 mr-1" />
                                  Dùng AI viết bài
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setAssignmentDialog({ open: true, plan })}
                                  className="border-blue-500/20 text-blue-300 hover:bg-blue-500/10"
                                >
                                  <UserPlus className="h-3 w-3 mr-1" />
                                  Assign Writer
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="h-96 bg-white/5 rounded-lg p-4">
                    <Calendar
                      localizer={localizer}
                      events={contentPlans.map(plan => ({
                        id: plan.id,
                        title: plan.title,
                        start: new Date(plan.plan_date),
                        end: new Date(plan.plan_date),
                        resource: plan
                      }))}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: '100%' }}
                      className="text-white"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-white">
                  Bài được giao cho bạn ({assignments.filter(a => a.writer_id === user?.id).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-gray-300">Tiêu đề bài</TableHead>
                        <TableHead className="text-gray-300">Deadline</TableHead>
                        <TableHead className="text-gray-300">Trạng thái</TableHead>
                        <TableHead className="text-gray-300">Ghi chú</TableHead>
                        <TableHead className="text-gray-300">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.filter(a => a.writer_id === user?.id).map((assignment) => (
                        <TableRow key={assignment.id} className="border-white/10">
                          <TableCell className="text-white">
                            <div>
                              <div className="font-medium">{assignment.content_plan?.title}</div>
                              <div className="text-sm text-gray-400">
                                Từ khóa: {assignment.content_plan?.main_keyword}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">
                            {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString('vi-VN') : 'Không có'}
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={assignment.status} 
                              onValueChange={(value) => updateAssignmentStatus(assignment.id, value)}
                            >
                              <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="assigned">Đã giao</SelectItem>
                                <SelectItem value="in_progress">Đang viết</SelectItem>
                                <SelectItem value="completed">Hoàn thành</SelectItem>
                                <SelectItem value="cancelled">Hủy</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-white max-w-xs">
                            <div className="truncate" title={assignment.notes}>
                              {assignment.notes || 'Không có ghi chú'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => assignment.content_plan && handleWriteWithAI(assignment.content_plan)}
                              className="border-green-500/20 text-green-300 hover:bg-green-500/10"
                            >
                              <PenTool className="h-3 w-3 mr-1" />
                              Viết bài
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {assignments.filter(a => a.writer_id === user?.id).length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Chưa có bài được giao
                      </h3>
                      <p className="text-gray-400">
                        Khi có người giao bài cho bạn, sẽ hiển thị ở đây
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialog.open} onOpenChange={(open) => setAssignmentDialog({ open, plan: null })}>
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Giao bài cho Writer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Tiêu đề bài:</Label>
              <p className="text-white mt-1">{assignmentDialog.plan?.title}</p>
            </div>
            
            <div>
              <Label className="text-gray-300 mb-2 block">Chọn người viết</Label>
              <Select value={selectedWriter} onValueChange={setSelectedWriter}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Chọn writer" />
                </SelectTrigger>
                <SelectContent>
                  {writers.map((writer) => (
                    <SelectItem key={writer.id} value={writer.id}>
                      {writer.display_name || writer.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Deadline</Label>
              <Input
                type="date"
                value={assignmentDueDate}
                onChange={(e) => setAssignmentDueDate(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Ghi chú riêng</Label>
              <Textarea
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                placeholder="Thêm ghi chú, yêu cầu đặc biệt..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleAssignWriter}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Giao bài
              </Button>
              <Button 
                variant="outline"
                onClick={() => setAssignmentDialog({ open: false, plan: null })}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {contentPlans.length === 0 && !isGenerating && (
        <Card className="glass-card border-white/10">
          <CardContent className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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