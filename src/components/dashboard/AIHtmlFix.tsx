import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, FileText, Heading1, Target, CheckCircle } from "lucide-react";

interface AIHtmlFixProps {
  fixes: {
    title?: string;
    metaDescription?: string;
    h1?: string;
    headingStructure?: string[];
    openingParagraph?: string;
    targetKeywords?: string[];
    keywordDensity?: {
      primary?: string;
      secondary?: string;
    };
    improvements?: string[];
    technicalSEO?: {
      altText?: string;
      internalLinks?: string;
      schemaMarkup?: string;
    };
  } | null;
}

export default function AIHtmlFix({ fixes }: AIHtmlFixProps) {
  if (!fixes) return null;

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">✨ Gợi ý sửa HTML từ AI</h2>
      </div>

      <div className="grid gap-4">
        {/* Title Suggestion */}
        {fixes.title && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                📝 Title mới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-md font-medium">
                {fixes.title}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Meta Description */}
        {fixes.metaDescription && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                📄 Meta Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-md">
                {fixes.metaDescription}
              </div>
            </CardContent>
          </Card>
        )}

        {/* H1 Suggestion */}
        {fixes.h1 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heading1 className="h-4 w-4" />
                📌 Heading (H1)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-md font-medium">
                {fixes.h1}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Heading Structure */}
        {fixes.headingStructure && fixes.headingStructure.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">🏗️ Cấu trúc Heading</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fixes.headingStructure.map((heading, index) => (
                  <div key={index} className="bg-muted p-2 rounded-md text-sm">
                    {heading}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Opening Paragraph */}
        {fixes.openingParagraph && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">📖 Đoạn mở bài</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">
                {fixes.openingParagraph}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Target Keywords */}
        {fixes.targetKeywords && fixes.targetKeywords.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                🎯 Từ khóa mục tiêu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {fixes.targetKeywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Keyword Density */}
        {fixes.keywordDensity && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">📊 Mật độ từ khóa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {fixes.keywordDensity.primary && (
                <div className="bg-muted p-2 rounded-md text-sm">
                  <strong>Chính:</strong> {fixes.keywordDensity.primary}
                </div>
              )}
              {fixes.keywordDensity.secondary && (
                <div className="bg-muted p-2 rounded-md text-sm">
                  <strong>Phụ:</strong> {fixes.keywordDensity.secondary}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Improvements */}
        {fixes.improvements && fixes.improvements.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                💡 Cải thiện cụ thể
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fixes.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="bg-muted p-2 rounded-md text-sm flex-1">
                      {improvement}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Technical SEO */}
        {fixes.technicalSEO && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">⚙️ SEO Kỹ thuật</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fixes.technicalSEO.altText && (
                <div>
                  <h4 className="font-medium text-sm mb-1">Alt Text</h4>
                  <div className="bg-muted p-2 rounded-md text-sm">
                    {fixes.technicalSEO.altText}
                  </div>
                </div>
              )}
              
              {fixes.technicalSEO.internalLinks && (
                <div>
                  <h4 className="font-medium text-sm mb-1">Liên kết nội bộ</h4>
                  <div className="bg-muted p-2 rounded-md text-sm">
                    {fixes.technicalSEO.internalLinks}
                  </div>
                </div>
              )}
              
              {fixes.technicalSEO.schemaMarkup && (
                <div>
                  <h4 className="font-medium text-sm mb-1">Schema Markup</h4>
                  <div className="bg-muted p-2 rounded-md text-sm">
                    {fixes.technicalSEO.schemaMarkup}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}