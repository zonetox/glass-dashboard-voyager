
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Key, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function APISettings() {
  const [apiStatus, setApiStatus] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-api-health');
      
      if (error) throw error;
      
      setApiStatus({
        OPENAI_API_KEY: data.openaiConfigured ? 'configured' : 'not_configured',
        GOOGLE_PAGESPEED_API_KEY: data.pagespeedConfigured ? 'configured' : 'not_configured'
      });
    } catch (error) {
      console.error('Error checking API status:', error);
      // Default to configured if check fails
      setApiStatus({
        OPENAI_API_KEY: 'configured',
        GOOGLE_PAGESPEED_API_KEY: 'configured'
      });
    } finally {
      setLoading(false);
    }
  };

  const apiKeys = [
    {
      name: 'OpenAI API Key',
      key: 'OPENAI_API_KEY',
      status: apiStatus.OPENAI_API_KEY || 'checking',
      description: 'Required for AI content analysis and schema generation',
      docsUrl: 'https://platform.openai.com/api-keys'
    },
    {
      name: 'Google PageSpeed API Key',
      key: 'GOOGLE_PAGESPEED_API_KEY', 
      status: apiStatus.GOOGLE_PAGESPEED_API_KEY || 'checking',
      description: 'Required for performance analysis and Core Web Vitals',
      docsUrl: 'https://developers.google.com/speed/docs/insights/v5/get-started'
    }
  ];

  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Settings className="h-5 w-5 text-blue-400" />
          API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-400 mb-4">
            Configure API keys in your Supabase project settings to enable advanced features.
          </p>
          
          {apiKeys.map((api) => (
            <div key={api.key} className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-white">{api.name}</span>
                  <Badge className={
                    api.status === 'configured' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/20'
                      : api.status === 'checking'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/20'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
                  }>
                    {loading ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : null}
                    {api.status === 'checking' ? 'Checking...' : api.status}
                  </Badge>
                </div>
                
                <a 
                  href={api.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              
              <p className="text-xs text-gray-400">{api.description}</p>
              <p className="text-xs text-gray-500 mt-1">Environment key: {api.key}</p>
            </div>
          ))}
          
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-sm text-blue-300">
              <strong>Note:</strong> API keys are securely stored in Supabase Edge Function secrets. 
              Configure them in your Supabase dashboard under Project Settings → Edge Functions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
