import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { 
  Key, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  Activity,
  Settings,
  AlertTriangle
} from 'lucide-react';

interface ApiToken {
  id: string;
  token_name: string;
  token_prefix: string;
  permissions: any;
  rate_limit_per_hour: number;
  last_used_at: string | null;
  created_at: string;
  is_active: boolean;
}

export function ApiManagement() {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [showToken, setShowToken] = useState<{ [key: string]: boolean }>({});
  const [newTokenName, setNewTokenName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isLoading, startLoading, stopLoading, loadingText } = useLoadingState();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    if (!user) return;
    
    startLoading('Đang tải API tokens...');
    try {
      const { data, error } = await supabase
        .from('api_tokens')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTokens(data || []);
    } catch (error) {
      handleError(error);
    } finally {
      stopLoading();
    }
  };

  const createToken = async () => {
    if (!user || !newTokenName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên cho API token",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      // Generate a secure random token
      const tokenValue = 'seo_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Hash the token using SHA-256 (this is what gets stored)
      const tokenHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(tokenValue));
      const hashArray = Array.from(new Uint8Array(tokenHash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { data, error } = await supabase
        .from('api_tokens')
        .insert({
          user_id: user.id,
          token_name: newTokenName.trim(),
          token_prefix: tokenValue.substring(0, 12) + '...', // Only store prefix for display
          token_hash: hashHex, // Store hashed token
          permissions: ['scan', 'results', 'history'],
          rate_limit_per_hour: 100
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Token đã tạo",
        description: `API token "${newTokenName}" đã được tạo thành công`,
      });

      // CRITICAL: Show the full token ONCE - user must save it now
      toast({
        title: "⚠️ API Token của bạn - LƯU NGAY",
        description: `${tokenValue} - Token này CHỈ hiển thị MỘT LẦN. Hãy lưu lại ngay!`,
        duration: 15000,
      });

      setNewTokenName('');
      await loadTokens();
    } catch (error) {
      handleError(error);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteToken = async (tokenId: string, tokenName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa token "${tokenName}"?`)) return;

    try {
      const { error } = await supabase
        .from('api_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) throw error;

      toast({
        title: "Đã xóa token",
        description: `Token "${tokenName}" đã được xóa`,
      });

      await loadTokens();
    } catch (error) {
      handleError(error);
    }
  };

  const toggleTokenVisibility = (tokenId: string) => {
    setShowToken(prev => ({
      ...prev,
      [tokenId]: !prev[tokenId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "API token đã được sao chép vào clipboard",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{loadingText}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Token */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Tạo API Token Mới
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Tên API token (ví dụ: My Website Integration)"
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={createToken}
              disabled={isCreating || !newTokenName.trim()}
            >
              {isCreating ? 'Đang tạo...' : 'Tạo Token'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Token sẽ có quyền truy cập scan, xem results và history với giới hạn 100 requests/giờ
          </p>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Hướng dẫn sử dụng API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Endpoint chính:</h4>
            <code className="text-sm">https://ycjdrqyztzweddtcodjo.supabase.co/functions/v1/</code>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Available endpoints:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <code>POST /analyze-website</code> - Phân tích website</li>
              <li>• <code>GET /api-results</code> - Lấy kết quả phân tích</li>
              <li>• <code>POST /generate-pdf-report</code> - Tạo báo cáo PDF</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800">Authentication</h4>
                <p className="text-sm text-yellow-700">
                  Thêm header: <code>Authorization: Bearer YOUR_API_TOKEN</code>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Tokens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Tokens ({tokens.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Chưa có API token nào</p>
              <p className="text-sm text-muted-foreground">Tạo token đầu tiên để bắt đầu sử dụng API</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tokens.map((token) => (
                <div key={token.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{token.token_name}</h4>
                        <Badge variant={token.is_active ? "default" : "secondary"}>
                          {token.is_active ? "Hoạt động" : "Tạm dừng"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>Token:</span>
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {showToken[token.id] ? token.token_prefix : token.token_prefix}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTokenVisibility(token.id)}
                          >
                            {showToken[token.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(token.token_prefix)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div>Tạo: {formatDate(token.created_at)}</div>
                        <div>
                          Lần cuối sử dụng: {token.last_used_at ? formatDate(token.last_used_at) : 'Chưa sử dụng'}
                        </div>
                        <div>Rate limit: {token.rate_limit_per_hour} requests/giờ</div>
                        <div>
                          Permissions: {Array.isArray(token.permissions) ? token.permissions.map(p => (
                            <Badge key={p} variant="outline" className="mr-1 text-xs">
                              {p}
                            </Badge>
                          )) : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {/* TODO: Show usage stats */}}
                      >
                        <Activity className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteToken(token.id, token.token_name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
