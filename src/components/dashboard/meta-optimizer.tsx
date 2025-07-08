
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Copy, Download, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MetaSuggestion {
  title: string;
  meta_description: string;
  focus_keyword: string;
}

interface GooglePreview {
  title: string;
  url: string;
  description: string;
}

export function MetaOptimizer() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<MetaSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<MetaSuggestion | null>(null);
  const { toast } = useToast();

  const generateSuggestions = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and content fields",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('api-metasuggest', {
        body: { 
          title: title.trim(),
          content: content.trim()
        }
      });

      if (error) throw error;

      setSuggestions(data.suggestions || []);
      toast({
        title: "Success",
        description: "Meta tag suggestions generated successfully!"
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate suggestions. Please try again.",
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
      description: "Content copied to clipboard"
    });
  };

  const selectSuggestion = (suggestion: MetaSuggestion) => {
    setSelectedSuggestion(suggestion);
    toast({
      title: "Selected",
      description: "Meta tags selected for implementation"
    });
  };

  const GooglePreviewCard = ({ suggestion }: { suggestion: MetaSuggestion }) => (
    <div className="border border-gray-300 rounded-lg p-4 bg-white text-black max-w-md">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">G</span>
        </div>
        <span className="text-sm text-gray-600">www.example.com</span>
      </div>
      <h3 className="text-lg text-blue-600 hover:underline cursor-pointer mb-1">
        {suggestion.title}
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed">
        {suggestion.meta_description}
      </p>
      <div className="flex items-center gap-2 mt-2">
        <Badge variant="secondary" className="text-xs">
          {suggestion.focus_keyword}
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Search className="h-5 w-5 text-blue-400" />
            Meta Tag Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div>
              <Label className="text-gray-300 mb-2 block">Article Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your article title"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Article Content *</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your article content here..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 min-h-[120px]"
              />
            </div>
          </div>

          <Button 
            onClick={generateSuggestions}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Suggestions...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Generate Meta Tag Suggestions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-white">Meta Tag Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="border border-white/20 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Option {index + 1}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectSuggestion(suggestion)}
                        className={`${selectedSuggestion === suggestion ? 'bg-green-500/20 border-green-500 text-green-400' : 'border-white/20 text-white'}`}
                      >
                        {selectedSuggestion === suggestion ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Selected
                          </>
                        ) : (
                          'Select'
                        )}
                      </Button>
                    </div>
                  </div>

                  <Tabs defaultValue="preview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/5">
                      <TabsTrigger value="preview" className="text-white data-[state=active]:bg-white/10">
                        Google Preview
                      </TabsTrigger>
                      <TabsTrigger value="tags" className="text-white data-[state=active]:bg-white/10">
                        Meta Tags
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview" className="space-y-4">
                      <GooglePreviewCard suggestion={suggestion} />
                    </TabsContent>

                    <TabsContent value="tags" className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label className="text-gray-300">Title Tag ({suggestion.title.length}/60)</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(suggestion.title)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="bg-gray-800 p-3 rounded font-mono text-sm text-green-400">
                          {suggestion.title}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label className="text-gray-300">Meta Description ({suggestion.meta_description.length}/155)</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(suggestion.meta_description)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="bg-gray-800 p-3 rounded font-mono text-sm text-green-400">
                          {suggestion.meta_description}
                        </div>
                      </div>

                      <div>
                        <Label className="text-gray-300 mb-2 block">HTML Code</Label>
                        <div className="bg-gray-800 p-3 rounded font-mono text-sm text-gray-300 relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(`<title>${suggestion.title}</title>\n<meta name="description" content="${suggestion.meta_description}">`)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <div>{`<title>${suggestion.title}</title>`}</div>
                          <div>{`<meta name="description" content="${suggestion.meta_description}">`}</div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
