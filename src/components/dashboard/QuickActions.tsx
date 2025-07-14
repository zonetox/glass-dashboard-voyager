import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  FileText, 
  Search, 
  Wand2, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Download,
  Globe,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import StatusIndicator from '@/components/ui/status-indicator';

interface QuickActionsProps {
  currentDomain?: string;
  seoScore?: number;
  totalIssues?: number;
  criticalIssues?: number;
  fixedIssues?: number;
  onQuickScan?: (domain: string) => void;
  onGeneratePDF?: () => void;
  onQuickOptimize?: () => void;
  isAnalyzing?: boolean;
  isGeneratingPDF?: boolean;
  isOptimizing?: boolean;
}

export function QuickActions({
  currentDomain = 'example.com',
  seoScore = 75,
  totalIssues = 12,
  criticalIssues = 3,
  fixedIssues = 8,
  onQuickScan,
  onGeneratePDF,
  onQuickOptimize,
  isAnalyzing = false,
  isGeneratingPDF = false,
  isOptimizing = false
}: QuickActionsProps) {
  const { toast } = useToast();
  const notifications = useNotifications();

  const handleQuickScan = () => {
    if (onQuickScan) {
      onQuickScan(currentDomain);
      notifications.showNotification({
        title: "🔍 Quick Scan Started",
        description: `Scanning ${currentDomain} for SEO issues...`
      });
    }
  };

  const handleQuickPDF = () => {
    if (onGeneratePDF) {
      onGeneratePDF();
      notifications.showNotification({
        title: "📄 PDF Generation Started", 
        description: "Generating comprehensive SEO report..."
      });
    }
  };

  const handleQuickOptimize = () => {
    if (onQuickOptimize) {
      onQuickOptimize();
      notifications.showNotification({
        title: "✨ AI Optimization Started",
        description: "AI is analyzing and optimizing your website..."
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const hasUnfixedIssues = totalIssues > fixedIssues;
  const unfixedIssues = totalIssues - fixedIssues;

  return (
    <Card className="glass-card border-white/10 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Zap className="h-5 w-5 text-yellow-400" />
          Quick Actions
          <Badge variant="secondary" className="ml-auto">
            {currentDomain}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Website Status */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-white font-medium truncate max-w-48">
              {currentDomain}
            </span>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className={`font-bold ${getScoreColor(seoScore)}`}>
              {seoScore}/100
            </span>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-2">
            {hasUnfixedIssues ? (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm text-white">
              {hasUnfixedIssues ? `${unfixedIssues} issues` : 'All fixed'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>SEO Progress</span>
            <span>{fixedIssues}/{totalIssues} issues fixed</span>
          </div>
          <Progress 
            value={(fixedIssues / totalIssues) * 100} 
            className="h-2"
          />
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          {/* Quick Scan */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleQuickScan}
              disabled={isAnalyzing}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white quick-scan-button"
              size="sm"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Quick Scan
                </>
              )}
            </Button>
            {isAnalyzing && (
              <StatusIndicator status="loading" size="sm" />
            )}
          </div>

          {/* Generate PDF */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleQuickPDF}
              disabled={isGeneratingPDF || seoScore === 0}
              variant="outline"
              className="flex-1 border-green-500/20 text-green-400 hover:bg-green-500/10 generate-pdf-button"
              size="sm"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating PDF...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Create PDF Report
                </>
              )}
            </Button>
            {isGeneratingPDF && (
              <StatusIndicator status="loading" size="sm" />
            )}
          </div>

          {/* Quick Optimize (only show if there are unfixed issues) */}
          {hasUnfixedIssues && (
            <div className="flex items-center gap-3">
              <Button
                onClick={handleQuickOptimize}
                disabled={isOptimizing}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white quick-optimize-button"
                size="sm"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Quick AI Optimize ({unfixedIssues} issues)
                  </>
                )}
              </Button>
              {isOptimizing && (
                <StatusIndicator status="loading" size="sm" />
              )}
            </div>
          )}
        </div>

        {/* Critical Issues Alert */}
        {criticalIssues > 0 && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">
                {criticalIssues} critical issue{criticalIssues > 1 ? 's' : ''} need immediate attention
              </span>
              <ArrowRight className="h-3 w-3 ml-auto" />
            </div>
          </div>
        )}

        {/* Success State */}
        {!hasUnfixedIssues && totalIssues > 0 && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">
                All SEO issues have been resolved! 🎉
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}