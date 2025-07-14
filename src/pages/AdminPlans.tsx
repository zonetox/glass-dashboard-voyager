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

interface Plan {
  id: string;
  name: string;
  monthly_limit: number;
  pdf_enabled: boolean;
  ai_enabled: boolean;
  price_vnd: number;
  created_at: string;
  updated_at: string;
}

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();
  const { userRole } = useAuth();

  // Redirect if not admin
  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('id');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách gói",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (planId: string, updates: Partial<Plan>) => {
    setSaving(planId);
    try {
      const { error } = await supabase
        .from('plans')
        .update(updates)
        .eq('id', planId);

      if (error) throw error;

      // Update local state
      setPlans(prev => prev.map(plan => 
        plan.id === planId ? { ...plan, ...updates } : plan
      ));

      toast({
        title: "Thành công",
        description: "Đã cập nhật gói thành công",
      });
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật gói",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleFieldChange = (planId: string, field: keyof Plan, value: any) => {
    // Update local state immediately for real-time feel
    setPlans(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, [field]: value } : plan
    ));

    // Debounce the API call
    setTimeout(() => {
      updatePlan(planId, { [field]: value });
    }, 500);
  };

  const formatPrice = (priceVnd: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(priceVnd);
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

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {plan.name}
                      <Badge variant={plan.id === 'free' ? 'secondary' : 'default'}>
                        {plan.id}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Cập nhật: {new Date(plan.updated_at).toLocaleString('vi-VN')}
                    </CardDescription>
                  </div>
                  {saving === plan.id && (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">Đang lưu...</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Monthly Limit */}
                <div className="space-y-2">
                  <Label htmlFor={`limit-${plan.id}`} className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Số lượt phân tích/tháng
                  </Label>
                  <Input
                    id={`limit-${plan.id}`}
                    type="number"
                    value={plan.monthly_limit}
                    onChange={(e) => handleFieldChange(plan.id, 'monthly_limit', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full"
                  />
                </div>

                <Separator />

                {/* Features */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Tính năng</Label>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor={`pdf-${plan.id}`}>PDF Report</Label>
                    </div>
                    <Switch
                      id={`pdf-${plan.id}`}
                      checked={plan.pdf_enabled}
                      onCheckedChange={(checked) => handleFieldChange(plan.id, 'pdf_enabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor={`ai-${plan.id}`}>AI Rewrite</Label>
                    </div>
                    <Switch
                      id={`ai-${plan.id}`}
                      checked={plan.ai_enabled}
                      onCheckedChange={(checked) => handleFieldChange(plan.id, 'ai_enabled', checked)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor={`price-${plan.id}`} className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Giá (VNĐ)
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id={`price-${plan.id}`}
                      type="number"
                      value={plan.price_vnd}
                      onChange={(e) => handleFieldChange(plan.id, 'price_vnd', parseInt(e.target.value) || 0)}
                      min="0"
                      step="1000"
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground">
                      Hiển thị: {formatPrice(plan.price_vnd)}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-sm">Tóm tắt gói</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Phân tích: {plan.monthly_limit}/tháng</div>
                    <div>Giá: {formatPrice(plan.price_vnd)}</div>
                    <div>PDF: {plan.pdf_enabled ? '✅' : '❌'}</div>
                    <div>AI: {plan.ai_enabled ? '✅' : '❌'}</div>
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