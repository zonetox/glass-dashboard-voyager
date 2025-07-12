
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Search, Loader2, CheckCircle, AlertCircle, Zap, Monitor, Smartphone, Brain, Code } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  url: string;
  title?: string;
  metaDescription?: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  images: {
    total: number;
    missingAlt: number;
    withAlt: number;
  };
  pageSpeedInsights?: {
    desktop: {
      score: number;
      lcp: number;
      fid: number;
      cls: number;
      fcp: number;
    };
    mobile: {
      score: number;
      lcp: number;
      fid: number;
      cls: number;
      fcp: number;
    };
    opportunities: string[];
  };
  aiAnalysis?: {
    citationPotential: string;
    semanticGaps: string[];
    faqSuggestions: string[];
    improvementSuggestions: string[];
  };
  schemaMarkup?: {
    type: string;
    jsonLd: any;
  };
  error?: string;
}

interface WebsiteAnalyzerProps {
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export function WebsiteAnalyzer({ onAnalysisComplete }: WebsiteAnalyzerProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeWebsite = async (websiteUrl: string) => {
    try {
      setIsAnalyzing(true);
      setProgress(0);
      setCurrentStep('Starting analysis...');
      setAnalysisResult(null);
      
      // Step 1: Website crawling
      setProgress(20);
      setCurrentStep('Crawling website content...');
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // UX delay
      
      // Step 2: PageSpeed analysis
      setProgress(40);
      setCurrentStep('Analyzing page speed...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 3: AI analysis
      setProgress(60);
      setCurrentStep('Running AI analysis...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 4: Schema generation
      setProgress(80);
      setCurrentStep('Generating schema markup...');
      
      // Call the analyze-website edge function
      const { data, error } = await supabase.functions.invoke('analyze-website', {
        body: { url: websiteUrl }
      });
      
      if (error) {
        throw new Error(error.message || 'Analysis failed');
      }
      
      if (data && !data.error) {
        setProgress(100);
        setCurrentStep('Analysis complete!');
        setAnalysisResult(data);
        
        if (onAnalysisComplete) {
          onAnalysisComplete(data);
        }
        
        toast({
          title: "Analysis Complete",
          description: `Successfully analyzed ${websiteUrl}`,
        });
      } else {
        throw new Error(data?.error || 'Analysis returned empty result');
      }
      
    } catch (error: any) {
      console.error('Analysis error:', error);
      setError(error.message || 'Analysis failed');
      setProgress(0);
      setCurrentStep('');
      toast({
        title: "Analysis Failed",
        description: error.message || 'Failed to analyze website. Please check if the URL is accessible and API keys are configured.',
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    try {
      // Add protocol if missing
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      await analyzeWebsite(formattedUrl);
      setUrl('');
    } catch (err) {
      setError('Invalid URL format');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Analysis Input Form */}
      <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Globe className="h-5 w-5 text-blue-400" />
            Website SEO Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="website-url" className="text-gray-300">
                Website URL
              </Label>
              <Input
                id="website-url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-400"
                disabled={isAnalyzing}
              />
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze Website
                </>
              )}
            </Button>
          </form>

          {/* Progress Tracking */}
          {isAnalyzing && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{currentStep}</span>
                <span className="text-blue-400">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-sm text-blue-300">
              <strong>Analysis includes:</strong> SEO score, meta tags, performance, 
              mobile-friendliness, AI citation potential, and schema markup.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Analysis Results for {analysisResult.url}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-white/5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="ai">AI Analysis</TabsTrigger>
                <TabsTrigger value="schema">Schema</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-gray-400">Title</Label>
                        <p className="text-white">{analysisResult.title || 'No title found'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Meta Description</Label>
                        <p className="text-white text-sm">{analysisResult.metaDescription || 'No description found'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">{analysisResult.headings.h1.length}</div>
                        <div className="text-sm text-gray-400">H1 Tags</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">{analysisResult.images.total}</div>
                        <div className="text-sm text-gray-400">Images</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-400">{analysisResult.images.missingAlt}</div>
                        <div className="text-sm text-gray-400">Missing Alt</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400">{analysisResult.headings.h2.length + analysisResult.headings.h3.length}</div>
                        <div className="text-sm text-gray-400">H2-H3 Tags</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="performance" className="space-y-4">
                {analysisResult.pageSpeedInsights ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">Desktop Performance</h3>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${getScoreColor(analysisResult.pageSpeedInsights.desktop.score)}`}>
                            {analysisResult.pageSpeedInsights.desktop.score}
                          </div>
                          <div className="text-sm text-gray-400">Performance Score</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-green-400" />
                        <h3 className="text-lg font-semibold text-white">Mobile Performance</h3>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${getScoreColor(analysisResult.pageSpeedInsights.mobile.score)}`}>
                            {analysisResult.pageSpeedInsights.mobile.score}
                          </div>
                          <div className="text-sm text-gray-400">Performance Score</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">Performance data not available</p>
                )}
                
                {analysisResult.pageSpeedInsights?.opportunities && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Optimization Opportunities</h3>
                    <div className="space-y-2">
                      {analysisResult.pageSpeedInsights.opportunities.map((opportunity, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-white/5 rounded">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <span className="text-gray-300">{opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="seo" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">SEO Elements</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">H1 Headings</span>
                        <Badge variant={analysisResult.headings.h1.length === 1 ? "default" : "destructive"}>
                          {analysisResult.headings.h1.length} found
                        </Badge>
                      </div>
                      {analysisResult.headings.h1.map((h1, index) => (
                        <p key={index} className="text-sm text-gray-300">{h1}</p>
                      ))}
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">Images</span>
                        <Badge variant={analysisResult.images.missingAlt === 0 ? "default" : "destructive"}>
                          {analysisResult.images.missingAlt} missing alt text
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-300">
                        {analysisResult.images.total} total images, {analysisResult.images.withAlt} with alt text
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="ai" className="space-y-4">
                {analysisResult.aiAnalysis ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">AI Citation Analysis</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-medium text-white mb-2">Citation Potential</h4>
                        <p className="text-gray-300 text-sm">{analysisResult.aiAnalysis.citationPotential}</p>
                      </div>
                      
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-medium text-white mb-2">Improvement Suggestions</h4>
                        <ul className="space-y-1">
                          {analysisResult.aiAnalysis.improvementSuggestions.map((suggestion, index) => (
                            <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                              <AlertCircle className="h-3 w-3 text-blue-400 mt-1 flex-shrink-0" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-medium text-white mb-2">FAQ Suggestions</h4>
                        <ul className="space-y-1">
                          {analysisResult.aiAnalysis.faqSuggestions.map((faq, index) => (
                            <li key={index} className="text-gray-300 text-sm">{faq}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">AI analysis not available</p>
                )}
              </TabsContent>
              
              <TabsContent value="schema" className="space-y-4">
                {analysisResult.schemaMarkup ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-green-400" />
                      <h3 className="text-lg font-semibold text-white">Schema.org Markup</h3>
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">{analysisResult.schemaMarkup.type}</Badge>
                        <span className="text-sm text-gray-400">Schema Type</span>
                      </div>
                      <pre className="text-sm text-gray-300 bg-black/20 p-3 rounded overflow-x-auto">
                        {JSON.stringify(analysisResult.schemaMarkup.jsonLd, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">Schema markup not generated</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
