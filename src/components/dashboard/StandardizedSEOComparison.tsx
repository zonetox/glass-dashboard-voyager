import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight,
  Zap,
  BarChart3,
  FileText,
  Search,
  Globe,
  Link,
  Image,
  Gauge
} from 'lucide-react';
import { StandardizedSEOAnalysis, ValidationStatus } from '@/lib/seo-schemas';

interface StandardizedSEOComparisonProps {
  analysis: StandardizedSEOAnalysis;
  onApplyFix?: (fixId: string) => void;
  onApplyAllFixes?: () => void;
}

export function StandardizedSEOComparison({ 
  analysis, 
  onApplyFix, 
  onApplyAllFixes 
}: StandardizedSEOComparisonProps) {
  
  const getStatusIcon = (status: ValidationStatus) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const getStatusBadge = (status: ValidationStatus, message: string) => {
    const variants = {
      valid: "bg-green-500/20 text-green-300 border-green-500/30",
      warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", 
      error: "bg-red-500/20 text-red-300 border-red-500/30"
    };

    return (
      <Badge className={variants[status]}>
        {getStatusIcon(status)}
        <span className="ml-1">{message}</span>
      </Badge>
    );
  };

  const getSectionIcon = (type: string) => {
    const icons = {
      meta_title: <FileText className="h-5 w-5" />,
      meta_description: <FileText className="h-5 w-5" />,
      headings: <BarChart3 className="h-5 w-5" />,
      alt_text: <Image className="h-5 w-5" />,
      pagespeed: <Gauge className="h-5 w-5" />,
      schema: <Globe className="h-5 w-5" />,
      internal_links: <Link className="h-5 w-5" />,
      ai_rewrite: <Zap className="h-5 w-5" />,
      topic_map: <Search className="h-5 w-5" />,
      auto_fix: <CheckCircle2 className="h-5 w-5" />
    };
    return icons[type as keyof typeof icons] || <FileText className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Header */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              Phân tích SEO chuẩn hóa
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{analysis.overall_score}/100</div>
                <div className="text-sm text-gray-400">Điểm tổng</div>
              </div>
              <Progress value={analysis.overall_score} className="w-24 h-2" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Two-Column Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Regular SEO Column */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-400" />
              SEO Thường
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Meta Title */}
            {analysis.regular_seo.meta_title && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getSectionIcon('meta_title')}
                  <span className="font-medium text-white">Meta Title</span>
                </div>
                {getStatusBadge(analysis.regular_seo.meta_title.status, analysis.regular_seo.meta_title.validation.message)}
                <div className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded">
                  "{analysis.regular_seo.meta_title.value.title}"
                </div>
                {analysis.regular_seo.meta_title.value.suggested_title && (
                  <div className="text-sm">
                    <span className="text-green-400">Đề xuất:</span>
                    <div className="text-gray-300 bg-green-500/10 p-2 rounded mt-1">
                      "{analysis.regular_seo.meta_title.value.suggested_title}"
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Meta Description */}
            {analysis.regular_seo.meta_description && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getSectionIcon('meta_description')}
                  <span className="font-medium text-white">Meta Description</span>
                </div>
                {getStatusBadge(analysis.regular_seo.meta_description.status, analysis.regular_seo.meta_description.validation.message)}
                <div className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded">
                  "{analysis.regular_seo.meta_description.value.description}"
                </div>
                {analysis.regular_seo.meta_description.value.suggested_description && (
                  <div className="text-sm">
                    <span className="text-green-400">Đề xuất:</span>
                    <div className="text-gray-300 bg-green-500/10 p-2 rounded mt-1">
                      "{analysis.regular_seo.meta_description.value.suggested_description}"
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Headings */}
            {analysis.regular_seo.headings && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getSectionIcon('headings')}
                  <span className="font-medium text-white">Headings Structure</span>
                </div>
                {getStatusBadge(analysis.regular_seo.headings.status, analysis.regular_seo.headings.validation.message)}
                <div className="text-sm space-y-1">
                  <div className="text-gray-400">Total: {analysis.regular_seo.headings.value.total_count}</div>
                  {analysis.regular_seo.headings.value.duplicates > 0 && (
                    <div className="text-yellow-400">Trùng lặp: {analysis.regular_seo.headings.value.duplicates}</div>
                  )}
                  {analysis.regular_seo.headings.value.missing.length > 0 && (
                    <div className="text-red-400">Thiếu: {analysis.regular_seo.headings.value.missing.join(', ')}</div>
                  )}
                </div>
              </div>
            )}

            {/* Alt Text */}
            {analysis.regular_seo.alt_text && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getSectionIcon('alt_text')}
                  <span className="font-medium text-white">Alt Text</span>
                </div>
                {getStatusBadge(analysis.regular_seo.alt_text.status, analysis.regular_seo.alt_text.validation.message)}
                <div className="text-sm space-y-1">
                  <div className="text-gray-400">
                    {analysis.regular_seo.alt_text.value.total_images} ảnh - 
                    Thiếu alt: {analysis.regular_seo.alt_text.value.missing_alt}
                  </div>
                  <div className="text-blue-400">
                    Từ khóa match: {analysis.regular_seo.alt_text.value.keyword_match_count}
                  </div>
                </div>
              </div>
            )}

            {/* PageSpeed */}
            {analysis.regular_seo.pagespeed && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getSectionIcon('pagespeed')}
                  <span className="font-medium text-white">PageSpeed</span>
                </div>
                {getStatusBadge(analysis.regular_seo.pagespeed.status, analysis.regular_seo.pagespeed.validation.message)}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-gray-800/50 rounded">
                    <div className="text-white font-medium">{analysis.regular_seo.pagespeed.value.mobile_score}</div>
                    <div className="text-gray-400">Mobile</div>
                  </div>
                  <div className="text-center p-2 bg-gray-800/50 rounded">
                    <div className="text-white font-medium">{analysis.regular_seo.pagespeed.value.desktop_score}</div>
                    <div className="text-gray-400">Desktop</div>
                  </div>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* AI SEO Column */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-400" />
              AI SEO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* AI Rewrite */}
            {analysis.ai_seo.ai_rewrite && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getSectionIcon('ai_rewrite')}
                  <span className="font-medium text-white">AI Rewriting</span>
                </div>
                {getStatusBadge(analysis.ai_seo.ai_rewrite.status, `Confidence: ${analysis.ai_seo.ai_rewrite.value.confidence}%`)}
                
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Before:</div>
                    <div className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded">
                      {analysis.ai_seo.ai_rewrite.value.original}
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <ArrowRight className="h-4 w-4 text-purple-400" />
                  </div>
                  
                  <div>
                    <div className="text-sm text-green-400 mb-1">After (AI Enhanced):</div>
                    <div className="text-sm text-gray-300 bg-green-500/10 p-3 rounded border border-green-500/20">
                      {analysis.ai_seo.ai_rewrite.value.rewritten}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-purple-500/10 rounded">
                      <div className="text-white font-medium">
                        {analysis.ai_seo.ai_rewrite.value.improvements.keyword_density}%
                      </div>
                      <div className="text-gray-400">Keyword Density</div>
                    </div>
                    <div className="text-center p-2 bg-purple-500/10 rounded">
                      <div className="text-white font-medium">
                        {analysis.ai_seo.ai_rewrite.value.improvements.readability_score}
                      </div>
                      <div className="text-gray-400">Readability</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Topic Map */}
            {analysis.ai_seo.topic_map && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getSectionIcon('topic_map')}
                  <span className="font-medium text-white">Topic Map</span>
                </div>
                {getStatusBadge(analysis.ai_seo.topic_map.status, analysis.ai_seo.topic_map.validation.message)}
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-purple-400">Main Topic:</span>
                    <span className="text-white ml-2">{analysis.ai_seo.topic_map.value.main_topic}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-purple-400">Subtopics:</div>
                    {analysis.ai_seo.topic_map.value.subtopics.slice(0, 3).map((subtopic, idx) => (
                      <div key={idx} className="text-xs bg-purple-500/10 p-2 rounded">
                        <div className="text-white">{subtopic.topic}</div>
                        <div className="text-gray-400">Intent: {subtopic.intent}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Auto-Fix */}
            {analysis.ai_seo.auto_fix && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getSectionIcon('auto_fix')}
                  <span className="font-medium text-white">Auto-Fix</span>
                </div>
                {getStatusBadge(analysis.ai_seo.auto_fix.status, `${analysis.ai_seo.auto_fix.value.fixes_available.length} fixes available`)}
                
                <div className="space-y-2">
                  {analysis.ai_seo.auto_fix.value.fixes_available.slice(0, 3).map((fix, idx) => (
                    <div key={idx} className="bg-gray-800/50 p-3 rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">{fix.description}</span>
                        <Badge variant={fix.priority === 'high' ? 'destructive' : fix.priority === 'medium' ? 'default' : 'secondary'}>
                          {fix.priority}
                        </Badge>
                      </div>
                      {fix.auto_applicable && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => onApplyFix?.(fix.id)}
                        >
                          Áp dụng fix
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {analysis.ai_seo.auto_fix.value.fixes_available.length > 0 && (
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={onApplyAllFixes}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Áp dụng tất cả fixes
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Search Intent */}
            {analysis.ai_seo.search_intent && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getSectionIcon('search_intent')}
                  <span className="font-medium text-white">Search Intent</span>
                </div>
                {getStatusBadge(analysis.ai_seo.search_intent.status, `${analysis.ai_seo.search_intent.value.confidence}% confidence`)}
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-purple-400">Intent:</span>
                    <span className="text-white ml-2 capitalize">{analysis.ai_seo.search_intent.value.primary_intent}</span>
                  </div>
                  
                  <div className="bg-purple-500/10 p-3 rounded">
                    <div className="text-sm text-purple-400 mb-1">Suggested CTA:</div>
                    <div className="text-white font-medium">"{analysis.ai_seo.search_intent.value.suggested_cta.text}"</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Placement: {analysis.ai_seo.search_intent.value.suggested_cta.placement}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Predictive Ranking */}
            {analysis.ai_seo.predictive_ranking && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-medium text-white">Predictive Ranking</span>
                </div>
                {getStatusBadge(analysis.ai_seo.predictive_ranking.status, `${analysis.ai_seo.predictive_ranking.value.confidence}% confidence`)}
                
                <div className="bg-gray-800/50 p-3 rounded space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-400">Keyword:</span>
                    <span className="text-white ml-2">{analysis.ai_seo.predictive_ranking.value.keyword}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-red-400">Hiện tại: #{analysis.ai_seo.predictive_ranking.value.current_position || 'N/A'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400">Dự đoán: #{analysis.ai_seo.predictive_ranking.value.predicted_position}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>

      {/* Validation Errors */}
      {analysis.validation_errors.length > 0 && (
        <Card className="glass-card border-red-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-400" />
              Lỗi xác thực
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.validation_errors.map((error, idx) => (
                <div key={idx} className="text-sm text-red-300 bg-red-500/10 p-2 rounded">
                  {error}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}