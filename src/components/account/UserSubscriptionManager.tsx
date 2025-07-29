import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { Crown, Calendar, CreditCard, ArrowRight, CheckCircle } from 'lucide-react';

interface UserSubscription {
  id: string;
  package_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  package: {
    name: string;
    description: string;
    base_price_vnd: number;
  };
}

interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  base_price_vnd: number;
  is_recommended: boolean;
  features: Array<{
    feature_type: string;
    is_enabled: boolean;
    custom_limit: number | null;
  }>;
}

export function UserSubscriptionManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [availablePackages, setAvailablePackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      // Mock data for now until subscription tables are properly set up
      setCurrentSubscription({
        id: '1',
        package_id: 'free',
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: null,
        package: {
          name: 'Free Plan',
          description: 'Gói miễn phí',
          base_price_vnd: 0
        }
      });

      // Mock available packages
      setAvailablePackages([
        {
          id: 'free',
          name: 'Free Plan',
          description: 'Gói miễn phí cho người dùng cá nhân',
          base_price_vnd: 0,
          is_recommended: false,
          features: [
            { feature_type: 'website_scan', is_enabled: true, custom_limit: 5 },
            { feature_type: 'ai_content', is_enabled: true, custom_limit: 10 },
            { feature_type: 'optimization', is_enabled: true, custom_limit: 2 }
          ]
        },
        {
          id: 'pro',
          name: 'Pro Plan',
          description: 'Gói chuyên nghiệp cho doanh nghiệp nhỏ',
          base_price_vnd: 99000,
          is_recommended: true,
          features: [
            { feature_type: 'website_scan', is_enabled: true, custom_limit: 50 },
            { feature_type: 'ai_content', is_enabled: true, custom_limit: 100 },
            { feature_type: 'optimization', is_enabled: true, custom_limit: 20 }
          ]
        }
      ]);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (packageData: SubscriptionPackage) => {
    setSelectedPackage(packageData);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSelectedPackage(null);
    loadSubscriptionData();
    toast({
      title: "Thanh toán thành công",
      description: "Gói dịch vụ đã được kích hoạt"
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getFeatureLimit = (features: any[], featureType: string) => {
    const feature = features.find(f => f.feature_type === featureType);
    return feature?.custom_limit || 0;
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

  if (showPayment && selectedPackage) {
    return (
      <div className="space-y-6">
        <Button 
          variant="outline" 
          onClick={() => setShowPayment(false)}
          className="mb-4"
        >
          ← Quay lại
        </Button>
        <PaymentMethodSelector
          packageId={selectedPackage.id}
          packageName={selectedPackage.name}
          price={selectedPackage.base_price_vnd}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      {currentSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="w-5 h-5 mr-2" />
              Gói đang sử dụng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{currentSubscription.package.name}</h3>
                  <p className="text-sm text-muted-foreground">{currentSubscription.package.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge className="bg-green-500/20 text-green-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Đang hoạt động
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {currentSubscription.end_date 
                        ? `Hết hạn: ${new Date(currentSubscription.end_date).toLocaleDateString('vi-VN')}`
                        : 'Không giới hạn'
                      }
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">
                  {formatPrice(currentSubscription.package.base_price_vnd)}
                </div>
                <div className="text-sm text-muted-foreground">/tháng</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            {currentSubscription ? 'Nâng cấp gói' : 'Chọn gói dịch vụ'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availablePackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative p-6 border rounded-lg transition-all hover:shadow-lg ${
                  pkg.is_recommended ? 'border-primary bg-primary/5' : ''
                }`}
              >
                {pkg.is_recommended && (
                  <Badge className="absolute -top-2 left-4 bg-primary">
                    Khuyên dùng
                  </Badge>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">{formatPrice(pkg.base_price_vnd)}</span>
                    <span className="text-muted-foreground">/tháng</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span>Website Scans:</span>
                      <span>{getFeatureLimit(pkg.features, 'website_scan') || 'Unlimited'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Content:</span>
                      <span>{getFeatureLimit(pkg.features, 'ai_content') || 'Unlimited'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Optimizations:</span>
                      <span>{getFeatureLimit(pkg.features, 'optimization') || 'Unlimited'}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => handleUpgrade(pkg)}
                  className="w-full"
                  variant={pkg.is_recommended ? "default" : "outline"}
                  disabled={currentSubscription?.package_id === pkg.id}
                >
                  {currentSubscription?.package_id === pkg.id ? (
                    'Đang sử dụng'
                  ) : (
                    <>
                      {currentSubscription ? 'Nâng cấp' : 'Chọn gói'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}