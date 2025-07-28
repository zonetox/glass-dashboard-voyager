import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface PaymentMethodSelectorProps {
  packageId: string;
  packageName: string;
  price: number;
  onPaymentSuccess?: () => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'momo',
    name: 'MoMo',
    icon: '💳',
    description: 'Thanh toán qua ví điện tử MoMo',
    color: 'bg-pink-500'
  },
  {
    id: 'vnpay',
    name: 'VNPay',
    icon: '🏦',
    description: 'Thanh toán qua VNPay (ATM/Visa/Master)',
    color: 'bg-blue-500'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '🌐',
    description: 'Thanh toán quốc tế qua PayPal',
    color: 'bg-blue-600'
  }
];

export function PaymentMethodSelector({ 
  packageId, 
  packageName, 
  price, 
  onPaymentSuccess 
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('momo');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatPrice = (priceVnd: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(priceVnd);
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn phương thức thanh toán",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-vietnam', {
        body: {
          payment_method: selectedMethod,
          package_id: packageId,
          amount: price,
          package_name: packageName,
          return_url: `${window.location.origin}/payment-success`,
          cancel_url: `${window.location.origin}/payment-cancel`
        }
      });

      if (error) throw error;

      if (data?.payment_url) {
        // Redirect to payment gateway
        window.location.href = data.payment_url;
      } else {
        throw new Error('Không nhận được URL thanh toán');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Lỗi thanh toán",
        description: error.message || "Không thể tạo giao dịch thanh toán",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Chọn phương thức thanh toán</span>
          <Badge variant="outline">{packageName}</Badge>
        </CardTitle>
        <CardDescription>
          Tổng thanh toán: <span className="font-bold text-primary">{formatPrice(price)}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
              <RadioGroupItem value={method.id} id={method.id} />
              <Label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer flex-1">
                <div className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center text-white text-lg`}>
                  {method.icon}
                </div>
                <div>
                  <div className="font-medium">{method.name}</div>
                  <div className="text-sm text-muted-foreground">{method.description}</div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <Button 
          onClick={handlePayment} 
          disabled={loading || !selectedMethod}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            `Thanh toán ${formatPrice(price)}`
          )}
        </Button>

        <div className="text-xs text-center text-muted-foreground">
          <p>🔒 Giao dịch được bảo mật bởi SSL</p>
          <p>💼 Thanh toán an toàn qua các nhà cung cấp uy tín</p>
        </div>
      </CardContent>
    </Card>
  );
}