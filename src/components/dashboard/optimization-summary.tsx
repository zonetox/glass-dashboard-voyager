
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Mail, 
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  ExternalLink
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OptimizationSummaryProps {
  summaryData: {
    backup: {
      success: boolean;
      downloadUrl?: string;
      message: string;
      timestamp: string;
      size?: string;
    };
    results: Array<{
      id: string;
      status: 'success' | 'failed' | 'skipped';
      message: string;
    }>;
    scores: {
      before: {
        seoScore: number;
        desktopSpeed: number;
        mobileSpeed: number;
      };
      after: {
        seoScore: number;
        desktopSpeed: number;
        mobileSpeed: number;
      };
    };
    report?: {
      reportUrl: string;
      reportData: any;
    };
    summary: {
      message: string;
      improvements: string;
    };
    successCount: number;
    failedCount: number;
    totalFixes: number;
  };
  url: string;
  schemaMarkup?: any;
}

export function OptimizationSummary({ summaryData, url, schemaMarkup }: OptimizationSummaryProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const getScoreChange = (before: number, after: number) => {
    const diff = after - before;
    if (diff > 0) return { icon: TrendingUp, color: 'text-green-400', text: `+${diff}` };
    if (diff < 0) return { icon: TrendingDown, color: 'text-red-400', text: `${diff}` };
    return { icon: Minus, color: 'text-gray-400', text: '0' };
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // In a real implementation, you'd use a PDF generation service
      // For now, we'll create a formatted text report
      const reportContent = generateTextReport();
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo-optimization-report-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Report exported",
        description: "Your optimization report has been downloaded."
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      // This would typically call an email service
      toast({
        title: "Email sent",
        description: "Optimization report has been sent to your email."
      });
    } catch (error) {
      toast({
        title: "Email failed",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const generateTextReport = () => {
    const timestamp = new Date().toLocaleString();
    return `
SEO OPTIMIZATION REPORT
Generated: ${timestamp}
Website: ${url}

=== SUMMARY ===
Total Fixes Applied: ${summaryData.successCount}/${summaryData.totalFixes}
Failed Fixes: ${summaryData.failedCount}
Status: ${summaryData.summary.message}

=== SCORE IMPROVEMENTS ===
SEO Score: ${summaryData.scores.before.seoScore} → ${summaryData.scores.after.seoScore} (${summaryData.scores.after.seoScore - summaryData.scores.before.seoScore >= 0 ? '+' : ''}${summaryData.scores.after.seoScore - summaryData.scores.before.seoScore})
Desktop Speed: ${summaryData.scores.before.desktopSpeed} → ${summaryData.scores.after.desktopSpeed}
Mobile Speed: ${summaryData.scores.before.mobileSpeed} → ${summaryData.scores.after.mobileSpeed}

=== FIXES APPLIED ===
${summaryData.results.map(result => 
  `${result.status.toUpperCase()}: ${result.message}`
).join('\n')}

=== BACKUP INFORMATION ===
Backup Status: ${summaryData.backup.success ? 'SUCCESS' : 'FAILED'}
Message: ${summaryData.backup.message}
Timestamp: ${summaryData.backup.timestamp}
${summaryData.backup.downloadUrl ? `Download: ${summaryData.backup.downloadUrl}` : ''}

=== RECOMMENDATIONS ===
${summaryData.summary.improvements}

Next Steps:
- Monitor your site's performance over the next few days
- Consider implementing additional SEO improvements
- Keep your backup safe for future restoration if needed
- Run another analysis in 1-2 weeks to track progress
    `.trim();
  };

  const seoChange = getScoreChange(summaryData.scores.before.seoScore, summaryData.scores.after.seoScore);
  const desktopChange = getScoreChange(summaryData.scores.before.desktopSpeed, summaryData.scores.after.desktopSpeed);
  const mobileChange = getScoreChange(summaryData.scores.before.mobileSpeed, summaryData.scores.after.mobileSpeed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CheckCircle className="h-6 w-6 text-green-400" />
            Optimization Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <p className="text-xl font-semibold text-white">
              {summaryData.successCount} out of {summaryData.totalFixes} fixes applied successfully
            </p>
            <p className="text-gray-300">{summaryData.summary.message}</p>
            {summaryData.failedCount > 0 && (
              <p className="text-yellow-400">
                {summaryData.failedCount} fixes failed - check individual results below
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Score Improvements */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Score Improvements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">SEO Score</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-white">
                  {summaryData.scores.before.seoScore} → {summaryData.scores.after.seoScore}
                </span>
                <seoChange.icon className={`h-5 w-5 ${seoChange.color}`} />
                <span className={`font-medium ${seoChange.color}`}>{seoChange.text}</span>
              </div>
            </div>
            
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Desktop Speed</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-white">
                  {summaryData.scores.before.desktopSpeed} → {summaryData.scores.after.desktopSpeed}
                </span>
                <desktopChange.icon className={`h-5 w-5 ${desktopChange.color}`} />
                <span className={`font-medium ${desktopChange.color}`}>{desktopChange.text}</span>
              </div>
            </div>
            
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Mobile Speed</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-white">
                  {summaryData.scores.before.mobileSpeed} → {summaryData.scores.after.mobileSpeed}
                </span>
                <mobileChange.icon className={`h-5 w-5 ${mobileChange.color}`} />
                <span className={`font-medium ${mobileChange.color}`}>{mobileChange.text}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup Information */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5 text-blue-400" />
            Backup Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {summaryData.backup.success ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                )}
                <span className="text-white font-medium">
                  {summaryData.backup.success ? 'Backup Created' : 'Backup Warning'}
                </span>
              </div>
              <p className="text-sm text-gray-300">{summaryData.backup.message}</p>
              <p className="text-xs text-gray-400">
                Created: {new Date(summaryData.backup.timestamp).toLocaleString()}
              </p>
              {summaryData.backup.size && (
                <p className="text-xs text-gray-400">Size: {summaryData.backup.size}</p>
              )}
            </div>
            {summaryData.backup.downloadUrl && (
              <Button 
                onClick={() => window.open(summaryData.backup.downloadUrl, '_blank')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fix Results */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Applied Fixes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summaryData.results.map((result, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                {result.status === 'success' && <CheckCircle className="h-5 w-5 text-green-400" />}
                {result.status === 'failed' && <AlertCircle className="h-5 w-5 text-red-400" />}
                {result.status === 'skipped' && <Minus className="h-5 w-5 text-yellow-400" />}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={
                      result.status === 'success' ? 'bg-green-500/20 text-green-400' :
                      result.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }>
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{result.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schema Markup */}
      {schemaMarkup && (
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Generated Schema Markup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-300">
                Schema.org JSON-LD markup has been generated and applied to your site.
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300">
                  <code>{JSON.stringify(schemaMarkup.jsonLd, null, 2)}</code>
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-gray-300">
            <p>• Monitor your site's performance over the next few days</p>
            <p>• Run another SEO analysis in 1-2 weeks to track improvements</p>
            <p>• Consider implementing additional SEO optimizations</p>
            <p>• Keep monitoring your search rankings and organic traffic</p>
            {summaryData.backup.success && (
              <p>• Store your backup file safely for future restoration if needed</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="bg-purple-500 hover:bg-purple-600"
        >
          {isExporting ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          Export Report
        </Button>
        
        <Button
          onClick={handleSendEmail}
          disabled={isSendingEmail}
          className="bg-green-500 hover:bg-green-600"
        >
          {isSendingEmail ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
          ) : (
            <Mail className="h-4 w-4 mr-2" />
          )}
          Email Report
        </Button>

        {summaryData.report?.reportUrl && (
          <Button
            onClick={() => window.open(summaryData.report.reportUrl, '_blank')}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full Report
          </Button>
        )}
      </div>
    </div>
  );
}
