import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  Award
} from 'lucide-react';

interface PDFReportTemplateProps {
  websiteData: {
    url: string;
    title: string;
    analysisDate: string;
    seoScore: number;
    issues: any[];
    improvements: any[];
    competitorData?: any[];
    analysis_data?: any;
    performance?: {
      desktop?: { score: number; metrics: any };
      mobile?: { score: number; metrics: any };
    };
    technical_seo?: {
      meta_title: boolean;
      meta_description: boolean;
      h1_count: number;
      alt_text_missing: number;
      images_total: number;
    };
    ai_analysis?: {
      search_intent?: string;
      citation_potential?: string;
      semantic_gaps?: string[];
      faq_suggestions?: string[];
      content_quality?: number;
      keyword_density?: any;
    };
  };
  onDownload: () => void;
  onCustomize?: () => void;
}

export function PDFReportTemplate({ websiteData, onDownload, onCustomize }: PDFReportTemplateProps) {
  const { 
    url, 
    title, 
    analysisDate, 
    seoScore, 
    issues, 
    improvements, 
    analysis_data,
    performance,
    technical_seo,
    ai_analysis
  } = websiteData;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "Excellent" };
    if (score >= 60) return { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "Good" };
    return { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "Needs Work" };
  };

  const scoreBadge = getScoreBadge(seoScore);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Report Header */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">SEO Analysis Report</CardTitle>
                <p className="text-gray-400 text-sm">Professional Website Audit</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={onCustomize} variant="outline" size="sm">
                Customize
              </Button>
              <Button onClick={onDownload} className="bg-primary hover:bg-primary/90">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 text-sm">Website</span>
              </div>
              <p className="text-white font-medium">{url}</p>
              <p className="text-gray-400 text-sm">{title}</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 text-sm">Analysis Date</span>
              </div>
              <p className="text-white font-medium">{analysisDate}</p>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                Latest Scan
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(seoScore)}`}>
                {seoScore}
              </div>
              <Badge variant="outline" className={scoreBadge.color}>
                {scoreBadge.label}
              </Badge>
              <p className="text-gray-400 text-sm mt-2">Overall SEO Score</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-400 mb-2">
                {issues.length}
              </div>
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                Issues Found
              </Badge>
              <p className="text-gray-400 text-sm mt-2">Requiring Attention</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {improvements.length}
              </div>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                Opportunities
              </Badge>
              <p className="text-gray-400 text-sm mt-2">For Improvement</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Metrics Breakdown */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            SEO Metrics Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            { 
              name: "Technical SEO", 
              score: technical_seo?.meta_title && technical_seo?.meta_description ? 85 : 45, 
              issues: (technical_seo?.meta_title ? 0 : 1) + (technical_seo?.meta_description ? 0 : 1) + (technical_seo?.alt_text_missing || 0) 
            },
            { 
              name: "Content Quality", 
              score: ai_analysis?.content_quality || 72, 
              issues: ai_analysis?.semantic_gaps?.length || 3 
            },
            { 
              name: "Mobile Optimization", 
              score: performance?.mobile?.score ? Math.round(performance.mobile.score * 100) : 75, 
              issues: performance?.mobile?.score && performance.mobile.score > 0.8 ? 0 : 2 
            },
            { 
              name: "Page Speed", 
              score: performance?.desktop?.score ? Math.round(performance.desktop.score * 100) : 68, 
              issues: performance?.desktop?.score && performance.desktop.score > 0.8 ? 0 : 3 
            },
            { 
              name: "Meta Tags", 
              score: technical_seo?.meta_title && technical_seo?.meta_description ? 94 : 35, 
              issues: (technical_seo?.meta_title ? 0 : 1) + (technical_seo?.meta_description ? 0 : 1) 
            },
            { 
              name: "Schema Markup", 
              score: analysis_data?.schema_markup ? 85 : 25, 
              issues: analysis_data?.schema_markup ? 1 : 5 
            }
          ].map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{metric.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${getScoreColor(metric.score)}`}>
                    {metric.score}%
                  </span>
                  {metric.issues > 0 && (
                    <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                      {metric.issues} issues
                    </Badge>
                  )}
                </div>
              </div>
              <Progress value={metric.score} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Critical Issues */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Critical Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              ...(technical_seo?.meta_description ? [] : [{
                type: "High Priority",
                title: "Meta Description Thiếu",
                description: "Trang web thiếu meta description, ảnh hưởng đến tỷ lệ click-through từ kết quả tìm kiếm.",
                impact: "Cao",
                effort: "Thấp"
              }]),
              ...(performance?.desktop?.score && performance.desktop.score < 0.7 ? [{
                type: "High Priority", 
                title: "Tốc Độ Tải Trang Chậm",
                description: `Điểm hiệu suất desktop: ${Math.round((performance.desktop.score || 0) * 100)}/100. Khuyến nghị trên 70 điểm.`,
                impact: "Cao",
                effort: "Trung bình"
              }] : []),
              ...(performance?.mobile?.score && performance.mobile.score < 0.7 ? [{
                type: "High Priority",
                title: "Hiệu Suất Mobile Kém", 
                description: `Điểm hiệu suất mobile: ${Math.round((performance.mobile.score || 0) * 100)}/100. Cần tối ưu cho thiết bị di động.`,
                impact: "Cao",
                effort: "Trung bình"
              }] : []),
              ...(technical_seo?.alt_text_missing && technical_seo.alt_text_missing > 0 ? [{
                type: "Medium Priority",
                title: "Alt Text Thiếu",
                description: `${technical_seo.alt_text_missing} hình ảnh thiếu alt text mô tả cho khả năng truy cập và SEO.`,
                impact: "Trung bình",
                effort: "Thấp"
              }] : []),
              ...(technical_seo?.h1_count !== 1 ? [{
                type: "Medium Priority",
                title: "Cấu Trúc Heading Không Tối Ưu",
                description: `Trang có ${technical_seo?.h1_count || 0} thẻ H1. Khuyến nghị chỉ nên có 1 thẻ H1 duy nhất.`,
                impact: "Trung bình", 
                effort: "Thấp"
              }] : []),
              ...(!analysis_data?.schema_markup ? [{
                type: "Medium Priority",
                title: "Thiếu Schema Markup",
                description: "Trang web chưa có schema markup để giúp search engines hiểu nội dung tốt hơn.",
                impact: "Trung bình",
                effort: "Trung bình"
              }] : [])
            ].slice(0, 5).map((issue, index) => (
              <div key={index} className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <Badge 
                    variant="outline" 
                    className={
                      issue.type === "High Priority" 
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : issue.type === "Medium Priority"
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    }
                  >
                    {issue.type}
                  </Badge>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      Impact: {issue.impact}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Effort: {issue.effort}
                    </Badge>
                  </div>
                </div>
                <h4 className="text-white font-medium mb-1">{issue.title}</h4>
                <p className="text-gray-400 text-sm">{issue.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-green-400" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                priority: 1,
                title: "Tối Ưu Tốc Độ Tải Trang", 
                description: "Nén hình ảnh và kích hoạt browser caching để giảm thời gian tải trang 40%.",
                expectedImpact: "+15 Điểm SEO",
                timeframe: "1-2 tuần"
              },
              {
                priority: 2,
                title: "Hoàn Thiện Meta Tags",
                description: "Thêm meta description hấp dẫn để tăng tỷ lệ click từ kết quả tìm kiếm.",
                expectedImpact: "+8 Điểm SEO", 
                timeframe: "3-5 ngày"
              },
              {
                priority: 3,
                title: "Triển Khai Schema Markup",
                description: "Thêm structured data để giúp search engines hiểu nội dung tốt hơn.",
                expectedImpact: "+12 Điểm SEO",
                timeframe: "1 tuần"
              },
              ...(ai_analysis?.search_intent ? [{
                priority: 4,
                title: "Tối Ưu Cho AI Search",
                description: `Tối ưu nội dung cho search intent: ${ai_analysis.search_intent}. Cải thiện khả năng được trích dẫn bởi AI.`,
                expectedImpact: "+10 Điểm SEO",
                timeframe: "1-2 tuần"
              }] : []),
              ...(ai_analysis?.semantic_gaps && ai_analysis.semantic_gaps.length > 0 ? [{
                priority: 5,
                title: "Lấp Đầy Khoảng Trống Ngữ Nghĩa",
                description: `Bổ sung nội dung cho các chủ đề còn thiếu: ${ai_analysis.semantic_gaps.slice(0, 2).join(', ')}.`,
                expectedImpact: "+6 Điểm SEO",
                timeframe: "2-3 tuần"
              }] : [])
            ].slice(0, 5).map((rec, index) => (
              <div key={index} className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Priority {rec.priority}
                  </Badge>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400">
                      {rec.expectedImpact}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {rec.timeframe}
                    </Badge>
                  </div>
                </div>
                <h4 className="text-white font-medium mb-1">{rec.title}</h4>
                <p className="text-gray-400 text-sm">{rec.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Footer */}
      <Card className="glass-card border-white/10">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400 text-sm">
                This report was generated on {analysisDate} using SEO Auto Tool
              </span>
            </div>
            <Separator className="bg-white/10" />
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <span>© 2024 SEO Auto Tool</span>
              <span>•</span>
              <span>Professional SEO Analysis</span>
              <span>•</span>
              <span>Contact: support@seoautotool.com</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}