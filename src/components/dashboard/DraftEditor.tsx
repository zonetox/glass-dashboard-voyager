import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface ContentDraft {
  id: string;
  plan_id: string;
  writer_id: string;
  content: string | null;
  last_saved_at: string;
  status: 'draft' | 'in_progress' | 'done';
  created_at: string;
  updated_at: string;
}

interface ContentPlan {
  id: string;
  title: string;
  main_keyword: string;
  main_topic: string;
  search_intent: string;
  content_length: string;
}

interface DraftEditorProps {
  planId: string;
  contentPlan: ContentPlan;
  onStatusChange?: (status: 'draft' | 'in_progress' | 'done') => void;
}

export function DraftEditor({ planId, contentPlan, onStatusChange }: DraftEditorProps) {
  const [draft, setDraft] = useState<ContentDraft | null>(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'link', 'image'
  ];

  // Load or create draft
  const loadDraft = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('content_drafts')
        .select('*')
        .eq('plan_id', planId)
        .eq('writer_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setDraft(data as ContentDraft);
        setContent(data.content || "");
        setLastSaved(new Date(data.last_saved_at));
      } else {
        // Create new draft
        const { data: newDraft, error: createError } = await supabase
          .from('content_drafts')
          .insert({
            plan_id: planId,
            writer_id: user.id,
            content: "",
            status: 'draft'
          })
          .select()
          .single();

        if (createError) throw createError;

        setDraft(newDraft as ContentDraft);
        setContent("");
        setLastSaved(new Date(newDraft.last_saved_at));
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải bản thảo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [planId, toast]);

  // Save draft
  const saveDraft = useCallback(async (newStatus?: 'draft' | 'in_progress' | 'done') => {
    if (!draft) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('content_drafts')
        .update({
          content,
          status: newStatus || draft.status,
          last_saved_at: new Date().toISOString()
        })
        .eq('id', draft.id);

      if (error) throw error;

      setLastSaved(new Date());
      setDraft(prev => prev ? { 
        ...prev, 
        content, 
        status: newStatus || prev.status,
        last_saved_at: new Date().toISOString()
      } : null);

      if (newStatus && onStatusChange) {
        onStatusChange(newStatus);
      }

      toast({
        title: "Đã lưu",
        description: "Bản thảo đã được lưu thành công",
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu bản thảo",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [draft, content, onStatusChange, toast]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!draft || !content) return;

    const autoSaveInterval = setInterval(() => {
      if (content !== draft.content) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [draft, content, saveDraft]);

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Bản thảo</Badge>;
      case 'in_progress':
        return <Badge variant="default">Đang viết</Badge>;
      case 'done':
        return <Badge variant="default" className="bg-green-500">Hoàn thành</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const updateStatus = (newStatus: 'draft' | 'in_progress' | 'done') => {
    saveDraft(newStatus);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{contentPlan.title}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>Từ khóa: <strong>{contentPlan.main_keyword}</strong></span>
                <span>Chủ đề: {contentPlan.main_topic}</span>
                <span>Độ dài: {contentPlan.content_length}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {draft && getStatusBadge(draft.status)}
              {lastSaved && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Lưu lần cuối: {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Editor and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Soạn thảo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                style={{ height: '400px' }}
              />
              
              <div className="flex items-center gap-2 pt-12">
                <Button 
                  onClick={() => saveDraft()} 
                  disabled={isSaving}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Đang lưu..." : "Lưu"}
                </Button>
                
                {draft?.status !== 'in_progress' && (
                  <Button 
                    variant="outline" 
                    onClick={() => updateStatus('in_progress')}
                    size="sm"
                  >
                    Bắt đầu viết
                  </Button>
                )}
                
                {draft?.status !== 'done' && (
                  <Button 
                    variant="default" 
                    onClick={() => updateStatus('done')}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Hoàn thành
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Xem trước</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none h-[400px] overflow-y-auto p-4 border rounded-md bg-muted/20"
              dangerouslySetInnerHTML={{ __html: content || "<p class='text-muted-foreground'>Nội dung sẽ hiển thị ở đây...</p>" }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}