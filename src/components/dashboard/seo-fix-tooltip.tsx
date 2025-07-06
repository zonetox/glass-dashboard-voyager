
import { useState } from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface SEOFixTooltipProps {
  title: string;
  description: string;
  recommendation: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
  isFixed?: boolean;
}

export function SEOFixTooltip({ 
  title, 
  description, 
  recommendation, 
  severity, 
  category,
  isFixed = false 
}: SEOFixTooltipProps) {
  const getSeverityIcon = () => {
    if (isFixed) return <CheckCircle className="h-4 w-4 text-green-400" />;
    
    switch (severity) {
      case 'high':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-400" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSeverityColor = () => {
    if (isFixed) return 'border-green-500/20 text-green-400';
    
    switch (severity) {
      case 'high':
        return 'border-red-500/20 text-red-400';
      case 'medium':
        return 'border-yellow-500/20 text-yellow-400';
      case 'low':
        return 'border-blue-500/20 text-blue-400';
      default:
        return 'border-gray-500/20 text-gray-400';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-help">
            {getSeverityIcon()}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white truncate">{title}</h4>
              <p className="text-xs text-gray-400 truncate">{category}</p>
            </div>
            <Badge variant="outline" className={getSeverityColor()}>
              {isFixed ? 'Fixed' : severity}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4 bg-gray-900 border border-white/20">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-white mb-1">{title}</h4>
              <Badge variant="outline" className={getSeverityColor()}>
                {category}
              </Badge>
            </div>
            
            <div>
              <h5 className="text-xs font-medium text-gray-300 mb-1">Issue Description</h5>
              <p className="text-xs text-gray-400">{description}</p>
            </div>
            
            <div>
              <h5 className="text-xs font-medium text-gray-300 mb-1">Recommendation</h5>
              <p className="text-xs text-gray-400">{recommendation}</p>
            </div>
            
            {isFixed && (
              <div className="flex items-center gap-1 text-xs text-green-400">
                <CheckCircle className="h-3 w-3" />
                <span>This issue has been resolved</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
