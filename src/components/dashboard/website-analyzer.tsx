
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Search, Loader2, CheckCircle, AlertCircle, Zap, Monitor, Smartphone, Brain, Code, FileDown, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { StandardizedSEOResults } from './StandardizedSEOResults';
import { StandardizedSEOAnalyzer } from '@/lib/standardized-seo-analyzer';
import html2pdf from 'html2pdf.js';
import { CoreWebVitalsChart } from './CoreWebVitalsChart';
import { SEODeepDetails } from './SEODeepDetails';


interface AnalysisResult {
  seo: {
    title: string;
    metaDescription: string;
    h1: string[];
    h2: string[];
    h3: string[];
    images: Array<{
      src: string;
      alt: string;
    }>;
    totalImages: number;
    imagesWithoutAlt: number;
    canonical: string;
    robotsMeta: string;
    viewport: string;
    wordCount: number;
  };
  performance: {
    mobile: {
      score: number;
      metrics: any;
    } | null;
    desktop: {
      score: number;
      metrics: any;
    } | null;
  };
  aiAnalysis: {
    searchIntent: string;
    semanticTopics: string[];
    contentGap: string[];
    suggestions: {
      newTitle: string;
      improvedMeta: string;
      extraHeadings: string[];
    };
    keywordDensity: Array<{
      keyword: string;
      count: number;
    }>;
    technicalSEO: {
      hasCanonical: boolean;
      robotsDirective: string;
      headingStructure: string;
      imageOptimization: string;
    };
    overallScore: number;
    priorityIssues: string[];
  };
  standardizedAnalysis?: any;
  formattedOutput?: string;
  scanId?: string;
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
      
      // Call the analyze-site edge function
      console.log('Calling analyze-site function with URL:', websiteUrl);
      const { data, error } = await supabase.functions.invoke('analyze-site', {
        body: { url: websiteUrl }
      });
      
      console.log('Edge function response:', { data, error });
      
