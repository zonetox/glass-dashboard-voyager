import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Share2, FileDown, Trash2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCompareScans } from "@/hooks/useCompareScans";
import AISEOResult from "@/components/dashboard/AISEOResult";
import SEOCompare from "@/components/dashboard/SEOCompare";
import type { Tables } from "@/integrations/supabase/types";
import html2pdf from "html2pdf.js";

type Scan = Tables<"scans">;

interface ScanDetailProps {
  scan: Scan | null;
  onBack?: () => void;
  onDelete?: () => void;
}

export default function ScanDetail({ scan, onBack, onDelete }: ScanDetailProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch comparison data for the same URL
  const { scans: history, hasComparison } = useCompareScans(
    scan?.url || null, 
    scan?.user_id || user?.id || null
  );

  const handleDelete = async () => {
    if (!scan) return;

    const confirmed = window.confirm("Bạn có chắc muốn xóa bản phân tích này?");
    if (!confirmed) return;

    try {
      const { error } = await supabase.from("scans").delete().eq("id", scan.id);
      
      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã xóa bản phân tích",
      });
      
      if (onDelete) {
        onDelete();
      } else if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error('Error deleting scan:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa bản phân tích",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (!scan) return;

    const link = `${window.location.origin}/scan/${scan.id}`;
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: "Đã sao chép",
        description: "Link chia sẻ đã được sao chép vào clipboard",
      });
    }).catch(() => {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép link",
        variant: "destructive",
      });
    });
  };

  const handleExportPDF = () => {
    if (!scan) return;

    const content = document.getElementById("scan-report");
    if (!content) {
      toast({
        title: "Lỗi",
        description: "Không thể tìm thấy nội dung để xuất PDF",
        variant: "destructive",
      });
      return;
    }

    const options = {
      margin: 1,
      filename: `SEO-Report-${scan.url.replace(/[^a-z0-9]/gi, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(options).from(content).save();
    
    toast({
      title: "Đang xuất PDF",
      description: "File PDF sẽ được tải xuống trong giây lát",
    });
  };

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
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {onBack && (
          <Button onClick={onBack} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        )}
        <Button onClick={handleShare} variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          🔗 Sao chép link chia sẻ
        </Button>
        <Button onClick={handleExportPDF} variant="secondary" className="gap-2">
          <FileDown className="h-4 w-4" />
          📄 Xuất PDF
        </Button>
        <Button onClick={handleDelete} variant="destructive" className="gap-2">
          <Trash2 className="h-4 w-4" />
          🗑️ Xóa
        </Button>
      </div>

      {/* PDF Export Container */}
      <div id="scan-report">
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

        {/* SEO Comparison - Show when there are multiple scans for the same URL */}
        {hasComparison && history.length >= 2 && (
          <div className="mt-6">
            <SEOCompare before={history[1]} after={history[0]} />
          </div>
        )}
      </div>
    </div>
  );
}