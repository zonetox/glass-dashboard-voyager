import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Star,
  Code,
  Loader2,
  Copy,
  CheckCircle2,
  Camera,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface BusinessData {
  name: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  hours: Record<string, string>;
  gmbUrl: string;
  coordinates?: { lat: number; lng: number };
  city?: string;
}

export default function LocalBusinessOptimizer() {
  const [businessData, setBusinessData] = useState<BusinessData>({
    name: '',
    category: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    hours: {
      'Monday': '09:00-18:00',
      'Tuesday': '09:00-18:00',
      'Wednesday': '09:00-18:00',
      'Thursday': '09:00-18:00',
      'Friday': '09:00-18:00',
      'Saturday': '09:00-17:00',
      'Sunday': 'Closed'
    },
    gmbUrl: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [schemaResult, setSchemaResult] = useState<any>(null);
  const [contentResult, setContentResult] = useState<any>(null);
  const [gmbResult, setGmbResult] = useState<any>(null);
  const [copiedSchema, setCopiedSchema] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadBusinessProfile();
    }
  }, [user]);

  const loadBusinessProfile = async () => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('business_name, business_address, business_phone, business_website, business_category, business_description, business_hours, google_my_business_url, coordinates')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setBusinessData({
          name: data.business_name || '',
          category: data.business_category || '',
          address: data.business_address || '',
          phone: data.business_phone || '',
          website: data.business_website || '',
          description: data.business_description || '',
          hours: (data.business_hours as Record<string, string>) || businessData.hours,
          gmbUrl: data.google_my_business_url || '',
          coordinates: data.coordinates as { lat: number; lng: number } | undefined
        });
      }
    } catch (error) {
      console.error('Error loading business profile:', error);
    }
  };

  const updateBusinessData = (field: keyof BusinessData, value: any) => {
    setBusinessData(prev => ({ ...prev, [field]: value }));
  };

  const generateSchemas = async () => {
    if (!businessData.name || !businessData.category) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền tên doanh nghiệp và loại hình",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('local-business-optimizer', {
        body: {
          businessData,
          optimizationType: 'schema',
          userId: user?.id
        }
      });

      if (error) throw error;
      setSchemaResult(data);
      
      toast({
        title: "Thành công",
        description: "Đã tạo schema cho doanh nghiệp địa phương!"
      });
    } catch (error) {
      console.error('Schema generation error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo schema. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const optimizeContent = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('local-business-optimizer', {
        body: {
          businessData,
          optimizationType: 'content',
          userId: user?.id
        }
      });

      if (error) throw error;
      setContentResult(data);
      
      toast({
        title: "Thành công",
        description: "Đã tối ưu nội dung local SEO!"
      });
    } catch (error) {
      console.error('Content optimization error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tối ưu nội dung. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const optimizeGMB = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('local-business-optimizer', {
        body: {
          businessData,
          optimizationType: 'gmb',
          userId: user?.id
        }
      });

      if (error) throw error;
      setGmbResult(data);
      
      toast({
        title: "Thành công",
        description: "Đã tạo checklist Google My Business!"
      });
    } catch (error) {
      console.error('GMB optimization error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tối ưu GMB. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSchema(type);
      setTimeout(() => setCopiedSchema(null), 2000);
      
      toast({
        title: "Đã sao chép",
        description: "Schema đã được sao chép vào clipboard"
      });
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Tối ưu doanh nghiệp địa phương
        </h1>
        <p className="text-muted-foreground">
          Tối ưu Local SEO và Google My Business cho doanh nghiệp của bạn
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Thông tin doanh nghiệp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tên doanh nghiệp *</Label>
              <Input
                value={businessData.name}
                onChange={(e) => updateBusinessData('name', e.target.value)}
                placeholder="VD: Nhà hàng ABC"
                className="glass-input"
              />
            </div>

            <div className="space-y-2">
              <Label>Loại hình kinh doanh *</Label>
              <Select value={businessData.category} onValueChange={(value) => updateBusinessData('category', value)}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Chọn loại hình" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Restaurant">Nhà hàng</SelectItem>
                  <SelectItem value="RetailStore">Cửa hàng bán lẻ</SelectItem>
                  <SelectItem value="ProfessionalService">Dịch vụ chuyên nghiệp</SelectItem>
                  <SelectItem value="HealthAndBeauty">Sức khỏe & Làm đẹp</SelectItem>
                  <SelectItem value="Automotive">Ô tô & Xe máy</SelectItem>
                  <SelectItem value="E-commerce">Thương mại điện tử</SelectItem>
                  <SelectItem value="RealEstate">Bất động sản</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Địa chỉ</Label>
              <Input
                value={businessData.address}
                onChange={(e) => updateBusinessData('address', e.target.value)}
                placeholder="Địa chỉ đầy đủ"
                className="glass-input"
              />
            </div>

            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input
                value={businessData.phone}
                onChange={(e) => updateBusinessData('phone', e.target.value)}
                placeholder="0123 456 789"
                className="glass-input"
              />
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={businessData.website}
                onChange={(e) => updateBusinessData('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="glass-input"
              />
            </div>

            <div className="space-y-2">
              <Label>Google My Business URL</Label>
              <Input
                value={businessData.gmbUrl}
                onChange={(e) => updateBusinessData('gmbUrl', e.target.value)}
                placeholder="Link đến trang GMB"
                className="glass-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mô tả doanh nghiệp</Label>
            <Textarea
              value={businessData.description}
              onChange={(e) => updateBusinessData('description', e.target.value)}
              placeholder="Mô tả ngắn gọn về doanh nghiệp của bạn..."
              className="glass-input min-h-[80px]"
            />
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={generateSchemas}
              disabled={isLoading}
              className="gradient-primary"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Code className="h-4 w-4 mr-2" />
              )}
              Tạo Schema
            </Button>
            
            <Button 
              onClick={optimizeContent}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              Tối ưu Local SEO
            </Button>

            <Button 
              onClick={optimizeGMB}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Star className="h-4 w-4 mr-2" />
              )}
              Tối ưu GMB
            </Button>
          </div>
        </CardContent>
      </Card>

      {(schemaResult || contentResult || gmbResult) && (
        <Tabs defaultValue="schemas" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schemas">Schema Markup</TabsTrigger>
            <TabsTrigger value="content">Local SEO</TabsTrigger>
            <TabsTrigger value="gmb">Google My Business</TabsTrigger>
          </TabsList>

          <TabsContent value="schemas" className="space-y-4">
            {schemaResult && (
              <div className="grid gap-4">
                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>LocalBusiness Schema</CardTitle>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(JSON.stringify(schemaResult.localBusinessSchema, null, 2), 'business')}
                    >
                      {copiedSchema === 'business' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto max-h-64">
                      {JSON.stringify(schemaResult.localBusinessSchema, null, 2)}
                    </pre>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Breadcrumb Schema</CardTitle>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(JSON.stringify(schemaResult.breadcrumbSchema, null, 2), 'breadcrumb')}
                    >
                      {copiedSchema === 'breadcrumb' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto max-h-64">
                      {JSON.stringify(schemaResult.breadcrumbSchema, null, 2)}
                    </pre>
                  </CardContent>
                </Card>

                {schemaResult.productSchema && (
                  <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Product Schema</CardTitle>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(JSON.stringify(schemaResult.productSchema, null, 2), 'product')}
                      >
                        {copiedSchema === 'product' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto max-h-64">
                        {JSON.stringify(schemaResult.productSchema, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            {contentResult && (
              <div className="space-y-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Tối ưu SEO địa phương</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Title Tag</h4>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        {contentResult.title}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Meta Description</h4>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        {contentResult.metaDescription}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Headings Structure</h4>
                      <div className="space-y-2">
                        {contentResult.headings.map((heading: string, index: number) => (
                          <div key={index} className="bg-muted/50 p-2 rounded text-sm">
                            H{index + 1}: {heading}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Từ khóa địa phương</h4>
                      <div className="flex flex-wrap gap-2">
                        {contentResult.localKeywords.map((keyword: string, index: number) => (
                          <Badge key={index} variant="secondary">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="gmb" className="space-y-4">
            {gmbResult && (
              <div className="space-y-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Checklist tối ưu GMB
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {gmbResult.optimizationChecklist.map((category: any, index: number) => (
                        <div key={index}>
                          <h4 className="font-semibold mb-3">{category.category}</h4>
                          <div className="space-y-2">
                            {category.items.map((item: any, itemIndex: number) => (
                              <div key={itemIndex} className="flex items-center gap-3">
                                <Checkbox checked={item.completed} disabled />
                                <span className={item.completed ? 'text-muted-foreground line-through' : ''}>
                                  {item.task}
                                </span>
                                {item.completed && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-blue-500" />
                        Gợi ý ảnh
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {gmbResult.photoSuggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-sm">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-green-500" />
                        Ý tưởng bài viết
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {gmbResult.postIdeas.map((idea: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-sm">{idea}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}