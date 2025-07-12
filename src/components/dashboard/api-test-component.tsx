import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, AlertCircle, Key } from 'lucide-react';

interface APITestResult {
  openaiWorking: boolean;
  googlePageSpeedWorking: boolean;
  crawlingWorking: boolean;
  error?: string;
  details?: any;
}

export function APITestComponent() {
  const [testUrl, setTestUrl] = useState('https://google.com');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<APITestResult | null>(null);
  const { toast } = useToast();

  const testAPIs = async () => {
    if (!testUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a test URL",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      // Test the analyze-website function
      const { data, error } = await supabase.functions.invoke('analyze-website', {
        body: { url: testUrl }
      });

      if (error) {
        setTestResult({
          openaiWorking: false,
          googlePageSpeedWorking: false,
          crawlingWorking: false,
          error: error.message || 'API test failed'
        });
        return;
      }

      // Analyze the response to determine what's working
      const result: APITestResult = {
        crawlingWorking: !!(data?.title || data?.headings),
        googlePageSpeedWorking: !!data?.pageSpeedInsights,
        openaiWorking: !!data?.aiAnalysis,
        details: data
      };

      setTestResult(result);

      toast({
        title: "API Test Complete",
        description: "Check results below",
      });

    } catch (error: any) {
      console.error('API test error:', error);
      setTestResult({
        openaiWorking: false,
        googlePageSpeedWorking: false,
        crawlingWorking: false,
        error: error.message || 'Unknown error occurred'
      });
      
      toast({
        title: "API Test Failed",
        description: error.message || 'Failed to test APIs',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (working: boolean, label: string) => (
    <div className="flex items-center gap-2">
      {working ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )}
      <span className="text-sm">{label}</span>
      <Badge variant={working ? "default" : "destructive"}>
        {working ? "Working" : "Failed"}
      </Badge>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Key className="h-5 w-5 text-blue-400" />
            API Testing Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-url" className="text-gray-300">
              Test URL
            </Label>
            <Input
              id="test-url"
              type="url"
              placeholder="https://example.com"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              disabled={isLoading}
            />
          </div>

          <Button 
            onClick={testAPIs}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Testing APIs...
              </>
            ) : (
              'Test All APIs'
            )}
          </Button>

          {testResult && (
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold text-white">Test Results</h3>
              
              <div className="space-y-3">
                {getStatusBadge(testResult.crawlingWorking, "Website Crawling")}
                {getStatusBadge(testResult.googlePageSpeedWorking, "Google PageSpeed API")}
                {getStatusBadge(testResult.openaiWorking, "OpenAI API")}
              </div>

              {testResult.error && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-300">
                    {testResult.error}
                  </AlertDescription>
                </Alert>
              )}

              {testResult.details && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">Response Details:</h4>
                  <div className="text-xs text-gray-300 space-y-1">
                    {testResult.details.title && (
                      <p><strong>Title:</strong> {testResult.details.title}</p>
                    )}
                    {testResult.details.headings?.h1?.length > 0 && (
                      <p><strong>H1 Count:</strong> {testResult.details.headings.h1.length}</p>
                    )}
                    {testResult.details.pageSpeedInsights && (
                      <p><strong>PageSpeed Desktop Score:</strong> {testResult.details.pageSpeedInsights.desktop?.score}/100</p>
                    )}
                    {testResult.details.aiAnalysis?.citationPotential && (
                      <p><strong>AI Analysis:</strong> ✓ Generated</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <h4 className="text-sm font-medium text-blue-300 mb-2">API Requirements:</h4>
            <ul className="text-xs text-blue-200 space-y-1">
              <li>• OpenAI API Key: Required for AI analysis and schema generation</li>
              <li>• Google PageSpeed API Key: Required for performance analysis</li>
              <li>• Website must be publicly accessible for crawling</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}