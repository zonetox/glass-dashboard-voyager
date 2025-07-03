
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: 'up' | 'down';
}

export function StatsCard({ title, value, change, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-300 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        <Icon className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <p className={`text-xs flex items-center gap-1 ${
          trend === 'up' ? 'text-green-400' : 'text-red-400'
        }`}>
          <span className={`${trend === 'up' ? '↗' : '↘'}`}></span>
          {change}
        </p>
      </CardContent>
    </Card>
  );
}
