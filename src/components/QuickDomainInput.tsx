import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Globe, Search, Clipboard, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickDomainInputProps {
  onAnalyze?: (url: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function QuickDomainInput({ 
  onAnalyze, 
  placeholder = "Nhập domain (vd: example.com)", 
  size = 'md',
  className = ''
}: QuickDomainInputProps) {
  const [url, setUrl] = useState('');
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (!url.trim()) return;
    
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    onAnalyze?.(formattedUrl);
    setUrl('');
    
    toast({
      title: "🚀 Bắt đầu phân tích",
      description: `Đang phân tích ${formattedUrl}...`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text.trim());
      toast({
        title: "📋 Đã dán từ clipboard",
        description: "URL đã được dán vào ô nhập",
      });
    } catch (err) {
      toast({
        title: "❌ Lỗi",
        description: "Không thể truy cập clipboard",
        variant: "destructive"
      });
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'max-w-sm',
          input: 'pl-8 pr-16 h-9 text-sm',
          button: 'h-7 px-2 text-xs',
          icon: 'h-3 w-3',
          pasteButton: 'h-7 w-7'
        };
      case 'lg':
        return {
          container: 'max-w-2xl',
          input: 'pl-12 pr-24 h-12 text-base',
          button: 'h-10 px-4',
          icon: 'h-5 w-5',
          pasteButton: 'h-10 w-10'
        };
      default: // md
        return {
          container: 'max-w-md',
          input: 'pl-10 pr-20 h-10',
          button: 'h-8 px-3 text-sm',
          icon: 'h-4 w-4',
          pasteButton: 'h-8 w-8'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <TooltipProvider>
      <div className={`relative ${sizeClasses.container} ${className}`}>
        <div className="relative">
          <Globe className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${sizeClasses.icon}`} />
          
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className={`${sizeClasses.input} bg-white/5 border-white/20 focus:border-blue-400 text-white placeholder:text-gray-400`}
          />
          
          {/* Paste Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handlePasteFromClipboard}
                variant="ghost"
                size="icon"
                className={`absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white hover:bg-white/10 ${sizeClasses.pasteButton}`}
              >
                <Clipboard className={sizeClasses.icon} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Dán từ clipboard</p>
            </TooltipContent>
          </Tooltip>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={!url.trim()}
            size="sm"
            className={`absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white ${sizeClasses.button}`}
          >
            {size === 'sm' ? (
              <Zap className={sizeClasses.icon} />
            ) : (
              <>
                <Search className={`${sizeClasses.icon} mr-1`} />
                {size === 'lg' ? 'Phân tích ngay' : 'Phân tích'}
              </>
            )}
          </Button>
        </div>
        
        {/* Quick domain suggestions */}
        {size === 'lg' && (
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-xs text-gray-400">Thử ngay:</span>
            {['github.com', 'stackoverflow.com', 'medium.com'].map((domain) => (
              <button
                key={domain}
                onClick={() => setUrl(domain)}
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                {domain}
              </button>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}