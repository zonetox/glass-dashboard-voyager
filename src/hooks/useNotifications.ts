import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

export interface NotificationConfig {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export function useNotifications() {
  const { toast } = useToast();

  const showNotification = useCallback((config: NotificationConfig) => {
    toast({
      title: config.title,
      description: config.description,
      variant: config.variant || 'default',
      duration: config.duration || 5000,
    });
  }, [toast]);

  const showSEOAnalysisComplete = useCallback((websiteUrl: string, score?: number) => {
    showNotification({
      title: "🎉 SEO Analysis Complete",
      description: `Analysis finished for ${websiteUrl}${score ? ` - Score: ${score}/100` : ''}`,
    });
  }, [showNotification]);

  const showAIFixComplete = useCallback((changesCount: number) => {
    showNotification({
      title: "✨ AI Optimization Complete",
      description: `Successfully applied ${changesCount} AI improvements to your website`,
    });
  }, [showNotification]);

  const showUsageLimitReached = useCallback((limitType: 'scans' | 'optimizations' | 'ai_rewrites') => {
    const messages = {
      scans: "You've reached your monthly scan limit",
      optimizations: "You've reached your monthly optimization limit", 
      ai_rewrites: "You've reached your monthly AI rewrite limit"
    };

    showNotification({
      title: "⚠️ Usage Limit Reached",
      description: `${messages[limitType]}. Upgrade your plan to continue.`,
      variant: 'destructive',
      duration: 7000,
    });
  }, [showNotification]);

  const showPDFGenerationComplete = useCallback((downloadUrl?: string) => {
    showNotification({
      title: "📄 PDF Report Ready",
      description: downloadUrl 
        ? "Your PDF report has been generated and is ready for download"
        : "Your PDF report has been generated successfully",
    });
  }, [showNotification]);

  const showBackupCreated = useCallback((websiteUrl: string) => {
    showNotification({
      title: "🛡️ Backup Created",
      description: `Website backup created for ${websiteUrl} before applying changes`,
    });
  }, [showNotification]);

  const showError = useCallback((title: string, description?: string) => {
    showNotification({
      title,
      description,
      variant: 'destructive',
    });
  }, [showNotification]);

  return {
    showNotification,
    showSEOAnalysisComplete,
    showAIFixComplete,
    showUsageLimitReached,
    showPDFGenerationComplete,
    showBackupCreated,
    showError,
  };
}