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
  };
  onDownload: () => void;
  onCustomize?: () => void;
}

export function PDFReportTemplate({ websiteData, onDownload, onCustomize }: PDFReportTemplateProps) {
  const { url, title, analysisDate, seoScore, issues, improvements } = websiteData;

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
            { name: "Technical SEO", score: 85, issues: 2 },
            { name: "Content Quality", score: 72, issues: 5 },
            { name: "Mobile Optimization", score: 91, issues: 1 },
            { name: "Page Speed", score: 68, issues: 3 },
            { name: "Meta Tags", score: 94, issues: 0 },
            { name: "Schema Markup", score: 45, issues: 8 }
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
              {
                type: "High Priority",
                title: "Missing Meta Descriptions",
                description: "15 pages are missing meta descriptions, affecting search result click-through rates.",
                impact: "High",
                effort: "Low"
              },
              {
                type: "Medium Priority", 
                title: "Slow Page Load Speed",
                description: "Average page load time is 4.2 seconds. Recommended threshold is under 3 seconds.",
                impact: "Medium",
                effort: "Medium"
              },
              {
                type: "Low Priority",
                title: "Alt Text Missing",
                description: "8 images are missing descriptive alt text for accessibility and SEO.",
                impact: "Low",
                effort: "Low"
              }
            ].map((issue, index) => (
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
                title: "Optimize Page Loading Speed", 
                description: "Compress images and enable browser caching to reduce load times by 40%.",
                expectedImpact: "+15 SEO Score",
                timeframe: "1-2 weeks"
              },
              {
                priority: 2,
                title: "Complete Meta Tag Optimization",
                description: "Add compelling meta descriptions to increase click-through rates from search results.",
                expectedImpact: "+8 SEO Score", 
                timeframe: "3-5 days"
              },
              {
                priority: 3,
                title: "Implement Schema Markup",
                description: "Add structured data to help search engines better understand your content.",
                expectedImpact: "+12 SEO Score",
                timeframe: "1 week"
              }
            ].map((rec, index) => (
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