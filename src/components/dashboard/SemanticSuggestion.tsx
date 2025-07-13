import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Brain, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Lightbulb,
  PenTool,
  Target,
  Info,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SemanticResult {
  id: string;
  url: string;
  main_topic: string | null;
  missing_topics: string[] | null;
  search_intent: string | null;
  entities: string[] | null;
  created_at: string;
}

// Type for database result
interface SemanticDbResult {
  id: string;
  url: string;
  main_topic: string | null;
  missing_topics: any; // JSONB type from database
  search_intent: string | null;
  entities: any; // JSONB type from database
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface SemanticSuggestionProps {
  url: string;
  content?: string;
}

export function SemanticSuggestion({ url, content }: SemanticSuggestionProps) {
  const { toast } = useToast();
  const [semanticData, setSemanticData] = useState<SemanticResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // Check if we have existing semantic analysis data
  useEffect(() => {
    const fetchSemanticData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('semantic_results')
          .select('*')
          .eq('url', url)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching semantic data:', error);
          return;
        }

        if (data) {
          // Convert database result to component format with proper type checking
          const semanticResult: SemanticResult = {
            id: data.id,
            url: data.url,
            main_topic: data.main_topic,
            missing_topics: Array.isArray(data.missing_topics) 
              ? data.missing_topics.filter((item): item is string => typeof item === 'string')
              : [],
            search_intent: data.search_intent,
            entities: Array.isArray(data.entities) 
              ? data.entities.filter((item): item is string => typeof item === 'string')
              : [],
            created_at: data.created_at
          };
          setSemanticData(semanticResult);
        }
      } catch (error) {
        console.error('Error in fetchSemanticData:', error);
      }
    };

    fetchSemanticData();
  }, [url]);

  const handleAnalyze = async () => {
    if (!content) {
      toast({
        title: "Content required",
        description: "Please provide content to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await supabase.functions.invoke('semantic-analysis', {
        body: {
          url,
          content: content.trim(),
          user_id: user?.id
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Analysis failed');
      }

      const result = response.data;
      
      // Create semantic result object
      const semanticResult: SemanticResult = {
        id: crypto.randomUUID(),
        url,
        main_topic: result.main_topic,
        missing_topics: result.missing_topics,
        search_intent: result.search_intent,
        entities: result.entities,
        created_at: new Date().toISOString()
      };

      setSemanticData(semanticResult);

      toast({
        title: "Analysis completed",
        description: "Semantic analysis has been generated successfully"
      });

    } catch (error) {
      console.error('Semantic analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : 'Failed to analyze content',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateContent = async (topic: string) => {
    setIsGenerating(topic);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await supabase.functions.invoke('rewrite-content', {
        body: {
          type: 'paragraph',
          url,
          original_content: `Write a comprehensive section about: ${topic}`,
          user_id: user?.id
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Content generation failed');
      }

      const result = response.data;
      
      toast({
        title: "Content generated",
        description: `Content for "${topic}" has been generated successfully`,
      });

      // You can handle the generated content here (show in modal, copy to clipboard, etc.)
      console.log('Generated content:', result);

    } catch (error) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : 'Failed to generate content',
        variant: "destructive"
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const getIntentIcon = (intent: string | null) => {
    switch (intent?.toLowerCase()) {
      case 'informational': return '📖';
      case 'transactional': return '💳';
      case 'navigational': return '🧭';
      case 'commercial': return '🛒';
      default: return '🔍';
    }
  };

  const getIntentColor = (intent: string | null) => {
    switch (intent?.toLowerCase()) {
      case 'informational': return 'bg-blue-500/20 border-blue-500/20 text-blue-400';
      case 'transactional': return 'bg-green-500/20 border-green-500/20 text-green-400';
      case 'navigational': return 'bg-purple-500/20 border-purple-500/20 text-purple-400';
      case 'commercial': return 'bg-orange-500/20 border-orange-500/20 text-orange-400';
      default: return 'bg-muted';
    }
  };

  return (
    <TooltipProvider>
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-5 w-5 text-purple-400" />
            Semantic Analysis
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Analyze content to understand main topics, missing elements, and search intent</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!semanticData && (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No semantic analysis found for this URL
              </p>
              <Button
                onClick={handleAnalyze}
                disabled={isLoading || !content}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze Content
                  </>
                )}
              </Button>
            </div>
          )}

          {semanticData && (
            <div className="grid gap-6">
              {/* Main Topic */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <h3 className="text-white font-medium">Main Topic</h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The primary topic identified in your content</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-300 font-medium">
                    {semanticData.main_topic || 'No main topic identified'}
                  </p>
                </div>
              </div>

              {/* Search Intent */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  <h3 className="text-white font-medium">Search Intent</h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The type of search query this content is designed to answer</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getIntentIcon(semanticData.search_intent)}</span>
                  <Badge className={getIntentColor(semanticData.search_intent)}>
                    {semanticData.search_intent || 'Unknown'}
                  </Badge>
                </div>
              </div>

              {/* Entities */}
              {semanticData.entities && semanticData.entities.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-400" />
                    <h3 className="text-white font-medium">Related Entities</h3>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Important entities, brands, locations, and keywords found in your content</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {semanticData.entities.map((entity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        🧠 {entity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Topics */}
              {semanticData.missing_topics && semanticData.missing_topics.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-400" />
                    <h3 className="text-white font-medium">Missing Topics</h3>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Related subtopics that could improve your content's completeness</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-3">
                    {semanticData.missing_topics.map((topic, index) => (
                      <div key={index} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                            <span className="text-red-300 text-sm">{topic}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGenerateContent(topic)}
                            disabled={isGenerating === topic}
                            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/20 hover:bg-purple-500/30 text-white"
                          >
                            {isGenerating === topic ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <PenTool className="h-3 w-3 mr-1" />
                                Write Content
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Refresh Analysis */}
              <div className="pt-4 border-t border-white/10">
                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full bg-white/5 border-white/20 hover:bg-white/10 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Re-analyzing...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Refresh Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}