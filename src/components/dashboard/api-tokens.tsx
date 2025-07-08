import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Copy, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface APIToken {
  id: string;
  token_name: string;
  token_prefix: string;
  permissions: string[];
  rate_limit_per_hour: number;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export function APITokens() {
  const [tokens, setTokens] = useState<APIToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [showDocs, setShowDocs] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTokens();
    }
  }, [user]);

  const fetchTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('api_tokens')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = data?.map(token => ({
        ...token,
        permissions: Array.isArray(token.permissions) 
          ? (token.permissions as string[])
          : ['scan', 'results', 'history']
      })) || [];
      
      setTokens(transformedData);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API tokens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createToken = async () => {
    if (!newTokenName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a token name",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      // Generate a random token
      const tokenValue = 'sat_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const { error } = await supabase
        .from('api_tokens')
        .insert({
          user_id: user?.id,
          token_name: newTokenName,
          token_hash: tokenValue,
          token_prefix: tokenValue.substring(0, 8) + '...',
          permissions: ['scan', 'results', 'history'],
          rate_limit_per_hour: 100
        });

      if (error) throw error;

      setGeneratedToken(tokenValue);
      setNewTokenName('');
      fetchTokens();
      
      toast({
        title: "Success",
        description: "API token created successfully",
      });
    } catch (error) {
      console.error('Error creating token:', error);
      toast({
        title: "Error",
        description: "Failed to create API token",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteToken = async (tokenId: string) => {
    try {
      const { error } = await supabase
        .from('api_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) throw error;
      
      fetchTokens();
      toast({
        title: "Success",
        description: "API token deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting token:', error);
      toast({
        title: "Error",
        description: "Failed to delete API token",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Token copied to clipboard",
    });
  };

  const apiDocumentation = `
# SEO Auto Tool API Documentation

## Authentication
Include your API token in the Authorization header:
\`Authorization: Bearer YOUR_API_TOKEN\`

## Endpoints

### 1. Trigger Website Scan
\`\`\`bash
curl -X POST "https://ycjdrqyztzweddtcodjo.supabase.co/functions/v1/api-scan" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'
\`\`\`

### 2. Get Scan Results
\`\`\`bash
curl "https://ycjdrqyztzweddtcodjo.supabase.co/functions/v1/api-results?url=https://example.com&limit=10" \\
  -H "Authorization: Bearer YOUR_API_TOKEN"
\`\`\`

### 3. Get All Results
\`\`\`bash
curl "https://ycjdrqyztzweddtcodjo.supabase.co/functions/v1/api-results" \\
  -H "Authorization: Bearer YOUR_API_TOKEN"
\`\`\`

### 4. Meta Tag Suggestions
\`\`\`bash
curl -X POST "https://ycjdrqyztzweddtcodjo.supabase.co/functions/v1/api-metasuggest" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Your Article Title", "content": "Your article content..."}'
\`\`\`

### 5. Generate FAQ Schema
\`\`\`bash
curl -X POST "https://ycjdrqyztzweddtcodjo.supabase.co/functions/v1/api-faq-schema" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"content": "Your article content..."}'
\`\`\`

## Node.js Example
\`\`\`javascript
const fetch = require('node-fetch');

const API_TOKEN = 'YOUR_API_TOKEN';
const BASE_URL = 'https://ycjdrqyztzweddtcodjo.supabase.co/functions/v1';

// Generate meta suggestions
async function getMetaSuggestions(title, content) {
  const response = await fetch(\`\${BASE_URL}/api-metasuggest\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_TOKEN}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, content })
  });
  return response.json();
}

// Generate FAQ schema
async function generateFAQSchema(content) {
  const response = await fetch(\`\${BASE_URL}/api-faq-schema\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_TOKEN}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content })
  });
  return response.json();
}
\`\`\`

## Python Example
\`\`\`python
import requests

API_TOKEN = 'YOUR_API_TOKEN'
BASE_URL = 'https://ycjdrqyztzweddtcodjo.supabase.co/functions/v1'

def get_meta_suggestions(title, content):
    response = requests.post(
        f'{BASE_URL}/api-metasuggest',
        headers={
            'Authorization': f'Bearer {API_TOKEN}',
            'Content-Type': 'application/json'
        },
        json={'title': title, 'content': content}
    )
    return response.json()

def generate_faq_schema(content):
    response = requests.post(
        f'{BASE_URL}/api-faq-schema',
        headers={
            'Authorization': f'Bearer {API_TOKEN}',
            'Content-Type': 'application/json'
        },
        json={'content': content}
    )
    return response.json()
\`\`\`

## Rate Limits
- Default: 100 requests per hour per token
- Rate limits reset every hour
- 429 status code returned when limit exceeded
`;

  if (loading) {
    return <div className="text-center py-8">Loading API tokens...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">API Tokens</h2>
          <p className="text-gray-400">Manage your API tokens for programmatic access</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowDocs(!showDocs)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            {showDocs ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showDocs ? 'Hide' : 'Show'} Docs
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Token
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create New API Token</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tokenName" className="text-white">Token Name</Label>
                  <Input
                    id="tokenName"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    placeholder="e.g., Production App, Development"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <Button 
                  onClick={createToken} 
                  disabled={creating}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  {creating ? 'Creating...' : 'Create Token'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {generatedToken && (
        <Card className="glass-card border-green-500/20">
          <CardHeader>
            <CardTitle className="text-green-400">Token Created Successfully!</CardTitle>
            <CardDescription className="text-gray-400">
              Copy this token now - you won't be able to see it again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
              <code className="flex-1 text-green-400 font-mono text-sm">{generatedToken}</code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(generatedToken)}
                className="border-green-500/20 text-green-400 hover:bg-green-500/10"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setGeneratedToken(null)}
              className="mt-2 border-gray-600 text-gray-400"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {showDocs && (
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">API Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={apiDocumentation}
              readOnly
              className="h-96 bg-gray-800 border-gray-600 text-gray-300 font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {tokens.map((token) => (
          <Card key={token.id} className="glass-card border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{token.token_name}</h3>
                    <Badge className={token.is_active 
                      ? "bg-green-500/20 text-green-400 border-green-500/20"
                      : "bg-gray-500/20 text-gray-400 border-gray-500/20"
                    }>
                      {token.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 font-mono">{token.token_prefix}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Rate limit: {token.rate_limit_per_hour}/hour</span>
                    <span>Created: {new Date(token.created_at).toLocaleDateString()}</span>
                    {token.last_used_at && (
                      <span>Last used: {new Date(token.last_used_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteToken(token.id)}
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {tokens.length === 0 && (
          <Card className="glass-card border-white/10">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-400">No API tokens created yet</p>
              <p className="text-sm text-gray-500 mt-1">Create your first token to start using the API</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
