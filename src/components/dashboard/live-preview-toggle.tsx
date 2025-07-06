
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, ExternalLink, Smartphone, Monitor } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LivePreviewToggleProps {
  originalUrl: string;
  previewUrl?: string;
  isOptimized?: boolean;
}

export function LivePreviewToggle({ 
  originalUrl, 
  previewUrl, 
  isOptimized = false 
}: LivePreviewToggleProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');

  const currentUrl = isPreviewMode && previewUrl ? previewUrl : originalUrl;

  return (
    <Card className="glass-card border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-medium">Live Preview</h3>
            {isOptimized && (
              <Badge className="bg-green-500/20 border-green-500/20 text-green-400">
                Optimized
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeviceView(deviceView === 'desktop' ? 'mobile' : 'desktop')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              {deviceView === 'desktop' ? 
                <Monitor className="h-4 w-4" /> : 
                <Smartphone className="h-4 w-4" />
              }
            </Button>
            
            {previewUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {isPreviewMode ? 'Original' : 'Preview'}
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(currentUrl, '_blank')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="bg-gray-100 px-4 py-2 border-b flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-600 truncate">
              {currentUrl}
            </div>
            {isPreviewMode && (
              <Badge className="bg-blue-500/20 border-blue-500/20 text-blue-600 text-xs">
                Optimized
              </Badge>
            )}
          </div>
          
          <iframe
            src={currentUrl}
            className={`w-full border-none ${
              deviceView === 'desktop' ? 'h-96' : 'h-[600px] max-w-sm mx-auto'
            }`}
            title={`Preview of ${new URL(currentUrl).hostname}`}
          />
        </div>
        
        <div className="mt-3 text-xs text-gray-400 text-center">
          {isPreviewMode ? (
            <span>Showing optimized version of your website</span>
          ) : (
            <span>Showing current live version</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
