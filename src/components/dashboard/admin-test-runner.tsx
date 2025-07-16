import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SEOValidator } from '@/lib/seo-validator';
import { StandardizedSEOAnalysis } from '@/lib/seo-schemas';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Loader2,
  FileText,
  Zap,
  BarChart3,
  Clipboard,
  Eye,
  Settings,
  Download
} from 'lucide-react';

interface TestResult {
  url: string;
  status: 'running' | 'completed' | 'failed';
  analysis?: StandardizedSEOAnalysis;
  errors: string[];
  checkResults: {
    metaTitle: boolean;
    headings: boolean;
    altText: boolean;
    aiRewrite: boolean;
    semanticTopics: boolean;
    oneClickFix: boolean;
    pdfReport: boolean;
  };
  processingTime: number;
}

// Test websites with different structures
const TEST_WEBSITES = [
  'https://example.com',
  'https://github.com',
  'https://stackoverflow.com',
  'https://medium.com/@test',
  'https://news.ycombinator.com'
];

export function AdminTestRunner() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState(0);
  const [progress, setProgress] = useState(0);
  const [overallStats, setOverallStats] = useState({
    total: 0,
    passed: 0,
    warnings: 0,
    failed: 0
  });

  const runComprehensiveTest = async () => {
    if (!user) return;
    
    setIsRunning(true);
    setTestResults([]);
    setCurrentTest(0);
    setProgress(0);
    
    const results: TestResult[] = [];
    
    for (let i = 0; i < TEST_WEBSITES.length; i++) {
      const url = TEST_WEBSITES[i];
      setCurrentTest(i + 1);
      setProgress(((i + 1) / TEST_WEBSITES.length) * 100);
      
      const startTime = Date.now();
      const result: TestResult = {
        url,
        status: 'running',
        errors: [],
        checkResults: {
          metaTitle: false,
          headings: false,
          altText: false,
          aiRewrite: false,
          semanticTopics: false,
          oneClickFix: false,
          pdfReport: false
        },
        processingTime: 0
      };
      
      results.push(result);
      setTestResults([...results]);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Use real analysis instead of simulation
        const { data: realAnalysis, error } = await supabase.functions.invoke('analyze-site', {
          body: { url, user_id: user?.id }
        });

        if (error) {
          throw new Error(`Analysis failed: ${error.message}`);
        }
        
        // Validate the real analysis
        const validation = await SEOValidator.validateAnalysis(realAnalysis, url);
        
        if (validation.isValid && validation.standardized) {
          result.analysis = validation.standardized;
          result.status = 'completed';
          
          // Run comprehensive checks
          result.checkResults = await runDetailedChecks(validation.standardized);
          
        } else {
          result.status = 'failed';
          result.errors = validation.errors;
          
          // Log API format error
          await logApiError(url, validation.errors);
        }
        
      } catch (error) {
        result.status = 'failed';
        result.errors = [error instanceof Error ? error.message : 'Unknown error'];
        
        await logApiError(url, result.errors);
      }
      
      result.processingTime = Date.now() - startTime;
      setTestResults([...results]);
    }
    
    // Calculate overall statistics
    const stats = calculateStats(results);
    setOverallStats(stats);
    
    setIsRunning(false);
    
    toast({
      title: "Kiểm thử hoàn tất",
      description: `${stats.passed}/${stats.total} tests passed`,
    });
  };

  const runDetailedChecks = async (analysis: StandardizedSEOAnalysis) => {
    const checks = {
      metaTitle: false,
      headings: false,
      altText: false,
      aiRewrite: false,
      semanticTopics: false,
      oneClickFix: false,
      pdfReport: false
    };

    // Check Meta Title
    if (analysis.regular_seo.meta_title) {
      const metaTitle = analysis.regular_seo.meta_title;
      checks.metaTitle = !!(
        metaTitle.value.title &&
        metaTitle.value.length > 0 &&
        metaTitle.validation.status &&
        (metaTitle.value.suggested_title || metaTitle.validation.status === 'valid')
      );
    }

    // Check Headings
    if (analysis.regular_seo.headings) {
      const headings = analysis.regular_seo.headings;
      checks.headings = !!(
        headings.value.total_count >= 0 &&
        typeof headings.value.duplicates === 'number' &&
        Array.isArray(headings.value.missing) &&
        Array.isArray(headings.value.structure)
      );
    }

    // Check Alt Text
    if (analysis.regular_seo.alt_text) {
      const altText = analysis.regular_seo.alt_text;
      checks.altText = !!(
        altText.value.total_images >= 0 &&
        altText.value.missing_alt >= 0 &&
        Array.isArray(altText.value.suggestions)
      );
    }

    // Check AI Rewrite
    if (analysis.ai_seo.ai_rewrite) {
      const aiRewrite = analysis.ai_seo.ai_rewrite;
      checks.aiRewrite = !!(
        aiRewrite.value.original &&
        aiRewrite.value.rewritten &&
        aiRewrite.value.improvements &&
        aiRewrite.value.confidence > 0
      );
    }

    // Check Semantic Topics
    if (analysis.ai_seo.topic_map) {
      const topicMap = analysis.ai_seo.topic_map;
      checks.semanticTopics = !!(
        topicMap.value.main_topic &&
        Array.isArray(topicMap.value.subtopics) &&
        Array.isArray(topicMap.value.semantic_clusters)
      );
    }

    // Check One-click Fix
    if (analysis.ai_seo.auto_fix) {
      const autoFix = analysis.ai_seo.auto_fix;
      checks.oneClickFix = !!(
        Array.isArray(autoFix.value.fixes_available) &&
        typeof autoFix.value.backup_created === 'boolean'
      );
    }

    // Check PDF Report structure
    checks.pdfReport = !!(
      analysis.url &&
      analysis.scan_id &&
      analysis.timestamp &&
      analysis.overall_score >= 0
    );

    return checks;
  };

  const logApiError = async (url: string, errors: string[]) => {
    try {
      await supabase.from('api_logs').insert({
        api_name: 'seo-standardization-test',
        endpoint: '/test-analysis',
        method: 'POST',
        domain: new URL(url).hostname,
        status_code: 422,
        success: false,
        error_message: errors.join(', '),
        request_payload: { url },
        response_data: { validation_errors: errors },
        user_id: user?.id
      });
    } catch (error) {
      console.error('Failed to log API error:', error);
    }
  };

  const calculateStats = (results: TestResult[]) => {
    const total = results.length;
    const passed = results.filter(r => r.status === 'completed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const warnings = results.filter(r => 
      r.status === 'completed' && 
      Object.values(r.checkResults).some(check => !check)
    ).length;

    return { total, passed, warnings, failed };
  };

  const exportResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      overallStats,
      testResults,
      testWebsites: TEST_WEBSITES
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-test-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-purple-400" />
            Kiểm thử toàn diện SEO & AI SEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={runComprehensiveTest}
              disabled={isRunning}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isRunning ? 'Đang chạy test...' : 'Chạy kiểm thử'}
            </Button>
            
            {testResults.length > 0 && (
              <Button
                variant="outline"
                onClick={exportResults}
                className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Xuất kết quả
              </Button>
            )}
          </div>
          
          {isRunning && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Test {currentTest}/{TEST_WEBSITES.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall Statistics */}
      {testResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{overallStats.total}</div>
                  <div className="text-sm text-gray-400">Tổng tests</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-green-400">{overallStats.passed}</div>
                  <div className="text-sm text-gray-400">Thành công</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{overallStats.warnings}</div>
                  <div className="text-sm text-gray-400">Cảnh báo</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <XCircle className="h-8 w-8 text-red-400" />
                <div>
                  <div className="text-2xl font-bold text-red-400">{overallStats.failed}</div>
                  <div className="text-sm text-gray-400">Thất bại</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Results */}
      <div className="space-y-4">
        {testResults.map((result, index) => (
          <Card key={index} className="glass-card border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-400" />
                  {result.url}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      result.status === 'completed' ? 'default' :
                      result.status === 'failed' ? 'destructive' : 'secondary'
                    }
                  >
                    {result.status === 'running' && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                    {result.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {result.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                    {result.status}
                  </Badge>
                  <span className="text-sm text-gray-400">{result.processingTime}ms</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              
              {/* Detailed Checks */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {Object.entries(result.checkResults).map(([check, passed]) => (
                  <div key={check} className="flex items-center gap-2">
                    {passed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                    <span className="text-sm text-gray-300 capitalize">
                      {check.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Errors */}
              {result.errors.length > 0 && (
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Lỗi phát hiện:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {result.errors.map((error, idx) => (
                        <li key={idx} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Analysis Summary */}
              {result.analysis && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                  <div>
                    <h4 className="font-semibold text-white mb-2">SEO Score</h4>
                    <div className="text-2xl font-bold text-blue-400">
                      {result.analysis.overall_score}/100
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">SEO Issues</h4>
                    <div className="text-sm text-gray-300">
                      {Object.keys(result.analysis.regular_seo).length} components analyzed
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">AI Features</h4>
                    <div className="text-sm text-gray-300">
                      {Object.keys(result.analysis.ai_seo).length} AI features tested
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}

// Simulate analysis for testing
async function simulateAnalysis(url: string): Promise<any> {
  // Add delay to simulate real API call
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  return {
    url,
    id: crypto.randomUUID(),
    user_id: 'test-user',
    created_at: new Date().toISOString(),
    seo: {
      title: `Page title for ${url}`,
      description: "Meta description for the page with proper length and keywords",
      headings: {
        h1: ["Main heading"],
        h2: ["Secondary heading 1", "Secondary heading 2"],
        h3: ["Tertiary heading"]
      },
      images: {
        total: 5,
        missing_alt: 2,
        suggestions: [
          { src: "/image1.jpg", alt: "Product image showing features" },
          { src: "/image2.jpg", alt: "Customer testimonial photo" }
        ]
      }
    },
    ai_analysis: {
      rewrite: {
        original: "Basic content that needs improvement",
        improved: "Enhanced content with better keywords and call-to-action",
        confidence: 88,
        improvements: {
          keyword_density: 2.5,
          readability_score: 82,
          cta_added: true,
          grammar_fixes: 3
        }
      },
      topic_map: {
        main_topic: "Digital Marketing",
        subtopics: [
          { topic: "SEO", intent: "informational" },
          { topic: "Content Strategy", intent: "navigational" }
        ],
        semantic_clusters: [
          { cluster_name: "Technical SEO", keywords: ["optimization", "performance", "crawling"] }
        ]
      },
      auto_fix: {
        fixes_available: [
          {
            id: "meta-title-fix",
            type: "meta_title",
            description: "Optimize meta title length and keywords",
            priority: "high",
            auto_applicable: true
          }
        ],
        backup_created: true
      }
    }
  };
}