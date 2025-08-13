import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertTriangle, Shield, Globe, Link, Search, Code, ExternalLink } from 'lucide-react';

interface TechnicalSEOReportProps {
  result: any;
}

export const TechnicalSEOReport: React.FC<TechnicalSEOReportProps> = ({ result }) => {
  const { indexability, security, social, i18n, links, schemaMarkup } = result;
  
  const getStatusIcon = (status: boolean) => {
    return status ? 
      <CheckCircle className="h-4 w-4 text-success" /> : 
      <XCircle className="h-4 w-4 text-destructive" />;
  };

  const getStatusBadge = (status: boolean, trueText: string, falseText: string) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className="ml-2">
        {status ? trueText : falseText}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Indexability */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5" />
            Khả năng Index & Crawling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(indexability?.indexable)}
                  <span className="text-sm font-medium text-white">Có thể Index</span>
                </div>
                {getStatusBadge(indexability?.indexable, 'Được phép', 'Bị chặn')}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(indexability?.sitemapFound)}
                  <span className="text-sm font-medium text-white">Sitemap</span>
                </div>
                {getStatusBadge(indexability?.sitemapFound, 'Tìm thấy', 'Không có')}
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(indexability?.robotsTxtStatus === 'present')}
                  <span className="text-sm font-medium text-white">Robots.txt</span>
                </div>
                <Badge variant={indexability?.robotsTxtStatus === 'present' ? "default" : "secondary"}>
                  {indexability?.robotsTxtStatus || 'unknown'}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-muted-foreground">Canonical URL</div>
                <div className="text-white text-xs break-all">
                  {indexability?.canonical || 'Không có'}
                </div>
                {indexability?.canonicalMatches !== undefined && (
                  <Badge variant={indexability.canonicalMatches ? "default" : "destructive"} className="mt-1">
                    {indexability.canonicalMatches ? 'Khớp URL' : 'Không khớp'}
                  </Badge>
                )}
              </div>

              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-muted-foreground">Robots Meta</div>
                <div className="text-white text-xs">
                  {indexability?.robotsMeta || 'Không có'}
                </div>
              </div>
            </div>
          </div>

          {indexability?.sitemapUrl && (
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="text-sm text-blue-300 mb-1">Sitemap URL:</div>
              <a 
                href={indexability.sitemapUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs break-all flex items-center gap-1"
              >
                {indexability.sitemapUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Bảo mật Website
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Điểm bảo mật tổng thể</span>
            <div className="flex items-center gap-2">
              <Progress value={security?.securityScore || 0} className="w-24 h-2" />
              <span className="text-white font-semibold">{security?.securityScore || 0}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(security?.isHttps)}
                <span className="text-sm font-medium text-white">HTTPS</span>
              </div>
              {getStatusBadge(security?.isHttps, 'Bảo mật', 'Không bảo mật')}
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon((security?.mixedContentCount || 0) === 0)}
                <span className="text-sm font-medium text-white">Mixed Content</span>
              </div>
              <Badge variant={(security?.mixedContentCount || 0) === 0 ? "default" : "destructive"}>
                {security?.mixedContentCount || 0} lỗi
              </Badge>
            </div>
          </div>

          {!security?.isHttps && (
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-destructive">Cảnh báo bảo mật</div>
                  <div className="text-xs text-muted-foreground">
                    Website chưa sử dụng HTTPS. Điều này có thể ảnh hưởng đến SEO và trải nghiệm người dùng.
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Media Optimization */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Tối ưu Social Media
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Open Graph</span>
                {getStatusBadge(Object.keys(social?.og || {}).length > 0, 'Có', 'Thiếu')}
              </div>
              <div className="text-xs text-muted-foreground">
                {Object.keys(social?.og || {}).length} tags được tìm thấy
              </div>
              {Object.keys(social?.og || {}).length > 0 && (
                <div className="mt-2 space-y-1">
                  {Object.entries(social.og).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="text-blue-300">{key}:</span>
                      <span className="text-white ml-1">{String(value).slice(0, 50)}...</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Twitter Cards</span>
                {getStatusBadge(Object.keys(social?.twitter || {}).length > 0, 'Có', 'Thiếu')}
              </div>
              <div className="text-xs text-muted-foreground">
                {Object.keys(social?.twitter || {}).length} tags được tìm thấy
              </div>
              {Object.keys(social?.twitter || {}).length > 0 && (
                <div className="mt-2 space-y-1">
                  {Object.entries(social.twitter).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="text-blue-300">{key}:</span>
                      <span className="text-white ml-1">{String(value).slice(0, 50)}...</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links Analysis */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Link className="h-5 w-5" />
            Phân tích Liên kết
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{links?.internal || 0}</div>
              <div className="text-sm text-muted-foreground">Internal Links</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{links?.external || 0}</div>
              <div className="text-sm text-muted-foreground">External Links</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{links?.internalToExternalRatio || 0}</div>
              <div className="text-sm text-muted-foreground">Tỷ lệ I/E</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Structured Data */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Code className="h-5 w-5" />
            Structured Data (Schema.org)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Có Structured Data</span>
            {getStatusBadge(schemaMarkup?.hasStructuredData, 'Có', 'Không')}
          </div>

          {schemaMarkup?.hasStructuredData && (
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Schema Type:</div>
                <Badge variant="outline">{schemaMarkup.type}</Badge>
              </div>

              {schemaMarkup.jsonLd && (
                <div className="p-3 bg-black/30 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">JSON-LD Preview:</div>
                  <pre className="text-xs text-green-300 overflow-auto max-h-32">
                    {JSON.stringify(schemaMarkup.jsonLd, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {!schemaMarkup?.hasStructuredData && (
            <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-warning">Khuyến nghị</div>
                  <div className="text-xs text-muted-foreground">
                    Thêm structured data để giúp search engines hiểu nội dung trang tốt hơn.
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* i18n */}
      {i18n?.hasMultiLanguage && (
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Đa ngôn ngữ (i18n)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {i18n.hreflangs.map((hreflang: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <Badge variant="outline">{hreflang.hreflang}</Badge>
                  <span className="text-xs text-muted-foreground">{hreflang.href}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};