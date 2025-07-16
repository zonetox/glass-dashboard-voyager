import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PenTool, FileText, Loader2, Copy, Download, Search, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ContentDuplicationChecker } from './content-duplication-checker';

interface WriteResponse {
  title: string;
  meta_description: string;
  outline: string[];
  markdown_content: string;
  html_content: string;
  schema_markup: object;
}

interface DuplicationResult {
  is_duplicate: boolean;
  similarity_score: number;
  existing_content: Array<{
    title: string;
    url: string;
    similarity: number;
  }>;
  suggested_angles: string[];
  search_results: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

export function ContentWriter() {
  const [topic, setTopic] = useState('');
  const [keyword, setKeyword] = useState('');
  const [articleType, setArticleType] = useState<string>('');
  const [tone, setTone] = useState<string>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingDuplication, setIsCheckingDuplication] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<WriteResponse | null>(null);
  const [duplicationResult, setDuplicationResult] = useState<DuplicationResult | null>(null);
  const [showDuplicationWarning, setShowDuplicationWarning] = useState(false);
  
  // WordPress publishing states
  const [showWordPressModal, setShowWordPressModal] = useState(false);
  const [isPublishingToWP, setIsPublishingToWP] = useState(false);
  const [wordpressUrl, setWordpressUrl] = useState('');
  const [wpUsername, setWpUsername] = useState('');
  const [wpPassword, setWpPassword] = useState('');
  const [publishDate, setPublishDate] = useState('');
  
  const { toast } = useToast();

  const handleDuplicationCheck = (result: DuplicationResult) => {
    setDuplicationResult(result);
    setShowDuplicationWarning(result.is_duplicate);
  };

