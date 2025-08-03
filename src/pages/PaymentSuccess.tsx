import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId') || searchParams.get('order_id');
  const amount = searchParams.get('amount');
  const packageName = searchParams.get('package') || 'Pro Plan';

  useEffect(() => {
    // Delay to show success animation
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Show success notification
      toast({
        title: "Thanh toán thành công!",
        description: `Tài khoản của bạn đã được nâng cấp lên ${packageName}`,
        duration: 5000,
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [packageName, toast]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const handleViewAccount = () => {
    navigate('/account');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xử lý thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Thanh toán thành công!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-gray-600">
              Cảm ơn bạn đã nâng cấp tài khoản
            </p>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-800">{packageName}</span>
              </div>
              
              {orderId && (
                <p className="text-sm text-gray-500">
                  Mã giao dịch: {orderId}
                </p>
              )}
              
              {amount && (
                <p className="text-sm text-gray-500">
                  Số tiền: {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(parseInt(amount))}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Bắt đầu sử dụng
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              onClick={handleViewAccount}
              variant="outline"
              className="w-full"
            >
              Xem thông tin tài khoản
            </Button>
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <p>✅ Tài khoản đã được kích hoạt</p>
            <p>✅ Tính năng Pro đã sẵn sàng</p>
            <p>✅ Email xác nhận đã được gửi</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}