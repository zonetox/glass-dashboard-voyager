import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { History, Eye, RotateCcw, Calendar, Globe, FileText, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { Tables } from '@/integrations/supabase/types';

type Backup = Tables<'backups'>;

const ITEMS_PER_PAGE = 10;

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'meta':
      return <FileText className="h-4 w-4" />;
    case 'schema':
      return <Globe className="h-4 w-4" />;
    case 'html':
      return <FileText className="h-4 w-4" />;
    case 'content':
      return <FileText className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case 'meta':
      return 'secondary';
    case 'schema':
      return 'outline';
    case 'html':
      return 'default';
    case 'content':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export function BackupHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  const fetchBackups = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get total count
      const { count } = await supabase
        .from('backups')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setTotalCount(count || 0);

      // Get paginated data
      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      setBackups(data || []);
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách backup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, [user, currentPage]);

  const handleRestore = async (backup: Backup) => {
    if (!user) return;

    try {
      setRestoring(backup.id);
      
      const { data, error } = await supabase.functions.invoke('restore-site', {
        body: {
          backup_id: backup.id,
          url: backup.url,
          user_id: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã khôi phục website thành công",
      });
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast({
        title: "Lỗi",
        description: "Không thể khôi phục backup",
        variant: "destructive",
      });
    } finally {
      setRestoring(null);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Lịch sử Backup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (backups.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Lịch sử Backup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Chưa có backup nào được tạo.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Lịch sử Backup ({totalCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(backup.created_at).toLocaleString('vi-VN')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 max-w-xs">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate" title={backup.url}>
                        {backup.url}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(backup.type)} className="flex items-center gap-1 w-fit">
                      {getTypeIcon(backup.type)}
                      {backup.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBackup(backup)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Xem chi tiết
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                          <DialogHeader>
                            <DialogTitle>Chi tiết Backup - {backup.type.toUpperCase()}</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-6">
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Thông tin</h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <strong>URL:</strong> {backup.url}
                                </div>
                                <div>
                                  <strong>Ngày tạo:</strong> {new Date(backup.created_at).toLocaleString('vi-VN')}
                                </div>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Nội dung gốc (trước khi fix)</h3>
                              <div className="bg-muted p-4 rounded-lg overflow-auto max-h-64">
                                <pre className="text-sm whitespace-pre-wrap">
                                  {JSON.stringify(backup.original_data, null, 2)}
                                </pre>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Gợi ý AI đã áp dụng</h3>
                              <div className="bg-muted p-4 rounded-lg overflow-auto max-h-64">
                                <pre className="text-sm whitespace-pre-wrap">
                                  {JSON.stringify(backup.ai_suggested_data, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleRestore(backup)}
                        disabled={restoring === backup.id}
                      >
                        {restoring === backup.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4 mr-1" />
                        )}
                        Khôi phục
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}