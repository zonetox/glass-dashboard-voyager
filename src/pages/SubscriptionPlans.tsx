import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Check, Star, Crown, Zap, ArrowRight } from 'lucide-react';

interface SubscriptionFeature {
  id: string;
  feature_type: string;
  name: string;
  description: string;
  uses_ai_tokens: boolean;
  ai_model: string | null;
}

interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  base_price_vnd: number;
  is_default: boolean;
  is_recommended: boolean;
  is_active: boolean;
}

interface PackageFeature {
  feature_type: string;
  is_enabled: boolean;
  custom_limit: number | null;
}

interface PackageWithFeatures extends SubscriptionPackage {
  features: PackageFeature[];
  total_features: number;
}

const SubscriptionPlans = () => {
  const [packages, setPackages] = useState<PackageWithFeatures[]>([]);
  const [features, setFeatures] = useState<SubscriptionFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all features
      const { data: featuresData, error: featuresError } = await supabase
        .from('subscription_features')
        .select('*')
        .order('feature_type');
      
      if (featuresError) throw featuresError;
      
      // Fetch active packages with their features
      const { data: packagesData, error: packagesError } = await supabase
        .from('subscription_packages')
        .select(`
          *,
          package_features (
            feature_type,
            is_enabled,
            custom_limit
          )
        `)
        .eq('is_active', true)
        .order('base_price_vnd');
      
      if (packagesError) throw packagesError;
      
      // Get user's current subscription if logged in
      if (user) {
        const { data: subscriptionData } = await supabase
          .from('user_subscriptions')
          .select('package_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();
        
        setCurrentSubscription(subscriptionData?.package_id || null);
      }
      
      // Transform data
      const packagesWithFeatures = packagesData?.map(pkg => ({
        ...pkg,
        features: pkg.package_features || [],
        total_features: pkg.package_features?.filter((f: PackageFeature) => f.is_enabled).length || 0
      })) || [];
      
      setFeatures(featuresData || []);
      setPackages(packagesWithFeatures);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách gói thành viên",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (packageId: string) => {
    if (!user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để chọn gói thành viên",
        variant: "destructive"
      });
      return;
    }

    // For now, just show a message - implement payment later
    toast({
      title: "Tính năng đang phát triển",
      description: "Chức năng thanh toán sẽ sớm được cập nhật",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getFeatureIcon = (featureType: string) => {
    switch (featureType) {
      case 'seo_audit': return '🔍';
      case 'ai_rewrite': return '✨';
      case 'ai_meta': return '📝';
      case 'ai_content_plan': return '📋';
      case 'ai_blog': return '📰';
      case 'image_alt': return '🖼️';
      case 'technical_seo': return '⚙️';
      case 'pdf_export': return '📤';
      case 'whitelabel': return '🎨';
      default: return '📦';
    }
  };

  const getFeatureDetails = (featureType: string) => {
    return features.find(f => f.feature_type === featureType);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Đang tải gói thành viên...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Crown className="w-8 h-8 text-primary" />
          Chọn gói thành viên
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Chọn gói phù hợp với nhu cầu SEO và AI của bạn. Nâng cấp hoặc hạ cấp bất cứ lúc nào.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {packages.map((pkg) => {
          const isCurrentPlan = currentSubscription === pkg.id;
          const isRecommended = pkg.is_recommended;
          
          return (
            <Card 
              key={pkg.id} 
              className={`relative transition-all hover:shadow-lg ${
                isRecommended ? 'border-primary shadow-md' : ''
              } ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Phổ biến nhất
                  </Badge>
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="outline" className="bg-background">
                    Gói hiện tại
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center space-y-4">
                <div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">{pkg.description}</p>
                </div>
                
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {pkg.base_price_vnd === 0 ? 'Miễn phí' : formatPrice(pkg.base_price_vnd)}
                  </div>
                  {pkg.base_price_vnd > 0 && (
                    <p className="text-sm text-muted-foreground">/tháng</p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <div className="space-y-3">
                  {pkg.features
                    .filter(f => f.is_enabled)
                    .map((packageFeature) => {
                      const featureDetails = getFeatureDetails(packageFeature.feature_type);
                      if (!featureDetails) return null;
                      
                      return (
                        <div key={packageFeature.feature_type} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getFeatureIcon(packageFeature.feature_type)}</span>
                              <span className="font-medium text-sm">{featureDetails.name}</span>
                              {featureDetails.uses_ai_tokens && (
                                <Badge variant="outline" className="ml-auto">
                                  <Zap className="w-3 h-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {packageFeature.custom_limit ? 
                                `${packageFeature.custom_limit} lần/tháng` : 
                                'Không giới hạn'
                              }
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Feature Count */}
                <div className="text-center text-sm text-muted-foreground">
                  <strong>{pkg.total_features}</strong> tính năng được bật
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full" 
                  variant={isCurrentPlan ? "outline" : (isRecommended ? "default" : "outline")}
                  onClick={() => handleSelectPlan(pkg.id)}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? (
                    "Gói hiện tại"
                  ) : (
                    <>
                      {pkg.base_price_vnd === 0 ? 'Bắt đầu miễn phí' : 'Chọn gói này'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <p className="text-sm text-muted-foreground">
          Tất cả gói đều bao gồm hỗ trợ khách hàng qua email. Không có phí ẩn.
        </p>
        <p className="text-sm text-muted-foreground">
          Cần gói doanh nghiệp? <a href="#" className="text-primary hover:underline">Liên hệ với chúng tôi</a>
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;