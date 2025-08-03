import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';

export default function PaymentCancel() {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/subscription-plans');
  };

  const handleBackHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            Thanh toán bị hủy
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-gray-600">
              Giao dịch thanh toán đã bị hủy bỏ
            </p>
            <p className="text-sm text-gray-500">
              Bạn có thể thử lại hoặc chọn phương thức thanh toán khác
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleRetry}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Thử lại thanh toán
            </Button>
            
            <Button 
              onClick={handleBackHome}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </div>

          <div className="text-sm text-gray-500">
            <p>💡 Lưu ý: Tài khoản của bạn vẫn ở gói hiện tại</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}