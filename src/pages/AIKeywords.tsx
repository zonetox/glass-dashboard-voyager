import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Search, 
  Sparkles, 
  TrendingUp, 
  Target,
  Lightbulb,
  Copy,
  Download,
  RefreshCw,
  Plus,
  X,
  Hash,
  Heading1,
  Heading2,
  Heading3,
  FileText,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import StatusIndicator from '@/components/ui/status-indicator';
import { supabase } from '@/integrations/supabase/client';

interface KeywordGroup {
  category: string;
  keywords: string[];
  searchVolume?: string;
  difficulty?: string;
  intent?: string;
}

interface KeywordSuggestions {
  mainKeywords: string[];
  semanticGroups: KeywordGroup[];
  headingDistribution: {
    h1: string[];
    h2: string[];
    h3: string[];
    title: string[];
    metaDescription: string[];
  };
  contentStrategy: string;
}

export default function AIKeywordsPage() {
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<KeywordSuggestions | null>(null);
  const [activeTab, setActiveTab] = useState('input');
  const { toast } = useToast();
  const notifications = useNotifications();

  const addKeywordField = () => {
    if (keywords.length < 3) {
      setKeywords([...keywords, '']);
    }
  };

  const removeKeywordField = (index: number) => {
    if (keywords.length > 1) {
      setKeywords(keywords.filter((_, i) => i !== index));
    }
  };

  const updateKeyword = (index: number, value: string) => {
    const updated = [...keywords];
    updated[index] = value;
    setKeywords(updated);
  };

  const analyzeKeywords = async () => {
    const validKeywords = keywords.filter(k => k.trim());
    if (validKeywords.length === 0) {
      toast({
        title: "⚠️ Missing Keywords",
        description: "Please enter at least one keyword to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        notifications.showError("Authentication required", "Please sign in to use AI keyword analysis");
        return;
      }

      const response = await supabase.functions.invoke('ai-keyword-analysis', {
        body: { keywords: validKeywords }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setResults(response.data);
      setActiveTab('results');
      
      notifications.showNotification({
        title: "🎯 Keyword Analysis Complete",
        description: `Generated ${response.data.semanticGroups.length} semantic keyword groups`
      });

    } catch (error) {
      console.error('Keyword analysis failed:', error);
      notifications.showError(
        "Analysis Failed", 
        error instanceof Error ? error.message : "Failed to analyze keywords"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copied",
      description: "Content copied to clipboard"
    });
  };

  const exportResults = () => {
    if (!results) return;
    
    const exportData = {
      mainKeywords: results.mainKeywords,
      semanticGroups: results.semanticGroups,
      headingDistribution: results.headingDistribution,
      contentStrategy: results.contentStrategy,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keyword-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "💾 Export Complete",
      description: "Keyword analysis exported to JSON file"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20">
              <Brain className="h-8 w-8 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold text-white">AI Keywords</h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Nhập từ khóa chính để AI phân tích và gợi ý nhóm từ khóa semantic liên quan
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="input" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Nhập từ khóa
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2" disabled={!results}>
              <Sparkles className="h-4 w-4" />
              Kết quả phân tích
            </TabsTrigger>
            <TabsTrigger value="strategy" className="flex items-center gap-2" disabled={!results}>
              <Target className="h-4 w-4" />
              Chiến lược content
            </TabsTrigger>
          </TabsList>

          {/* Input Tab */}
          <TabsContent value="input" className="space-y-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Hash className="h-5 w-5 text-blue-400" />
                  Từ khóa chính (1-3 từ khóa)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {keywords.map((keyword, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input
                        value={keyword}
                        onChange={(e) => updateKeyword(index, e.target.value)}
                        placeholder={`Từ khóa ${index + 1} (ví dụ: SEO website)`}
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>
                    {keywords.length > 1 && (
                      <Button
                        onClick={() => removeKeywordField(index)}
                        variant="outline"
                        size="icon"
                        className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {keywords.length < 3 && (
                  <Button
                    onClick={addKeywordField}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm từ khóa
                  </Button>
                )}

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    onClick={analyzeKeywords}
                    disabled={isAnalyzing || keywords.every(k => !k.trim())}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang phân tích...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Phân tích với AI
                      </>
                    )}
                  </Button>
                  
                  {isAnalyzing && (
                    <StatusIndicator 
                      status="loading" 
                      message="AI đang phân tích từ khóa..." 
                      size="sm"
                    />
                  )}
                </div>

                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Mẹo:</strong> Nhập từ khóa chính của bạn (1-3 từ), AI sẽ phân tích và gợi ý các nhóm từ khóa semantic liên quan, 
                    cùng với cách phân bổ vào các phần heading, title và meta description.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {results && (
              <>
                {/* Export Actions */}
                <div className="flex items-center gap-3 justify-end">
                  <Button
                    onClick={exportResults}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button
                    onClick={() => setActiveTab('input')}
                    variant="outline"
                    size="sm"
                    className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Phân tích mới
                  </Button>
                </div>

                {/* Main Keywords */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Target className="h-5 w-5 text-green-400" />
                      Từ khóa chính
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {results.mainKeywords.map((keyword, index) => (
                        <Badge key={index} className="bg-green-500/20 text-green-300 border-green-500/20">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Semantic Groups */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Sparkles className="h-5 w-5 text-purple-400" />
                      Nhóm từ khóa semantic
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.semanticGroups.map((group, index) => (
                      <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white">{group.category}</h4>
                          <div className="flex items-center gap-2">
                            {group.intent && (
                              <Badge variant="secondary" className="text-xs">
                                {group.intent}
                              </Badge>
                            )}
                            <Button
                              onClick={() => copyToClipboard(group.keywords.join(', '))}
                              variant="ghost"
                              size="sm"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {group.keywords.map((keyword, keyIndex) => (
                            <Badge key={keyIndex} variant="outline" className="border-purple-500/20 text-purple-300">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Heading Distribution */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <FileText className="h-5 w-5 text-blue-400" />
                      Phân bổ heading & title
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* H1 Tags */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Heading1 className="h-4 w-4 text-red-400" />
                          <span className="font-medium text-white">H1 Tags</span>
                          <Button
                            onClick={() => copyToClipboard(results.headingDistribution.h1.join('\n'))}
                            variant="ghost"
                            size="sm"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {results.headingDistribution.h1.map((item, index) => (
                            <div key={index} className="text-sm text-gray-300 p-2 rounded bg-white/5">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* H2 Tags */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Heading2 className="h-4 w-4 text-yellow-400" />
                          <span className="font-medium text-white">H2 Tags</span>
                          <Button
                            onClick={() => copyToClipboard(results.headingDistribution.h2.join('\n'))}
                            variant="ghost"
                            size="sm"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {results.headingDistribution.h2.map((item, index) => (
                            <div key={index} className="text-sm text-gray-300 p-2 rounded bg-white/5">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* H3 Tags */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Heading3 className="h-4 w-4 text-green-400" />
                          <span className="font-medium text-white">H3 Tags</span>
                          <Button
                            onClick={() => copyToClipboard(results.headingDistribution.h3.join('\n'))}
                            variant="ghost"
                            size="sm"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {results.headingDistribution.h3.map((item, index) => (
                            <div key={index} className="text-sm text-gray-300 p-2 rounded bg-white/5">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Title & Meta */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-400" />
                          <span className="font-medium text-white">Title & Meta</span>
                          <Button
                            onClick={() => copyToClipboard([
                              'TITLES:', 
                              ...results.headingDistribution.title,
                              '',
                              'META DESCRIPTIONS:',
                              ...results.headingDistribution.metaDescription
                            ].join('\n'))}
                            variant="ghost"
                            size="sm"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400 uppercase tracking-wide">Titles</div>
                          {results.headingDistribution.title.map((item, index) => (
                            <div key={index} className="text-sm text-gray-300 p-2 rounded bg-white/5">
                              {item}
                            </div>
                          ))}
                          <div className="text-xs text-gray-400 uppercase tracking-wide mt-3">Meta Descriptions</div>
                          {results.headingDistribution.metaDescription.map((item, index) => (
                            <div key={index} className="text-sm text-gray-300 p-2 rounded bg-white/5">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Strategy Tab */}
          <TabsContent value="strategy" className="space-y-6">
            {results && (
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="h-5 w-5 text-orange-400" />
                    Chiến lược content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => copyToClipboard(results.contentStrategy)}
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Strategy
                      </Button>
                    </div>
                    <Textarea
                      value={results.contentStrategy}
                      readOnly
                      className="min-h-[400px] bg-white/5 border-white/20 text-white resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}