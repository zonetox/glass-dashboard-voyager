import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { History, Download, Eye, Calendar, CreditCard } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type PaymentOrder = Database['public']['Tables']['payment_orders']['Row'];

export function BillingHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBillingHistory();
    }
  }, [user]);

  const loadBillingHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading billing history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400">Thành công</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Đang xử lý</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400">Thất bại</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500/20 text-gray-400">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'momo': return 'MoMo';
      case 'vnpay': return 'VNPay';
      case 'paypal': return 'PayPal';
      default: return method;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="w-5 h-5 mr-2" />
          Lịch sử thanh toán ({orders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">#{order.id.slice(0, 8)}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.created_at).toLocaleDateString('vi-VN')}
                        </span>
                        <span>{getPaymentMethodName(order.payment_method)}</span>
                        <span className="font-medium text-foreground">
                          {formatPrice(order.amount)}
                        </span>
                      </div>
                      {order.transaction_id && (
                        <div className="text-xs">
                          Mã GD: {order.transaction_id}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Chi tiết
                  </Button>
                  {order.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Hóa đơn
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium mb-2">Chưa có lịch sử thanh toán</h4>
            <p className="text-sm text-muted-foreground">
              Lịch sử giao dịch sẽ xuất hiện ở đây sau khi bạn thực hiện thanh toán
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}