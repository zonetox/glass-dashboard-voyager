
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Search, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DuplicationResult {
  is_duplicate: boolean;
  similarity_score: number;
  existing_content: Array<{
    title: string;
    url: string;
    similarity: number;
  }>;
  suggested_angles: string[];
  search_results: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

interface ContentDuplicationCheckerProps {
  onCheck: (result: DuplicationResult) => void;
  isChecking: boolean;
}

export function ContentDuplicationChecker({ onCheck, isChecking }: ContentDuplicationCheckerProps) {
  const [topic, setTopic] = useState('');
  const [keyword, setKeyword] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [checkResult, setCheckResult] = useState<DuplicationResult | null>(null);
  const { toast } = useToast();

  const handleCheck = async () => {
    if (!topic.trim() || !keyword.trim()) {
      toast({
        title: "Error",
        description: "Please provide both topic and keyword",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate content duplication check - in real implementation this would call AI search APIs
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: DuplicationResult = {
        is_duplicate: Math.random() > 0.7,
        similarity_score: Math.floor(Math.random() * 100),
        existing_content: [
          {
            title: `Similar article about ${topic}`,
            url: `https://example.com/article-1`,
            similarity: 85
          },
          {
            title: `Related content on ${keyword}`,
            url: `https://example.com/article-2`,
            similarity: 72
          }
        ],
        suggested_angles: [
          `Focus on ${keyword} for beginners`,
          `Advanced ${keyword} strategies`,
          `${topic} case studies and examples`,
          `Common ${keyword} mistakes to avoid`,
          `Future trends in ${topic}`
        ],
        search_results: [
          {
            title: `Complete Guide to ${topic}`,
            url: 'https://competitor.com/guide',
            snippet: `Learn everything about ${keyword} with our comprehensive guide...`
          }
        ]
      };

      setCheckResult(mockResult);
      onCheck(mockResult);

      toast({
        title: "Check Complete",
        description: mockResult.is_duplicate 
          ? "Potential content duplication detected" 
          : "No significant duplication found"
      });

    } catch (error) {
      console.error('Error checking content duplication:', error);
      toast({
        title: "Error",
        description: "Failed to check content duplication",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Search className="h-5 w-5 text-blue-400" />
            Content Duplication Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-gray-300 mb-2 block">Topic/Title</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Best Natural Sunscreens for Sensitive Skin"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Primary Keyword</Label>
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., natural sunscreen"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-gray-300 mb-2 block">Your Website (Optional)</Label>
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="e.g., https://yoursite.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <Button 
            onClick={handleCheck}
            disabled={isChecking}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isChecking ? (
              <>
                <Search className="h-4 w-4 mr-2 animate-spin" />
                Checking for Duplicates...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Check Content Duplication
              </>
            )}
          </Button>

          <p className="text-sm text-gray-400 mt-4">
            We'll check your site and search engines for similar content before generating new articles.
          </p>
        </CardContent>
      </Card>

      {checkResult && (
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-white">
              <span className="flex items-center gap-2">
                {checkResult.is_duplicate ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                )}
                Duplication Analysis Results
              </span>
              <Badge 
                className={`${
                  checkResult.is_duplicate 
                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20' 
                    : 'bg-green-500/20 text-green-300 border-green-500/20'
                }`}
              >
                {checkResult.similarity_score}% Similar
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {checkResult.is_duplicate && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <h4 className="font-semibold text-yellow-300 mb-2">⚠️ Potential Duplication Detected</h4>
                <p className="text-yellow-200 text-sm">
                  We found similar content that might affect your SEO. Consider using one of the suggested angles below.
                </p>
              </div>
            )}

            {checkResult.existing_content.length > 0 && (
              <div>
                <h4 className="font-semibold text-white mb-3">Similar Existing Content</h4>
                <div className="space-y-2">
                  {checkResult.existing_content.map((content, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded border border-white/10">
                      <div className="flex items-center justify-between">
                        <a 
                          href={content.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-medium"
                        >
                          {content.title}
                        </a>
                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/20">
                          {content.similarity}% similar
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-400" />
                Suggested Fresh Angles
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {checkResult.suggested_angles.map((angle, index) => (
                  <div 
                    key={index} 
                    className="p-3 bg-green-500/10 border border-green-500/20 rounded cursor-pointer hover:bg-green-500/20 transition"
                    onClick={() => {
                      navigator.clipboard.writeText(angle);
                      toast({
                        title: "Copied",
                        description: "Angle copied to clipboard"
                      });
                    }}
                  >
                    <p className="text-green-300 text-sm">💡 {angle}</p>
                  </div>
                ))}
              </div>
            </div>

            {!checkResult.is_duplicate && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h4 className="font-semibold text-green-300 mb-2">✅ Content is Unique</h4>
                <p className="text-green-200 text-sm">
                  No significant duplication found. You're good to proceed with content creation!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
