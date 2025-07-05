
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Link, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InternalLink {
  url: string;
  anchor: string;
  description?: string;
}

interface InsertedLink {
  anchor: string;
  url: string;
  position: string;
  context: string;
}

interface InternalLinksResponse {
  modifiedContent: string;
  insertedLinks: InsertedLink[];
}

export function InternalLinksOptimizer() {
  const [content, setContent] = useState('');
  const [links, setLinks] = useState<InternalLink[]>([{ url: '', anchor: '', description: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InternalLinksResponse | null>(null);
  const [copiedContent, setCopiedContent] = useState(false);

  const addLink = () => {
    setLinks([...links, { url: '', anchor: '', description: '' }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof InternalLink, value: string) => {
    const updatedLinks = links.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    );
    setLinks(updatedLinks);
  };

  const handleOptimize = async () => {
    if (!content.trim()) {
      toast.error('Please provide content to optimize');
      return;
    }

    const validLinks = links.filter(link => link.url.trim() && link.anchor.trim());
    if (validLinks.length === 0) {
      toast.error('Please provide at least one valid internal link');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('internal-links', {
        body: {
          content: content.trim(),
          links: validLinks
        }
      });

      if (error) throw error;

      setResult(data);
      toast.success(`Successfully inserted ${data.insertedLinks.length} internal links`);
    } catch (error) {
      console.error('Internal links optimization error:', error);
      toast.error('Failed to optimize internal links. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedContent(true);
      toast.success('Content copied to clipboard');
      setTimeout(() => setCopiedContent(false), 2000);
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const handleReset = () => {
    setContent('');
    setLinks([{ url: '', anchor: '', description: '' }]);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Link className="h-5 w-5" />
            Internal Links Optimizer
          </CardTitle>
          <CardDescription className="text-gray-400">
            Use AI to automatically insert internal links at optimal positions in your content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Input */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-white">
              Content to Optimize
            </Label>
            <Textarea
              id="content"
              placeholder="Paste your article content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] bg-white/5 border-white/10 text-white placeholder-gray-400"
            />
          </div>

          {/* Internal Links */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white">Internal Links to Insert</Label>
              <Button
                type="button"
                onClick={addLink}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Link
              </Button>
            </div>

            {links.map((link, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-400">URL</Label>
                  <Input
                    placeholder="https://example.com/page"
                    value={link.url}
                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-gray-400">Anchor Text</Label>
                  <Input
                    placeholder="Link text"
                    value={link.anchor}
                    onChange={(e) => updateLink(index, 'anchor', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-gray-400">Description (Optional)</Label>
                  <Input
                    placeholder="What this page is about"
                    value={link.description}
                    onChange={(e) => updateLink(index, 'description', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={() => removeLink(index)}
                    size="sm"
                    variant="destructive"
                    disabled={links.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleOptimize}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing Links...
                </>
              ) : (
                'Optimize Internal Links'
              )}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Optimization Results</CardTitle>
            <CardDescription className="text-gray-400">
              {result.insertedLinks.length} internal links inserted successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Inserted Links Summary */}
            {result.insertedLinks.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-white font-medium">Inserted Links:</h4>
                <div className="space-y-2">
                  {result.insertedLinks.map((link, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                          {link.anchor}
                        </Badge>
                        <span className="text-blue-400 text-sm">{link.url}</span>
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        Position: {link.position}
                      </div>
                      <div className="text-sm text-gray-300 italic">
                        "{link.context}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optimized Content */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">Optimized Content:</h4>
                <Button
                  onClick={() => copyToClipboard(result.modifiedContent)}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {copiedContent ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy HTML
                    </>
                  )}
                </Button>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {result.modifiedContent}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
