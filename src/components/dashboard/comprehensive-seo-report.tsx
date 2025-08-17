import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  FileText,
  Download,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Code,
  Gauge,
  ImageIcon,
  Link,
  Target,
  Clock,
  Share2,
  Monitor,
  Smartphone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ComprehensiveSEOReportProps {
  scanData: any;
  analysisData: any;
  className?: string;
}

export function ComprehensiveSEOReport({ 
  scanData, 
  analysisData, 
  className 
}: ComprehensiveSEOReportProps) {
  const { toast } = useToast();
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const handleGeneratePDF = async () => {
    setGeneratingPDF(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-pdf-report', {
        body: {
          url: scanData.url,
          scan_id: scanData.id,
          include_ai: false,
          user_id: scanData.user_id
        }
      });

      if (error) throw error;

      toast({
        title: "Báo cáo PDF đã tạo thành công",
        description: "Báo cáo SEO chi tiết đã được tạo và lưu trữ."
      });

      // Open PDF in new tab
      if (data.file_url) {
        window.open(data.file_url, '_blank');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Lỗi tạo báo cáo",
        description: "Không thể tạo báo cáo PDF. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'good':
      case 'pass':
      case 'optimal':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
      case 'needs_improvement':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
      case 'fail':
      case 'poor':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const seoData = analysisData?.seo || {};
  const performanceData = analysisData?.performance || {};
  const issues = analysisData?.issues || [];

  // Calculate overall metrics
  const overallScore = scanData?.seo_score || 0;
  const desktopScore = performanceData?.desktop?.score ? Math.round(performanceData.desktop.score * 100) : 0;
  const mobileScore = performanceData?.mobile?.score ? Math.round(performanceData.mobile.score * 100) : 0;

  // Categorize issues by severity
  const criticalIssues = issues.filter((issue: any) => issue.severity === 'high' || issue.severity === 'critical');
  const warningIssues = issues.filter((issue: any) => issue.severity === 'medium' || issue.severity === 'warning');
  const infoIssues = issues.filter((issue: any) => issue.severity === 'low' || issue.severity === 'info');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Báo Cáo SEO Toàn Diện</h2>
            <p className="text-muted-foreground">{scanData?.url}</p>
          </div>
        </div>
        <Button 
          onClick={handleGeneratePDF}
          disabled={generatingPDF}
          className="flex items-center gap-2"
        >
          {generatingPDF ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Tải PDF
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
          <TabsTrigger value="technical">Kỹ Thuật</TabsTrigger>
          <TabsTrigger value="performance">Hiệu Suất</TabsTrigger>
          <TabsTrigger value="content">Nội Dung</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}/100
                </div>
                <div className="text-sm text-muted-foreground">Điểm SEO Tổng Thể</div>
                <Progress value={overallScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Monitor className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className={`text-3xl font-bold ${getScoreColor(desktopScore)}`}>
                  {desktopScore}/100
                </div>
                <div className="text-sm text-muted-foreground">Hiệu Suất Desktop</div>
                <Progress value={desktopScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Smartphone className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className={`text-3xl font-bold ${getScoreColor(mobileScore)}`}>
                  {mobileScore}/100
                </div>
                <div className="text-sm text-muted-foreground">Hiệu Suất Mobile</div>
                <Progress value={mobileScore} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Issues Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Tóm Tắt Vấn Đề
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{criticalIssues.length}</div>
                  <div className="text-sm text-red-700">Vấn Đề Nghiêm Trọng</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{warningIssues.length}</div>
                  <div className="text-sm text-yellow-700">Cảnh Báo</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{infoIssues.length}</div>
                  <div className="text-sm text-blue-700">Thông Tin</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Cơ Bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Ngày Phân Tích:</span>
                  <div className="text-muted-foreground">
                    {new Date(scanData?.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">URL:</span>
                  <div className="text-muted-foreground break-all">{scanData?.url}</div>
                </div>
                <div>
                  <span className="text-sm font-medium">Meta Title:</span>
                  <div className="text-muted-foreground">
                    {seoData?.title ? '✓ Có' : '✗ Thiếu'}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Meta Description:</span>
                  <div className="text-muted-foreground">
                    {seoData?.metaDescription ? '✓ Có' : '✗ Thiếu'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical" className="space-y-6">
          {/* Meta Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Meta Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(seoData?.title ? 'good' : 'error')}
                    <span className="font-medium">Meta Title</span>
                  </div>
                  <Badge variant={seoData?.title ? "default" : "destructive"}>
                    {seoData?.title ? 'Có' : 'Thiếu'}
                  </Badge>
                </div>
                {seoData?.title && (
                  <div className="text-sm text-muted-foreground pl-6">
                    {seoData.title} ({seoData.title.length} ký tự)
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(seoData?.metaDescription ? 'good' : 'error')}
                    <span className="font-medium">Meta Description</span>
                  </div>
                  <Badge variant={seoData?.metaDescription ? "default" : "destructive"}>
                    {seoData?.metaDescription ? 'Có' : 'Thiếu'}
                  </Badge>
                </div>
                {seoData?.metaDescription && (
                  <div className="text-sm text-muted-foreground pl-6">
                    {seoData.metaDescription} ({seoData.metaDescription.length} ký tự)
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Headings Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Cấu Trúc Heading
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{seoData?.h1?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">H1</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{seoData?.h2?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">H2</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{seoData?.h3?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">H3</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{seoData?.h4?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">H4+</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Hình Ảnh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{seoData?.totalImages || 0}</div>
                  <div className="text-sm text-muted-foreground">Tổng Ảnh</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{seoData?.imagesWithoutAlt || 0}</div>
                  <div className="text-sm text-muted-foreground">Thiếu Alt Text</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Core Web Vitals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Core Web Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Desktop Performance */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Desktop
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">
                        {performanceData?.desktop?.metrics?.fcp ? 
                          `${Math.round(performanceData.desktop.metrics.fcp)}ms` : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">First Contentful Paint</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">
                        {performanceData?.desktop?.metrics?.lcp ? 
                          `${Math.round(performanceData.desktop.metrics.lcp)}ms` : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">Largest Contentful Paint</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">
                        {performanceData?.desktop?.metrics?.cls ? 
                          performanceData.desktop.metrics.cls.toFixed(3) : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">Cumulative Layout Shift</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Mobile Performance */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">
                        {performanceData?.mobile?.metrics?.fcp ? 
                          `${Math.round(performanceData.mobile.metrics.fcp)}ms` : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">First Contentful Paint</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">
                        {performanceData?.mobile?.metrics?.lcp ? 
                          `${Math.round(performanceData.mobile.metrics.lcp)}ms` : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">Largest Contentful Paint</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">
                        {performanceData?.mobile?.metrics?.cls ? 
                          performanceData.mobile.metrics.cls.toFixed(3) : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">Cumulative Layout Shift</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* All Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danh Sách Vấn Đề Chi Tiết
              </CardTitle>
            </CardHeader>
            <CardContent>
              {issues.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="font-medium">Không có vấn đề nào được phát hiện!</p>
                  <p className="text-muted-foreground">SEO website của bạn trông rất tốt.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {issues.map((issue: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(issue.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{issue.title}</h4>
                            <Badge variant={
                              issue.severity === 'high' || issue.severity === 'critical' ? 'destructive' :
                              issue.severity === 'medium' || issue.severity === 'warning' ? 'default' :
                              'secondary'
                            }>
                              {issue.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {issue.description}
                          </p>
                          {issue.recommendation && (
                            <p className="text-sm text-blue-600">
                              <strong>Khuyến nghị:</strong> {issue.recommendation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}