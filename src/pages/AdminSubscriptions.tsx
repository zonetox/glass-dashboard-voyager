import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Settings, Package, Users, Star, Crown, Zap } from 'lucide-react';

interface SubscriptionFeature {
  id: string;
  feature_type: string;
  name: string;
  description: string;
  suggested_price_vnd: number;
  suggested_limit: number | null;
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
  id: string;
  package_id: string;
  feature_type: string;
  is_enabled: boolean;
  custom_price_vnd: number | null;
  custom_limit: number | null;
}

const AdminSubscriptions = () => {
  const [features, setFeatures] = useState<SubscriptionFeature[]>([]);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [packageFeatures, setPackageFeatures] = useState<PackageFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null);
  const { toast } = useToast();

  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    base_price_vnd: 0,
    is_default: false,
    is_recommended: false,
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch features
      const { data: featuresData, error: featuresError } = await supabase
        .from('subscription_features')
        .select('*')
        .order('feature_type');
      
      if (featuresError) throw featuresError;
      
      // Fetch packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('subscription_packages')
        .select('*')
        .order('created_at');
      
      if (packagesError) throw packagesError;
      
      // Fetch package features
      const { data: packageFeaturesData, error: packageFeaturesError } = await supabase
        .from('package_features')
        .select('*');
      
      if (packageFeaturesError) throw packageFeaturesError;
      
      setFeatures(featuresData || []);
      setPackages(packagesData || []);
      setPackageFeatures(packageFeaturesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách gói và tính năng",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_packages')
        .insert(newPackage)
        .select()
        .single();
      
      if (error) throw error;
      
      setPackages([...packages, data]);
      setNewPackage({
        name: '',
        description: '',
        base_price_vnd: 0,
        is_default: false,
        is_recommended: false,
        is_active: true
      });
      setIsDialogOpen(false);
      
      toast({
        title: "Thành công",
        description: "Đã tạo gói thành viên mới"
      });
    } catch (error) {
      console.error('Error creating package:', error);
      toast({
        title: "Lỗi tạo gói",
        description: "Không thể tạo gói thành viên mới",
        variant: "destructive"
      });
    }
  };

  const togglePackageFeature = async (packageId: string, featureType: string, enabled: boolean) => {
    try {
      if (enabled) {
        // Enable feature
        const { error } = await supabase
          .from('package_features')
          .upsert({
            package_id: packageId,
            feature_type: featureType as any,
            is_enabled: true
          });
        
        if (error) throw error;
      } else {
        // Disable feature
        const { error } = await supabase
          .from('package_features')
          .delete()
          .eq('package_id', packageId)
          .eq('feature_type', featureType as any);
        
        if (error) throw error;
      }
      
      // Refresh package features
      const { data: packageFeaturesData } = await supabase
        .from('package_features')
        .select('*');
      
      setPackageFeatures(packageFeaturesData || []);
      
      toast({
        title: "Cập nhật thành công",
        description: `Đã ${enabled ? 'bật' : 'tắt'} tính năng`
      });
    } catch (error) {
      console.error('Error toggling feature:', error);
      toast({
        title: "Lỗi cập nhật",
        description: "Không thể cập nhật tính năng",
        variant: "destructive"
      });
    }
  };

  const updateFeatureLimit = async (packageId: string, featureType: string, limit: number) => {
    try {
      const { error } = await supabase
        .from('package_features')
        .update({ custom_limit: limit })
        .eq('package_id', packageId)
        .eq('feature_type', featureType as any);
      
      if (error) throw error;
      
      toast({
        title: "Cập nhật thành công",
        description: "Đã cập nhật giới hạn tính năng"
      });
    } catch (error) {
      console.error('Error updating limit:', error);
      toast({
        title: "Lỗi cập nhật",
        description: "Không thể cập nhật giới hạn",
        variant: "destructive"
      });
    }
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

  const isFeatureEnabled = (packageId: string, featureType: string) => {
    return packageFeatures.some(pf => 
      pf.package_id === packageId && 
      pf.feature_type === featureType && 
      pf.is_enabled
    );
  };

  const getFeatureLimit = (packageId: string, featureType: string) => {
    const feature = packageFeatures.find(pf => 
      pf.package_id === packageId && pf.feature_type === featureType
    );
    return feature?.custom_limit || '';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6" />
            Quản lý gói thành viên
          </h1>
          <p className="text-muted-foreground">Tạo và quản lý các gói thành viên linh hoạt theo tính năng</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tạo gói mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo gói thành viên mới</DialogTitle>
              <DialogDescription>
                Tạo gói thành viên mới với các tính năng tùy chỉnh
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên gói</Label>
                <Input
                  id="name"
                  value={newPackage.name}
                  onChange={(e) => setNewPackage({...newPackage, name: e.target.value})}
                  placeholder="VD: Gói Pro"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={newPackage.description}
                  onChange={(e) => setNewPackage({...newPackage, description: e.target.value})}
                  placeholder="Mô tả ngắn về gói"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="base_price">Giá cơ bản (VND)</Label>
                <Input
                  id="base_price"
                  type="number"
                  value={newPackage.base_price_vnd}
                  onChange={(e) => setNewPackage({...newPackage, base_price_vnd: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_recommended"
                  checked={newPackage.is_recommended}
                  onCheckedChange={(checked) => setNewPackage({...newPackage, is_recommended: checked})}
                />
                <Label htmlFor="is_recommended">Gói đề xuất</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreatePackage} disabled={!newPackage.name}>
                Tạo gói
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="packages" className="w-full">
        <TabsList>
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Quản lý gói
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Tính năng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-4">
          <div className="grid gap-6">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="flex items-center gap-2">
                        {pkg.is_recommended && <Star className="w-5 h-5 text-yellow-500" />}
                        {pkg.name}
                        {pkg.is_default && <Badge variant="secondary">Mặc định</Badge>}
                        {pkg.is_recommended && <Badge variant="default">Đề xuất</Badge>}
                      </CardTitle>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{formatPrice(pkg.base_price_vnd)}</p>
                      <p className="text-sm text-muted-foreground">Giá cơ bản/tháng</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{pkg.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Tính năng trong gói:</h4>
                    <div className="grid gap-3">
                      {features.map((feature) => {
                        const enabled = isFeatureEnabled(pkg.id, feature.feature_type);
                        const limit = getFeatureLimit(pkg.id, feature.feature_type);
                        
                        return (
                          <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{getFeatureIcon(feature.feature_type)}</span>
                              <div>
                                <p className="font-medium">{feature.name}</p>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                                <p className="text-xs text-primary">
                                  Gợi ý: {formatPrice(feature.suggested_price_vnd)}
                                  {feature.suggested_limit && ` - ${feature.suggested_limit} lần/tháng`}
                                  {feature.uses_ai_tokens && (
                                    <Badge variant="outline" className="ml-2">
                                      <Zap className="w-3 h-3 mr-1" />
                                      {feature.ai_model}
                                    </Badge>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {enabled && (
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={`limit-${pkg.id}-${feature.feature_type}`} className="text-sm">
                                    Giới hạn:
                                  </Label>
                                  <Input
                                    id={`limit-${pkg.id}-${feature.feature_type}`}
                                    type="number"
                                    className="w-20"
                                    placeholder="∞"
                                    value={limit}
                                    onChange={(e) => {
                                      const newLimit = parseInt(e.target.value) || 0;
                                      updateFeatureLimit(pkg.id, feature.feature_type, newLimit);
                                    }}
                                  />
                                </div>
                              )}
                              <Switch
                                checked={enabled}
                                onCheckedChange={(checked) => 
                                  togglePackageFeature(pkg.id, feature.feature_type, checked)
                                }
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách tính năng hệ thống</CardTitle>
              <p className="text-muted-foreground">
                Các tính năng có sẵn để tạo gói thành viên
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {features.map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFeatureIcon(feature.feature_type)}</span>
                      <div>
                        <h4 className="font-semibold">{feature.name}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm font-medium text-primary">
                            {formatPrice(feature.suggested_price_vnd)}
                          </span>
                          {feature.suggested_limit && (
                            <span className="text-sm text-muted-foreground">
                              {feature.suggested_limit} lần/tháng
                            </span>
                          )}
                          {feature.uses_ai_tokens && (
                            <Badge variant="outline">
                              <Zap className="w-3 h-3 mr-1" />
                              {feature.ai_model}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSubscriptions;