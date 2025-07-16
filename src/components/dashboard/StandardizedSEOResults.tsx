import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Target,
  Eye,
  Zap,
  ImageIcon,
  Gauge,
  Code,
  Link,
  TrendingUp,
  Lightbulb
} from 'lucide-react';

interface StandardizedSEOResultsProps {
  standardizedAnalysis: any;
  formattedOutput: string;
  className?: string;
}

export function StandardizedSEOResults({ 
  standardizedAnalysis, 
  formattedOutput, 
  className 
}: StandardizedSEOResultsProps) {
  if (!standardizedAnalysis) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          No standardized analysis available
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
      case 'found':
      case 'pass':
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'needs_improvement':
      case 'too_short':
      case 'too_long':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'missing':
      case 'invalid':
      case 'fail':
      case 'poor':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
      case 'found':
      case 'pass':
      case 'good':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'needs_improvement':
      case 'too_short':
      case 'too_long':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'missing':
      case 'invalid':
      case 'fail':
      case 'poor':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const { metaTitle, metaDescription, headings, altText, pageSpeed, schema, internalLinks, overall } = standardizedAnalysis;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Kết Quả Phân Tích SEO Chuẩn Hóa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{overall.seoScore}/100</div>
              <div className="text-sm text-muted-foreground">SEO Score</div>
            </div>
            <div className="flex-1">
              <Progress value={overall.seoScore} className="h-3" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              <span className="font-medium">Hành động ưu tiên:</span>
              <span className="text-sm">{overall.priorityActions.join(', ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Tối ưu tiếp theo:</span>
              <span className="text-sm">{overall.nextOptimizationTarget}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meta Tags Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4" />
              Meta Title
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metaTitle.status)}
                  <span className="text-sm font-medium">{metaTitle.length} ký tự</span>
                </div>
                <Badge variant="outline" className={getStatusColor(metaTitle.status)}>
                  {metaTitle.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs">Keyword:</span>
                  <Badge variant={metaTitle.keywordPresence ? "default" : "destructive"} className="text-xs">
                    {metaTitle.keywordPresence ? 'Có' : 'Không'}
                  </Badge>
                </div>
                
                {metaTitle.current && (
                  <div className="text-xs text-muted-foreground">
                    <strong>Hiện tại:</strong> {metaTitle.current}
                  </div>
                )}
                
                {metaTitle.suggestion !== metaTitle.current && (
                  <div className="text-xs bg-blue-50 p-2 rounded">
                    <strong>Gợi ý:</strong> {metaTitle.suggestion}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4" />
              Meta Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metaDescription.status)}
                  <span className="text-sm font-medium">{metaDescription.length} ký tự</span>
                </div>
                <Badge variant="outline" className={getStatusColor(metaDescription.status)}>
                  {metaDescription.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span>Unique:</span>
                  <Badge variant={metaDescription.unique ? "default" : "destructive"} className="text-xs">
                    {metaDescription.unique ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <span>CTA:</span>
                  <Badge variant={metaDescription.hasCTA ? "default" : "secondary"} className="text-xs">
                    {metaDescription.hasCTA ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
              
              {metaDescription.suggestion !== metaDescription.current && (
                <div className="text-xs bg-blue-50 p-2 rounded">
                  <strong>Gợi ý:</strong> {metaDescription.suggestion}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Code className="h-4 w-4" />
            Cấu Trúc Nội Dung (Headings)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{headings.total}</div>
              <div className="text-xs text-muted-foreground">Tổng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{headings.h1Count}</div>
              <div className="text-xs text-muted-foreground">H1</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{headings.h2Count}</div>
              <div className="text-xs text-muted-foreground">H2</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{headings.h3Count}</div>
              <div className="text-xs text-muted-foreground">H3</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Cấu trúc:</span>
              <Badge variant="outline" className={getStatusColor(headings.structureScore > 80 ? 'good' : headings.structureScore > 60 ? 'needs_improvement' : 'poor')}>
                {headings.structureScore}/100
              </Badge>
            </div>
            
            {headings.duplicates > 0 && (
              <div className="flex items-center gap-2 text-sm text-yellow-700">
                <AlertTriangle className="h-3 w-3" />
                {headings.duplicates} heading trùng lặp
              </div>
            )}
            
            {headings.missing.length > 0 && (
              <div className="text-sm text-red-700">
                <strong>Thiếu:</strong> {headings.missing.join(', ')}
              </div>
            )}
            
            {headings.suggestions.length > 0 && (
              <div className="text-xs bg-green-50 p-2 rounded">
                <strong>Gợi ý:</strong> {headings.suggestions[0]}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Images and Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ImageIcon className="h-4 w-4" />
              Alt Text
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold">{altText.totalImages}</div>
                  <div className="text-xs text-muted-foreground">Tổng ảnh</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600">{altText.missingAlt}</div>
                  <div className="text-xs text-muted-foreground">Thiếu alt</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{altText.keywordMatch}</div>
                  <div className="text-xs text-muted-foreground">Có keyword</div>
                </div>
              </div>
              
              {altText.suggestions.length > 0 && (
                <div className="text-xs bg-blue-50 p-2 rounded">
                  <strong>Gợi ý:</strong> {altText.suggestions[0]}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Gauge className="h-4 w-4" />
              PageSpeed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {getStatusIcon(pageSpeed.mobile.status)}
                    <span className="text-sm font-medium">Mobile</span>
                  </div>
                  <div className="text-lg font-bold">{pageSpeed.mobile.score}/100</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {getStatusIcon(pageSpeed.desktop.status)}
                    <span className="text-sm font-medium">Desktop</span>
                  </div>
                  <div className="text-lg font-bold">{pageSpeed.desktop.score}/100</div>
                </div>
              </div>
              
              {pageSpeed.criticalIssues.length > 0 && (
                <div className="text-xs bg-red-50 p-2 rounded">
                  <strong>Lỗi nghiêm trọng:</strong> {pageSpeed.criticalIssues[0]}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schema and Internal Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Code className="h-4 w-4" />
              Schema Markup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(schema.status)}
                  <span className="text-sm font-medium">{schema.type}</span>
                </div>
                <Badge variant="outline" className={getStatusColor(schema.validation)}>
                  {schema.validation}
                </Badge>
              </div>
              
              {schema.suggestions.length > 0 && (
                <div className="text-xs bg-blue-50 p-2 rounded">
                  <strong>Gợi ý:</strong> {schema.suggestions[0]}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Link className="h-4 w-4" />
              Internal Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold">{internalLinks.totalLinks}</div>
                  <div className="text-xs text-muted-foreground">Tổng links</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">{internalLinks.orphanedPages}</div>
                  <div className="text-xs text-muted-foreground">Trang cô lập</div>
                </div>
              </div>
              
              {internalLinks.linkSuggestions.length > 0 && (
                <div className="text-xs bg-green-50 p-2 rounded">
                  <strong>Gợi ý link:</strong> "{internalLinks.linkSuggestions[0].anchorText}"
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formatted Output */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4" />
            Kết Quả Chuẩn Hóa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {formattedOutput}
          </pre>
          <div className="mt-4 flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigator.clipboard.writeText(formattedOutput)}
            >
              Copy Kết Quả
            </Button>
            <Button size="sm">
              Tải PDF Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}