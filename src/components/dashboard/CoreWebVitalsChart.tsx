import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface CoreWebVitalsChartProps {
  desktopMetrics?: any | null;
  mobileMetrics?: any | null;
}

function extractMetric(metrics: any, keys: string[]): number | undefined {
  if (!metrics) return undefined;
  for (const key of keys) {
    const k = Object.keys(metrics).find((m) => m.toLowerCase() === key.toLowerCase());
    const val = k ? metrics[k as keyof typeof metrics] : metrics[key as keyof typeof metrics];
    const num = typeof val === 'object' && val !== null && 'value' in val ? (val as any).value : val;
    if (typeof num === 'number' && !isNaN(num)) return num;
  }
  return undefined;
}

function buildData(desktop?: any, mobile?: any) {
  const d = {
    LCP: extractMetric(desktop, ['lcp', 'largestContentfulPaint', 'largest_contentful_paint']),
    FCP: extractMetric(desktop, ['fcp', 'firstContentfulPaint', 'first_contentful_paint']),
    CLS: extractMetric(desktop, ['cls', 'cumulativeLayoutShift', 'cumulative_layout_shift']),
    INP: extractMetric(desktop, ['inp', 'interactionToNextPaint', 'interaction_to_next_paint', 'fid', 'firstInputDelay', 'first_input_delay']),
    TBT: extractMetric(desktop, ['tbt', 'totalBlockingTime', 'total_blocking_time']),
  };
  const m = {
    LCP: extractMetric(mobile, ['lcp', 'largestContentfulPaint', 'largest_contentful_paint']),
    FCP: extractMetric(mobile, ['fcp', 'firstContentfulPaint', 'first_contentful_paint']),
    CLS: extractMetric(mobile, ['cls', 'cumulativeLayoutShift', 'cumulative_layout_shift']),
    INP: extractMetric(mobile, ['inp', 'interactionToNextPaint', 'interaction_to_next_paint', 'fid', 'firstInputDelay', 'first_input_delay']),
    TBT: extractMetric(mobile, ['tbt', 'totalBlockingTime', 'total_blocking_time']),
  };

  const rows = [
    { metric: 'LCP', desktop: d.LCP ?? null, mobile: m.LCP ?? null },
    { metric: 'FCP', desktop: d.FCP ?? null, mobile: m.FCP ?? null },
    { metric: 'CLS', desktop: d.CLS ?? null, mobile: m.CLS ?? null },
    { metric: 'INP/FID', desktop: d.INP ?? null, mobile: m.INP ?? null },
    { metric: 'TBT', desktop: d.TBT ?? null, mobile: m.TBT ?? null },
  ];

  return rows.filter((r) => r.desktop !== null || r.mobile !== null);
}

export const CoreWebVitalsChart: React.FC<CoreWebVitalsChartProps> = ({ desktopMetrics, mobileMetrics }) => {
  const data = buildData(desktopMetrics, mobileMetrics);

  if (!data.length) {
    return (
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Core Web Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">Không có dữ liệu Core Web Vitals.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Core Web Vitals</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            desktop: { label: 'Desktop', color: 'hsl(var(--primary))' },
            mobile: { label: 'Mobile', color: 'hsl(var(--secondary))' },
          }}
          className="w-full h-[300px]"
        >
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="desktop" name="Desktop" fill="var(--color-desktop)" radius={[4,4,0,0]} />
            <Bar dataKey="mobile" name="Mobile" fill="var(--color-mobile)" radius={[4,4,0,0]} />
          </BarChart>
        </ChartContainer>
        <p className="text-xs text-gray-500 mt-2">LCP/FCP/INP/TBT tính theo ms, CLS là chỉ số không đơn vị.</p>
      </CardContent>
    </Card>
  );
};
