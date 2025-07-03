
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Website, SEOIssue } from '@/lib/types';
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Globe,
  Calendar,
  TrendingUp,
  ExternalLink
} from 'lucide-react';

interface OptimizationResultsProps {
  websites: Website[];
  getWebsiteIssues: (websiteId: string) => SEOIssue[];
  onToggleIssue: (issueId: string) => void;
}

export function OptimizationResults({ 
  websites, 
  getWebsiteIssues, 
  onToggleIssue 
}: OptimizationResultsProps) {
  const getStatusColor = (status: Website['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/20';
      case 'analyzing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
    }
  };

  const getSeverityColor = (severity: SEOIssue['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/20';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
    }
  };

  if (websites.length === 0) {
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Websites Analyzed Yet</h3>
          <p className="text-gray-400">Add a website to see detailed SEO analysis results.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          Analysis Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {websites.map((website) => {
            const websiteIssues = getWebsiteIssues(website.id);
            
            return (
              <div 
                key={website.id}
                className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-white font-medium truncate">{website.url}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                        onClick={() => window.open(website.url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {website.lastAnalyzed}
                      </div>
                      <Badge className={getStatusColor(website.status)}>
                        {website.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      <span className="text-2xl font-bold text-white">{website.seoScore}</span>
                      <span className="text-gray-400">/100</span>
                    </div>
                    <p className="text-xs text-gray-400">SEO Score</p>
                  </div>
                </div>

                {websiteIssues.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Issues Found ({websiteIssues.length})
                    </h4>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {websiteIssues.slice(0, 3).map((issue) => (
                        <div 
                          key={issue.id}
                          className="flex items-start gap-3 p-2 bg-white/5 rounded border border-white/5"
                        >
                          <button
                            onClick={() => onToggleIssue(issue.id)}
                            className="mt-0.5 flex-shrink-0"
                          >
                            {issue.isFixed ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-gray-400 hover:border-white transition-colors" />
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-sm ${issue.isFixed ? 'text-gray-400 line-through' : 'text-white'}`}>
                                {issue.title}
                              </span>
                              <Badge className={getSeverityColor(issue.severity)}>
                                {issue.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-400">{issue.description}</p>
                          </div>
                        </div>
                      ))}
                      
                      {websiteIssues.length > 3 && (
                        <p className="text-xs text-gray-400 text-center py-2">
                          +{websiteIssues.length - 3} more issues
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
