import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Scan = Tables<"scans">;

export function useScanDetail(scanId: string | null) {
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scanId) {
      setScan(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchScan = async () => {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("scans")
        .select("*")
        .eq("id", scanId)
        .single();

      if (fetchError) {
        setError(fetchError.message);
        setScan(null);
      } else {
        setScan(data);
      }
      
      setLoading(false);
    };

    fetchScan();
  }, [scanId]);

  return { scan, loading, error };
}