  const generateContent = async () => {
    if (!topic.trim() || !keyword.trim() || !articleType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Show warning if duplication detected and user hasn't been warned
    if (duplicationResult?.is_duplicate && showDuplicationWarning) {
      const proceed = confirm(
        `⚠️ Content duplication detected (${duplicationResult.similarity_score}% similar)!\n\nWe found similar content that might affect your SEO ranking. Consider using one of the suggested fresh angles instead.\n\nDo you want to proceed anyway?`
      );
      
      if (!proceed) {
        return;
      }
      setShowDuplicationWarning(false);
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('write', {
        body: { 
          topic: topic.trim(),
          keyword: keyword.trim(),
          article_type: articleType,
          tone
        }
      });

      if (error) throw error;

      setGeneratedContent(data);
      toast({
        title: "Success",
        description: "Article generated successfully!"
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard"
    });
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const publishToWordPress = async () => {
    if (!wordpressUrl || !wpUsername || !wpPassword || !generatedContent) {
      toast({
        title: "Error",
        description: "Please fill in all WordPress credentials",
        variant: "destructive"
      });
      return;
    }

    setIsPublishingToWP(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('schedule-to-wordpress', {
        body: {
          wordpressUrl: wordpressUrl.trim(),
          username: wpUsername.trim(),
          password: wpPassword.trim(),
          title: generatedContent.title,
          content: generatedContent.html_content,
          publishDate: publishDate || undefined
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Post successfully published to WordPress"
        });
        setShowWordPressModal(false);
        // Reset form
        setWordpressUrl('');
        setWpUsername('');
        setWpPassword('');
        setPublishDate('');
      } else {
        throw new Error(data.error || 'Failed to publish to WordPress');
      }
    } catch (error) {
      console.error('Error publishing to WordPress:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to publish to WordPress. Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setIsPublishingToWP(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Duplication Checker */}
      <ContentDuplicationChecker 
        onCheck={handleDuplicationCheck}
        isChecking={isCheckingDuplication}
      />
      
      {duplicationResult?.is_duplicate && showDuplicationWarning && (
        <Card className="glass-card border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="text-yellow-400 text-xl">⚠️</div>
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-300 mb-2">Content Duplication Warning</h4>
                <p className="text-yellow-200 text-sm mb-3">
                  Similar content detected ({duplicationResult.similarity_score}% similarity). 
                  Consider using a fresh angle to avoid SEO penalties.
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowDuplicationWarning(false)}
                    className="border-yellow-500/20 text-yellow-300 hover:bg-yellow-500/10"
                  >
                    I understand, proceed anyway
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <PenTool className="h-5 w-5 text-orange-400" />
            AI Content Writer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="text-gray-300 mb-2 block">Topic *</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Best Natural Sunscreens for Sensitive Skin"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Target Keyword *</Label>
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., natural sunscreen"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Article Type *</Label>
              <Select value={articleType} onValueChange={setArticleType}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select article type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="how-to">How-to Guide</SelectItem>
                  <SelectItem value="product">Product Article</SelectItem>
                  <SelectItem value="listicle">Listicle</SelectItem>
                  <SelectItem value="guide">Comprehensive Guide</SelectItem>
                  <SelectItem value="comparison">Comparison</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="authoritative">Authoritative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateContent}
            disabled={isGenerating}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Article
              </>
            )}
          </Button>

          <p className="text-sm text-gray-400 mt-4">
            Generate SEO-optimized articles with proper structure, meta descriptions, and schema markup.
          </p>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-white">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-400" />
                Generated Content
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadAsFile(generatedContent.markdown_content, `${topic.slice(0, 30)}.md`)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Dialog open={showWordPressModal} onOpenChange={setShowWordPressModal}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Đăng lên WordPress
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-gray-900 border-white/10">
                    <DialogHeader>
                      <DialogTitle className="text-white">Publish to WordPress</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-300 mb-2 block">WordPress Site URL *</Label>
                        <Input
                          value={wordpressUrl}
                          onChange={(e) => setWordpressUrl(e.target.value)}
                          placeholder="https://your-site.com"
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-gray-300 mb-2 block">Username *</Label>
                        <Input
                          value={wpUsername}
                          onChange={(e) => setWpUsername(e.target.value)}
                          placeholder="WordPress username"
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-gray-300 mb-2 block">Password / Application Password *</Label>
                        <Input
                          type="password"
                          value={wpPassword}
                          onChange={(e) => setWpPassword(e.target.value)}
                          placeholder="WordPress password"
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-gray-300 mb-2 block">Publish Date (optional)</Label>
                        <Input
                          type="datetime-local"
                          value={publishDate}
                          onChange={(e) => setPublishDate(e.target.value)}
                          className="bg-white/5 border-white/10 text-white"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Leave empty for immediate draft, or set future date for scheduling
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowWordPressModal(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={publishToWordPress}
                          disabled={isPublishingToWP}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          {isPublishingToWP ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Publishing...
                            </>
                          ) : (
                            'Publish'
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5 bg-white/5">
                <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/10">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="markdown" className="text-white data-[state=active]:bg-white/10">
                  Markdown
                </TabsTrigger>
                <TabsTrigger value="html" className="text-white data-[state=active]:bg-white/10">
                  HTML
                </TabsTrigger>
                <TabsTrigger value="schema" className="text-white data-[state=active]:bg-white/10">
                  Schema
                </TabsTrigger>
                <TabsTrigger value="seo" className="text-white data-[state=active]:bg-white/10">
                  SEO Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white">Article Title</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedContent.title)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-green-300 text-lg">{generatedContent.title}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white">Meta Description</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedContent.meta_description)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-gray-300">{generatedContent.meta_description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">Article Outline</h3>
                  <div className="space-y-2">
                    {generatedContent.outline.map((heading, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/20">
                          H{index + 2}
                        </Badge>
                        <span className="text-gray-300">{heading}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="markdown">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => copyToClipboard(generatedContent.markdown_content)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Textarea
                    value={generatedContent.markdown_content}
                    readOnly
                    className="min-h-[400px] bg-white/5 border-white/10 text-white font-mono text-sm"
                  />
                </div>
              </TabsContent>

              <TabsContent value="html">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => copyToClipboard(generatedContent.html_content)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Textarea
                    value={generatedContent.html_content}
                    readOnly
                    className="min-h-[400px] bg-white/5 border-white/10 text-white font-mono text-sm"
                  />
                </div>
              </TabsContent>

              <TabsContent value="schema">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => copyToClipboard(JSON.stringify(generatedContent.schema_markup, null, 2))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Textarea
                    value={JSON.stringify(generatedContent.schema_markup, null, 2)}
                    readOnly
                    className="min-h-[400px] bg-white/5 border-white/10 text-white font-mono text-sm"
                  />
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="font-semibold text-white mb-2">Title Length</h4>
                    <p className={`text-sm ${generatedContent.title.length <= 60 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {generatedContent.title.length}/60 characters
                    </p>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="font-semibold text-white mb-2">Meta Description Length</h4>
                    <p className={`text-sm ${generatedContent.meta_description.length <= 155 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {generatedContent.meta_description.length}/155 characters
                    </p>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="font-semibold text-white mb-2">Word Count</h4>
                    <p className="text-green-400 text-sm">
                      ~{generatedContent.markdown_content.split(' ').length} words
                    </p>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="font-semibold text-white mb-2">Headings</h4>
                    <p className="text-blue-400 text-sm">
                      {generatedContent.outline.length} main sections
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
