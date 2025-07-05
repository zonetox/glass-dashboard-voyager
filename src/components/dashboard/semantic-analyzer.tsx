
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Search, 
  Target, 
  TrendingUp, 
  BookOpen,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SemanticAnalysisResult {
  mainTopic: string;
  subtopics: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  suggestedImprovements: string[];
  contentOutline: Array<{
    section: string;
    subsections: string[];
  }>;
  semanticGaps: string[];
  topicalDepthScore: number;
}

export function SemanticAnalyzer() {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SemanticAnalysisResult | null>(null);

  const handleAnalysis = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please provide content to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch(
        'https://ycjdrqyztzweddtcodjo.supabase.co/functions/v1/semantic-analysis',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljamRycXl6dHp3ZWRkdGNvZGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MTc4MTQsImV4cCI6MjA2NzA5MzgxNH0.1hVFiDBUwBVrU8RnA4cBXDixt4-EQnNF6qtET7ruWXo`
          },
          body: JSON.stringify({
            content: content.trim(),
            url: url.trim() || undefined
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result = await response.json();
      setAnalysisResult(result);

      toast({
        title: "Analysis completed",
        description: "Semantic analysis has been generated successfully"
      });

    } catch (error) {
      console.error('Semantic analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : 'Failed to analyze content',
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 border-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 border-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 border-gray-500/20 text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-5 w-5 text-purple-400" />
            Semantic Content Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">Website URL (optional)</label>
            <input
              type="url"
              placeholder="https://example.com/page"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Page Content</label>
            <Textarea
              placeholder="Paste your page content here for semantic analysis..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-purple-400"
            />
          </div>

          <Button
            onClick={handleAnalysis}
            disabled={isAnalyzing || !content.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyze Semantic Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {analysisResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Topic & Score */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="h-5 w-5 text-blue-400" />
                Topic Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">Main Topic</h3>
                <p className="text-blue-300 text-lg font-semibold">{analysisResult.mainTopic}</p>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-2">Topical Depth Score</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getScoreColor(analysisResult.topicalDepthScore)}`}>
                    {analysisResult.topicalDepthScore}/100
                  </span>
                  <TrendingUp className={`h-5 w-5 ${getScoreColor(analysisResult.topicalDepthScore)}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Missing Subtopics */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                Missing Subtopics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisResult.subtopics.map((subtopic, index) => (
                  <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-medium">{subtopic.title}</h4>
                      <Badge className={getPriorityColor(subtopic.priority)}>
                        {subtopic.priority}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm">{subtopic.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Outline */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BookOpen className="h-5 w-5 text-green-400" />
                Suggested Content Outline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisResult.contentOutline.map((section, index) => (
                  <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-white font-medium mb-2">{section.section}</h4>
                    <ul className="space-y-1">
                      {section.subsections.map((subsection, subIndex) => (
                        <li key={subIndex} className="text-gray-300 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                          {subsection}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Improvements & Gaps */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CheckCircle2 className="h-5 w-5 text-purple-400" />
                Improvements & Gaps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Suggested Improvements</h4>
                <ul className="space-y-2">
                  {analysisResult.suggestedImprovements.map((improvement, index) => (
                    <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">Semantic Gaps</h4>
                <ul className="space-y-2">
                  {analysisResult.semanticGaps.map((gap, index) => (
                    <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
