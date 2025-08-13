import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface SEOScoreBreakdownProps {
  result: any;
}

export const SEOScoreBreakdown: React.FC<SEOScoreBreakdownProps> = ({ result }) => {
  const seoScore = result?.seoScore || {};
  const breakdown = seoScore.breakdown || {};
  
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'hsl(var(--success))';
    if (percentage >= 60) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const getScoreIcon = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return <CheckCircle className="h-4 w-4 text-success" />;
    if (percentage >= 60) return <AlertTriangle className="h-4 w-4 text-warning" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  const scoreCategories = [
    { key: 'titleOptimization', label: 'Tối ưu Title', maxScore: 15 },
    { key: 'metaDescription', label: 'Meta Description', maxScore: 10 },
    { key: 'headingStructure', label: 'Cấu trúc Heading', maxScore: 10 },
    { key: 'imageOptimization', label: 'Tối ưu Hình ảnh', maxScore: 10 },
    { key: 'technicalSEO', label: 'Technical SEO', maxScore: 15 },
    { key: 'contentQuality', label: 'Chất lượng Nội dung', maxScore: 10 },
    { key: 'indexability', label: 'Khả năng Index', maxScore: 10 },
    { key: 'socialOptimization', label: 'Social Media', maxScore: 5 },
    { key: 'structuredData', label: 'Structured Data', maxScore: 5 }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="glass-card border-white/10">
        <CardHeader className="text-center">
          <div className="mx-auto w-32 h-32 relative">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-muted-foreground"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary"
                stroke={seoScore.color || 'hsl(var(--primary))'}
                strokeWidth="3"
                strokeDasharray={`${seoScore.overall || 0}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{seoScore.overall || 0}</div>
                <div className="text-sm text-muted-foreground">điểm</div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Badge 
              variant="outline" 
              className="text-lg px-4 py-1"
              style={{ borderColor: seoScore.color, color: seoScore.color }}
            >
              Xếp hạng {seoScore.grade || 'N/A'}
            </Badge>
            <p className="text-muted-foreground">{seoScore.status || 'Unknown'}</p>
          </div>
        </CardHeader>
      </Card>

      {/* Score Breakdown */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Chi tiết điểm số SEO
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scoreCategories.map((category) => {
            const score = breakdown[category.key] || 0;
            const percentage = (score / category.maxScore) * 100;
            
            return (
              <div key={category.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getScoreIcon(score, category.maxScore)}
                    <span className="text-sm font-medium text-white">{category.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {score}/{category.maxScore}
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                  style={{
                    background: 'hsl(var(--muted))',
                  }}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Issues and Strengths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Issues */}
        {seoScore.issues && seoScore.issues.length > 0 && (
          <Card className="glass-card border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Vấn đề cần khắc phục ({seoScore.issues.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {seoScore.issues.map((issue: string, index: number) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white">{issue}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Strengths */}
        {seoScore.strengths && seoScore.strengths.length > 0 && (
          <Card className="glass-card border-success/20">
            <CardHeader>
              <CardTitle className="text-success flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Điểm mạnh ({seoScore.strengths.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {seoScore.strengths.map((strength: string, index: number) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-success/10 rounded-lg border border-success/20">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white">{strength}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};