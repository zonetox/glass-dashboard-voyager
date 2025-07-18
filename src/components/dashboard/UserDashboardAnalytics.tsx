import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Globe, 
  Clock,
  Target,
  Eye,
  Search,
  FileText,
  Award,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface DashboardAnalyticsProps {
  userId?: string;
  timeRange?: string;
  onExportData?: () => void;
}

export function UserDashboardAnalytics({ userId, timeRange = '30d', onExportData }: DashboardAnalyticsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [isLoading, setIsLoading] = useState(false);

  // Mock analytics data
  const analyticsData = {
    overview: {
      totalScans: 156,
      totalWebsites: 12,
      avgSeoScore: 78,
      issuesFixed: 89,
      trendsData: [
        { date: '2024-01-01', scans: 5, score: 65 },
        { date: '2024-01-08', scans: 8, score: 68 },
        { date: '2024-01-15', scans: 12, score: 72 },
        { date: '2024-01-22', scans: 15, score: 75 },
        { date: '2024-01-29', scans: 18, score: 78 }
      ]
    },
    seoScores: {
      current: 78,
      previous: 72,
      trend: '+6',
      distribution: [
        { name: 'Excellent (80-100)', value: 35, color: '#10B981' },
        { name: 'Good (60-79)', value: 45, color: '#F59E0B' },
        { name: 'Poor (0-59)', value: 20, color: '#EF4444' }
      ],
      weeklyData: [
        { date: 'Mon', score: 75 },
        { date: 'Tue', score: 76 },
        { date: 'Wed', score: 74 },
        { date: 'Thu', score: 78 },
        { date: 'Fri', score: 77 },
        { date: 'Sat', score: 79 },
        { date: 'Sun', score: 78 }
      ]
    },
    issuesTracking: {
      total: 145,
      fixed: 89,
      pending: 56,
      breakdown: [
        { category: 'Meta Tags', total: 25, fixed: 20, pending: 5 },
        { category: 'Page Speed', total: 18, fixed: 12, pending: 6 },
        { category: 'Content Quality', total: 32, fixed: 28, pending: 4 },
        { category: 'Technical SEO', total: 28, fixed: 15, pending: 13 },
        { category: 'Mobile Optimization', total: 22, fixed: 14, pending: 8 },
        { category: 'Schema Markup', total: 20, fixed: 0, pending: 20 }
      ]
    },
    websitePerformance: [
      { 
        domain: 'example1.com', 
        seoScore: 85, 
        lastScan: '2024-01-15',
        issues: 3,
        trend: '+5',
        traffic: 15420,
        keywords: 245
      },
      { 
        domain: 'example2.com', 
        seoScore: 72, 
        lastScan: '2024-01-14',
        issues: 8,
        trend: '+2',
        traffic: 8900,
        keywords: 189
      },
      { 
        domain: 'example3.com', 
        seoScore: 68, 
        lastScan: '2024-01-13',
        issues: 12,
        trend: '-3',
        traffic: 5600,
        keywords: 156
      }
    ],
    activityLog: [
      { 
        id: 1, 
        action: 'SEO Analysis Completed', 
        target: 'example1.com', 
        timestamp: '2024-01-15 14:30',
        type: 'analysis',
        result: 'Success'
      },
      { 
        id: 2, 
        action: 'One-Click Fix Applied', 
        target: 'example2.com', 
        timestamp: '2024-01-15 13:45',
        type: 'optimization',
        result: 'Success'
      },
      { 
        id: 3, 
        action: 'PDF Report Generated', 
        target: 'example1.com', 
        timestamp: '2024-01-15 12:20',
        type: 'report',
        result: 'Success'
      },
      { 
        id: 4, 
        action: 'Competitor Analysis', 
        target: 'example3.com', 
        timestamp: '2024-01-15 11:15',
        type: 'analysis',
        result: 'Success'
      }
    ]
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getTrendIcon = (trend: string) => {
    if (trend.startsWith('+')) return <ArrowUpRight className="h-4 w-4 text-green-400" />;
    if (trend.startsWith('-')) return <ArrowDownRight className="h-4 w-4 text-red-400" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleRefreshData = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Dashboard Analytics
              </CardTitle>
              <p className="text-gray-400 text-sm mt-1">
                Comprehensive insights into your SEO performance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32 bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="7d" className="text-white">Last 7 days</SelectItem>
                  <SelectItem value="30d" className="text-white">Last 30 days</SelectItem>
                  <SelectItem value="90d" className="text-white">Last 3 months</SelectItem>
                  <SelectItem value="1y" className="text-white">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleRefreshData} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={onExportData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Scans</p>
                <p className="text-2xl font-bold text-white">{analyticsData.overview.totalScans}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span className="text-green-400 text-xs">+12% this month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Search className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Websites</p>
                <p className="text-2xl font-bold text-white">{analyticsData.overview.totalWebsites}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span className="text-green-400 text-xs">+3 new</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg SEO Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(analyticsData.overview.avgSeoScore)}`}>
                  {analyticsData.overview.avgSeoScore}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span className="text-green-400 text-xs">+6 points</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Issues Fixed</p>
                <p className="text-2xl font-bold text-white">{analyticsData.overview.issuesFixed}</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span className="text-green-400 text-xs">61% resolved</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white/5 border border-white/10">
          <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
          <TabsTrigger value="seo-scores" className="text-white">SEO Scores</TabsTrigger>
          <TabsTrigger value="issues" className="text-white">Issues</TabsTrigger>
          <TabsTrigger value="websites" className="text-white">Websites</TabsTrigger>
          <TabsTrigger value="activity" className="text-white">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Trends Chart */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.overview.trendsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="scans" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.2}
                      name="Scans"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.2}
                      name="SEO Score"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo-scores" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.seoScores.distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={(entry) => `${entry.value}%`}
                      >
                        {analyticsData.seoScores.distribution.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {analyticsData.seoScores.distribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-gray-300 text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Score Trend */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Weekly Score Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.seoScores.weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Issues Breakdown by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.issuesTracking.breakdown.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{category.category}</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                          {category.fixed} fixed
                        </Badge>
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                          {category.pending} pending
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Progress 
                        value={(category.fixed / category.total) * 100} 
                        className="flex-1 h-2" 
                      />
                      <span className="text-sm text-gray-400 w-12">
                        {Math.round((category.fixed / category.total) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="websites" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Website Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.websitePerformance.map((website, index) => (
                  <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <div>
                          <h4 className="text-white font-medium">{website.domain}</h4>
                          <p className="text-gray-400 text-sm">Last scan: {website.lastScan}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getScoreColor(website.seoScore)}`}>
                              {website.seoScore}
                            </span>
                            {getTrendIcon(website.trend)}
                            <span className={website.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                              {website.trend}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs">{website.issues} issues</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm">{formatNumber(website.traffic)}</p>
                          <p className="text-gray-400 text-xs">monthly traffic</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm">{website.keywords}</p>
                          <p className="text-gray-400 text-xs">keywords</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.activityLog.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      {activity.type === 'analysis' && <Search className="h-5 w-5 text-blue-400" />}
                      {activity.type === 'optimization' && <Zap className="h-5 w-5 text-yellow-400" />}
                      {activity.type === 'report' && <FileText className="h-5 w-5 text-green-400" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{activity.action}</h4>
                      <p className="text-gray-400 text-sm">{activity.target}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-1">
                        {activity.result}
                      </Badge>
                      <p className="text-gray-400 text-xs">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}