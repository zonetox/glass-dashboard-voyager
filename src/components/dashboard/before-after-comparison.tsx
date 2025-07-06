
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface BeforeAfterData {
  before: {
    seoScore: number;
    desktopSpeed: number;
    mobileSpeed: number;
    issues: number;
  };
  after: {
    seoScore: number;
    desktopSpeed: number;
    mobileSpeed: number;
    issues: number;
  };
  url: string;
  optimizedAt: string;
}

interface BeforeAfterComparisonProps {
  data: BeforeAfterData;
}

export function BeforeAfterComparison({ data }: BeforeAfterComparisonProps) {
  const getScoreChange = (before: number, after: number) => {
    const change = after - before;
    const percentage = Math.abs((change / before) * 100).toFixed(1);
    return {
      value: change,
      percentage,
      isPositive: change > 0
    };
  };

  const seoChange = getScoreChange(data.before.seoScore, data.after.seoScore);
  const desktopChange = getScoreChange(data.before.desktopSpeed, data.after.desktopSpeed);
  const mobileChange = getScoreChange(data.before.mobileSpeed, data.after.mobileSpeed);
  const issuesChange = getScoreChange(data.before.issues, data.after.issues);

  const MetricCard = ({ 
    title, 
    before, 
    after, 
    change, 
    unit = '' 
  }: { 
    title: string; 
    before: number; 
    after: number; 
    change: any; 
    unit?: string; 
  }) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-300">{title}</h4>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-red-500/20 text-red-400">
            {before}{unit}
          </Badge>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <Badge variant="outline" className="border-green-500/20 text-green-400">
            {after}{unit}
          </Badge>
        </div>
        <div className={`flex items-center gap-1 text-sm ${
          change.isPositive ? 'text-green-400' : 'text-red-400'
        }`}>
          {change.isPositive ? 
            <TrendingUp className="h-3 w-3" /> : 
            <TrendingDown className="h-3 w-3" />
          }
          <span>
            {change.isPositive ? '+' : ''}{change.value} ({change.percentage}%)
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Before vs After Comparison</CardTitle>
        <p className="text-sm text-gray-400">
          Optimization results for {new URL(data.url).hostname}
        </p>
        <p className="text-xs text-gray-500">
          Optimized on {new Date(data.optimizedAt).toLocaleDateString()}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <MetricCard
          title="SEO Score"
          before={data.before.seoScore}
          after={data.after.seoScore}
          change={seoChange}
          unit="/100"
        />
        
        <MetricCard
          title="Desktop Speed"
          before={data.before.desktopSpeed}
          after={data.after.desktopSpeed}
          change={desktopChange}
          unit="/100"
        />
        
        <MetricCard
          title="Mobile Speed"
          before={data.before.mobileSpeed}
          after={data.after.mobileSpeed}
          change={mobileChange}
          unit="/100"
        />
        
        <MetricCard
          title="Issues Found"
          before={data.before.issues}
          after={data.after.issues}
          change={issuesChange}
        />

        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Overall Improvement</span>
          </div>
          <p className="text-xs text-gray-300">
            Your website's performance improved significantly after optimization. 
            Continue monitoring these metrics to maintain optimal performance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
