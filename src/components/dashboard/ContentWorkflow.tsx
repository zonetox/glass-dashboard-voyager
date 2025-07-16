import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Clock, User, FileText, Globe } from 'lucide-react';
import { format } from 'date-fns';

interface ContentDraft {
  id: string;
  plan_id: string;
  writer_id: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_saved_at: string;
  scheduled_date?: string;
  target_sites?: string[];
  published_sites?: any;
  content_plans: {
    title: string;
    main_keyword: string;
    main_topic: string;
  };
}

interface WordPressSite {
  id: string;
  site_name: string;
  site_url: string;
  default_status: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-100 text-blue-800',
  waiting_review: 'bg-yellow-100 text-yellow-800',
  needs_changes: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  scheduled: 'bg-purple-100 text-purple-800',
  published: 'bg-emerald-100 text-emerald-800',
};

const statusLabels: Record<string, string> = {
  draft: 'Nháp',
  in_progress: 'Đang viết',
  waiting_review: 'Chờ duyệt',
  needs_changes: 'Cần sửa',
  approved: 'Đã duyệt',
  scheduled: 'Đã lên lịch',
  published: 'Đã đăng',
};

export const ContentWorkflow: React.FC = () => {
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [filteredDrafts, setFilteredDrafts] = useState<ContentDraft[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedDraft, setSelectedDraft] = useState<ContentDraft | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState<string>('09:00');
  const [wordPressSites, setWordPressSites] = useState<WordPressSite[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrafts();
    fetchWordPressSites();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredDrafts(drafts);
    } else {
      setFilteredDrafts(drafts.filter(draft => draft.status === statusFilter));
    }
  }, [drafts, statusFilter]);

  const fetchDrafts = async () => {
    try {
      const { data, error } = await supabase
        .from('content_drafts')
        .select(`
          *,
          content_plans (
            title,
            main_keyword,
            main_topic
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDrafts(data || []);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách bài viết',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWordPressSites = async () => {
    try {
      const { data, error } = await supabase
        .from('wordpress_sites')
        .select('*')
        .order('site_name', { ascending: true });

      if (error) throw error;
      setWordPressSites(data || []);
    } catch (error) {
      console.error('Error fetching WordPress sites:', error);
    }
  };

  const handlePublishToMultipleSites = async () => {
    if (!selectedDraft || selectedSites.length === 0) return;

    setPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke('publish-to-multiple-wp', {
        body: {
          draftId: selectedDraft.id,
          siteIds: selectedSites,
        },
      });

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: `Đã đăng bài lên ${data.successfulPublications} / ${data.totalSites} sites`,
      });

      fetchDrafts();
      setShowPublishDialog(false);
      setSelectedSites([]);
      setSelectedDraft(null);
    } catch (error) {
      console.error('Error publishing to multiple sites:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể đăng bài lên WordPress',
        variant: 'destructive',
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleSchedule = async () => {
    if (!selectedDraft || !scheduledDate) return;

    try {
      const scheduleDateTime = new Date(scheduledDate);
      const [hours, minutes] = scheduledTime.split(':');
      scheduleDateTime.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase
        .from('content_drafts')
        .update({
          status: 'scheduled',
          scheduled_date: scheduleDateTime.toISOString(),
        })
        .eq('id', selectedDraft.id);

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: `Đã lên lịch đăng bài vào ${format(scheduleDateTime, 'dd/MM/yyyy HH:mm')}`,
      });

      fetchDrafts();
      setSelectedDraft(null);
      setScheduledDate(undefined);
    } catch (error) {
      console.error('Error scheduling draft:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lên lịch đăng bài',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Đang tải...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Workflow Quản lý Content
        </CardTitle>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="in_progress">Đang viết</SelectItem>
              <SelectItem value="waiting_review">Chờ duyệt</SelectItem>
              <SelectItem value="needs_changes">Cần sửa</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="scheduled">Đã lên lịch</SelectItem>
              <SelectItem value="published">Đã đăng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Từ khóa chính</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Cập nhật lần cuối</TableHead>
              <TableHead>Ngày đăng</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDrafts.map((draft) => (
              <TableRow key={draft.id}>
                <TableCell className="font-medium">
                  {draft.content_plans?.title || 'Không có tiêu đề'}
                </TableCell>
                <TableCell>{draft.content_plans?.main_keyword}</TableCell>
                <TableCell>
                  <Badge className={statusColors[draft.status]}>
                    {statusLabels[draft.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(draft.updated_at), 'dd/MM/yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  {draft.scheduled_date ? (
                    <div className="flex items-center gap-1 text-sm">
                      <CalendarIcon className="h-4 w-4" />
                      {format(new Date(draft.scheduled_date), 'dd/MM/yyyy HH:mm')}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {draft.status === 'approved' && (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedDraft(draft)}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Lên lịch
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Lên lịch đăng bài</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Chọn ngày đăng</Label>
                                <Calendar
                                  mode="single"
                                  selected={scheduledDate}
                                  onSelect={setScheduledDate}
                                  disabled={(date) => date < new Date()}
                                  className="rounded-md border"
                                />
                              </div>
                              <div>
                                <Label htmlFor="time">Giờ đăng</Label>
                                <Input
                                  id="time"
                                  type="time"
                                  value={scheduledTime}
                                  onChange={(e) => setScheduledTime(e.target.value)}
                                />
                              </div>
                              <Button 
                                onClick={handleSchedule}
                                disabled={!scheduledDate}
                                className="w-full"
                              >
                                Xác nhận lên lịch
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
                          <DialogTrigger asChild>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedDraft(draft);
                                setShowPublishDialog(true);
                              }}
                            >
                              <Globe className="h-4 w-4 mr-1" />
                              Đăng ngay
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Đăng bài lên WordPress</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Chọn WordPress sites để đăng:</Label>
                                <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                                  {wordPressSites.map((site) => (
                                    <div key={site.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={site.id}
                                        checked={selectedSites.includes(site.id)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setSelectedSites(prev => [...prev, site.id]);
                                          } else {
                                            setSelectedSites(prev => prev.filter(id => id !== site.id));
                                          }
                                        }}
                                      />
                                      <Label htmlFor={site.id} className="text-sm">
                                        {site.site_name} ({site.site_url})
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                                {wordPressSites.length === 0 && (
                                  <p className="text-sm text-muted-foreground">
                                    Chưa có WordPress site nào. Thêm site ở tab Site Manager.
                                  </p>
                                )}
                              </div>
                              <Button 
                                onClick={handlePublishToMultipleSites}
                                disabled={selectedSites.length === 0 || publishing}
                                className="w-full"
                              >
                                {publishing ? 'Đang đăng...' : `Đăng lên ${selectedSites.length} site(s)`}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredDrafts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Không có bài viết nào {statusFilter !== 'all' && `với trạng thái "${statusLabels[statusFilter]}"`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};