import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw } from 'lucide-react';

interface DemoVideoProps {
  className?: string;
}

export function DemoVideo({ className }: DemoVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Demo video features showcase
  const features = [
    { time: "0:05", title: "Website Analysis", description: "AI-powered SEO scanning" },
    { time: "0:25", title: "Real-time Optimization", description: "One-click AI fixes" },
    { time: "0:45", title: "Progress Tracking", description: "SEO score monitoring" },
    { time: "1:05", title: "Professional Reports", description: "PDF report generation" },
    { time: "1:25", title: "Competitor Analysis", description: "Market comparison tools" }
  ];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Video Player */}
      <Card className="glass-card border-white/10 overflow-hidden">
        <CardContent className="p-0">
          <div 
            className="relative bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 aspect-video cursor-pointer group"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            {/* Video Placeholder with Demo Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm border border-primary/30">
                  {isPlaying ? (
                    <Pause className="h-8 w-8 text-primary" />
                  ) : (
                    <Play className="h-8 w-8 text-primary ml-1" />
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">SEO Auto Tool Demo</h3>
                  <p className="text-gray-300 text-sm max-w-md">
                    Watch how our AI analyzes and optimizes your website in real-time
                  </p>
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                    ● LIVE DEMO
                  </Badge>
                </div>
              </div>
            </div>

            {/* Play Button Overlay */}
            <button
              onClick={handlePlayPause}
              className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-all duration-300"
            >
              <div className="w-20 h-20 bg-primary/80 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/20 shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                {isPlaying ? (
                  <Pause className="h-8 w-8 text-white" />
                ) : (
                  <Play className="h-8 w-8 text-white ml-1" />
                )}
              </div>
            </button>

            {/* Video Controls */}
            {showControls && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <span className="text-white text-sm">1:45 / 1:45</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-2 bg-white/20 rounded-full h-1">
                  <div 
                    className="bg-primary rounded-full h-1 transition-all duration-1000"
                    style={{ width: isPlaying ? "65%" : "0%" }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Demo Features Timeline */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <Card 
            key={index}
            className="glass-card border-white/10 hover:border-primary/30 transition-all duration-300 cursor-pointer group"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-xs">
                  {feature.time}
                </Badge>
                <div className="flex-1">
                  <h4 className="font-medium text-white group-hover:text-primary transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Demo Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">1:45</div>
          <div className="text-sm text-gray-400">Demo Duration</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent">5</div>
          <div className="text-sm text-gray-400">Key Features</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">100%</div>
          <div className="text-sm text-gray-400">Real Functionality</div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border border-primary/20">
        <h3 className="text-lg font-semibold text-white mb-2">
          Ready to try it yourself?
        </h3>
        <p className="text-gray-300 text-sm mb-4">
          Start your free trial and experience the power of AI-driven SEO optimization
        </p>
        <Button className="bg-primary hover:bg-primary/90">
          Start Free Trial
        </Button>
      </div>
    </div>
  );
}