      if (error) {
        console.error('Edge function error:', error);
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

  const handleExportPDF = () => {
    const content = document.getElementById('analysis-report');
    if (!content) return;

    const options = {
      margin: 1,
      filename: 'SEO-Analysis-Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    } as any;

    // @ts-ignore
    html2pdf().set(options).from(content).save();

    toast({
      title: 'Đang xuất PDF',
      description: 'File PDF sẽ được tải xuống trong giây lát',
    });
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

          {/* Quick Test Button */}
          <div className="mt-4 space-y-3">
            <Button 
              onClick={() => analyzeWebsite('https://example.com')}
              variant="outline"
              className="w-full"
              disabled={isAnalyzing}
            >
              Test with Example.com
            </Button>
          </div>

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
        <Card id="analysis-report" className="glass-card border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <CheckCircle className="h-5 w-5 text-green-400" />
                Analysis Results
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <FileDown className="h-4 w-4 mr-2" />
                Xuất PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="standardized" className="w-full">
              <TabsList className="grid w-full grid-cols-7 bg-white/5">
                <TabsTrigger value="standardized">Chuẩn Hóa</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="details">Chi tiết</TabsTrigger>
                <TabsTrigger value="ai">AI Analysis</TabsTrigger>
                <TabsTrigger value="schema">Schema</TabsTrigger>
              </TabsList>
              
              <TabsContent value="standardized" className="space-y-4">
                <StandardizedSEOResults 
                  standardizedAnalysis={analysisResult.standardizedAnalysis}
                  formattedOutput={analysisResult.formattedOutput || 'No formatted output available'}
                />
              </TabsContent>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-gray-400">Title</Label>
                        <p className="text-white">{analysisResult.seo.title || 'No title found'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Meta Description</Label>
                        <p className="text-white text-sm">{analysisResult.seo.metaDescription || 'No description found'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">{analysisResult.seo.h1.length}</div>
                        <div className="text-sm text-gray-400">H1 Tags</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">{analysisResult.seo.totalImages}</div>
                        <div className="text-sm text-gray-400">Images</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-400">{analysisResult.seo.imagesWithoutAlt}</div>
                        <div className="text-sm text-gray-400">Missing Alt</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400">{analysisResult.seo.h2.length + analysisResult.seo.h3.length}</div>
                        <div className="text-sm text-gray-400">H2-H3 Tags</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="performance" className="space-y-4">
                <CoreWebVitalsChart desktopMetrics={analysisResult.performance.desktop?.metrics} mobileMetrics={analysisResult.performance.mobile?.metrics} />
                {(analysisResult.performance.desktop || analysisResult.performance.mobile) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysisResult.performance.desktop && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-5 w-5 text-blue-400" />
                          <h3 className="text-lg font-semibold text-white">Desktop Performance</h3>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                          <div className="text-center">
                            <div className={`text-3xl font-bold ${getScoreColor(Math.round(analysisResult.performance.desktop.score * 100))}`}>
                              {Math.round(analysisResult.performance.desktop.score * 100)}
                            </div>
                            <div className="text-sm text-gray-400">Performance Score</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {analysisResult.performance.mobile && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-5 w-5 text-green-400" />
                          <h3 className="text-lg font-semibold text-white">Mobile Performance</h3>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                          <div className="text-center">
                            <div className={`text-3xl font-bold ${getScoreColor(Math.round(analysisResult.performance.mobile.score * 100))}`}>
                              {Math.round(analysisResult.performance.mobile.score * 100)}
                            </div>
                            <div className="text-sm text-gray-400">Performance Score</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400">Performance data not available</p>
                )}
                
                {analysisResult.aiAnalysis.priorityIssues && analysisResult.aiAnalysis.priorityIssues.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Priority Issues</h3>
                    <div className="space-y-2">
                      {analysisResult.aiAnalysis.priorityIssues.map((issue, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-white/5 rounded">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <span className="text-gray-300">{issue}</span>
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
                        <Badge variant={analysisResult.seo.h1.length === 1 ? "default" : "destructive"}>
                          {analysisResult.seo.h1.length} found
                        </Badge>
                      </div>
                      {analysisResult.seo.h1.map((h1, index) => (
                        <p key={index} className="text-sm text-gray-300">{h1}</p>
                      ))}
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">Images</span>
                        <Badge variant={analysisResult.seo.imagesWithoutAlt === 0 ? "default" : "destructive"}>
                          {analysisResult.seo.imagesWithoutAlt} missing alt text
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-300">
                        {analysisResult.seo.totalImages} total images, {analysisResult.seo.totalImages - analysisResult.seo.imagesWithoutAlt} with alt text
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <SEODeepDetails result={analysisResult} />
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
                        <h4 className="font-medium text-white mb-2">Search Intent</h4>
                        <p className="text-gray-300 text-sm">{analysisResult.aiAnalysis.searchIntent}</p>
                      </div>
                      
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-medium text-white mb-2">Content Suggestions</h4>
                        <ul className="space-y-1">
                          {analysisResult.aiAnalysis.suggestions.extraHeadings.map((heading, index) => (
                            <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                              <AlertCircle className="h-3 w-3 text-blue-400 mt-1 flex-shrink-0" />
                              {heading}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-medium text-white mb-2">Technical SEO Status</h4>
                        <div className="space-y-2 text-sm text-gray-300">
                          <div>Heading Structure: {analysisResult.aiAnalysis.technicalSEO.headingStructure}</div>
                          <div>Image Optimization: {analysisResult.aiAnalysis.technicalSEO.imageOptimization}</div>
                          <div>Overall Score: {analysisResult.aiAnalysis.overallScore}/100</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">AI analysis not available</p>
                )}
              </TabsContent>
              
              <TabsContent value="schema" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Technical SEO Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Meta Information</h4>
                      <div className="space-y-1 text-sm text-gray-300">
                        <div>Canonical URL: {analysisResult.seo.canonical || 'Not set'}</div>
                        <div>Robots Meta: {analysisResult.seo.robotsMeta || 'Not set'}</div>
                        <div>Viewport: {analysisResult.seo.viewport || 'Not set'}</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Content Statistics</h4>
                      <div className="space-y-1 text-sm text-gray-300">
                        <div>Word Count: {analysisResult.seo.wordCount}</div>
                        <div>H1 Tags: {analysisResult.seo.h1.length}</div>
                        <div>H2 Tags: {analysisResult.seo.h2.length}</div>
                        <div>H3 Tags: {analysisResult.seo.h3.length}</div>
                      </div>
                    </div>
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
