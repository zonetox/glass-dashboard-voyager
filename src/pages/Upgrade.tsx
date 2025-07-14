import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Wallet, Smartphone, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const paymentMethods = [
  {
    name: "Stripe",
    icon: CreditCard,
    description: "Thẻ tín dụng/ghi nợ quốc tế",
    endpoint: "create-stripe-checkout",
    color: "from-blue-500 to-blue-600"
  },
  {
    name: "PayPal",
    icon: Wallet,
    description: "Ví điện tử toàn cầu",
    endpoint: "create-paypal-checkout",
    color: "from-blue-600 to-blue-700"
  },
  {
    name: "Momo",
    icon: Smartphone,
    description: "Ví điện tử Việt Nam",
    endpoint: "create-momo-checkout",
    color: "from-pink-500 to-pink-600"
  },
  {
    name: "VNPay",
    icon: Building2,
    description: "Cổng thanh toán Việt Nam",
    endpoint: "create-vnpay-checkout",
    color: "from-red-500 to-red-600"
  }
];

export default function Upgrade() {
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handlePayment = async (method: typeof paymentMethods[0]) => {
    try {
      const { data, error } = await supabase.functions.invoke(method.endpoint, {
        body: { plan: "pro" }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tạo link thanh toán",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tạo link thanh toán",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
      <div className="max-w-4xl mx-auto pt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Nâng cấp lên <span className="text-primary">Pro</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Mở khóa tất cả tính năng cao cấp và tăng giới hạn sử dụng với gói Pro
          </p>
        </div>

        {/* Pricing Card */}
        <Card className="mb-12 bg-white/5 backdrop-blur-lg border-white/10 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">Gói Pro</CardTitle>
            <CardDescription className="text-lg">
              <span className="text-4xl font-bold text-foreground">799,000₫</span>
              <span className="text-muted-foreground">/tháng</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-foreground">Tính năng Pro:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ Unlimited SEO scans</li>
                  <li>✓ AI-powered analysis</li>
                  <li>✓ PDF reports</li>
                  <li>✓ Priority support</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-foreground">Giới hạn:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• 100 scans/tháng</li>
                  <li>• 50 AI rewrites/tháng</li>
                  <li>• 20 optimizations/tháng</li>
                  <li>• Advanced analytics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paymentMethods.map((method) => {
            const IconComponent = method.icon;
            return (
              <Card 
                key={method.name} 
                className="bg-white/5 backdrop-blur-lg border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${method.color} flex items-center justify-center`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">{method.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
                  <Button 
                    onClick={() => handlePayment(method)}
                    className={`w-full bg-gradient-to-r ${method.color} text-white hover:opacity-90 transition-opacity`}
                  >
                    Thanh toán với {method.name}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Security Notice */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            🔒 Thanh toán được bảo mật bởi SSL 256-bit encryption
          </p>
        </div>
      </div>
    </div>
  );
}