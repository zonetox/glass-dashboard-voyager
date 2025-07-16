import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Scan = Tables<"scans">;

interface StandardizedScan extends Scan {
  scan_id: string;
  domain: string;
  has_ai_suggestions: boolean;
  processing_time_ms?: number;
}

export function useScanHistory(userId: string | null) {
  const [scans, setScans] = useState<StandardizedScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setScans([]);
      setLoading(false);
      return;
    }

    const fetchScans = async () => {
      setLoading(true);
      
      try {
        // Get total count for usage tracking
        const { count } = await supabase
          .from("scans")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", userId);

        setTotalCount(count || 0);

        // Get scan data with standardized format
        const { data, error } = await supabase
          .from("scans")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!error && data) {
          // Transform to standardized format
          const standardizedScans: StandardizedScan[] = data.map(scan => ({
            ...scan,
            scan_id: scan.id,
            domain: extractDomain(scan.url),
            has_ai_suggestions: Boolean(scan.ai_analysis),
            processing_time_ms: scan.created_at ? getProcessingTime(scan.created_at) : undefined
          }));
          
          setScans(standardizedScans);
        }
      } catch (error) {
        console.error('Error fetching scans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, [userId]);

  return { scans, loading, totalCount };
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

function getProcessingTime(createdAt: string): number {
  // Estimate processing time based on scan complexity (mock implementation)
  const baseTime = 2000; // 2 seconds base
  const randomVariation = Math.random() * 3000; // 0-3 seconds variation
  return Math.round(baseTime + randomVariation);
}