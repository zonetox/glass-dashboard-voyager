import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings, 
  Brain, 
  FileText, 
  Image, 
  Search, 
  Download,
  Palette,
  Save,
  RefreshCw,
  DollarSign,
  Cpu,
  Zap,
  Plus
} from 'lucide-react';

interface SubscriptionFeature {
  id: string;
  feature_type: string;
  name: string;
  description: string;
  suggested_price_vnd: number;
  suggested_limit: number | null;
  uses_ai_tokens: boolean;
  ai_model: string | null;
  created_at: string;
  updated_at: string;
}

interface PackageFeature {
  id: string;
  package_id: string;
  feature_type: string;
  is_enabled: boolean;
  custom_price_vnd: number | null;
  custom_limit: number | null;
  created_at: string;
}

interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  base_price_vnd: number;
  is_active: boolean;
  is_recommended: boolean;
  is_default: boolean;
}

export function AdminFeatureManager() {
  const [features, setFeatures] = useState<SubscriptionFeature[]>([]);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [packageFeatures, setPackageFeatures] = useState<PackageFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [featuresData, packagesData, packageFeaturesData] = await Promise.all([
        supabase.from('subscription_features').select('*').order('feature_type'),
        supabase.from('subscription_packages').select('*').order('name'),
        supabase.from('package_features').select('*')
      ]);

      if (featuresData.error) throw featuresData.error;
      if (packagesData.error) throw packagesData.error;
      if (packageFeaturesData.error) throw packageFeaturesData.error;

      setFeatures(featuresData.data || []);
      setPackages(packagesData.data || []);
      setPackageFeatures(packageFeaturesData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu tính năng",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFeature = async (featureId: string, updates: Partial<SubscriptionFeature>) => {
    setSaving(featureId);
    try {
      const { error } = await supabase
        .from('subscription_features')
        .update(updates)
        .eq('id', featureId);

      if (error) throw error;

      setFeatures(prev => prev.map(f => 
        f.id === featureId ? { ...f, ...updates } : f
      ));

      toast({
        title: "Thành công",
        description: "Đã cập nhật tính năng",
      });
    } catch (error) {
      console.error('Error updating feature:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật tính năng",
        variant: "destructive"
      });
    } finally {
      setSaving(null);
    }
  };

  const updatePackageFeature = async (packageId: string, featureType: string, updates: Partial<PackageFeature>) => {
    try {
      // Check if package feature exists
      const existing = packageFeatures.find(pf => 
        pf.package_id === packageId && pf.feature_type === featureType
      );

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('package_features')
          .update(updates)
          .eq('id', existing.id);

        if (error) throw error;

        setPackageFeatures(prev => prev.map(pf => 
          pf.id === existing.id ? { ...pf, ...updates } : pf
        ));
      } else {
        // Create new
        const { data, error } = await supabase
          .from('package_features')
          .insert({
            package_id: packageId,
            feature_type: featureType,
            ...updates
          })
          .select()
          .single();

        if (error) throw error;

        setPackageFeatures(prev => [...prev, data]);
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật tính năng gói",
      });
    } catch (error) {
      console.error('Error updating package feature:', error);
      toast({
        title: "Lỗi", 
        description: "Không thể cập nhật tính năng gói",
        variant: "destructive"
      });
    }
  };

  const getFeatureIcon = (featureType: string) => {
    switch (featureType) {
      case 'seo_audit': return Search;
      case 'ai_rewrite': return Brain;
      case 'ai_meta': return FileText;
      case 'ai_content_plan': return Cpu;
      case 'ai_blog': return FileText;
      case 'image_alt': return Image;
      case 'technical_seo': return Settings;
      case 'pdf_export': return Download;
      case 'whitelabel': return Palette;
      default: return Zap;
    }
  };

  const formatPrice = (priceVnd: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(priceVnd);
  };

  const isFeatureEnabledInPackage = (packageId: string, featureType: string) => {
    return packageFeatures.some(pf => 
      pf.package_id === packageId && 
      pf.feature_type === featureType && 
      pf.is_enabled
    );
  };

  const getPackageFeatureLimit = (packageId: string, featureType: string) => {
    const pf = packageFeatures.find(pf => 
      pf.package_id === packageId && pf.feature_type === featureType
    );
    return pf?.custom_limit || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải quản lý tính năng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Quản lý Tính năng
          </h2>
          <p className="text-muted-foreground">Cấu hình tính năng, giá cả và giới hạn cho từng gói</p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tải lại
        </Button>
      </div>

      {/* Features Overview */}
      <div className="grid gap-6">
        {features.map((feature) => {
          const IconComponent = getFeatureIcon(feature.feature_type);
          
          return (
            <Card key={feature.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {feature.name}
                        {feature.uses_ai_tokens && (
                          <Badge variant="secondary">
                            <Brain className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  {saving === feature.id && (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">Đang lưu...</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Feature Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`price-${feature.id}`}>Giá đề xuất (VNĐ)</Label>
                    <Input
                      id={`price-${feature.id}`}
                      type="number"
                      value={feature.suggested_price_vnd}
                      onChange={(e) => updateFeature(feature.id, {
                        suggested_price_vnd: parseInt(e.target.value) || 0
                      })}
                      min="0"
                      step="1000"
                    />
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(feature.suggested_price_vnd)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`limit-${feature.id}`}>Giới hạn đề xuất</Label>
                    <Input
                      id={`limit-${feature.id}`}
                      type="number"
                      value={feature.suggested_limit || ''}
                      onChange={(e) => updateFeature(feature.id, {
                        suggested_limit: e.target.value ? parseInt(e.target.value) : null
                      })}
                      min="1"
                      placeholder="Không giới hạn"
                    />
                  </div>

                  {feature.uses_ai_tokens && (
                    <div className="space-y-2">
                      <Label htmlFor={`model-${feature.id}`}>AI Model</Label>
                      <Input
                        id={`model-${feature.id}`}
                        value={feature.ai_model || ''}
                        onChange={(e) => updateFeature(feature.id, {
                          ai_model: e.target.value || null
                        })}
                        placeholder="gpt-4o-mini"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Package Configuration */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Cấu hình cho từng gói</Label>
                  
                  <div className="grid gap-4">
                    {packages.map((pkg) => (
                      <div key={pkg.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{pkg.name}</h4>
                            {pkg.is_recommended && <Badge>Khuyên dùng</Badge>}
                          </div>
                          <Switch
                            checked={isFeatureEnabledInPackage(pkg.id, feature.feature_type)}
                            onCheckedChange={(checked) => 
                              updatePackageFeature(pkg.id, feature.feature_type, {
                                is_enabled: checked
                              })
                            }
                          />
                        </div>

                        {isFeatureEnabledInPackage(pkg.id, feature.feature_type) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <div className="space-y-1">
                              <Label className="text-sm">Giới hạn tùy chỉnh</Label>
                              <Input
                                type="number"
                                value={getPackageFeatureLimit(pkg.id, feature.feature_type) || ''}
                                onChange={(e) => updatePackageFeature(pkg.id, feature.feature_type, {
                                  custom_limit: e.target.value ? parseInt(e.target.value) : null,
                                  is_enabled: true
                                })}
                                placeholder={feature.suggested_limit?.toString() || 'Không giới hạn'}
                                min="1"
                                className="h-8"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <Label className="text-sm">Giá tùy chỉnh (VNĐ)</Label>
                              <Input
                                type="number"
                                placeholder={feature.suggested_price_vnd.toString()}
                                min="0"
                                step="1000"
                                className="h-8"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}