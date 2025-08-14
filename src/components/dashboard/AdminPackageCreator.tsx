import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Package, Save, X } from 'lucide-react';

interface NewPackage {
  name: string;
  description: string;
  base_price_vnd: number;
  is_active: boolean;
  is_recommended: boolean;
  is_default: boolean;
}

interface AdminPackageCreatorProps {
  onPackageCreated: () => void;
}

export function AdminPackageCreator({ onPackageCreated }: AdminPackageCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPackage, setNewPackage] = useState<NewPackage>({
    name: '',
    description: '',
    base_price_vnd: 0,
    is_active: true,
    is_recommended: false,
    is_default: false
  });
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!newPackage.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên gói",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('subscription_packages')
        .insert([newPackage])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã tạo gói mới thành công",
      });

      // Reset form
      setNewPackage({
        name: '',
        description: '',
        base_price_vnd: 0,
        is_active: true,
        is_recommended: false,
        is_default: false
      });
      
      setIsOpen(false);
      onPackageCreated();
    } catch (error) {
      console.error('Error creating package:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo gói mới",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const formatPrice = (priceVnd: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(priceVnd);
  };

  if (!isOpen) {
    return (
      <Card className="border-dashed border-2 cursor-pointer hover:border-primary/50 transition-colors">
        <CardContent 
          className="flex flex-col items-center justify-center py-12 text-center"
          onClick={() => setIsOpen(true)}
        >
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium mb-2">Tạo gói mới</h3>
          <p className="text-sm text-muted-foreground">
            Thêm gói dịch vụ mới với tính năng tùy chỉnh
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Tạo gói mới
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="package-name">Tên gói *</Label>
            <Input
              id="package-name"
              value={newPackage.name}
              onChange={(e) => setNewPackage(prev => ({
                ...prev,
                name: e.target.value
              }))}
              placeholder="Ví dụ: Premium Plan"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="package-price">Giá cơ bản (VNĐ)</Label>
            <Input
              id="package-price"
              type="number"
              value={newPackage.base_price_vnd}
              onChange={(e) => setNewPackage(prev => ({
                ...prev,
                base_price_vnd: parseInt(e.target.value) || 0
              }))}
              min="0"
              step="1000"
            />
            <p className="text-xs text-muted-foreground">
              {formatPrice(newPackage.base_price_vnd)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="package-description">Mô tả gói</Label>
          <Textarea
            id="package-description"
            value={newPackage.description}
            onChange={(e) => setNewPackage(prev => ({
              ...prev,
              description: e.target.value
            }))}
            placeholder="Mô tả chi tiết về gói dịch vụ..."
            rows={3}
          />
        </div>

        {/* Package Settings */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Cài đặt gói</Label>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Kích hoạt gói</Label>
                <p className="text-sm text-muted-foreground">
                  Gói có hiển thị cho người dùng không
                </p>
              </div>
              <Switch
                checked={newPackage.is_active}
                onCheckedChange={(checked) => setNewPackage(prev => ({
                  ...prev,
                  is_active: checked
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Gói khuyên dùng</Label>
                <p className="text-sm text-muted-foreground">
                  Hiển thị badge "Khuyên dùng"
                </p>
              </div>
              <Switch
                checked={newPackage.is_recommended}
                onCheckedChange={(checked) => setNewPackage(prev => ({
                  ...prev,
                  is_recommended: checked
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Gói mặc định</Label>
                <p className="text-sm text-muted-foreground">
                  Gói mặc định cho user mới
                </p>
              </div>
              <Switch
                checked={newPackage.is_default}
                onCheckedChange={(checked) => setNewPackage(prev => ({
                  ...prev,
                  is_default: checked
                }))}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={handleCreate}
            disabled={creating || !newPackage.name.trim()}
            className="flex-1"
          >
            {creating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang tạo...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Tạo gói
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={creating}
          >
            Hủy
          </Button>
        </div>

        {/* Preview */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">Xem trước</h4>
          <div className="text-sm space-y-1">
            <div><strong>Tên:</strong> {newPackage.name || 'Chưa nhập'}</div>
            <div><strong>Giá:</strong> {formatPrice(newPackage.base_price_vnd)}/tháng</div>
            <div><strong>Trạng thái:</strong> {newPackage.is_active ? 'Hoạt động' : 'Tạm dừng'}</div>
            {newPackage.is_recommended && <div className="text-primary">✨ Gói khuyên dùng</div>}
            {newPackage.is_default && <div className="text-blue-600">🏠 Gói mặc định</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}