import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
  aiAnalysis: {
    searchIntent: string;
    semanticTopics: string[];
    contentGap: string[];
    suggestions: {
      newTitle: string;
      improvedMeta: string;
      h1?: string;
      extraHeadings: string[];
    };
    keywordDensity: { keyword: string; count?: number; density: number }[];
    wordCount: number;
    technicalSEO?: {
      hasCanonical: boolean;
      robotsDirective: string;
      headingStructure: string;
      imageOptimization: string;
    };
    overallScore?: number;
    priorityIssues?: string[];
  };
}

export default function AISEOResults({ aiAnalysis }: Props) {
  if (!aiAnalysis) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getIntentBadgeVariant = (intent: string) => {
    switch (intent.toLowerCase()) {
      case 'transactional':
        return 'default';
      case 'informational':
        return 'secondary';
      case 'commercial':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            🤖 Phân tích AI SEO nâng cao
            {aiAnalysis.overallScore && (
              <Badge variant="outline" className={getScoreColor(aiAnalysis.overallScore)}>
                {aiAnalysis.overallScore}/100
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Intent */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">🎯 Search Intent:</span>
            <Badge variant={getIntentBadgeVariant(aiAnalysis.searchIntent)}>
              {aiAnalysis.searchIntent}
            </Badge>
          </div>

          {/* Priority Issues */}
          {aiAnalysis.priorityIssues && aiAnalysis.priorityIssues.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2 text-destructive">⚠️ Priority Issues:</h3>
              <ul className="space-y-1">
                {aiAnalysis.priorityIssues.map((issue, i) => (
                  <li key={i} className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Semantic Topics */}
          <div>
            <h3 className="font-semibold text-sm mb-2">🧠 Semantic Topics:</h3>
            <div className="flex flex-wrap gap-2">
              {aiAnalysis.semanticTopics.map((topic, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          {/* Content Gaps */}
          {aiAnalysis.contentGap.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2 text-destructive">❗ Content Gaps:</h3>
              <ul className="space-y-1">
                {aiAnalysis.contentGap.map((gap, i) => (
                  <li key={i} className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    • {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          <div>
            <h3 className="font-semibold text-sm mb-3">🛠️ Đề xuất cải thiện:</h3>
            <div className="space-y-3">
              <div className="bg-muted/50 p-3 rounded">
                <p className="text-sm"><strong>New Title:</strong></p>
                <p className="text-sm text-muted-foreground mt-1">{aiAnalysis.suggestions.newTitle}</p>
              </div>
              
              <div className="bg-muted/50 p-3 rounded">
                <p className="text-sm"><strong>Improved Meta:</strong></p>
                <p className="text-sm text-muted-foreground mt-1">{aiAnalysis.suggestions.improvedMeta}</p>
              </div>
              
              {aiAnalysis.suggestions.h1 && (
                <div className="bg-muted/50 p-3 rounded">
                  <p className="text-sm"><strong>H1 Suggestion:</strong></p>
                  <p className="text-sm text-muted-foreground mt-1">{aiAnalysis.suggestions.h1}</p>
                </div>
              )}

              {aiAnalysis.suggestions.extraHeadings.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Heading phụ nên bổ sung:</p>
                  <ul className="space-y-1">
                    {aiAnalysis.suggestions.extraHeadings.map((heading, i) => (
                      <li key={i} className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                        H2/H3: {heading}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Keyword Density */}
          {aiAnalysis.keywordDensity.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-3">🔤 Keyword Density:</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    {aiAnalysis.keywordDensity[0].count !== undefined && (
                      <TableHead className="text-center">Count</TableHead>
                    )}
                    <TableHead className="text-center">Density (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aiAnalysis.keywordDensity.slice(0, 5).map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.keyword}</TableCell>
                      {item.count !== undefined && (
                        <TableCell className="text-center">{item.count}</TableCell>
                      )}
                      <TableCell className="text-center">{item.density.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Technical SEO */}
          {aiAnalysis.technicalSEO && (
            <div>
              <h3 className="font-semibold text-sm mb-3">⚙️ Technical SEO:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-muted/30 p-3 rounded">
                  <p className="text-sm font-medium">Canonical URL:</p>
                  <p className="text-xs text-muted-foreground">
                    {aiAnalysis.technicalSEO.hasCanonical ? "✅ Present" : "❌ Missing"}
                  </p>
                </div>
                <div className="bg-muted/30 p-3 rounded">
                  <p className="text-sm font-medium">Robots Directive:</p>
                  <p className="text-xs text-muted-foreground">{aiAnalysis.technicalSEO.robotsDirective}</p>
                </div>
                <div className="bg-muted/30 p-3 rounded">
                  <p className="text-sm font-medium">Heading Structure:</p>
                  <p className="text-xs text-muted-foreground">{aiAnalysis.technicalSEO.headingStructure}</p>
                </div>
                <div className="bg-muted/30 p-3 rounded">
                  <p className="text-sm font-medium">Image Optimization:</p>
                  <p className="text-xs text-muted-foreground">{aiAnalysis.technicalSEO.imageOptimization}</p>
                </div>
              </div>
            </div>
          )}

          {/* Word Count */}
          <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded">
            📄 Tổng số từ trong nội dung: <strong>{aiAnalysis.wordCount.toLocaleString()}</strong> từ
          </div>
        </CardContent>
      </Card>
    </div>
  );
}