import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, MessageSquare, Clock, User, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DOMPurify from 'dompurify';

interface ContentDraft {
  id: string;
  plan_id: string;
  writer_id: string;
  content: string;
  status: string;
  last_saved_at: string;
  created_at: string;
  content_plans: {
    title: string;
    main_keyword: string;
    search_intent: string;
  };
}

interface ContentFeedback {
  id: string;
  draft_id: string;
  reviewer_id: string;
  comment: string;
  created_at: string;
}

export default function ReviewPanel() {
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<ContentDraft | null>(null);
  const [feedback, setFeedback] = useState<ContentFeedback[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDraftsForReview();
  }, []);

  useEffect(() => {
    if (selectedDraft) {
      fetchFeedback(selectedDraft.id);
    }
  }, [selectedDraft]);

  const fetchDraftsForReview = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_drafts')
        .select(`
          *,
          content_plans:plan_id (
            title,
            main_keyword,
            search_intent
          )
        `)
        .eq('status', 'done')
        .order('last_saved_at', { ascending: false });

      if (error) throw error;
      setDrafts(data || []);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bài viết cần duyệt",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async (draftId: string) => {
    try {
      const { data, error } = await supabase
        .from('content_feedback')
        .select('*')
        .eq('draft_id', draftId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const addFeedback = async () => {
    if (!selectedDraft || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('content_feedback')
        .insert({
          draft_id: selectedDraft.id,
          reviewer_id: user.id,
          comment: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      await fetchFeedback(selectedDraft.id);
      
      toast({
        title: "Thành công",
        description: "Đã gửi phản hồi"
      });
    } catch (error) {
      console.error('Error adding feedback:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi phản hồi",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateDraftStatus = async (status: 'approved' | 'needs_changes') => {
    if (!selectedDraft) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('content_drafts')
        .update({ status })
        .eq('id', selectedDraft.id);

      if (error) throw error;

      // Update local state
      setSelectedDraft({ ...selectedDraft, status });
      setDrafts(prev => prev.filter(d => d.id !== selectedDraft.id));

      toast({
        title: "Thành công",
        description: status === 'approved' 
          ? "Bài viết đã được phê duyệt"
          : "Bài viết cần chỉnh sửa"
      });
    } catch (error) {
      console.error('Error updating draft status:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái bài viết",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'done':
        return <Badge variant="outline" className="bg-blue-50"><Clock className="w-3 h-3 mr-1" />Chờ duyệt</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50"><CheckCircle className="w-3 h-3 mr-1" />Đã duyệt</Badge>;
      case 'needs_changes':
        return <Badge variant="outline" className="bg-yellow-50"><XCircle className="w-3 h-3 mr-1" />Cần sửa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Duyệt bài viết</h2>
        <Badge variant="secondary" className="ml-2">
          {drafts.length} bài viết chờ duyệt
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách bài viết chờ duyệt */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Bài viết chờ duyệt</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {drafts.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Không có bài viết nào cần duyệt
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {drafts.map((draft) => (
                    <Card
                      key={draft.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedDraft?.id === draft.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedDraft(draft)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="font-medium line-clamp-2">
                            {draft.content_plans?.title || 'Untitled'}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(draft.last_saved_at).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(draft.status)}
                            <Badge variant="outline" className="text-xs">
                              {draft.content_plans?.search_intent}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chi tiết bài viết và duyệt */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDraft ? (
            <>
              {/* Thông tin bài viết */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedDraft.content_plans?.title}</CardTitle>
                    {getStatusBadge(selectedDraft.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Writer ID: {selectedDraft.writer_id.slice(0, 8)}...
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(selectedDraft.last_saved_at).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <strong>Từ khóa chính:</strong> {selectedDraft.content_plans?.main_keyword}
                    </div>
                    <div>
                      <strong>Search Intent:</strong> {selectedDraft.content_plans?.search_intent}
                    </div>
                    <Separator />
                    <div>
                      <strong>Nội dung:</strong>
                      <ScrollArea className="h-64 mt-2 p-4 border rounded-md">
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: DOMPurify.sanitize(selectedDraft.content || '', {
                              ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a'],
                              ALLOWED_ATTR: ['href', 'class', 'target', 'rel']
                            })
                          }}
                        />
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Phản hồi và comments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Phản hồi ({feedback.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Danh sách phản hồi */}
                  <ScrollArea className="h-32">
                    {feedback.length === 0 ? (
                      <div className="text-center text-muted-foreground py-4">
                        Chưa có phản hồi nào
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {feedback.map((item) => (
                          <div key={item.id} className="p-3 bg-muted/50 rounded-md">
                            <div className="text-sm text-muted-foreground mb-1">
                              {new Date(item.created_at).toLocaleString('vi-VN')}
                            </div>
                            <div>{item.comment}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Form thêm phản hồi */}
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Nhập phản hồi cho writer..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <Button 
                      onClick={addFeedback}
                      disabled={submitting || !newComment.trim()}
                      size="sm"
                    >
                      Gửi phản hồi
                    </Button>
                  </div>

                  <Separator />

                  {/* Nút duyệt */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => updateDraftStatus('approved')}
                      disabled={submitting || selectedDraft.status === 'approved'}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Phê duyệt
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateDraftStatus('needs_changes')}
                      disabled={submitting}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Yêu cầu sửa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  Chọn một bài viết để xem chi tiết và duyệt
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}