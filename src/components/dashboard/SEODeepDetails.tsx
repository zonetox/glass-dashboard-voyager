import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEOScoreBreakdown } from './SEOScoreBreakdown';
import { TechnicalSEOReport } from './TechnicalSEOReport';
import { PerformanceOptimizationReport } from './PerformanceOptimizationReport';
import { FileText, BarChart3, Settings, Zap } from 'lucide-react';

interface SEODeepDetailsProps {
  result: any;
}

export const SEODeepDetails: React.FC<SEODeepDetailsProps> = ({ result }) => {
  const seo = result?.seo || {};
  const ai = result?.aiAnalysis || {};

  const titleLen = seo?.title ? seo.title.length : 0;
  const descLen = seo?.metaDescription ? seo.metaDescription.length : 0;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="score" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/5">
          <TabsTrigger value="score" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Điểm số SEO
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Technical SEO
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Nội dung
          </TabsTrigger>
        </TabsList>

        <TabsContent value="score" className="space-y-4">
          <SEOScoreBreakdown result={result} />
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <TechnicalSEOReport result={result} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceOptimizationReport result={result} />
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Meta & Cấu trúc nội dung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Độ dài Title</div>
                  <div className="text-xl font-semibold text-white">{titleLen} ký tự</div>
                  <Badge variant="outline" className="mt-1">{titleLen >= 50 && titleLen <= 60 ? 'Tối ưu' : 'Cần xem lại'}</Badge>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Độ dài Meta Description</div>
                  <div className="text-xl font-semibold text-white">{descLen} ký tự</div>
                  <Badge variant="outline" className="mt-1">{descLen >= 120 && descLen <= 160 ? 'Tối ưu' : 'Cần xem lại'}</Badge>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Canonical</div>
                  <div className="text-white">{seo?.canonical || 'Chưa thiết lập'}</div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">H1</div>
                  <div className="text-white font-semibold">{seo?.h1?.length || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">H2</div>
                  <div className="text-white font-semibold">{seo?.h2?.length || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">H3</div>
                  <div className="text-white font-semibold">{seo?.h3?.length || 0}</div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Title hiện tại:</div>
                <div className="text-white text-sm">{seo?.title || 'Không có'}</div>
              </div>

              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Meta Description hiện tại:</div>
                <div className="text-white text-sm">{seo?.metaDescription || 'Không có'}</div>
              </div>

              {seo?.h1?.length > 0 && (
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">H1 Tags:</div>
                  <div className="space-y-1">
                    {seo.h1.map((h1: string, index: number) => (
                      <div key={index} className="text-white text-sm">{h1}</div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {ai?.keywordDensity?.length ? (
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Mật độ từ khóa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ai.keywordDensity.map((k: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white/5 rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">{k.keyword}</span>
                        <Badge variant="outline" className="text-xs">{k.count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {ai?.suggestions && (
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Gợi ý AI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ai.suggestions.newTitle && ai.suggestions.newTitle !== seo?.title && (
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-sm text-blue-300 mb-1">Gợi ý Title mới:</div>
                    <div className="text-white text-sm">{ai.suggestions.newTitle}</div>
                  </div>
                )}

                {ai.suggestions.improvedMeta && ai.suggestions.improvedMeta !== seo?.metaDescription && (
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-sm text-green-300 mb-1">Gợi ý Meta Description mới:</div>
                    <div className="text-white text-sm">{ai.suggestions.improvedMeta}</div>
                  </div>
                )}

                {ai.suggestions.extraHeadings?.length > 0 && (
                  <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="text-sm text-purple-300 mb-2">Gợi ý thêm Headings:</div>
                    <div className="space-y-1">
                      {ai.suggestions.extraHeadings.map((heading: string, index: number) => (
                        <div key={index} className="text-white text-sm">• {heading}</div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
