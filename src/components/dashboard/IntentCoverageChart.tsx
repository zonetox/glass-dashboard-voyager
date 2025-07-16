import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { Info, Navigation, ShoppingCart, Briefcase, TrendingUp } from "lucide-react";

interface IntentData {
  intent_type: string;
  count: number;
  percentage: number;
}

interface IntentCoverageChartProps {
  className?: string;
}

const intentColors = {
  informational: 'hsl(var(--chart-1))',
  navigational: 'hsl(var(--chart-2))',
  transactional: 'hsl(var(--chart-3))',
  commercial: 'hsl(var(--chart-4))'
};

const intentIcons = {
  informational: Info,
  navigational: Navigation,
  transactional: ShoppingCart,
  commercial: Briefcase
};

const intentLabels = {
  informational: 'Thông tin',
  navigational: 'Điều hướng',
  transactional: 'Giao dịch',
  commercial: 'Thương mại'
};

export default function IntentCoverageChart({ className }: IntentCoverageChartProps) {
  const [intentData, setIntentData] = useState<IntentData[]>([]);
  const [totalContent, setTotalContent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntentCoverage();
  }, []);

  const fetchIntentCoverage = async () => {
    try {
      setLoading(true);
      
      // Get intent distribution
      const { data: intentStats, error } = await supabase
        .from('content_intent')
        .select('intent_type')
        .order('intent_type');

      if (error) throw error;

      // Count intents
      const intentCounts = intentStats.reduce((acc, item) => {
        acc[item.intent_type] = (acc[item.intent_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const total = intentStats.length;
      
      // Convert to chart data
      const chartData = Object.entries(intentCounts).map(([intent_type, count]) => ({
        intent_type,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }));

      setIntentData(chartData);
      setTotalContent(total);
    } catch (error) {
      console.error('Error fetching intent coverage:', error);
      setIntentData([]);
      setTotalContent(0);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const IconComponent = intentIcons[data.intent_type as keyof typeof intentIcons];
      
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <IconComponent className="h-4 w-4" />
            <span className="font-medium">{intentLabels[data.intent_type as keyof typeof intentLabels]}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {data.count} bài viết ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null; // Don't show label for small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="medium"
      >
        {`${percentage}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Phân bố Intent toàn Site
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Đang tải dữ liệu...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (intentData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Phân bố Intent toàn Site
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="mb-2">Chưa có dữ liệu phân loại intent</div>
              <div className="text-sm">Hãy phân tích intent cho các trang web của bạn</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Phân bố Intent toàn Site
          </div>
          <Badge variant="outline">
            {totalContent} trang
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={intentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {intentData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={intentColors[entry.intent_type as keyof typeof intentColors]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Intent Statistics */}
        <div className="grid grid-cols-2 gap-3">
          {intentData.map((item) => {
            const IconComponent = intentIcons[item.intent_type as keyof typeof intentIcons];
            return (
              <div key={item.intent_type} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: intentColors[item.intent_type as keyof typeof intentColors] }}
                  />
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {intentLabels[item.intent_type as keyof typeof intentLabels]}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.count} bài • {item.percentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}