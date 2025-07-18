import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  progress?: number;
}

export function LoadingSpinner({ size = "md", className, text, progress }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className="relative">
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
      {text && (
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {text}
        </p>
      )}
      {progress !== undefined && (
        <div className="w-full max-w-xs bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}