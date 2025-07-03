
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  AlertCircle 
} from 'lucide-react';

interface ProgressTrackerProps {
  overallScore: number;
  totalIssues: number;
  fixedIssues: number;
  websites: number;
}

export function ProgressTracker({ 
  overallScore, 
  totalIssues, 
  fixedIssues, 
  websites 
}: ProgressTrackerProps) {
  const progressPercentage = totalIssues > 0 ? (fixedIssues / totalIssues) * 100 : 0;
  const pendingIssues = totalIssues - fixedIssues;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Target className="h-5 w-5 text-blue-400" />
          Optimization Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall SEO Score */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreBackground(overallScore)} mb-3`}>
              <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}
              </span>
            </div>
            <h3 className="text-lg font-medium text-white mb-1">Overall SEO Score</h3>
            <p className="text-sm text-gray-400">
              Average across {websites} website{websites !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Issue Resolution</span>
              <span className="text-sm text-gray-400">
                {fixedIssues} of {totalIssues} fixed
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-white/10"
            />
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-400">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <CheckCircle2 className="h-5 w-5 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{fixedIssues}</div>
              <div className="text-xs text-gray-400">Issues Fixed</div>
            </div>
            
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <Clock className="h-5 w-5 text-yellow-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{pendingIssues}</div>
              <div className="text-xs text-gray-400">Pending</div>
            </div>
            
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <TrendingUp className="h-5 w-5 text-blue-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{websites}</div>
              <div className="text-xs text-gray-400">Websites</div>
            </div>
          </div>

          {/* Recommendations */}
          {pendingIssues > 0 && (
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-300 font-medium mb-1">
                    Next Steps
                  </p>
                  <p className="text-xs text-blue-200">
                    You have {pendingIssues} pending issue{pendingIssues !== 1 ? 's' : ''} to resolve. 
                    Focus on high-priority items first to improve your SEO score.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
