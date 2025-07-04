
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Code, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { useState } from 'react';

interface AIAnalysisResultsProps {
  analysisData: any;
}

export function AIAnalysisResults({ analysisData }: AIAnalysisResultsProps) {
  const [copiedSchema, setCopiedSchema] = useState(false);
  
  if (!analysisData?.aiAnalysis && !analysisData?.schemaMarkup) {
    return null;
  }

  const { aiAnalysis, schemaMarkup } = analysisData;

  const copySchemaToClipboard = async () => {
    if (schemaMarkup?.jsonLd) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(schemaMarkup.jsonLd, null, 2));
        setCopiedSchema(true);
        setTimeout(() => setCopiedSchema(false), 2000);
      } catch (err) {
        console.error('Failed to copy schema markup:', err);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Citation Analysis */}
      {aiAnalysis && (
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5 text-purple-400" />
              AI Content Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Citation Potential */}
            {aiAnalysis.citationPotential && (
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-purple-300 mb-1">Citation Potential</h4>
                    <p className="text-sm text-gray-300">{aiAnalysis.citationPotential}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Semantic Gaps */}
            {aiAnalysis.semanticGaps && aiAnalysis.semanticGaps.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-400" />
                  Semantic Gaps to Fill
                </h4>
                <div className="space-y-1">
                  {aiAnalysis.semanticGaps.map((gap: string, index: number) => (
                    <div key={index} className="text-sm text-gray-300 p-2 bg-white/5 rounded border border-white/10">
                      • {gap.replace(/^[-•]\s*/, '')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Suggestions */}
            {aiAnalysis.faqSuggestions && aiAnalysis.faqSuggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  Suggested FAQ Topics
                </h4>
                <div className="space-y-1">
                  {aiAnalysis.faqSuggestions.map((faq: string, index: number) => (
                    <div key={index} className="text-sm text-gray-300 p-2 bg-white/5 rounded border border-white/10">
                      • {faq.replace(/^[-•]\s*/, '')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvement Suggestions */}
            {aiAnalysis.improvementSuggestions && aiAnalysis.improvementSuggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  AI-Readability Improvements
                </h4>
                <div className="space-y-1">
                  {aiAnalysis.improvementSuggestions.map((suggestion: string, index: number) => (
                    <div key={index} className="text-sm text-gray-300 p-2 bg-white/5 rounded border border-white/10">
                      • {suggestion.replace(/^[-•]\s*/, '')}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schema Markup */}
      {schemaMarkup && (
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <Code className="h-5 w-5 text-green-400" />
              Generated Schema.org Markup
              <Badge className="bg-green-500/20 text-green-400 border-green-500/20">
                {schemaMarkup.type}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                Add this JSON-LD markup to your page's &lt;head&gt; section to improve search engine understanding:
              </p>
              
              <div className="relative">
                <pre className="bg-gray-900 p-4 rounded-lg text-sm text-green-400 overflow-x-auto max-h-60 border border-white/10">
                  <code>
                    {JSON.stringify(schemaMarkup.jsonLd, null, 2)}
                  </code>
                </pre>
                
                <Button
                  onClick={copySchemaToClipboard}
                  size="sm"
                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
                  variant="outline"
                >
                  {copiedSchema ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
