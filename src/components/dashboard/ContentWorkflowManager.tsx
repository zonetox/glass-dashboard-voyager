import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Clock, CheckCircle, XCircle, Eye, MessageSquare, Users, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ContentItem {
  id: string;
  title: string;
  type: 'article' | 'page' | 'blog_post';
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'published';
  author_id: string;
  reviewer_id?: string;
  created_at: string;
  updated_at: string;
  word_count: number;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  feedback?: string;
}

interface WorkflowStats {
  total_drafts: number;
  pending_review: number;
  approved: number;
  published: number;
  avg_review_time: number;
}

export default function ContentWorkflowManager() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState<WorkflowStats>({
    total_drafts: 0,
    pending_review: 0,
    approved: 0,
    published: 0,
    avg_review_time: 0
  });
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected'>('approved');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadContentItems();
    loadWorkflowStats();
  }, []);

  const loadContentItems = async () => {
    try {
      const { data, error } = await supabase
        .from('content_drafts')
        .select(`
          id,
          plan_id,
          writer_id,
          content,
          status,
          created_at,
          updated_at,
          scheduled_date,
          content_plans!inner(
            title,
            main_keyword,
            content_length
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform data to match ContentItem interface
      const transformedData: ContentItem[] = data?.map(item => ({
        id: item.id,
        title: item.content_plans.title,
        type: 'article' as const,
        status: item.status as ContentItem['status'],
        author_id: item.writer_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        word_count: item.content?.length || 0,
        priority: 'medium' as const,
        due_date: item.scheduled_date
      })) || [];

      setContentItems(transformedData);
    } catch (error) {
      console.error('Error loading content items:', error);
    }
  };

  const loadWorkflowStats = async () => {
    try {
      const { data, error } = await supabase
        .from('content_drafts')
        .select('status, created_at, updated_at');

      if (error) throw error;

      const stats = data?.reduce((acc, item) => {
        switch (item.status) {
          case 'draft':
            acc.total_drafts++;
            break;
          case 'review':
            acc.pending_review++;
            break;
          case 'approved':
            acc.approved++;
            break;
          case 'published':
            acc.published++;
            break;
        }
        return acc;
      }, {
        total_drafts: 0,
        pending_review: 0,
        approved: 0,
        published: 0,
        avg_review_time: 2.5
      });

      setStats(stats || {
        total_drafts: 0,
        pending_review: 0,
        approved: 0,
        published: 0,
        avg_review_time: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleReview = (item: ContentItem) => {
    setSelectedItem(item);
    setShowReviewDialog(true);
    setReviewFeedback('');
    setReviewDecision('approved');
  };

  const submitReview = async () => {
    if (!selectedItem) return;

    setLoading(true);
    try {
      // Update content status
      const { error: updateError } = await supabase
        .from('content_drafts')
        .update({
          status: reviewDecision,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedItem.id);

      if (updateError) throw updateError;

      // Add feedback
      if (reviewFeedback) {
        const { error: feedbackError } = await supabase
          .from('content_feedback')
          .insert({
            draft_id: selectedItem.id,
            reviewer_id: user?.id,
            comment: reviewFeedback
          });

        if (feedbackError) throw feedbackError;
      }

      toast({ 
        title: `Content ${reviewDecision}`, 
        description: `"${selectedItem.title}" has been ${reviewDecision}` 
      });

      setShowReviewDialog(false);
      loadContentItems();
      loadWorkflowStats();
    } catch (error) {
      toast({ title: "Failed to submit review", variant: "destructive" });
    }
    setLoading(false);
  };

  const getStatusIcon = (status: ContentItem['status']) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'review':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'published':
        return <Eye className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ContentItem['status']) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'review':
        return 'default';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'published':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: ContentItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Content Workflow Management</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="review">Review Queue</TabsTrigger>
          <TabsTrigger value="drafts">All Drafts</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Drafts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_drafts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_review}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approved}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.published}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest content workflow activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contentItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Updated {formatDistanceToNow(new Date(item.updated_at))} ago
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Review Queue</CardTitle>
              <CardDescription>Items waiting for review approval</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentItems.filter(item => item.status === 'review').map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell>{item.author_id}</TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.due_date ? formatDistanceToNow(new Date(item.due_date)) : 'No due date'}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => handleReview(item)}>
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Content Drafts</CardTitle>
              <CardDescription>Complete list of content items across all statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Word Count</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(item.status)}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1">{item.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell>{item.word_count.toLocaleString()}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(item.updated_at))} ago
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {item.status === 'review' && (
                            <Button size="sm" onClick={() => handleReview(item)}>
                              Review
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Content Calendar
              </CardTitle>
              <CardDescription>Schedule and track content publication dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4 text-center">
                <div className="font-semibold">Mon</div>
                <div className="font-semibold">Tue</div>
                <div className="font-semibold">Wed</div>
                <div className="font-semibold">Thu</div>
                <div className="font-semibold">Fri</div>
                <div className="font-semibold">Sat</div>
                <div className="font-semibold">Sun</div>
                {/* Calendar grid would be implemented here */}
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="aspect-square border rounded p-2 text-sm">
                    {i + 1}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Review Content: {selectedItem?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Decision</label>
              <Select value={reviewDecision} onValueChange={(value: 'approved' | 'rejected') => setReviewDecision(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve</SelectItem>
                  <SelectItem value="rejected">Request Changes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Feedback (optional)</label>
              <Textarea
                placeholder="Provide feedback to the author..."
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button onClick={submitReview} disabled={loading}>
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}