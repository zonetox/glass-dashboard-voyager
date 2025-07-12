import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useScanDetail } from '@/hooks/useScanDetail';
import ScanHistory from '@/components/dashboard/ScanHistory';
import ScanDetail from '@/components/dashboard/ScanDetail';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function ScanHistoryPage() {
  const { user } = useAuth();
  const { scans, loading: scansLoading } = useScanHistory(user?.id || null);
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const { scan, loading: scanLoading } = useScanDetail(selectedScanId);

  const handleBackToList = () => {
    setSelectedScanId(null);
  };

  if (scansLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Đang tải lịch sử...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {!selectedScanId ? (
        <>
          <h2 className="text-xl font-bold mb-4">📜 Lịch sử phân tích SEO</h2>
          <ScanHistory scans={scans} setSelectedScanId={setSelectedScanId} />
        </>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToList}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
            <h2 className="text-xl font-bold">Chi tiết phân tích</h2>
          </div>
          
          {scanLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Đang tải chi tiết...</div>
            </div>
          ) : (
            <ScanDetail scan={scan} />
          )}
        </>
      )}
    </div>
  );
}