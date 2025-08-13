import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Zap, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface PerformanceOptimizationReportProps {
  result: any;
}

export const PerformanceOptimizationReport: React.FC<PerformanceOptimizationReportProps> = ({ result }) => {
  const { performance, coreWebVitals } = result;

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'hsl(var(--success))';
    if (score >= 0.7) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 0.9) return { grade: 'Excellent', color: 'success' };
    if (score >= 0.7) return { grade: 'Good', color: 'warning' };
    if (score >= 0.5) return { grade: 'Poor', color: 'destructive' };
    return { grade: 'Critical', color: 'destructive' };
  };

  const formatMilliseconds = (ms: number) => {
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.round(ms)}ms`;
  };

  const getVitalStatus = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return { status: 'good', color: 'hsl(var(--success))' };
    if (value <= thresholds.poor) return { status: 'needs-improvement', color: 'hsl(var(--warning))' };
    return { status: 'poor', color: 'hsl(var(--destructive))' };
  };

  const vitalThresholds = {
    lcp: { good: 2500, poor: 4000 },
    cls: { good: 0.1, poor: 0.25 },
    tbt: { good: 300, poor: 600 },
    tti: { good: 3800, poor: 7300 }
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mobile Performance */}
        {performance?.mobile && (
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-400" />
                Mobile Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div 
                  className="text-4xl font-bold"
                  style={{ color: getScoreColor(performance.mobile.score || 0) }}
                >
                  {Math.round((performance.mobile.score || 0) * 100)}
                </div>
                <div className="text-sm text-muted-foreground">Performance Score</div>
                <Badge 
                  variant="outline" 
                  className="mt-2"
                  style={{ 
                    borderColor: getScoreColor(performance.mobile.score || 0),
                    color: getScoreColor(performance.mobile.score || 0)
                  }}
                >
                  {getScoreGrade(performance.mobile.score || 0).grade}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Performance</span>
                  <span className="text-white">{Math.round((performance.mobile.score || 0) * 100)}%</span>
                </div>
                <Progress 
                  value={(performance.mobile.score || 0) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Desktop Performance */}
        {performance?.desktop && (
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Monitor className="h-5 w-5 text-blue-400" />
                Desktop Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div 
                  className="text-4xl font-bold"
                  style={{ color: getScoreColor(performance.desktop.score || 0) }}
                >
                  {Math.round((performance.desktop.score || 0) * 100)}
                </div>
                <div className="text-sm text-muted-foreground">Performance Score</div>
                <Badge 
                  variant="outline" 
                  className="mt-2"
                  style={{ 
                    borderColor: getScoreColor(performance.desktop.score || 0),
                    color: getScoreColor(performance.desktop.score || 0)
                  }}
                >
                  {getScoreGrade(performance.desktop.score || 0).grade}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Performance</span>
                  <span className="text-white">{Math.round((performance.desktop.score || 0) * 100)}%</span>
                </div>
                <Progress 
                  value={(performance.desktop.score || 0) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Core Web Vitals */}
      {(coreWebVitals?.mobile || coreWebVitals?.desktop) && (
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Core Web Vitals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mobile Vitals */}
              {coreWebVitals?.mobile && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </h4>
                  
                  <div className="space-y-3">
                    {coreWebVitals.mobile.lcp && (
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">Largest Contentful Paint</span>
                          <Badge 
                            variant="outline"
                            style={{ 
                              borderColor: getVitalStatus(coreWebVitals.mobile.lcp, vitalThresholds.lcp).color,
                              color: getVitalStatus(coreWebVitals.mobile.lcp, vitalThresholds.lcp).color
                            }}
                          >
                            {formatMilliseconds(coreWebVitals.mobile.lcp)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">Tốt: ≤ 2.5s | Cần cải thiện: ≤ 4.0s</div>
                      </div>
                    )}

                    {coreWebVitals.mobile.cls !== null && (
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">Cumulative Layout Shift</span>
                          <Badge 
                            variant="outline"
                            style={{ 
                              borderColor: getVitalStatus(coreWebVitals.mobile.cls, vitalThresholds.cls).color,
                              color: getVitalStatus(coreWebVitals.mobile.cls, vitalThresholds.cls).color
                            }}
                          >
                            {coreWebVitals.mobile.cls.toFixed(3)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">Tốt: ≤ 0.1 | Cần cải thiện: ≤ 0.25</div>
                      </div>
                    )}

                    {coreWebVitals.mobile.tbt && (
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">Total Blocking Time</span>
                          <Badge 
                            variant="outline"
                            style={{ 
                              borderColor: getVitalStatus(coreWebVitals.mobile.tbt, vitalThresholds.tbt).color,
                              color: getVitalStatus(coreWebVitals.mobile.tbt, vitalThresholds.tbt).color
                            }}
                          >
                            {formatMilliseconds(coreWebVitals.mobile.tbt)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">Tốt: ≤ 300ms | Cần cải thiện: ≤ 600ms</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Desktop Vitals */}
              {coreWebVitals?.desktop && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Desktop
                  </h4>
                  
                  <div className="space-y-3">
                    {coreWebVitals.desktop.lcp && (
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">Largest Contentful Paint</span>
                          <Badge 
                            variant="outline"
                            style={{ 
                              borderColor: getVitalStatus(coreWebVitals.desktop.lcp, vitalThresholds.lcp).color,
                              color: getVitalStatus(coreWebVitals.desktop.lcp, vitalThresholds.lcp).color
                            }}
                          >
                            {formatMilliseconds(coreWebVitals.desktop.lcp)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">Tốt: ≤ 2.5s | Cần cải thiện: ≤ 4.0s</div>
                      </div>
                    )}

                    {coreWebVitals.desktop.cls !== null && (
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">Cumulative Layout Shift</span>
                          <Badge 
                            variant="outline"
                            style={{ 
                              borderColor: getVitalStatus(coreWebVitals.desktop.cls, vitalThresholds.cls).color,
                              color: getVitalStatus(coreWebVitals.desktop.cls, vitalThresholds.cls).color
                            }}
                          >
                            {coreWebVitals.desktop.cls.toFixed(3)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">Tốt: ≤ 0.1 | Cần cải thiện: ≤ 0.25</div>
                      </div>
                    )}

                    {coreWebVitals.desktop.tbt && (
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">Total Blocking Time</span>
                          <Badge 
                            variant="outline"
                            style={{ 
                              borderColor: getVitalStatus(coreWebVitals.desktop.tbt, vitalThresholds.tbt).color,
                              color: getVitalStatus(coreWebVitals.desktop.tbt, vitalThresholds.tbt).color
                            }}
                          >
                            {formatMilliseconds(coreWebVitals.desktop.tbt)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">Tốt: ≤ 300ms | Cần cải thiện: ≤ 600ms</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Opportunities */}
      {(performance?.mobile?.opportunities?.length > 0 || performance?.desktop?.opportunities?.length > 0) && (
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              Cơ hội Tối ưu Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mobile Opportunities */}
              {performance?.mobile?.opportunities?.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile Opportunities
                  </h4>
                  <div className="space-y-3">
                    {performance.mobile.opportunities.slice(0, 5).map((opportunity: any, index: number) => (
                      <div key={index} className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">{opportunity.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">{opportunity.description}</div>
                            <Badge variant="outline" className="mt-2 text-orange-400 border-orange-400">
                              Tiết kiệm: {formatMilliseconds(opportunity.savings)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Desktop Opportunities */}
              {performance?.desktop?.opportunities?.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Desktop Opportunities
                  </h4>
                  <div className="space-y-3">
                    {performance.desktop.opportunities.slice(0, 5).map((opportunity: any, index: number) => (
                      <div key={index} className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">{opportunity.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">{opportunity.description}</div>
                            <Badge variant="outline" className="mt-2 text-orange-400 border-orange-400">
                              Tiết kiệm: {formatMilliseconds(opportunity.savings)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};