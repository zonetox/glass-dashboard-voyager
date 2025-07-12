import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Scan = Tables<"scans">;

export function useCompareScans(url: string | null, userId: string | null) {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url || !userId) {
      setScans([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchScans = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("scans")
        .select("*")
        .eq("url", url)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(2);

      if (fetchError) {
        setError(fetchError.message);
        setScans([]);
      } else {
        setScans(data || []);
      }
      
      setLoading(false);
    };

    fetchScans();
  }, [url, userId]);

  const hasComparison = scans.length >= 2;
  const latestScan = scans[0] || null;
  const previousScan = scans[1] || null;

  return { 
    scans, 
    loading, 
    error, 
    hasComparison,
    latestScan,
    previousScan
  };
}