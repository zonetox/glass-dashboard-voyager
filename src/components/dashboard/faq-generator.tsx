
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpCircle, Copy, Download, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQResult {
  faqs: FAQ[];
  schema: object;
  html_embed: string;
}

export function FAQGenerator() {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [faqResult, setFaqResult] = useState<FAQResult | null>(null);
  const { toast } = useToast();

  const generateFAQ = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter article content",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('api-faq-schema', {
        body: { 
          content: content.trim()
        }
      });

      if (error) throw error;

      setFaqResult({
        faqs: data.faqs || [],
        schema: data.schema || {},
        html_embed: data.html_embed || ''
      });
      
      toast({
        title: "Success",
        description: "FAQ schema generated successfully!"
      });
    } catch (error) {
      console.error('Error generating FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to generate FAQ. Please try again.",
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

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <HelpCircle className="h-5 w-5 text-purple-400" />
            FAQ Schema Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div>
              <Label className="text-gray-300 mb-2 block">Article Content *</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your article content here to generate relevant FAQs..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 min-h-[150px]"
              />
            </div>
          </div>

          <Button 
            onClick={generateFAQ}
            disabled={isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating FAQ...
              </>
            ) : (
              <>
                <HelpCircle className="h-4 w-4 mr-2" />
                Generate FAQ Schema
              </>
            )}
          </Button>

          <p className="text-sm text-gray-400 mt-4">
            AI will analyze your content and create 3-5 relevant frequently asked questions with concise answers and proper JSON-LD schema markup.
          </p>
        </CardContent>
      </Card>

      {faqResult && (
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-white">
              <span className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-green-400" />
                Generated FAQ Schema
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(faqResult.html_embed, 'faq-schema.html')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 bg-white/5">
                <TabsTrigger value="preview" className="text-white data-[state=active]:bg-white/10">
                  FAQ Preview
                </TabsTrigger>
                <TabsTrigger value="schema" className="text-white data-[state=active]:bg-white/10">
                  JSON-LD Schema
                </TabsTrigger>
                <TabsTrigger value="html" className="text-white data-[state=active]:bg-white/10">
                  HTML Embed
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
                <div className="space-y-6">
                  {faqResult.faqs.map((faq, index) => (
                    <div key={index} className="border border-white/20 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-xs font-semibold">Q</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-semibold">A</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="schema">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => copyToClipboard(JSON.stringify(faqResult.schema, null, 2))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Textarea
                    value={JSON.stringify(faqResult.schema, null, 2)}
                    readOnly
                    className="min-h-[400px] bg-white/5 border-white/10 text-white font-mono text-sm"
                  />
                </div>
              </TabsContent>

              <TabsContent value="html">
                <div className="space-y-4">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-400 mb-2">How to use:</h4>
                    <p className="text-gray-300 text-sm">
                      Copy the HTML code below and paste it into the &lt;head&gt; section of your webpage. 
                      This will add structured data that helps search engines understand your FAQ content.
                    </p>
                  </div>
                  
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 z-10"
                      onClick={() => copyToClipboard(faqResult.html_embed)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Textarea
                      value={faqResult.html_embed}
                      readOnly
                      className="min-h-[300px] bg-white/5 border-white/10 text-white font-mono text-sm"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
