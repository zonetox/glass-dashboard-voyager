import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DOMPurify from 'dompurify';
import { 
  FileText, 
  Languages, 
  PenTool, 
  Eye, 
  Upload, 
  Calendar, 
  Globe, 
  Loader2,
  Clock,
  Target,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Copy,
  Save,
  Send,
  Trash2,
  Settings
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  keyword: string;
  language: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  tags: string[];
  categories: string[];
  outline: any;
  ai_score: number;
  word_count: number;
  reading_time: number;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  wordpress_post_id: number | null;
  wordpress_url: string | null;
  created_at: string;
  updated_at: string;
}

interface MultiLangContentWriterProps {
  className?: string;
}

const LANGUAGES = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' }
];

const CONTENT_TYPES = [
  { value: 'blog', label: 'Blog Post' },
  { value: 'article', label: 'Article' },
  { value: 'guide', label: 'How-to Guide' },
  { value: 'review', label: 'Review' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'news', label: 'News' }
];

export default function MultiLangContentWriter({ className }: MultiLangContentWriterProps) {
  const [activeTab, setActiveTab] = useState('writer');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Form states
  const [keyword, setKeyword] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('vi');
  const [contentType, setContentType] = useState('blog');
  const [wordCount, setWordCount] = useState(1500);
  const [scheduledDate, setScheduledDate] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts();
    }
  }, [activeTab]);

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bài viết",
        variant: "destructive",
      });
    } finally {
      setLoadingPosts(false);
    }
  };

  const generateContent = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập từ khóa",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-writer', {
        body: {
          keyword: keyword.trim(),
          language: selectedLanguage,
          content_type: contentType,
          word_count: wordCount,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;

      setSelectedPost(data.post);
      setActiveTab('preview');
      
      toast({
        title: "Tạo nội dung thành công",
        description: `Đã tạo bài viết ${data.metrics.word_count} từ với điểm AI: ${data.metrics.ai_score}/100`,
      });

      // Refresh posts list
      if (activeTab === 'posts') {
        fetchPosts();
      }

    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Lỗi tạo nội dung",
        description: "Không thể tạo nội dung AI",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const publishToWordPress = async (post: Post) => {
    setIsPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke('publish-to-wordpress', {
        body: {
          post_id: post.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          scheduled_at: scheduledDate || null
        }
      });

      if (error) throw error;

      // Update post status
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          status: scheduledDate ? 'scheduled' : 'published',
          published_at: scheduledDate ? null : new Date().toISOString(),
          scheduled_at: scheduledDate ? new Date(scheduledDate).toISOString() : null,
          wordpress_post_id: data.wordpress_post_id,
          wordpress_url: data.wordpress_url
        })
        .eq('id', post.id);

      if (updateError) throw updateError;

      toast({
        title: "Xuất bản thành công",
        description: scheduledDate ? "Bài viết đã được lên lịch" : "Bài viết đã được đăng lên WordPress",
      });

      // Refresh posts
      fetchPosts();

    } catch (error) {
      console.error('Error publishing post:', error);
      toast({
        title: "Lỗi xuất bản",
        description: "Không thể đăng bài lên WordPress",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const updatePostStatus = async (postId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ status })
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, status } : p
      ));

      toast({
        title: "Cập nhật thành công",
        description: `Trạng thái bài viết đã được thay đổi thành ${status}`,
      });
    } catch (error) {
      console.error('Error updating post status:', error);
      toast({
        title: "Lỗi cập nhật",
        description: "Không thể cập nhật trạng thái bài viết",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== postId));

      toast({
        title: "Xóa thành công",
        description: "Bài viết đã được xóa",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Lỗi xóa",
        description: "Không thể xóa bài viết",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Đã copy",
        description: `${type} đã được copy vào clipboard`,
      });
    }).catch(() => {
      toast({
        title: "Lỗi",
        description: "Không thể copy vào clipboard",
        variant: "destructive",
      });
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getLanguageInfo = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code) || LANGUAGES[0];
  };

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="writer" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            AI Writer
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Bài viết của tôi
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="writer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                AI Content Writer
              </CardTitle>
              <CardDescription>
                Tạo nội dung đa ngôn ngữ với AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="keyword">Từ khóa chính</Label>
                  <Input
                    id="keyword"
                    placeholder="Nhập từ khóa..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="language">Ngôn ngữ</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <div className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="content-type">Loại nội dung</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="word-count">Số từ mục tiêu</Label>
                  <Input
                    id="word-count"
                    type="number"
                    min="500"
                    max="5000"
                    step="100"
                    value={wordCount}
                    onChange={(e) => setWordCount(parseInt(e.target.value) || 1500)}
                  />
                </div>
              </div>

              <Button
                onClick={generateContent}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PenTool className="h-4 w-4 mr-2" />
                )}
                Tạo nội dung AI
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Danh sách bài viết
              </CardTitle>
              <CardDescription>
                Quản lý các bài viết đã tạo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPosts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Đang tải...</span>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có bài viết nào
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => {
                    const langInfo = getLanguageInfo(post.language);
                    
                    return (
                      <Card key={post.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium line-clamp-1">{post.title}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={getStatusColor(post.status)}>
                                  {post.status}
                                </Badge>
                                <Badge variant="outline">
                                  {langInfo.flag} {langInfo.name}
                                </Badge>
                                <Badge variant="outline" className={getScoreColor(post.ai_score)}>
                                  AI: {post.ai_score}/100
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <span>Từ khóa: {post.keyword}</span>
                              <span>{post.word_count} từ</span>
                              <span>{post.reading_time} phút đọc</span>
                              <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>

                            {post.excerpt && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {post.excerpt}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPost(post);
                                setActiveTab('preview');
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {post.status === 'draft' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => publishToWordPress(post)}
                                disabled={isPublishing}
                              >
                                {isPublishing ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            
                            {post.wordpress_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(post.wordpress_url!, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deletePost(post.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {selectedPost ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Preview: {selectedPost.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {getLanguageInfo(selectedPost.language).flag} {getLanguageInfo(selectedPost.language).name}
                    </Badge>
                    <Badge variant="outline" className={getScoreColor(selectedPost.ai_score)}>
                      AI Score: {selectedPost.ai_score}/100
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription>
                  {selectedPost.word_count} từ • {selectedPost.reading_time} phút đọc • Từ khóa: {selectedPost.keyword}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Meta Information */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">SEO Title</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={selectedPost.meta_title} readOnly />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedPost.meta_title, 'SEO Title')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Meta Description</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Textarea value={selectedPost.meta_description} readOnly rows={2} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedPost.meta_description, 'Meta Description')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Content Preview */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Nội dung</Label>
                  <Card className="p-4">
                    <ScrollArea className="h-96">
                      <div 
                        className="prose max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ 
                          __html: DOMPurify.sanitize(selectedPost.content, {
                            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img'],
                            ALLOWED_ATTR: ['href', 'class', 'target', 'rel', 'src', 'alt']
                          })
                        }}
                      />
                    </ScrollArea>
                  </Card>
                </div>

                {/* Tags and Categories */}
                {(selectedPost.tags.length > 0 || selectedPost.categories.length > 0) && (
                  <div className="flex flex-wrap gap-4">
                    {selectedPost.tags.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedPost.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedPost.categories.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Categories</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedPost.categories.map((category, index) => (
                            <Badge key={index} variant="outline">{category}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Publishing Options */}
                {selectedPost.status === 'draft' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="scheduled-date">Lên lịch xuất bản (tùy chọn)</Label>
                      <Input
                        id="scheduled-date"
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => publishToWordPress(selectedPost)}
                        disabled={isPublishing}
                        className="flex-1"
                      >
                        {isPublishing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        {scheduledDate ? 'Lên lịch đăng' : 'Đăng ngay'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => updatePostStatus(selectedPost.id, 'published')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Đánh dấu đã đăng
                      </Button>
                    </div>
                  </div>
                )}
                
                {selectedPost.wordpress_url && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedPost.wordpress_url!, '_blank')}
                      className="w-full"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Xem trên WordPress
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chọn bài viết để xem preview</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}