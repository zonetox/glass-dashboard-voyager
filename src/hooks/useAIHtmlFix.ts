import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAIHtmlFix() {
  const [fixes, setFixes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFix = async (url: string, ai_analysis: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('seo-html-suggestions', {
        body: { url, ai_analysis }
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      setFixes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate SEO suggestions');
      console.error('Error generating SEO suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  return { fixes, loading, error, generateFix };
}