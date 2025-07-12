import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AISEOResult from "@/components/dashboard/AISEOResult";
import type { Tables } from "@/integrations/supabase/types";

type Scan = Tables<"scans">;

interface ScanDetailProps {
  scan: Scan | null;
}

export default function ScanDetail({ scan }: ScanDetailProps) {
  if (!scan) {
    return (
      <Card className="border">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No scan selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            📄 Chi tiết phân tích cho:
            <span className="text-primary">{scan.url}</span>
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              🕒 {new Date(scan.created_at || "").toLocaleString("vi-VN")}
            </div>
            <Badge variant="outline">
              ID: {scan.id}
            </Badge>
          </div>
        </CardHeader>
        
        {scan.seo && (
          <>
            <Separator />
            <CardContent className="pt-4">
              <h3 className="text-lg font-semibold mb-4">📊 SEO Data</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(scan.seo as Record<string, any>).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div className="text-sm break-words">
                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </>
        )}
      </Card>

      {scan.ai_analysis && (
        <AISEOResult aiAnalysis={scan.ai_analysis} />
      )}
    </div>
  );
}