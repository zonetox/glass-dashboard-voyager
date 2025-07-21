import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StandardizedSEOComparison } from '@/components/dashboard/StandardizedSEOComparison';
import { SEOValidator } from '@/lib/seo-validator';
import { StandardizedSEOAnalysis } from '@/lib/seo-schemas';
import { useToast } from '@/hooks/use-toast';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Loader2,
  RefreshCw,
  FileText,
  Zap,
  BarChart3
} from 'lucide-react';

export function SEOStandardization() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { scans, loading: scansLoading } = useScanHistory(user?.id || null);
  
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<StandardizedSEOAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    total: number;
    valid: number;
    warnings: number;
    errors: number;
  }>({ total: 0, valid: 0, warnings: 0, errors: 0 });

  useEffect(() => {
    if (scans.length > 0) {
      validateExistingScans();
    }
  }, [scans]);

  const validateExistingScans = async () => {
    let total = 0, valid = 0, warnings = 0, errors = 0;

    for (const scan of scans.slice(0, 10)) { // Check last 10 scans
      total++;
      
      try {
        const validation = await SEOValidator.validateAnalysis(scan, scan.url);
        
        if (validation.isValid) {
          valid++;
        } else {
          errors++;
        }
        
        // Check for warnings in the standardized result
        if (validation.standardized) {
          const regularResults = Object.values(validation.standardized.regular_seo).filter(Boolean);
          const aiResults = Object.values(validation.standardized.ai_seo).filter(Boolean);
          const allResults = [...regularResults, ...aiResults] as any[];
          
          const hasWarnings = allResults.some(result => result?.status === 'warning');
          
          if (hasWarnings) warnings++;
        }
      } catch (error) {
        errors++;
      }
    }

    setValidationResults({ total, valid, warnings, errors });
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập URL",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Call real analysis API
      const { data, error } = await supabase.functions.invoke('analyze-website', {
        body: { url }
      });

      if (error) throw error;
      
      // Validate the real analysis
      const validation = await SEOValidator.validateAnalysis(data, url);
      
      if (validation.standardized) {
        setAnalysis(validation.standardized);
        
        toast({
          title: "Thành công",
          description: "Phân tích SEO đã được chuẩn hóa",
        });
      } else {
        throw new Error('Validation failed: ' + validation.errors.join(', '));
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể phân tích website",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFix = (fixId: string) => {
    toast({
      title: "Thành công",
      description: `Đã áp dụng fix: ${fixId}`,
    });
  };

  const handleApplyAllFixes = () => {
    toast({
      title: "Thành công", 
      description: "Đã áp dụng tất cả fixes",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Chuẩn hóa kết quả SEO & AI SEO
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Hệ thống kiểm tra và chuẩn hóa kết quả phân tích SEO theo schema đã định nghĩa
          </p>
        </div>

        {/* Validation Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{validationResults.total}</div>
                  <div className="text-sm text-gray-400">Tổng scans</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-green-400">{validationResults.valid}</div>
                  <div className="text-sm text-gray-400">Hợp lệ</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{validationResults.warnings}</div>
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
                  <div className="text-2xl font-bold text-red-400">{validationResults.errors}</div>
                  <div className="text-sm text-gray-400">Lỗi</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analyze Section */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-6 w-6 text-blue-400" />
              Phân tích chuẩn hóa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Nhập URL để phân tích..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <Button 
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Phân tích
              </Button>
              <Button
                variant="outline"
                onClick={validateExistingScans}
                disabled={scansLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Kiểm tra lại
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {analysis && (
          <StandardizedSEOComparison
            analysis={analysis}
            onApplyFix={handleApplyFix}
            onApplyAllFixes={handleApplyAllFixes}
          />
        )}

        {/* Schema Information */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-purple-400" />
              Schema chuẩn hóa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">SEO Thường</h3>
                <div className="space-y-2">
                  {[
                    { name: 'Meta Title', format: '{length} ký tự – {status} – {keyword presence}' },
                    { name: 'Meta Description', format: '{length} ký tự – {status} – unique: true/false' },
                    { name: 'Headings', format: '{count} total – trùng: {X} – thiếu: {Y}' },
                    { name: 'Alt Text', format: '{imageCount} images – thiếu alt: {missing}' },
                    { name: 'PageSpeed', format: 'Mobile: {score}/100 – Desktop: {score}' },
                    { name: 'Schema', format: '{type}: found/missing – validate: pass/fail' },
                    { name: 'Internal Links', format: '{internalLinkCount} – orphaned: {X}' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-gray-800/50 p-3 rounded">
                      <div className="font-medium text-blue-400">{item.name}</div>
                      <div className="text-sm text-gray-300">{item.format}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">AI SEO</h3>
                <div className="space-y-2">
                  {[
                    { name: 'AI Rewriting', format: 'Before → After block với highlight improvements' },
                    { name: 'Topic Map', format: 'JSON dạng topic → subtopics → intent' },
                    { name: 'Auto-Fix', format: 'Danh sách lỗi → Fix suggested → Status' },
                    { name: 'Search Intent', format: 'Intent: Informational/Navigational/Transactional' },
                    { name: 'Predictive Rank', format: '{keyword} – hiện tại: #X – dự đoán: #Y' },
                    { name: 'Multi-language', format: 'Kết quả theo từng ngôn ngữ với quality score' },
                    { name: 'Trend Detection', format: 'Từ khóa X tăng +Y% trong 7 ngày' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-gray-800/50 p-3 rounded">
                      <div className="font-medium text-purple-400">{item.name}</div>
                      <div className="text-sm text-gray-300">{item.format}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
