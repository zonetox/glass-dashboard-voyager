import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, 
  Code, 
  MessageSquare, 
  Loader2,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function VoiceSearchOptimizer() {
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [schemaResult, setSchemaResult] = useState<any>(null);
  const [rewriteResult, setRewriteResult] = useState<any>(null);
  const [copiedSchema, setCopiedSchema] = useState<string | null>(null);
  const { toast } = useToast();

  const generateSchemas = async () => {
    if (!content.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung để tối ưu",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('voice-search-optimizer', {
        body: {
          content,
          url,
          optimizationType: 'schema'
        }
      });

      if (error) throw error;
      setSchemaResult(data);
      
      toast({
        title: "Thành công",
        description: "Đã tạo schema cho voice search!"
      });
    } catch (error) {
      console.error('Schema generation error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo schema. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const optimizeContent = async () => {
    if (!content.trim()) {
      toast({
        title: "Lỗi", 
        description: "Vui lòng nhập nội dung để tối ưu",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('voice-search-optimizer', {
        body: {
          content,
          url,
          optimizationType: 'rewrite'
        }
      });

      if (error) throw error;
      setRewriteResult(data);
      
      toast({
        title: "Thành công",
        description: "Đã tối ưu nội dung cho voice search!"
      });
    } catch (error) {
      console.error('Content optimization error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tối ưu nội dung. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSchema(type);
      setTimeout(() => setCopiedSchema(null), 2000);
      
      toast({
        title: "Đã sao chép",
        description: "Schema đã được sao chép vào clipboard"
      });
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Tối ưu Voice Search
        </h1>
        <p className="text-muted-foreground">
          Tạo schema và rewrite content cho tìm kiếm bằng giọng nói
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Nội dung cần tối ưu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Nhập nội dung website của bạn..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] glass-input"
          />
          
          <div className="flex gap-4">
            <Button 
              onClick={generateSchemas}
              disabled={isLoading}
              className="gradient-primary"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Code className="h-4 w-4 mr-2" />
              )}
              Tạo Schema
            </Button>
            
            <Button 
              onClick={optimizeContent}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <MessageSquare className="h-4 w-4 mr-2" />
              )}
              Tối ưu nội dung
            </Button>
          </div>
        </CardContent>
      </Card>

      {(schemaResult || rewriteResult) && (
        <Tabs defaultValue="schemas" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schemas">Schema Markup</TabsTrigger>
            <TabsTrigger value="content">Nội dung tối ưu</TabsTrigger>
          </TabsList>

          <TabsContent value="schemas" className="space-y-4">
            {schemaResult && (
              <div className="grid gap-4">
                {schemaResult.faqSchema && (
                  <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">FAQ Schema</CardTitle>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(JSON.stringify(schemaResult.faqSchema, null, 2), 'faq')}
                      >
                        {copiedSchema === 'faq' ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(schemaResult.faqSchema, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {schemaResult.speakableSchema && (
                  <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">Speakable Schema</CardTitle>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(JSON.stringify(schemaResult.speakableSchema, null, 2), 'speakable')}
                      >
                        {copiedSchema === 'speakable' ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(schemaResult.speakableSchema, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            {rewriteResult && (
              <div className="space-y-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Nội dung tối ưu Voice Search</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      {rewriteResult.voiceOptimizedContent}
                    </div>
                  </CardContent>
                </Card>

                {rewriteResult.shortAnswers && (
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Câu trả lời ngắn</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {rewriteResult.shortAnswers.map((answer: string, index: number) => (
                          <Badge key={index} variant="secondary" className="p-2 text-sm">
                            {answer}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {rewriteResult.questionAnswerPairs && (
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Cặp hỏi-đáp</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {rewriteResult.questionAnswerPairs.map((pair: any, index: number) => (
                          <div key={index} className="border-l-4 border-primary pl-4">
                            <p className="font-medium text-primary">{pair.question}</p>
                            <p className="text-muted-foreground mt-1">{pair.answer}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}