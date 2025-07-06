
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bot, Star, Zap } from 'lucide-react';

interface AIReadyBadgeProps {
  score: number;
  factors: {
    structuredData: boolean;
    semanticMarkup: boolean;
    contentQuality: boolean;
    loadSpeed: boolean;
    mobileOptimized: boolean;
  };
}

export function AIReadyBadge({ score, factors }: AIReadyBadgeProps) {
  const getAIReadyLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-400 border-green-500/20', icon: Star };
    if (score >= 75) return { level: 'Good', color: 'text-blue-400 border-blue-500/20', icon: Zap };
    if (score >= 50) return { level: 'Moderate', color: 'text-yellow-400 border-yellow-500/20', icon: Bot };
    return { level: 'Needs Work', color: 'text-red-400 border-red-500/20', icon: Bot };
  };

  const aiReady = getAIReadyLevel(score);
  const IconComponent = aiReady.icon;

  const factorLabels = {
    structuredData: 'Structured Data (Schema.org)',
    semanticMarkup: 'Semantic HTML Markup',
    contentQuality: 'High-Quality Content',
    loadSpeed: 'Fast Loading Speed',
    mobileOptimized: 'Mobile Optimized'
  };

  const completedFactors = Object.entries(factors).filter(([_, value]) => value).length;
  const totalFactors = Object.keys(factors).length;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`${aiReady.color} cursor-help`}>
            <IconComponent className="h-3 w-3 mr-1" />
            AI-Ready: {aiReady.level} ({score}/100)
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4 bg-gray-900 border border-white/20">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-white mb-1">AI Citation Readiness</h4>
              <p className="text-xs text-gray-400">
                How likely your content is to be cited by AI systems like ChatGPT, Claude, and Gemini.
              </p>
            </div>
            
            <div>
              <h5 className="text-xs font-medium text-gray-300 mb-2">
                Optimization Factors ({completedFactors}/{totalFactors})
              </h5>
              <div className="space-y-1">
                {Object.entries(factors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${
                      value ? 'bg-green-400' : 'bg-gray-600'
                    }`} />
                    <span className={value ? 'text-gray-300' : 'text-gray-500'}>
                      {factorLabels[key as keyof typeof factorLabels]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-gray-400">
                AI systems prefer well-structured, fast-loading content with clear semantic markup.
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
