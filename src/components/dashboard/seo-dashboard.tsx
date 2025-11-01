
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Website, SEOIssue } from '@/lib/types';
import { OptimizationSummary } from './optimization-summary';
import { 
  TrendingUp, 
  Smartphone, 
  Monitor, 
  Brain,
  Zap,
  CheckCircle,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SEODashboardProps {
  website: Website;
  issues: SEOIssue[];
  analysisData?: any;
}

export function SEODashboard({ website, issues, analysisData }: SEODashboardProps) {
  const { toast } = useToast();
  const [selectedFixes, setSelectedFixes] = useState<Set<string>>(new Set());
  const [wpCredentials, setWpCredentials] = useState({
    username: '',
    password: '',
    applicationPassword: ''
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  const desktopScore = analysisData?.pageSpeedInsights?.desktop?.score || 0;
  const mobileScore = analysisData?.pageSpeedInsights?.mobile?.score || 0;
  const citationScore = extractCitationScore(analysisData?.aiAnalysis?.citationPotential || '');

  function extractCitationScore(citationText: string): number {
    const match = citationText.match(/(\d+)\/10/);
    return match ? parseInt(match[1]) * 10 : 50;
  }

  const handleFixToggle = (issueId: string, checked: boolean) => {
    const newSelected = new Set(selectedFixes);
    if (checked) {
      newSelected.add(issueId);
    } else {
      newSelected.delete(issueId);
    }
    setSelectedFixes(newSelected);
  };

  const handleOptimization = async () => {
    if (selectedFixes.size === 0) {
      toast({
        title: "No fixes selected",
        description: "Please select at least one issue to fix.",
        variant: "destructive"
      });
      return;
    }

    if (!wpCredentials.username || !wpCredentials.applicationPassword) {
      toast({
        title: "WordPress credentials required",
        description: "Please provide WordPress credentials to apply fixes.",
        variant: "destructive"
      });
      return;
    }

    setIsOptimizing(true);
    try {
      const selectedIssues = issues.filter(issue => selectedFixes.has(issue.id));
      
      // Prepare before scores for comparison
      const beforeScores = {
        seoScore: website.seoScore,
        desktopSpeed: desktopScore,
        mobileSpeed: mobileScore
      };
      
      const { data: result, error: invokeError } = await supabase.functions.invoke('optimize-website', {
        body: {
          url: website.url,
          fixes: selectedIssues,
          wpCredentials,
          schemaMarkup: analysisData?.schemaMarkup,
          beforeScores
        }
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }
      
      if (!result) {
        throw new Error('No optimization result returned');
      }
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Store the optimization result for the summary
      setOptimizationResult(result);

      toast({
        title: "Optimization completed",
        description: `Applied ${result.successCount}/${selectedIssues.length} fixes successfully.`
      });

      // Clear selected fixes after successful optimization
      setSelectedFixes(new Set());

    } catch (error) {
      console.error('Optimization error:', error);
      toast({
        title: "Optimization failed",
        description: error instanceof Error ? error.message : 'Failed to apply fixes',
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  // If we have optimization results, show the summary
  if (optimizationResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Optimization Results</h2>
          <Button 
            onClick={() => setOptimizationResult(null)}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Back to Dashboard
          </Button>
        </div>
        
        <OptimizationSummary
          summaryData={optimizationResult}
          url={website.url}
          schemaMarkup={analysisData?.schemaMarkup}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scores Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-white/10">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${getScoreColor(website.seoScore)}`}>
              {website.seoScore}
            </div>
            <div className="text-sm text-gray-400">SEO Score</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-4 text-center">
            <Monitor className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${getScoreColor(desktopScore)}`}>
              {desktopScore}
            </div>
            <div className="text-sm text-gray-400">Desktop Speed</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-4 text-center">
            <Smartphone className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${getScoreColor(mobileScore)}`}>
              {mobileScore}
            </div>
            <div className="text-sm text-gray-400">Mobile Speed</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-4 text-center">
            <Brain className="h-8 w-8 text-pink-400 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${getScoreColor(citationScore)}`}>
              {citationScore}
            </div>
            <div className="text-sm text-gray-400">AI Citation Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Issues and Fixes */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            SEO Issues & Auto-Fix Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          {issues.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-white font-medium">No issues found!</p>
              <p className="text-gray-400">Your website SEO looks great.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((issue) => (
                <div key={issue.id} className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  <Checkbox
                    id={`fix-${issue.id}`}
                    checked={selectedFixes.has(issue.id)}
                    onCheckedChange={(checked) => handleFixToggle(issue.id, !!checked)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`fix-${issue.id}`} className="text-white font-medium cursor-pointer">
                        {issue.title}
                      </Label>
                      <Badge className={
                        issue.severity === 'high' ? 'bg-red-500/20 border-red-500/20 text-red-400' :
                        issue.severity === 'medium' ? 'bg-yellow-500/20 border-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 border-green-500/20 text-green-400'
                      }>
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{issue.description}</p>
                    <p className="text-sm text-blue-300">
                      <strong>Auto-fix:</strong> {issue.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* WordPress Credentials */}
      {issues.length > 0 && (
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Settings className="h-5 w-5 text-blue-400" />
              WordPress Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wp-username" className="text-white">Username</Label>
                <Input
                  id="wp-username"
                  type="text"
                  placeholder="WordPress username"
                  value={wpCredentials.username}
                  onChange={(e) => setWpCredentials({...wpCredentials, username: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="wp-app-password" className="text-white">Application Password</Label>
                <Input
                  id="wp-app-password"
                  type="password"
                  placeholder="WordPress application password"
                  value={wpCredentials.applicationPassword}
                  onChange={(e) => setWpCredentials({...wpCredentials, applicationPassword: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>
            
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-300">
                <strong>Note:</strong> Application passwords are safer than regular passwords. 
                Generate one in your WordPress admin under Users → Profile → Application Passwords.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Actions */}
      {issues.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={handleOptimization}
            disabled={isOptimizing || selectedFixes.size === 0}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-lg font-medium"
          >
            {isOptimizing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Applying Fixes...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run Optimization ({selectedFixes.size} selected)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
