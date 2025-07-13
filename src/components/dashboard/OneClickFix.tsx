import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Wand2, 
  Shield, 
  Brain, 
  Search, 
  PenTool,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  Archive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FixSuggestion {
  id: string;
  type: 'meta_title' | 'meta_desc' | 'h1' | 'paragraph' | 'alt_text';
  element: string;
  original: string;
  suggestion: string;
  reasoning: string;
  status: 'pending' | 'accepted' | 'skipped';
}

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  icon: any;
}

interface OneClickFixProps {
  url: string;
  content?: string;
  onBackupCreated?: () => void;
}

export function OneClickFix({ url, content, onBackupCreated }: OneClickFixProps) {
  const { toast } = useToast();
  
  // Process states
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [reviewStep, setReviewStep] = useState(0);
  const [isInReviewMode, setIsInReviewMode] = useState(false);
  
  // Data states
  const [suggestions, setSuggestions] = useState<FixSuggestion[]>([]);
  const [backupId, setBackupId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  
  const processSteps: ProcessStep[] = [
    {
      id: 'backup',
      title: 'Creating Backup',
      description: 'Securing original content',
      status: 'pending',
      icon: Shield
    },
    {
      id: 'analyze',
      title: 'AI Analysis',
      description: 'Analyzing content structure',
      status: 'pending',
      icon: Brain
    },
    {
      id: 'semantic',
      title: 'Semantic Analysis', 
      description: 'Understanding content meaning',
      status: 'pending',
      icon: Search
    },
    {
      id: 'generate',
      title: 'Generate Fixes',
      description: 'Creating optimized content',
      status: 'pending',
      icon: PenTool
    }
  ];

  const [steps, setSteps] = useState(processSteps);

  const updateStepStatus = (stepId: string, status: ProcessStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const executeBackup = async () => {
    updateStepStatus('backup', 'loading');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await supabase.functions.invoke('backup-site', {
        body: {
          url,
          original_data: {
            content: content || '',
            timestamp: new Date().toISOString()
          },
          type: 'one_click_fix',
          user_id: user?.id
        }
      });

      if (response.error) throw new Error(response.error.message);
      
      setBackupId(response.data.id);
      updateStepStatus('backup', 'completed');
      onBackupCreated?.();
      
      return response.data;
    } catch (error) {
      updateStepStatus('backup', 'error');
      throw error;
    }
  };

  const executeAnalysis = async () => {
    updateStepStatus('analyze', 'loading');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await supabase.functions.invoke('analyze-site', {
        body: {
          url,
          user_id: user?.id
        }
      });

      if (response.error) throw new Error(response.error.message);
      
      setAnalysisData(response.data);
      updateStepStatus('analyze', 'completed');
      
      return response.data;
    } catch (error) {
      updateStepStatus('analyze', 'error');
      throw error;
    }
  };

  const executeSemanticAnalysis = async () => {
    updateStepStatus('semantic', 'loading');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await supabase.functions.invoke('semantic-analysis', {
        body: {
          url,
          content: content || '',
          user_id: user?.id
        }
      });

      if (response.error) throw new Error(response.error.message);
      
      updateStepStatus('semantic', 'completed');
      return response.data;
    } catch (error) {
      updateStepStatus('semantic', 'error');
      throw error;
    }
  };

  const generateSuggestions = async (analysisData: any, semanticData: any) => {
    updateStepStatus('generate', 'loading');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const fixTypes = ['meta_title', 'meta_desc', 'h1', 'paragraph', 'alt_text'];
      const newSuggestions: FixSuggestion[] = [];

      for (const type of fixTypes) {
        try {
          // Extract relevant original content based on type
          let originalContent = '';
          let elementIdentifier = '';
          
          switch (type) {
            case 'meta_title':
              originalContent = analysisData?.seo?.meta_title || 'No title found';
              elementIdentifier = '<title>';
              break;
            case 'meta_desc':
              originalContent = analysisData?.seo?.meta_description || 'No description found';
              elementIdentifier = '<meta name="description">';
              break;
            case 'h1':
              originalContent = analysisData?.seo?.h1_tags?.[0] || 'No H1 found';
              elementIdentifier = '<h1>';
              break;
            case 'paragraph':
              originalContent = content?.substring(0, 200) + '...' || 'No content found';
              elementIdentifier = 'First paragraph';
              break;
            case 'alt_text':
              originalContent = 'Image alt text optimization';
              elementIdentifier = '<img alt>';
              break;
          }

          const response = await supabase.functions.invoke('rewrite-content', {
            body: {
              type,
              url,
              original_content: originalContent,
              user_id: user?.id
            }
          });

          if (!response.error && response.data) {
            newSuggestions.push({
              id: `${type}_${Date.now()}`,
              type: type as any,
              element: elementIdentifier,
              original: originalContent,
              suggestion: response.data.suggestion,
              reasoning: response.data.reasoning,
              status: 'pending'
            });
          }
        } catch (error) {
          console.error(`Failed to generate ${type} suggestion:`, error);
        }
      }

      setSuggestions(newSuggestions);
      updateStepStatus('generate', 'completed');
      
      return newSuggestions;
    } catch (error) {
      updateStepStatus('generate', 'error');
      throw error;
    }
  };

  const handleStartOptimization = async () => {
    if (!content) {
      toast({
        title: "Content required",
        description: "Please provide content to optimize",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep(0);
    
    try {
      // Step 1: Backup
      await executeBackup();
      setCurrentStep(1);
      
      // Step 2: Analysis
      const analysis = await executeAnalysis();
      setCurrentStep(2);
      
      // Step 3: Semantic Analysis
      const semantic = await executeSemanticAnalysis();
      setCurrentStep(3);
      
      // Step 4: Generate Suggestions
      await generateSuggestions(analysis, semantic);
      setCurrentStep(4);
      
      // Move to review mode
      setIsInReviewMode(true);
      setReviewStep(0);
      
      toast({
        title: "Analysis Complete",
        description: "Review the AI suggestions to optimize your content"
      });
      
    } catch (error) {
      console.error('Optimization process failed:', error);
      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : 'Failed to complete optimization',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionAction = (suggestionId: string, action: 'accepted' | 'skipped') => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, status: action } : s
    ));
  };

  const handleNextReview = () => {
    if (reviewStep < suggestions.length - 1) {
      setReviewStep(reviewStep + 1);
    }
  };

  const handlePrevReview = () => {
    if (reviewStep > 0) {
      setReviewStep(reviewStep - 1);
    }
  };

  const handleFinishReview = async () => {
    const acceptedSuggestions = suggestions.filter(s => s.status === 'accepted');
    
    try {
      // Save optimization results
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('optimization_history')
        .insert({
          user_id: user?.id || '',
          website_url: url,
          fixes_applied: acceptedSuggestions as any, // Convert to JSON
          backup_url: backupId,
          status: 'completed'
        });

      if (error) throw error;

      toast({
        title: "Optimization Complete",
        description: `Applied ${acceptedSuggestions.length} AI improvements to your content`
      });

      // Reset component state
      setIsInReviewMode(false);
      setSuggestions([]);
      setSteps(processSteps);
      
    } catch (error) {
      console.error('Failed to save optimization:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save optimization results",
        variant: "destructive"
      });
    }
  };

  const getStepIcon = (step: ProcessStep) => {
    const IconComponent = step.icon;
    const getIconColor = () => {
      switch (step.status) {
        case 'completed': return 'text-green-400';
        case 'loading': return 'text-blue-400';
        case 'error': return 'text-red-400';
        default: return 'text-muted-foreground';
      }
    };
    
    return <IconComponent className={`h-5 w-5 ${getIconColor()}`} />;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meta_title': return '📋';
      case 'meta_desc': return '📝';
      case 'h1': return '📖';
      case 'paragraph': return '📄';
      case 'alt_text': return '🖼️';
      default: return '✨';
    }
  };

  const currentSuggestion = suggestions[reviewStep];

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Wand2 className="h-5 w-5 text-purple-400" />
          AI One-Click Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isProcessing && !isInReviewMode && (
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-4">
                <Wand2 className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">
                Complete AI Optimization
              </h3>
              <p className="text-muted-foreground text-sm">
                Let AI analyze and optimize your entire page with smart suggestions
              </p>
            </div>
            
            <Button
              onClick={handleStartOptimization}
              disabled={!content}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              size="lg"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Start AI Optimization
            </Button>
          </div>
        )}

        {/* Processing Steps */}
        {isProcessing && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-white font-semibold mb-2">
                Optimizing Your Content
              </h3>
              <Progress 
                value={(currentStep / steps.length) * 100} 
                className="w-full mb-4"
              />
            </div>
            
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    index <= currentStep 
                      ? 'bg-white/5 border border-white/10' 
                      : 'opacity-50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {step.status === 'loading' ? (
                      <div className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full" />
                    ) : (
                      getStepIcon(step)
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{step.title}</h4>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                  {step.status === 'completed' && (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  )}
                  {step.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Mode */}
        {isInReviewMode && suggestions.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-white font-semibold mb-2">
                Review AI Suggestions
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Review each suggestion and decide which changes to apply
              </p>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary">
                  {reviewStep + 1} of {suggestions.length}
                </Badge>
                <Badge variant="outline" className="border-green-500/20 text-green-400">
                  {suggestions.filter(s => s.status === 'accepted').length} accepted
                </Badge>
              </div>
            </div>

            {currentSuggestion && (
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <span className="text-2xl">{getTypeIcon(currentSuggestion.type)}</span>
                    {currentSuggestion.element}
                    <Badge 
                      variant={currentSuggestion.status === 'pending' ? 'secondary' : 
                              currentSuggestion.status === 'accepted' ? 'default' : 'destructive'}
                      className={currentSuggestion.status === 'accepted' ? 'bg-green-500/20 border-green-500/20 text-green-400' : ''}
                    >
                      {currentSuggestion.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Original Content */}
                  <div className="space-y-2">
                    <h4 className="text-white font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-400" />
                      Original
                    </h4>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-300 text-sm">{currentSuggestion.original}</p>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  {/* AI Suggestion */}
                  <div className="space-y-2">
                    <h4 className="text-white font-medium flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-400" />
                      AI Suggestion
                    </h4>
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-green-300 text-sm">{currentSuggestion.suggestion}</p>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="space-y-2">
                    <h4 className="text-white font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-400" />
                      Why This Change?
                    </h4>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-300 text-sm">{currentSuggestion.reasoning}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {currentSuggestion.status === 'pending' && (
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => handleSuggestionAction(currentSuggestion.id, 'accepted')}
                        className="flex-1 bg-green-500/20 border border-green-500/20 hover:bg-green-500/30 text-green-400"
                        variant="outline"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleSuggestionAction(currentSuggestion.id, 'skipped')}
                        className="flex-1 bg-red-500/20 border border-red-500/20 hover:bg-red-500/30 text-red-400"
                        variant="outline"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Skip
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                onClick={handlePrevReview}
                disabled={reviewStep === 0}
                variant="outline"
                className="bg-white/5 border-white/20 hover:bg-white/10 text-white"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {reviewStep === suggestions.length - 1 ? (
                <Button
                  onClick={handleFinishReview}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Apply Changes
                </Button>
              ) : (
                <Button
                  onClick={handleNextReview}
                  variant="outline"
                  className="bg-white/5 border-white/20 hover:bg-white/10 text-white"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}