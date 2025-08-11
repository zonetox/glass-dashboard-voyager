import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SEODeepDetailsProps {
  result: any;
}

export const SEODeepDetails: React.FC<SEODeepDetailsProps> = ({ result }) => {
  const seo = result?.seo || {};
  const ai = result?.aiAnalysis || {};

  const titleLen = seo?.title ? seo.title.length : 0;
  const descLen = seo?.metaDescription ? seo.metaDescription.length : 0;

  return (
    <div className="space-y-6">
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Meta & Cấu trúc nội dung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Độ dài Title</div>
              <div className="text-xl font-semibold text-white">{titleLen} ký tự</div>
              <Badge variant="outline" className="mt-1">{titleLen >= 50 && titleLen <= 60 ? 'Tối ưu' : 'Cần xem lại'}</Badge>
            </div>
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Độ dài Meta Description</div>
              <div className="text-xl font-semibold text-white">{descLen} ký tự</div>
              <Badge variant="outline" className="mt-1">{descLen >= 120 && descLen <= 160 ? 'Tối ưu' : 'Cần xem lại'}</Badge>
            </div>
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Canonical</div>
              <div className="text-white">{seo?.canonical || 'Chưa thiết lập'}</div>
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">H1</div>
              <div className="text-white font-semibold">{seo?.h1?.length || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">H2</div>
              <div className="text-white font-semibold">{seo?.h2?.length || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">H3</div>
              <div className="text-white font-semibold">{seo?.h3?.length || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {ai?.keywordDensity?.length ? (
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Mật độ từ khóa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ai.keywordDensity.map((k: any, idx: number) => (
                <div key={idx} className="p-3 bg-white/5 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">{k.keyword}</span>
                    <Badge variant="outline" className="text-xs">{k.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Dữ liệu thô</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-96 overflow-auto text-xs text-gray-300 bg-black/30 p-3 rounded">{JSON.stringify(result, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  );
};
