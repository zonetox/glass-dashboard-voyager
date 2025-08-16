import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Calendar, 
  Globe, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  BarChart3,
  Users,
  Clock,
  Award,
  Brain,
  Search,
  Zap,
  Monitor,
  Smartphone,
  Image,
  Code,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ComprehensivePDFReportProps {
  scanData: {
    id: string;
    url: string;
    seo_score: number;
    created_at: string;
    analysis_data: any;
    user_id?: string;
  };
}

export function ComprehensivePDFReport({ scanData }: ComprehensivePDFReportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeAI, setIncludeAI] = useState(true);
  const { toast } = useToast();

  const generatePDFReport = async () => {
    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('enhanced-pdf-report', {
        body: {
          url: scanData.url,
          scan_id: scanData.id,
          include_ai: includeAI,
          user_id: scanData.user_id
        }
      });

      if (error) throw error;

      if (data?.file_url) {
        // Open PDF in new tab
        window.open(data.file_url, '_blank');
        
        toast({
          title: "Báo cáo đã được tạo thành công",
          description: "PDF báo cáo SEO chi tiết đã sẵn sàng tải xuống.",
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Lỗi tạo báo cáo",
        description: "Không thể tạo báo cáo PDF. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", label: "Xuất sắc" };
    if (score >= 60) return { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "Tốt" };
    return { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "Cần cải thiện" };
  };

  const scoreBadge = getScoreBadge(scanData.seo_score);
  const analysis = scanData.analysis_data;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Report Header */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">Báo Cáo SEO Chuyên Nghiệp</CardTitle>
                <p className="text-gray-400">Phân tích toàn diện website và khuyến nghị tối ưu</p>
                <div className="flex items-center gap-2 mt-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{scanData.url}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className={`text-4xl font-bold ${getScoreColor(scanData.seo_score)}`}>
                {scanData.seo_score}
              </div>
              <Badge variant="outline" className={scoreBadge.color}>
                {scoreBadge.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">
                  {new Date(scanData.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAI}
                  onChange={(e) => setIncludeAI(e.target.checked)}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm text-gray-300">Bao gồm phân tích AI</span>
              </label>
            </div>
            <Button 
              onClick={generatePDFReport}
              disabled={isGenerating}
              className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? 'Đang tạo...' : 'Tải Báo Cáo PDF'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/5">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary">
            <BarChart3 className="h-4 w-4 mr-2" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="technical" className="data-[state=active]:bg-primary">
            <Code className="h-4 w-4 mr-2" />
            Kỹ thuật
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-primary">
            <Zap className="h-4 w-4 mr-2" />
            Hiệu suất
          </TabsTrigger>
          <TabsTrigger value="ai-analysis" className="data-[state=active]:bg-primary">
            <Brain className="h-4 w-4 mr-2" />
            AI Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Executive Summary */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Tóm Tắt Điều Hành
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${getScoreColor(scanData.seo_score)}`}>
                    {scanData.seo_score}/100
                  </div>
                  <p className="text-gray-400 text-sm">Điểm SEO Tổng Thể</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {analysis?.performance?.desktop?.score ? Math.round(analysis.performance.desktop.score * 100) : 'N/A'}
                  </div>
                  <p className="text-gray-400 text-sm">Hiệu Suất Desktop</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {analysis?.performance?.mobile?.score ? Math.round(analysis.performance.mobile.score * 100) : 'N/A'}
                  </div>
                  <p className="text-gray-400 text-sm">Hiệu Suất Mobile</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {analysis?.issues?.length || 0}
                  </div>
                  <p className="text-gray-400 text-sm">Vấn Đề Phát Hiện</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Chỉ Số Chính</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Meta Title</span>
                    <Badge variant="outline" className={analysis?.seo?.title ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                      {analysis?.seo?.title ? "✓" : "✗"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Meta Description</span>
                    <Badge variant="outline" className={analysis?.seo?.metaDescription ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                      {analysis?.seo?.metaDescription ? "✓" : "✗"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Thẻ H1</span>
                    <span className="text-white">{analysis?.seo?.h1?.length || 0}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Tổng hình ảnh</span>
                    <span className="text-white">{analysis?.seo?.totalImages || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Thiếu Alt Text</span>
                    <span className="text-red-400">{analysis?.seo?.imagesWithoutAlt || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Schema Markup</span>
                    <Badge variant="outline" className={analysis?.schema_markup ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                      {analysis?.schema_markup ? "✓" : "✗"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                Phân Tích Kỹ Thuật SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis?.issues && analysis.issues.length > 0 ? (
                analysis.issues.map((issue: any, index: number) => (
                  <div key={index} className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                        {issue.severity || 'Medium'}
                      </Badge>
                    </div>
                    <h4 className="text-white font-medium mb-1">{issue.title}</h4>
                    <p className="text-gray-400 text-sm">{issue.description}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-medium">Không phát hiện vấn đề kỹ thuật nghiêm trọng</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-blue-400" />
                  Desktop Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400 mb-2">
                      {analysis?.performance?.desktop?.score ? Math.round(analysis.performance.desktop.score * 100) : 'N/A'}
                    </div>
                    <Progress 
                      value={analysis?.performance?.desktop?.score ? analysis.performance.desktop.score * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  {analysis?.performance?.desktop?.metrics && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">First Contentful Paint</span>
                        <span className="text-white">
                          {analysis.performance.desktop.metrics.fcp ? `${Math.round(analysis.performance.desktop.metrics.fcp)}ms` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Largest Contentful Paint</span>
                        <span className="text-white">
                          {analysis.performance.desktop.metrics.lcp ? `${Math.round(analysis.performance.desktop.metrics.lcp)}ms` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-purple-400" />
                  Mobile Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-400 mb-2">
                      {analysis?.performance?.mobile?.score ? Math.round(analysis.performance.mobile.score * 100) : 'N/A'}
                    </div>
                    <Progress 
                      value={analysis?.performance?.mobile?.score ? analysis.performance.mobile.score * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  {analysis?.performance?.mobile?.metrics && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">First Contentful Paint</span>
                        <span className="text-white">
                          {analysis.performance.mobile.metrics.fcp ? `${Math.round(analysis.performance.mobile.metrics.fcp)}ms` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Largest Contentful Paint</span>
                        <span className="text-white">
                          {analysis.performance.mobile.metrics.lcp ? `${Math.round(analysis.performance.mobile.metrics.lcp)}ms` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-6">
          {analysis?.aiAnalysis ? (
            <>
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Phân Tích AI cho Search Engine
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.aiAnalysis.searchIntent && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Ý Định Tìm Kiếm</h4>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        {analysis.aiAnalysis.searchIntent}
                      </Badge>
                    </div>
                  )}
                  
                  {analysis.aiAnalysis.citationPotential && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Tiềm Năng Trích Dẫn AI</h4>
                      <p className="text-gray-300">{analysis.aiAnalysis.citationPotential}</p>
                    </div>
                  )}

                  {analysis.aiAnalysis.semanticGaps && analysis.aiAnalysis.semanticGaps.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Khoảng Trống Ngữ Nghĩa</h4>
                      <div className="space-y-2">
                        {analysis.aiAnalysis.semanticGaps.map((gap: string, index: number) => (
                          <Badge key={index} variant="outline" className="mr-2 mb-2">
                            {gap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.aiAnalysis.faqSuggestions && analysis.aiAnalysis.faqSuggestions.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Gợi Ý FAQ</h4>
                      <div className="space-y-2">
                        {analysis.aiAnalysis.faqSuggestions.map((faq: string, index: number) => (
                          <div key={index} className="p-2 bg-white/5 rounded text-sm text-gray-300">
                            {faq}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="glass-card border-white/10">
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Chưa có dữ liệu phân tích AI cho scan này.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}