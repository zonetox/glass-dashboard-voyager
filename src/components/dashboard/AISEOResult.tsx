import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Search,
  Lightbulb,
  BarChart3
} from "lucide-react";

interface AISEOResultProps {
  aiAnalysis: any;
}

export default function AISEOResult({ aiAnalysis }: AISEOResultProps) {
  if (!aiAnalysis || typeof aiAnalysis !== 'object') {
    return (
      <Card className="border">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No AI analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  const analysis = aiAnalysis as Record<string, any>;

  return (
    <Card className="border animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          🤖 AI SEO Analysis Results
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-1">
              <BarChart3 className="h-3 w-3" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="intent" className="gap-1">
              <Target className="h-3 w-3" />
              Intent
            </TabsTrigger>
            <TabsTrigger value="issues" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Issues
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-1">
              <Lightbulb className="h-3 w-3" />
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {analysis.searchIntent && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Search Intent</h4>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {analysis.searchIntent}
                  </Badge>
                </div>
              )}

              {analysis.overallScore && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Overall Score</h4>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {analysis.overallScore}/100
                  </Badge>
                </div>
              )}

              {analysis.contentQuality && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Content Quality</h4>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {analysis.contentQuality}
                  </Badge>
                </div>
              )}

              {analysis.technicalSEO && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Technical SEO</h4>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {analysis.technicalSEO}
                  </Badge>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="intent" className="space-y-4">
            {analysis.searchIntent ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Search Intent Analysis</h3>
                </div>
                <Card className="bg-muted/50 border-primary/20">
                  <CardContent className="p-4">
                    <p className="text-lg">{analysis.searchIntent}</p>
                  </CardContent>
                </Card>
                
                {analysis.intentDescription && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Description</h4>
                    <p className="text-muted-foreground">{analysis.intentDescription}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No search intent analysis available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            {analysis.issues && Array.isArray(analysis.issues) && analysis.issues.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <h3 className="text-lg font-semibold">Identified Issues</h3>
                </div>
                {analysis.issues.map((issue: any, index: number) => (
                  <Card key={index} className="border-destructive/20 bg-destructive/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="destructive" className="mt-0.5">
                          {issue.severity || 'Medium'}
                        </Badge>
                        <div className="flex-1">
                          <h5 className="font-medium mb-1">
                            {issue.title || issue.type || `Issue ${index + 1}`}
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            {issue.description || issue.message || issue}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">No issues identified</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {analysis.recommendations && Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">AI Recommendations</h3>
                </div>
                {analysis.recommendations.map((rec: any, index: number) => (
                  <Card key={index} className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium mb-1">
                            {rec.title || `Recommendation ${index + 1}`}
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            {rec.description || rec.content || rec}
                          </p>
                          {rec.priority && (
                            <Badge variant="outline" className="mt-2">
                              Priority: {rec.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recommendations available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Raw data section for debugging */}
        <Separator className="my-6" />
        <details className="space-y-2">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
            View Raw AI Analysis Data
          </summary>
          <ScrollArea className="h-48 w-full">
            <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </ScrollArea>
        </details>
      </CardContent>
    </Card>
  );
}