import React from 'react';
import { Loader2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatusIndicatorProps {
  status: 'idle' | 'loading' | 'success' | 'error' | 'warning';
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusIndicator({ 
  status, 
  message, 
  className,
  size = 'md' 
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', 
    lg: 'h-6 w-6'
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Loader2 className={cn(sizeClasses[size], 'animate-spin text-blue-500')} />,
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          textColor: 'text-blue-700 dark:text-blue-300',
          borderColor: 'border-blue-200 dark:border-blue-800'
        };
      case 'success':
        return {
          icon: <CheckCircle2 className={cn(sizeClasses[size], 'text-green-500')} />,
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          textColor: 'text-green-700 dark:text-green-300',
          borderColor: 'border-green-200 dark:border-green-800'
        };
      case 'error':
        return {
          icon: <AlertTriangle className={cn(sizeClasses[size], 'text-red-500')} />,
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          textColor: 'text-red-700 dark:text-red-300',
          borderColor: 'border-red-200 dark:border-red-800'
        };
      case 'warning':
        return {
          icon: <Clock className={cn(sizeClasses[size], 'text-yellow-500')} />,
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
          textColor: 'text-yellow-700 dark:text-yellow-300',
          borderColor: 'border-yellow-200 dark:border-yellow-800'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config || status === 'idle') return null;

  return (
    <div 
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
        config.bgColor,
        config.textColor, 
        config.borderColor,
        className
      )}
    >
      {config.icon}
      {message && <span>{message}</span>}
    </div>
  );
}

export default StatusIndicator;