import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Globe, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface WordPressSite {
  id: string;
  site_name: string;
  site_url: string;
  application_password: string;
  default_category: string;
  default_status: string;
  created_at: string;
  updated_at: string;
}

export const WordPressSiteManager: React.FC = () => {
  const [sites, setSites] = useState<WordPressSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<WordPressSite | null>(null);
  const [formData, setFormData] = useState({
    site_name: '',
    site_url: '',
    application_password: '',
    default_category: 'general',
    default_status: 'publish',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const { data, error } = await supabase
        .from('wordpress_sites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      console.error('Error fetching WordPress sites:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách WordPress sites',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      site_name: '',
      site_url: '',
      application_password: '',
      default_category: 'general',
      default_status: 'publish',
    });
    setEditingSite(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.site_name || !formData.site_url || !formData.application_password) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    try {
      let siteUrl = formData.site_url.trim();
      if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
        siteUrl = 'https://' + siteUrl;
      }
      siteUrl = siteUrl.replace(/\/$/, ''); // Remove trailing slash

      if (editingSite) {
        const { error } = await supabase
          .from('wordpress_sites')
          .update({
            ...formData,
            site_url: siteUrl,
          })
          .eq('id', editingSite.id);

        if (error) throw error;
        toast({
          title: 'Thành công',
          description: 'Đã cập nhật WordPress site',
        });
      } else {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        const { error } = await supabase
          .from('wordpress_sites')
          .insert({
            ...formData,
            site_url: siteUrl,
            user_id: userData.user.id,
          });

        if (error) throw error;
        toast({
          title: 'Thành công',
          description: 'Đã thêm WordPress site mới',
        });
      }

      fetchSites();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving WordPress site:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu WordPress site',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (site: WordPressSite) => {
    setEditingSite(site);
    setFormData({
      site_name: site.site_name,
      site_url: site.site_url,
      application_password: site.application_password,
      default_category: site.default_category,
      default_status: site.default_status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (siteId: string) => {
    try {
      const { error } = await supabase
        .from('wordpress_sites')
        .delete()
        .eq('id', siteId);

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Đã xóa WordPress site',
      });
      fetchSites();
    } catch (error) {
      console.error('Error deleting WordPress site:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa WordPress site',
        variant: 'destructive',
      });
    }
  };

  const testConnection = async (site: WordPressSite) => {
    try {
      const response = await fetch(`${site.site_url}/wp-json/wp/v2/users/me`, {
        headers: {
          'Authorization': `Basic ${btoa(`admin:${site.application_password}`)}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Kết nối thành công',
          description: `Có thể kết nối tới ${site.site_name}`,
        });
      } else {
        toast({
          title: 'Kết nối thất bại',
          description: `Không thể kết nối tới ${site.site_name}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Lỗi kết nối',
        description: `Không thể kết nối tới ${site.site_name}`,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Đang tải...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Quản lý WordPress Sites
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm Site
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingSite ? 'Chỉnh sửa' : 'Thêm'} WordPress Site
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="site_name">Tên site</Label>
                  <Input
                    id="site_name"
                    value={formData.site_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, site_name: e.target.value }))}
                    placeholder="Ví dụ: Blog chính"
                  />
                </div>
                <div>
                  <Label htmlFor="site_url">URL site</Label>
                  <Input
                    id="site_url"
                    value={formData.site_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, site_url: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="application_password">Application Password</Label>
                  <Input
                    id="application_password"
                    type="password"
                    value={formData.application_password}
                    onChange={(e) => setFormData(prev => ({ ...prev, application_password: e.target.value }))}
                    placeholder="WordPress Application Password"
                  />
                </div>
                <div>
                  <Label htmlFor="default_category">Danh mục mặc định</Label>
                  <Input
                    id="default_category"
                    value={formData.default_category}
                    onChange={(e) => setFormData(prev => ({ ...prev, default_category: e.target.value }))}
                    placeholder="general"
                  />
                </div>
                <div>
                  <Label htmlFor="default_status">Trạng thái mặc định</Label>
                  <Select
                    value={formData.default_status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, default_status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Nháp</SelectItem>
                      <SelectItem value="publish">Công khai</SelectItem>
                      <SelectItem value="private">Riêng tư</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  {editingSite ? 'Cập nhật' : 'Thêm'} Site
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên site</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Trạng thái mặc định</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.map((site) => (
              <TableRow key={site.id}>
                <TableCell className="font-medium">{site.site_name}</TableCell>
                <TableCell>
                  <a 
                    href={site.site_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    {site.site_url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {site.default_status === 'publish' ? 'Công khai' : 
                     site.default_status === 'draft' ? 'Nháp' : 'Riêng tư'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(site.created_at), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(site)}
                    >
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(site)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc muốn xóa site "{site.site_name}"? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(site.id)}>
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {sites.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Chưa có WordPress site nào. Thêm site đầu tiên để bắt đầu.
          </div>
        )}
      </CardContent>
    </Card>
  );
};