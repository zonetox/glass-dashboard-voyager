import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle, 
  Sparkles, 
  Check, 
  Copy, 
  Loader2,
  Eye,
  EyeOff 
} from 'lucide-react';

interface AISuggestionCardProps {
  error: {
    id: string;
    title: string;
    description: string;
    type: 'meta' | 'h1' | 'alt' | 'paragraph';
    severity: 'high' | 'medium' | 'low';
    originalContent: string;
    affectedUrl: string;
  };
  onAccept?: (errorId: string, newContent: string) => void;
}

export const AISuggestionCard: React.FC<AISuggestionCardProps> = ({ 
  error, 
  onAccept 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isAccepted, setIsAccepted] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const { toast } = useToast();

  const severityColors = {
    high: 'bg-destructive text-destructive-foreground',
    medium: 'bg-warning text-warning-foreground',
    low: 'bg-muted text-muted-foreground'
  };

  const typeIcons = {
    meta: '🏷️',
    h1: '📰',
    alt: '🖼️',
    paragraph: '📝'
  };

  const generateAISuggestion = async () => {
    setIsLoading(true);
    try {
      const { data, error: functionError } = await supabase.functions.invoke('rewrite-content', {
        body: {
          url: error.affectedUrl,
          type: error.type,
          original_content: error.originalContent,
          context: error.description,
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      setAiSuggestion(data.suggestion);
      toast({
        title: "AI suggestion generated",
        description: "Review the suggestion and decide whether to accept it.",
      });
    } catch (err) {
      console.error('Error generating AI suggestion:', err);
      toast({
        title: "Error generating suggestion",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (aiSuggestion && onAccept) {
      onAccept(error.id, aiSuggestion);
      setIsAccepted(true);
      toast({
        title: "Changes accepted",
        description: "The suggestion has been marked for implementation.",
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(aiSuggestion);
      toast({
        title: "Copied to clipboard",
        description: "The suggestion has been copied for manual implementation.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please select and copy the text manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <CardTitle className="text-lg">{error.title}</CardTitle>
          </div>
          <Badge className={severityColors[error.severity]}>
            {error.severity}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{error.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Content Type and URL */}
        <div className="flex items-center gap-2 text-sm">
          <span>{typeIcons[error.type]}</span>
          <span className="font-medium capitalize">{error.type}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground truncate">{error.affectedUrl}</span>
        </div>

        {/* Original Content Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Current Content</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOriginal(!showOriginal)}
            >
              {showOriginal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showOriginal ? 'Hide' : 'Show'}
            </Button>
          </div>
          {showOriginal && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                {error.originalContent || 'No content found'}
              </p>
            </div>
          )}
        </div>

        {/* AI Suggestion Button */}
        {!aiSuggestion && (
          <Button
            onClick={generateAISuggestion}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Generating...' : 'Get AI Suggestion'}
          </Button>
        )}

        {/* AI Suggestion Result */}
        {aiSuggestion && (
          <div className="space-y-3">
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Suggestion
              </h4>
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                <p className="text-sm">{aiSuggestion}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleAccept}
                disabled={isAccepted}
                className="flex-1"
                variant={isAccepted ? "secondary" : "default"}
              >
                {isAccepted ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Accepted
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Accept
                  </>
                )}
              </Button>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="icon"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};