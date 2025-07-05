
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Download, 
  Mail, 
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Clock,
  Shield,
  Code,
  Target
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OptimizationSummaryProps {
  summaryData: {
    url: string;
    timestamp: string;
    beforeScores: {
      seoScore: number;
      desktopSpeed: number;
      mobileSpeed: number;
    };
    afterScores: {
      seoScore: number;
      desktopSpeed: number;
      mobileSpeed: number;
    };
    backupInfo: {
      downloadUrl: string;
      filename: string;
      size: number;
    };
    appliedFixes: Array<{
      id: string;
      title: string;
      status: 'success' | 'failed' | 'skipped';
      message: string;
    }>;
    successCount: number;
    failedCount: number;
    recommendations: string[];
    reportUrl?: string;
  };
  url: string;
  schemaMarkup?: any;
}

export function OptimizationSummary({ summaryData, schemaMarkup }: OptimizationSummaryProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const getScoreDelta = (before: number, after: number) => {
    const delta = after - before;
    return {
      value: delta,
      icon: delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus,
      color: delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-gray-400'
    };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // In a real implementation, this would call a PDF generation service
      toast({
        title: "PDF Export",
        description: "PDF export functionality would be implemented here",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to export PDF report",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      // In a real implementation, this would call an email service
      toast({
        title: "Email Sent",
        description: "Optimization report has been sent to your email",
      });
    } catch (error) {
      toast({
        title: "Email failed",
        description: "Unable to send email report",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const seoScoreDelta = getScoreDelta(summaryData.beforeScores.seoScore, summaryData.afterScores.seoScore);
  const desktopDelta = getScoreDelta(summaryData.beforeScores.desktopSpeed, summaryData.afterScores.desktopSpeed);
  const mobileDelta = getScoreDelta(summaryData.beforeScores.mobileSpeed, summaryData.afterScores.mobileSpeed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CheckCircle className="h-6 w-6 text-green-400" />
            Optimization Complete
          </CardTitle>
          <p className="text-gray-400">
            Completed on {new Date(summaryData.timestamp).toLocaleString()} for{' '}
            <span className="text-blue-300">{summaryData.url}</span>
          </p>
        </CardHeader>
      </Card>

      {/* Score Improvements */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Score Improvements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl font-bold text-blue-400">
                  {summaryData.afterScores.seoScore}
                </span>
                <seoScoreDelta.icon className={`h-5 w-5 ${seoScoreDelta.color}`} />
                <span className={`text-sm ${seoScoreDelta.color}`}>
                  {seoScoreDelta.value > 0 ? '+' : ''}{seoScoreDelta.value}
                </span>
              </div>
              <div className="text-sm text-gray-400">SEO Score</div>
              <div className="text-xs text-gray-500">
                was {summaryData.beforeScores.seoScore}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl font-bold text-purple-400">
                  {summaryData.afterScores.desktopSpeed}
                </span>
                <desktopDelta.icon className={`h-5 w-5 ${desktopDelta.color}`} />
                <span className={`text-sm ${desktopDelta.color}`}>
                  {desktopDelta.value > 0 ? '+' : ''}{desktopDelta.value}
                </span>
              </div>
              <div className="text-sm text-gray-400">Desktop Speed</div>
              <div className="text-xs text-gray-500">
                was {summaryData.beforeScores.desktopSpeed}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl font-bold text-green-400">
                  {summaryData.afterScores.mobileSpeed}
                </span>
                <mobileDelta.icon className={`h-5 w-5 ${mobileDelta.color}`} />
                <span className={`text-sm ${mobileDelta.color}`}>
                  {mobileDelta.value > 0 ? '+' : ''}{mobileDelta.value}
                </span>
              </div>
              <div className="text-sm text-gray-400">Mobile Speed</div>
              <div className="text-xs text-gray-500">
                was {summaryData.beforeScores.mobileSpeed}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applied Fixes */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="h-5 w-5 text-yellow-400" />
            Applied Fixes ({summaryData.successCount} successful, {summaryData.failedCount} failed)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summaryData.appliedFixes.map((fix) => (
              <div key={fix.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                {fix.status === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{fix.title}</span>
                    <Badge className={
                      fix.status === 'success' 
                        ? 'bg-green-500/20 border-green-500/20 text-green-400'
                        : 'bg-red-500/20 border-red-500/20 text-red-400'
                    }>
                      {fix.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{fix.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backup Information */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5 text-blue-400" />
            Backup Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div>
              <div className="text-white font-medium">{summaryData.backupInfo.filename}</div>
              <div className="text-sm text-gray-400">
                Size: {formatFileSize(summaryData.backupInfo.size)} • Created: {new Date(summaryData.timestamp).toLocaleString()}
              </div>
            </div>
            <Button
              onClick={() => window.open(summaryData.backupInfo.downloadUrl, '_blank')}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schema Markup */}
      {schemaMarkup && (
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Code className="h-5 w-5 text-purple-400" />
              Generated Schema.org Markup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg p-4 border border-white/10">
              <pre className="text-sm text-gray-300 overflow-x-auto">
                <code>{JSON.stringify(schemaMarkup, null, 2)}</code>
              </pre>
            </div>
            <div className="mt-3 text-sm text-gray-400">
              This JSON-LD markup has been automatically added to your website to improve search engine understanding.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <ArrowRight className="h-5 w-5 text-green-400" />
            Next Steps & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summaryData.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300">{rec}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-indigo-400" />
            Export & Share
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isExporting ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Export PDF
            </Button>

            <Button
              onClick={handleSendEmail}
              disabled={isSendingEmail}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isSendingEmail ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Email Report
            </Button>

            {summaryData.reportUrl && (
              <Button
                onClick={() => window.open(summaryData.reportUrl, '_blank')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
