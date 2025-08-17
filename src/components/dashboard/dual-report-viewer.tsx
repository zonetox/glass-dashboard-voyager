import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText,
  Brain,
  GitCompare,
  Download,
  Eye,
  BarChart3
} from 'lucide-react';
import { ComprehensiveSEOReport } from './comprehensive-seo-report';
import { ComprehensiveAISEOReport } from './comprehensive-ai-seo-report';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DualReportViewerProps {
  scanData: any;
  analysisData: any;
  aiAnalysis: any;
  className?: string;
}

export function DualReportViewer({ 
  scanData, 
  analysisData, 
  aiAnalysis, 
  className 
}: DualReportViewerProps) {
  const { toast } = useToast();
  const [activeReport, setActiveReport] = useState<'seo' | 'ai' | 'compare'>('compare');
  const [generatingCombinedPDF, setGeneratingCombinedPDF] = useState(false);

  const handleGenerateCombinedPDF = async () => {
    setGeneratingCombinedPDF(true);
    try {
      // Generate both SEO and AI reports
      const [seoResult, aiResult] = await Promise.all([
        supabase.functions.invoke('enhanced-pdf-report', {
          body: {
            url: scanData.url,
            scan_id: scanData.id,
            include_ai: false,
            user_id: scanData.user_id
          }
        }),
        supabase.functions.invoke('enhanced-pdf-report', {
          body: {
            url: scanData.url,
            scan_id: scanData.id,
            include_ai: true,
            user_id: scanData.user_id
          }
        })
      ]);

      if (seoResult.error || aiResult.error) {
        throw new Error('Failed to generate reports');
      }

      toast({
        title: "Báo cáo kết hợp đã tạo thành công",
        description: "Cả hai báo cáo SEO và AI SEO đều đã được tạo."
      });

      // Open both PDFs in new tabs
      if (seoResult.data?.file_url) {
        window.open(seoResult.data.file_url, '_blank');
      }
      if (aiResult.data?.file_url) {
        setTimeout(() => window.open(aiResult.data.file_url, '_blank'), 500);
      }
    } catch (error) {
      console.error('Error generating combined PDF:', error);
      toast({
        title: "Lỗi tạo báo cáo kết hợp",
        description: "Không thể tạo báo cáo kết hợp. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setGeneratingCombinedPDF(false);
    }
  };

  const overallSEOScore = scanData?.seo_score || 0;
  const citationScore = aiAnalysis?.citationPotential ? 
    parseInt(aiAnalysis.citationPotential.match(/(\d+)\/10/)?.[1] || '5') * 10 : 50;
  const aiOverallScore = aiAnalysis?.overallScore || 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Combined Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitCompare className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Báo Cáo SEO & AI SEO Toàn Diện</h2>
            <p className="text-muted-foreground">{scanData?.url}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleGenerateCombinedPDF}
            disabled={generatingCombinedPDF}
            className="flex items-center gap-2"
          >
            {generatingCombinedPDF ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Tải Cả 2 PDF
          </Button>
        </div>
      </div>

      {/* Report Type Toggle */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant={activeReport === 'compare' ? 'default' : 'outline'}
              onClick={() => setActiveReport('compare')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              So Sánh
            </Button>
            <Button
              variant={activeReport === 'seo' ? 'default' : 'outline'}
              onClick={() => setActiveReport('seo')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Báo Cáo SEO
            </Button>
            <Button
              variant={activeReport === 'ai' ? 'default' : 'outline'}
              onClick={() => setActiveReport('ai')}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Báo Cáo AI SEO
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comparison View */}
      {activeReport === 'compare' && (
        <div className="space-y-6">
          {/* Score Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-blue-200">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-600">{overallSEOScore}/100</div>
                <div className="text-sm text-muted-foreground">Điểm SEO Truyền Thống</div>
                <Badge className="mt-2" variant={overallSEOScore >= 80 ? 'default' : overallSEOScore >= 60 ? 'secondary' : 'destructive'}>
                  {overallSEOScore >= 80 ? 'Tốt' : overallSEOScore >= 60 ? 'Trung Bình' : 'Cần Cải Thiện'}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardContent className="p-6 text-center">
                <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-600">{aiOverallScore}/100</div>
                <div className="text-sm text-muted-foreground">Điểm AI SEO</div>
                <Badge className="mt-2" variant={aiOverallScore >= 80 ? 'default' : aiOverallScore >= 60 ? 'secondary' : 'destructive'}>
                  {aiOverallScore >= 80 ? 'Tốt' : aiOverallScore >= 60 ? 'Trung Bình' : 'Cần Cải Thiện'}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="p-6 text-center">
                <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-600">{citationScore}/100</div>
                <div className="text-sm text-muted-foreground">Tiềm Năng Trích Dẫn AI</div>
                <Badge className="mt-2" variant={citationScore >= 80 ? 'default' : citationScore >= 60 ? 'secondary' : 'destructive'}>
                  {citationScore >= 80 ? 'Cao' : citationScore >= 60 ? 'Trung Bình' : 'Thấp'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Key Insights Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional SEO Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <FileText className="h-5 w-5" />
                  SEO Truyền Thống
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Meta Title:</span>
                    <Badge variant={analysisData?.seo?.title ? 'default' : 'destructive'}>
                      {analysisData?.seo?.title ? 'Có' : 'Thiếu'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Meta Description:</span>
                    <Badge variant={analysisData?.seo?.metaDescription ? 'default' : 'destructive'}>
                      {analysisData?.seo?.metaDescription ? 'Có' : 'Thiếu'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Headings H1:</span>
                    <span className="text-sm font-medium">{analysisData?.seo?.h1?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ảnh thiếu Alt:</span>
                    <span className="text-sm font-medium text-red-600">
                      {analysisData?.seo?.imagesWithoutAlt || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI SEO Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Brain className="h-5 w-5" />
                  AI SEO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ý Định Tìm Kiếm:</span>
                    <Badge variant="outline">
                      {aiAnalysis?.searchIntent || 'Chưa xác định'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Khoảng Trống Ngữ Nghĩa:</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {aiAnalysis?.semanticGaps?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gợi Ý FAQ:</span>
                    <span className="text-sm font-medium text-blue-600">
                      {aiAnalysis?.faqSuggestions?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Đề Xuất Cải Thiện:</span>
                    <span className="text-sm font-medium text-green-600">
                      {aiAnalysis?.improvementSuggestions?.length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Khuyến Nghị Tối Ưu Hóa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-blue-600">SEO Truyền Thống</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Tối ưu meta tags và heading structure
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Cải thiện tốc độ tải trang
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Thêm alt text cho hình ảnh
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Tối ưu internal linking
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3 text-purple-600">AI SEO</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Cải thiện nội dung cho AI search
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Thêm schema markup structured data
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Tối ưu cho featured snippets
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Nâng cao authority và trustworthiness
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Individual Reports */}
      {activeReport === 'seo' && (
        <ComprehensiveSEOReport 
          scanData={scanData}
          analysisData={analysisData}
        />
      )}

      {activeReport === 'ai' && (
        <ComprehensiveAISEOReport 
          scanData={scanData}
          aiAnalysis={aiAnalysis}
        />
      )}
    </div>
  );
}