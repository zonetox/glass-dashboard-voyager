import React from "react";
import { Card } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";

type Scan = Tables<"scans">;

interface ScanHistoryProps {
  scans: Scan[];
  setSelectedScanId?: (scanId: string) => void;
}

export default function ScanHistory({ scans, setSelectedScanId }: ScanHistoryProps) {
  if (!scans.length) {
    return (
      <p className="text-muted-foreground text-sm italic">
        Chưa có lịch sử phân tích nào.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {scans.map((scan) => (
        <Card
          key={scan.id}
          className="p-4 border hover:bg-muted/50 cursor-pointer transition-all animate-fade-in hover-scale"
          onClick={() => {
            if (setSelectedScanId) {
              setSelectedScanId(scan.id);
            } else {
              console.log("Click scan:", scan.id);
            }
          }}
        >
          <div className="text-sm font-medium text-primary">{scan.url}</div>
          <div className="text-xs text-muted-foreground">
            🕒 {new Date(scan.created_at || "").toLocaleString("vi-VN")}
          </div>
          {scan.ai_analysis && 
           typeof scan.ai_analysis === 'object' && 
           'searchIntent' in scan.ai_analysis && (
            <div className="mt-1 text-sm">
              🎯 <strong>Intent:</strong> {String(scan.ai_analysis.searchIntent)}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}