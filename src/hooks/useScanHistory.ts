import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Scan = Tables<"scans">;

export function useScanHistory(userId: string | null) {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setScans([]);
      setLoading(false);
      return;
    }

    const fetchScans = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("scans")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setScans(data);
      }
      setLoading(false);
    };

    fetchScans();
  }, [userId]);

  return { scans, loading };
}