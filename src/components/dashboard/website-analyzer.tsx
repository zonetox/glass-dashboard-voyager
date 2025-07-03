
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Search, Loader2 } from 'lucide-react';

interface WebsiteAnalyzerProps {
  onAnalyze: (url: string) => Promise<void>;
  isLoading: boolean;
}

export function WebsiteAnalyzer({ onAnalyze, isLoading }: WebsiteAnalyzerProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    try {
      // Add protocol if missing
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      await onAnalyze(formattedUrl);
      setUrl('');
    } catch (err) {
      setError('Invalid URL format');
    }
  };

  return (
    <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Globe className="h-5 w-5 text-blue-400" />
          Add Website for Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website-url" className="text-gray-300">
              Website URL
            </Label>
            <Input
              id="website-url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-400"
              disabled={isLoading}
            />
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyze Website
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-sm text-blue-300">
            <strong>Analysis includes:</strong> SEO score, meta tags, performance, 
            mobile-friendliness, and optimization recommendations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
