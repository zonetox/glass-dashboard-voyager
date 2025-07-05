
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Network, Target, FileText, Loader2, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PillarPage {
  title: string;
  meta_description: string;
  purpose: string;
  target_keywords: string[];
}

interface ClusterArticle {
  title: string;
  meta_description: string;
  purpose: string;
  link_to_pillar: string;
  target_keywords: string[];
}

interface ContentCluster {
  pillar: PillarPage;
  clusters: ClusterArticle[];
}

export function ContentClusterGenerator() {
  const [keyword, setKeyword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentCluster, setContentCluster] = useState<ContentCluster | null>(null);
  const { toast } = useToast();

  const generateContentCluster = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Error",
        description: "Please enter a primary keyword",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('content-cluster', {
        body: { keyword: keyword.trim() }
      });

      if (error) throw error;

      setContentCluster(data);
      toast({
        title: "Success",
        description: "Content cluster generated successfully!"
      });
    } catch (error) {
      console.error('Error generating content cluster:', error);
      toast({
        title: "Error",
        description: "Failed to generate content cluster. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Network className="h-5 w-5 text-purple-400" />
            Content Cluster Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Primary Keyword
              </label>
              <div className="flex gap-2">
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g., natural sunscreen"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && generateContentCluster()}
                />
                <Button 
                  onClick={generateContentCluster}
                  disabled={isGenerating}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Generate Cluster
                    </>
                  )}
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-400">
              Generate a comprehensive content cluster with 1 pillar page and 5-8 supporting articles 
              to establish topical authority for your target keyword.
            </p>
          </div>
        </CardContent>
      </Card>

      {contentCluster && (
        <div className="space-y-6">
          {/* Pillar Page */}
          <Card className="glass-card border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-blue-400" />
                Pillar Page
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-white">Title</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(contentCluster.pillar.title)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-blue-300">{contentCluster.pillar.title}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-white">Meta Description</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(contentCluster.pillar.meta_description)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-gray-300">{contentCluster.pillar.meta_description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Purpose</h3>
                <p className="text-gray-300">{contentCluster.pillar.purpose}</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Target Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {contentCluster.pillar.target_keywords.map((keyword, index) => (
                    <Badge key={index} className="bg-blue-500/20 text-blue-300 border-blue-500/20">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cluster Articles */}
          <Card className="glass-card border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-white">
                <Network className="h-5 w-5 text-green-400" />
                Supporting Cluster Articles ({contentCluster.clusters.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {contentCluster.clusters.map((cluster, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white">Title</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(cluster.title)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-green-300">{cluster.title}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white">Meta Description</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(cluster.meta_description)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-gray-300 text-sm">{cluster.meta_description}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-white mb-1">Purpose</h4>
                        <p className="text-gray-300 text-sm">{cluster.purpose}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-white mb-1">Connection to Pillar</h4>
                        <p className="text-yellow-300 text-sm">{cluster.link_to_pillar}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-white mb-2">Target Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {cluster.target_keywords.map((keyword, kidx) => (
                            <Badge key={kidx} className="bg-green-500/20 text-green-300 border-green-500/20">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {index < contentCluster.clusters.length - 1 && (
                      <Separator className="mt-4 bg-white/10" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
