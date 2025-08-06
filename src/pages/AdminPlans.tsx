import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Save, Package, DollarSign, FileText, Brain, Users } from 'lucide-react';

interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  base_price_vnd: number;
  is_default: boolean;
  is_recommended: boolean;
  is_active: boolean;
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
}

export default function AdminPlans() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [packageFeatures, setPackageFeatures] = useState<PackageFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();
  const { userRole } = useAuth();

  // Redirect if not admin
  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
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

      setPackages(packagesData || []);
      setPackageFeatures(packageFeaturesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách gói",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePackage = async (packageId: string, updates: Partial<SubscriptionPackage>) => {
    setSaving(packageId);
    try {
      const { error } = await supabase
        .from('subscription_packages')
        .update(updates)
        .eq('id', packageId);

      if (error) throw error;

      // Update local state
      setPackages(prev => prev.map(pkg => 
        pkg.id === packageId ? { ...pkg, ...updates } : pkg
      ));

      toast({
        title: "Thành công",
        description: "Đã cập nhật gói thành công",
      });
    } catch (error) {
      console.error('Error updating package:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật gói",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleFieldChange = (packageId: string, field: keyof SubscriptionPackage, value: any) => {
    // Update local state immediately for real-time feel
    setPackages(prev => prev.map(pkg => 
      pkg.id === packageId ? { ...pkg, [field]: value } : pkg
    ));

    // Debounce the API call
    setTimeout(() => {
      updatePackage(packageId, { [field]: value });
    }, 500);
  };

  const formatPrice = (priceVnd: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(priceVnd);
  };

  const getFeatureLimit = (packageId: string, featureType: string) => {
    const feature = packageFeatures.find(pf => 
      pf.package_id === packageId && pf.feature_type === featureType
    );
    return feature?.custom_limit || 0;
  };

  const isFeatureEnabled = (packageId: string, featureType: string) => {
    return packageFeatures.some(pf => 
      pf.package_id === packageId && 
      pf.feature_type === featureType && 
      pf.is_enabled
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Quản lý Gói Dịch vụ</h1>
          </div>
          <p className="text-muted-foreground">
            Cập nhật thông tin các gói dịch vụ, giá cả và tính năng
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {pkg.name}
                      {pkg.is_recommended && <Badge className="bg-primary">Khuyên dùng</Badge>}
                      {pkg.is_default && <Badge variant="secondary">Mặc định</Badge>}
                    </CardTitle>
                    <CardDescription>
                      {pkg.description}
                    </CardDescription>
                    <CardDescription className="text-xs">
                      Cập nhật: {new Date(pkg.updated_at).toLocaleString('vi-VN')}
                    </CardDescription>
                  </div>
                  {saving === pkg.id && (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">Đang lưu...</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Package Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Gói mặc định</Label>
                    <Switch
                      checked={pkg.is_default}
                      onCheckedChange={(checked) => handleFieldChange(pkg.id, 'is_default', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Gói khuyên dùng</Label>
                    <Switch
                      checked={pkg.is_recommended}
                      onCheckedChange={(checked) => handleFieldChange(pkg.id, 'is_recommended', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Kích hoạt</Label>
                    <Switch
                      checked={pkg.is_active}
                      onCheckedChange={(checked) => handleFieldChange(pkg.id, 'is_active', checked)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor={`price-${pkg.id}`} className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Giá cơ bản (VNĐ)
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id={`price-${pkg.id}`}
                      type="number"
                      value={pkg.base_price_vnd}
                      onChange={(e) => handleFieldChange(pkg.id, 'base_price_vnd', parseInt(e.target.value) || 0)}
                      min="0"
                      step="1000"
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground">
                      Hiển thị: {formatPrice(pkg.base_price_vnd)}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Features Summary */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Tính năng đã bật</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Website Scans:</span>
                      <span>{getFeatureLimit(pkg.id, 'website_scan') || 'Unlimited'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>AI Content:</span>
                      <span>{getFeatureLimit(pkg.id, 'ai_content') || 'Unlimited'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Optimizations:</span>
                      <span>{getFeatureLimit(pkg.id, 'optimization') || 'Unlimited'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>PDF Export:</span>
                      <span>{isFeatureEnabled(pkg.id, 'pdf_export') ? '✅' : '❌'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>AI Rewrite:</span>
                      <span>{isFeatureEnabled(pkg.id, 'ai_rewrite') ? '✅' : '❌'}</span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-sm">Tóm tắt gói</h4>
                  <div className="text-sm space-y-1">
                    <div>Giá: {formatPrice(pkg.base_price_vnd)}/tháng</div>
                    <div>Trạng thái: {pkg.is_active ? 'Hoạt động' : 'Tạm dừng'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Các thay đổi sẽ được lưu tự động sau 0.5 giây</p>
        </div>
      </div>
    </div>
  );
}