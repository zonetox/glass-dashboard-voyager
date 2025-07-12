import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Scan = Tables<"scans">;

interface SEOCompareProps {
  before: Scan | null;
  after: Scan | null;
}

interface ComparisonItem {
  label: string;
  beforeValue: string;
  afterValue: string;
  hasChanged: boolean;
  isImprovement?: boolean;
}

export default function SEOCompare({ before, after }: SEOCompareProps) {
  if (!before || !after) {
    return (
      <Card className="border">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">
            Cần ít nhất 2 lần phân tích để so sánh
          </p>
        </CardContent>
      </Card>
    );
  }

  const improvementScore = getImprovementScore(before, after);
  const comparisonItems = getComparisonItems(before, after);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            📊 So sánh SEO Trước & Sau
          </CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Trước: {new Date(before.created_at || "").toLocaleDateString("vi-VN")}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">
              Sau: {new Date(after.created_at || "").toLocaleDateString("vi-VN")}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Overall Improvement Score */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">✨ Mức cải thiện tổng thể</h3>
              <div className="flex items-center gap-2">
                {improvementScore > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : improvementScore < 0 ? (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                ) : (
                  <Minus className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={`text-lg font-bold ${
                  improvementScore > 0 ? 'text-green-600' : 
                  improvementScore < 0 ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {improvementScore > 0 ? '+' : ''}{improvementScore}%
                </span>
              </div>
            </div>
            <Progress 
              value={Math.abs(improvementScore)} 
              className="h-3"
            />
            <p className="text-sm text-muted-foreground">
              {improvementScore > 50 ? 'Cải thiện đáng kể' :
               improvementScore > 20 ? 'Cải thiện tốt' :
               improvementScore > 0 ? 'Cải thiện nhẹ' :
               improvementScore === 0 ? 'Không có thay đổi' :
               'Cần cải thiện thêm'}
            </p>
          </div>

          <Separator />

          {/* Detailed Comparison */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">🔍 Chi tiết thay đổi</h3>
            <div className="space-y-3">
              {comparisonItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{item.label}</h4>
                    <div className="flex items-center gap-2">
                      {item.hasChanged ? (
                        item.isImprovement !== undefined ? (
                          item.isImprovement ? (
                            <Badge className="bg-green-500/20 text-green-700">
                              Cải thiện
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-700">
                              Giảm sút
                            </Badge>
                          )
                        ) : (
                          <Badge className="bg-blue-500/20 text-blue-700">
                            Thay đổi
                          </Badge>
                        )
                      ) : (
                        <Badge variant="secondary">
                          Không đổi
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="text-muted-foreground font-medium">🔙 Trước:</div>
                      <div className="p-2 bg-muted/50 rounded border-l-4 border-l-red-200">
                        {item.beforeValue || 'Không có dữ liệu'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-muted-foreground font-medium">✅ Sau:</div>
                      <div className="p-2 bg-muted/50 rounded border-l-4 border-l-green-200">
                        {item.afterValue || 'Không có dữ liệu'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getComparisonItems(before: Scan, after: Scan): ComparisonItem[] {
  const items: ComparisonItem[] = [];

  // AI Analysis Comparison
  const beforeAI = before.ai_analysis as Record<string, any> || {};
  const afterAI = after.ai_analysis as Record<string, any> || {};

  if (beforeAI.searchIntent || afterAI.searchIntent) {
    items.push({
      label: "🎯 Search Intent",
      beforeValue: beforeAI.searchIntent || "Chưa phân tích",
      afterValue: afterAI.searchIntent || "Chưa phân tích",
      hasChanged: beforeAI.searchIntent !== afterAI.searchIntent,
    });
  }

  // SEO Data Comparison
  const beforeSEO = before.seo as Record<string, any> || {};
  const afterSEO = after.seo as Record<string, any> || {};

  if (beforeSEO.title || afterSEO.title) {
    const beforeTitle = beforeSEO.title || "";
    const afterTitle = afterSEO.title || "";
    items.push({
      label: "📝 Title Tag",
      beforeValue: beforeTitle,
      afterValue: afterTitle,
      hasChanged: beforeTitle !== afterTitle,
      isImprovement: afterTitle.length > beforeTitle.length && afterTitle.length <= 60,
    });
  }

  if (beforeSEO.metaDescription || afterSEO.metaDescription) {
    const beforeMeta = beforeSEO.metaDescription || "";
    const afterMeta = afterSEO.metaDescription || "";
    items.push({
      label: "📄 Meta Description",
      beforeValue: beforeMeta,
      afterValue: afterMeta,
      hasChanged: beforeMeta !== afterMeta,
      isImprovement: afterMeta.length > beforeMeta.length && afterMeta.length <= 160,
    });
  }

  if (beforeSEO.h1 || afterSEO.h1) {
    items.push({
      label: "🏷️ H1 Tag",
      beforeValue: beforeSEO.h1 || "Không có",
      afterValue: afterSEO.h1 || "Không có",
      hasChanged: beforeSEO.h1 !== afterSEO.h1,
    });
  }

  // AI Analysis Quality Metrics
  if (beforeAI.overallScore || afterAI.overallScore) {
    const beforeScore = beforeAI.overallScore || 0;
    const afterScore = afterAI.overallScore || 0;
    items.push({
      label: "🎯 Overall Score",
      beforeValue: `${beforeScore}/100`,
      afterValue: `${afterScore}/100`,
      hasChanged: beforeScore !== afterScore,
      isImprovement: afterScore > beforeScore,
    });
  }

  return items;
}

function getImprovementScore(before: Scan, after: Scan): number {
  let score = 0;
  let totalChecks = 0;

  const beforeAI = before.ai_analysis as Record<string, any> || {};
  const afterAI = after.ai_analysis as Record<string, any> || {};
  const beforeSEO = before.seo as Record<string, any> || {};
  const afterSEO = after.seo as Record<string, any> || {};

  // Search Intent improvement
  if (beforeAI.searchIntent && afterAI.searchIntent) {
    totalChecks++;
    if (beforeAI.searchIntent !== afterAI.searchIntent) {
      score += 20; // Assume change is improvement
    }
  }

  // Title improvement
  if (beforeSEO.title || afterSEO.title) {
    totalChecks++;
    const beforeLen = (beforeSEO.title || "").length;
    const afterLen = (afterSEO.title || "").length;
    if (afterLen > beforeLen && afterLen <= 60) score += 15;
    else if (afterLen < beforeLen && beforeLen > 60) score += 10;
  }

  // Meta description improvement
  if (beforeSEO.metaDescription || afterSEO.metaDescription) {
    totalChecks++;
    const beforeLen = (beforeSEO.metaDescription || "").length;
    const afterLen = (afterSEO.metaDescription || "").length;
    if (afterLen > beforeLen && afterLen <= 160) score += 15;
    else if (afterLen < beforeLen && beforeLen > 160) score += 10;
  }

  // Overall score improvement
  if (beforeAI.overallScore && afterAI.overallScore) {
    totalChecks++;
    const scoreDiff = afterAI.overallScore - beforeAI.overallScore;
    score += Math.min(Math.max(scoreDiff, -30), 30);
  }

  // H1 tag presence
  if (!beforeSEO.h1 && afterSEO.h1) {
    score += 10;
  }

  return totalChecks > 0 ? Math.round(score) : 0;
}