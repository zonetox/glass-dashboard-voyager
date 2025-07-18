import { AlertTriangle, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'default' | 'destructive';
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessage({ 
  title = "Error", 
  message, 
  variant = "destructive", 
  onRetry, 
  onDismiss,
  className 
}: ErrorMessageProps) {
  return (
    <Alert variant={variant} className={cn("glass-card border-red-500/20 bg-red-500/5", className)}>
      <AlertTriangle className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle className="text-red-400 mb-1">{title}</AlertTitle>
        <AlertDescription className="text-red-300 text-sm mb-3">
          {message}
        </AlertDescription>
        <div className="flex items-center gap-2">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Try Again
            </Button>
          )}
          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <X className="mr-1 h-3 w-3" />
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}