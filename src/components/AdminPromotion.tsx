import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Crown, UserCheck } from 'lucide-react';

export default function AdminPromotion() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const promoteToAdmin = async () => {
    if (!email.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('promote-admin', {
        body: { email: email.trim() }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "✅ Thành công",
          description: `Đã thăng cấp ${email} thành admin`,
        });
        setEmail('');
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error promoting to admin:', error);
      toast({
        title: "❌ Lỗi",
        description: error.message || "Không thể thăng cấp admin",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Thăng cấp Admin
        </CardTitle>
        <CardDescription>
          Thăng cấp người dùng thành quản trị viên hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email người dùng</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </div>
        
        <Button 
          onClick={promoteToAdmin}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang xử lý...
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4 mr-2" />
              Thăng cấp Admin
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded">
          <strong>Lưu ý:</strong> Người dùng sẽ được:
          <ul className="mt-1 list-disc list-inside space-y-1">
            <li>Thăng cấp thành Admin</li>
            <li>Nâng cấp lên gói Enterprise</li>
            <li>Được 1000 lượt scan/tháng</li>
            <li>Quyền truy cập tất cả tính năng</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}