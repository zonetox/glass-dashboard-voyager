import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search,
  Brain,
  FileText,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Zap,
  Globe,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ComprehensiveSEOReport } from './comprehensive-seo-report';
import { ComprehensiveAISEOReport } from './comprehensive-ai-seo-report';
import { DualReportViewer } from './dual-report-viewer';

interface EnhancedSEOAnalyzerProps {
  className?: string;
}

export function EnhancedSEOAnalyzer({ className }: EnhancedSEOAnalyzerProps) {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [aiAnalysisResults, setAiAnalysisResults] = useState<any>(null);
  const [activeView, setActiveView] = useState<'input' | 'results'>('input');

  const handleAnalyze = async () => {
    if (!url) {
      toast({
        title: "URL không hợp lệ",
        description: "Vui lòng nhập URL cần phân tích.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Run both SEO and AI analysis in parallel
      const [seoResponse, aiResponse] = await Promise.all([
        supabase.functions.invoke('analyze-site', {
          body: { url, analysis_type: 'seo' }
        }),
        supabase.functions.invoke('analyze-site', {
          body: { url, analysis_type: 'ai_seo' }
        })
      ]);

      if (seoResponse.error) {
        throw new Error(`SEO Analysis failed: ${seoResponse.error.message}`);
      }

      if (aiResponse.error) {
        throw new Error(`AI Analysis failed: ${aiResponse.error.message}`);
      }

      setAnalysisResults(seoResponse.data);
      setAiAnalysisResults(aiResponse.data);
      setActiveView('results');

      toast({
        title: "Phân tích hoàn tất",
        description: "Đã hoàn thành phân tích SEO và AI SEO chi tiết."
      });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Lỗi phân tích",
        description: "Không thể thực hiện phân tích. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setActiveView('input');
    setAnalysisResults(null);
    setAiAnalysisResults(null);
    setUrl('');
  };

  if (activeView === 'results' && analysisResults) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Kết Quả Phân Tích Toàn Diện</h2>
          <Button onClick={resetAnalysis} variant="outline">
            Phân Tích Mới
          </Button>
        </div>
        
        <DualReportViewer 
          scanData={analysisResults}
          analysisData={analysisResults.analysis_data}
          aiAnalysis={aiAnalysisResults?.aiAnalysis}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            Công Cụ Phân Tích SEO & AI SEO Chuyên Nghiệp
          </CardTitle>
          <p className="text-muted-foreground">
            Phân tích toàn diện website theo tiêu chuẩn quốc tế: Google Core Web Vitals, WCAG 2.1, Schema.org và tối ưu cho AI Search Engines
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập URL website cần phân tích (ví dụ: https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              disabled={isAnalyzing}
            />
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !url}
              className="min-w-[120px]"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Đang phân tích...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Phân Tích
                </div>
              )}
            </Button>
          </div>
          
          {/* Progress indicator */}
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Đang thực hiện phân tích toàn diện...</span>
                <span>~30-60 giây</span>
              </div>
              <Progress value={65} className="h-2" />
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Technical SEO Analysis
                </div>
                <div className="flex items-center gap-1">
                  <div className="animate-spin h-3 w-3 border border-primary border-t-transparent rounded-full" />
                  AI SEO Analysis
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-blue-200">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-medium mb-2">SEO Truyền Thống</h3>
            <p className="text-sm text-muted-foreground">
              Phân tích theo chuẩn Google: Core Web Vitals, Meta Tags, Technical Issues
            </p>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-green-600" />
                <span>WCAG 2.1 AA Compliance</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-blue-600" />
                <span>W3C Standards</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="p-6 text-center">
            <Brain className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-medium mb-2">AI SEO Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Tối ưu cho ChatGPT, Claude, Bard và các AI Search Engines
            </p>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-purple-600" />
                <span>AI Citation Potential</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3 text-green-600" />
                <span>Semantic Gap Analysis</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-medium mb-2">Báo Cáo Chuyên Nghiệp</h3>
            <p className="text-sm text-muted-foreground">
              Export PDF chi tiết theo tiêu chuẩn quốc tế
            </p>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3 text-blue-600" />
                <span>Executive Summary</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3 text-green-600" />
                <span>Actionable Insights</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Standards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Tiêu Chuẩn Tuân Thủ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="text-sm">
                <div className="font-medium">Google Core Web Vitals</div>
                <div className="text-muted-foreground">LCP, FID, CLS</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <div className="text-sm">
                <div className="font-medium">W3C HTML/CSS</div>
                <div className="text-muted-foreground">Valid Markup</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              <div className="text-sm">
                <div className="font-medium">Schema.org</div>
                <div className="text-muted-foreground">Structured Data</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-orange-600" />
              <div className="text-sm">
                <div className="font-medium">WCAG 2.1 AA</div>
                <div className="text-muted-foreground">Accessibility</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}