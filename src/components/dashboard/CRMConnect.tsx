import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  Zap, 
  Settings, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Plus,
  Trash2,
  TestTube,
  RefreshCcw,
  BarChart3,
  Users,
  Globe,
  Clock,
  TrendingUp,
  ExternalLink,
  Download,
  Filter
} from "lucide-react";

interface CRMConfig {
  id: string;
  user_id: string;
  crm_type: string;
  crm_name: string;
  api_key_encrypted: string;
  api_endpoint: string | null;
  is_active: boolean;
  sync_frequency: number;
  last_sync_at: string | null;
  settings: any;
  created_at: string;
  updated_at: string;
}

interface TrackingData {
  id: string;
  domain: string;
  page_url: string;
  visitor_id: string | null;
  keyword: string | null;
  campaign_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  referrer: string | null;
  country: string | null;
  device_type: string | null;
  browser: string | null;
  visit_duration: number | null;
  conversion_value: number | null;
  crm_contact_id: string | null;
  synced_to_crm: boolean;
  visited_at: string;
  created_at: string;
}

interface SyncLog {
  id: string;
  crm_config_id: string;
  tracking_data_id: string | null;
  sync_type: string;
  status: string;
  crm_object_id: string | null;
  error_message: string | null;
  sync_duration_ms: number | null;
  created_at: string;
}

interface CRMConnectProps {
  className?: string;
}

const CRM_TYPES = [
  { 
    value: 'hubspot', 
    label: 'HubSpot', 
    icon: '🟠',
    description: 'Marketing, Sales & Service Hub',
    apiKeyLabel: 'Private App Access Token'
  },
  { 
    value: 'salesforce', 
    label: 'Salesforce', 
    icon: '🔵',
    description: 'Sales Cloud & Marketing Cloud',
    apiKeyLabel: 'Connected App Key'
  },
  { 
    value: 'zoho', 
    label: 'Zoho CRM', 
    icon: '🟡',
    description: 'Zoho CRM Suite',
    apiKeyLabel: 'Auth Token'
  }
];

export default function CRMConnect({ className }: CRMConnectProps) {
  const [activeTab, setActiveTab] = useState('configs');
  const [crmConfigs, setCrmConfigs] = useState<CRMConfig[]>([]);
  const [trackingData, setTrackingData] = useState<TrackingData[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showAddCRM, setShowAddCRM] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Form states
  const [selectedCRMType, setSelectedCRMType] = useState('');
  const [crmName, setCrmName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [syncFrequency, setSyncFrequency] = useState(300);
  
  // Filter states
  const [domainFilter, setDomainFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7days');
  
  const { toast } = useToast();

  useEffect(() => {
    if (activeTab === 'configs') {
      fetchCRMConfigs();
    } else if (activeTab === 'tracking') {
      fetchTrackingData();
    } else if (activeTab === 'logs') {
      fetchSyncLogs();
    }
  }, [activeTab]);

  const fetchCRMConfigs = async () => {
    try {
      setLoadingConfigs(true);
      
      const { data, error } = await supabase
        .from('crm_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCrmConfigs(data || []);
    } catch (error) {
      console.error('Error fetching CRM configs:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải cấu hình CRM",
        variant: "destructive",
      });
    } finally {
      setLoadingConfigs(false);
    }
  };

  const fetchTrackingData = async () => {
    try {
      setLoadingTracking(true);
      
      let query = supabase
        .from('seo_tracking_data')
        .select('*')
        .order('visited_at', { ascending: false })
        .limit(100);

      if (domainFilter) {
        query = query.ilike('domain', `%${domainFilter}%`);
      }

      if (statusFilter === 'synced') {
        query = query.eq('synced_to_crm', true);
      } else if (statusFilter === 'unsynced') {
        query = query.eq('synced_to_crm', false);
      }

      // Date filter
      if (dateFilter !== 'all') {
        const days = parseInt(dateFilter.replace('days', ''));
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        query = query.gte('visited_at', cutoffDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setTrackingData(data || []);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu tracking",
        variant: "destructive",
      });
    } finally {
      setLoadingTracking(false);
    }
  };

  const fetchSyncLogs = async () => {
    try {
      setLoadingLogs(true);
      
      const { data, error } = await supabase
        .from('crm_sync_logs')
        .select(`
          *,
          crm_configurations(crm_name, crm_type)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setSyncLogs(data || []);
    } catch (error) {
      console.error('Error fetching sync logs:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải log đồng bộ",
        variant: "destructive",
      });
    } finally {
      setLoadingLogs(false);
    }
  };

  const addCRMConfig = async () => {
    if (!selectedCRMType || !crmName || !apiKey) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('crm_configurations')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          crm_type: selectedCRMType,
          crm_name: crmName,
          api_key_encrypted: apiKey, // In production, encrypt this
          api_endpoint: apiEndpoint || null,
          sync_frequency: syncFrequency,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setCrmConfigs(prev => [data, ...prev]);
      setShowAddCRM(false);
      resetForm();

      toast({
        title: "Thành công",
        description: "Đã thêm cấu hình CRM",
      });

    } catch (error) {
      console.error('Error adding CRM config:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm cấu hình CRM",
        variant: "destructive",
      });
    }
  };

  const testCRMConnection = async (configId: string) => {
    try {
      setIsTestingConnection(true);
      
      const { data, error } = await supabase.functions.invoke('seo-crm-sync', {
        body: {
          action: 'test_crm_connection',
          crm_config_id: configId,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;

      toast({
        title: "Kết nối thành công",
        description: data.message || "CRM đã được kết nối",
      });

    } catch (error) {
      console.error('Error testing CRM connection:', error);
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối tới CRM",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const toggleCRMStatus = async (configId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('crm_configurations')
        .update({ is_active: isActive })
        .eq('id', configId);

      if (error) throw error;

      setCrmConfigs(prev => prev.map(config => 
        config.id === configId ? { ...config, is_active: isActive } : config
      ));

      toast({
        title: "Cập nhật thành công",
        description: `CRM đã được ${isActive ? 'bật' : 'tắt'}`,
      });

    } catch (error) {
      console.error('Error updating CRM status:', error);
      toast({
        title: "Lỗi cập nhật",
        description: "Không thể cập nhật trạng thái CRM",
        variant: "destructive",
      });
    }
  };

  const bulkSyncToCRM = async (configId: string) => {
    try {
      setIsSyncing(true);
      
      const { data, error } = await supabase.functions.invoke('seo-crm-sync', {
        body: {
          action: 'bulk_sync',
          crm_config_id: configId,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;

      toast({
        title: "Đồng bộ thành công",
        description: `Đã đồng bộ ${data.synced}/${data.processed} bản ghi`,
      });

      // Refresh data
      fetchTrackingData();
      fetchSyncLogs();

    } catch (error) {
      console.error('Error bulk syncing:', error);
      toast({
        title: "Lỗi đồng bộ",
        description: "Không thể đồng bộ dữ liệu",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteCRMConfig = async (configId: string) => {
    try {
      const { error } = await supabase
        .from('crm_configurations')
        .delete()
        .eq('id', configId);

      if (error) throw error;

      setCrmConfigs(prev => prev.filter(config => config.id !== configId));

      toast({
        title: "Xóa thành công",
        description: "Đã xóa cấu hình CRM",
      });

    } catch (error) {
      console.error('Error deleting CRM config:', error);
      toast({
        title: "Lỗi xóa",
        description: "Không thể xóa cấu hình CRM",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedCRMType('');
    setCrmName('');
    setApiKey('');
    setApiEndpoint('');
    setSyncFrequency(300);
  };

  const getCRMTypeInfo = (type: string) => {
    return CRM_TYPES.find(crm => crm.value === type) || CRM_TYPES[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSyncedBadgeColor = (synced: boolean) => {
    return synced ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
  };

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configs" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            CRM Configs
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            SEO → Sales Journey
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Sync Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  CRM Configurations
                </div>
                <Button onClick={() => setShowAddCRM(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add CRM
                </Button>
              </CardTitle>
              <CardDescription>
                Kết nối và quản lý các hệ thống CRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingConfigs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Đang tải...</span>
                </div>
              ) : crmConfigs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có cấu hình CRM nào
                </div>
              ) : (
                <div className="space-y-4">
                  {crmConfigs.map((config) => {
                    const crmInfo = getCRMTypeInfo(config.crm_type);
                    
                    return (
                      <Card key={config.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{crmInfo.icon}</div>
                            <div>
                              <h4 className="font-medium">{config.crm_name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {crmInfo.label} • Sync mỗi {config.sync_frequency}s
                              </p>
                              {config.last_sync_at && (
                                <p className="text-xs text-muted-foreground">
                                  Sync cuối: {new Date(config.last_sync_at).toLocaleString('vi-VN')}
                                </p>
                              )}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={config.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}
                            >
                              {config.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={config.is_active}
                              onCheckedChange={(checked) => toggleCRMStatus(config.id, checked)}
                            />
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => testCRMConnection(config.id)}
                              disabled={isTestingConnection}
                            >
                              {isTestingConnection ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <TestTube className="h-4 w-4" />
                              )}
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => bulkSyncToCRM(config.id)}
                              disabled={isSyncing}
                            >
                              {isSyncing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCcw className="h-4 w-4" />
                              )}
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCRMConfig(config.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                SEO → Sales Journey
              </CardTitle>
              <CardDescription>
                Theo dõi hành trình từ SEO đến chuyển đổi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Lọc theo domain..."
                    value={domainFilter}
                    onChange={(e) => setDomainFilter(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="synced">Đã sync</SelectItem>
                    <SelectItem value="unsynced">Chưa sync</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1days">1 ngày</SelectItem>
                    <SelectItem value="7days">7 ngày</SelectItem>
                    <SelectItem value="30days">30 ngày</SelectItem>
                    <SelectItem value="all">Tất cả</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={fetchTrackingData}>
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* Tracking Data Table */}
              {loadingTracking ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Đang tải...</span>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Domain</TableHead>
                        <TableHead>Page</TableHead>
                        <TableHead>Keyword</TableHead>
                        <TableHead>UTM Campaign</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>CRM Status</TableHead>
                        <TableHead>Visited</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trackingData.map((data) => (
                        <TableRow key={data.id}>
                          <TableCell className="font-medium">{data.domain}</TableCell>
                          <TableCell>
                            <span className="text-xs">{data.page_url.substring(0, 50)}...</span>
                          </TableCell>
                          <TableCell>{data.keyword || '-'}</TableCell>
                          <TableCell>{data.utm_campaign || '-'}</TableCell>
                          <TableCell>{data.utm_source || data.referrer?.substring(0, 20) || '-'}</TableCell>
                          <TableCell>{data.country || '-'}</TableCell>
                          <TableCell>{data.device_type || '-'}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={getSyncedBadgeColor(data.synced_to_crm)}
                            >
                              {data.synced_to_crm ? 'Synced' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs">
                              {new Date(data.visited_at).toLocaleString('vi-VN')}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Sync Logs
              </CardTitle>
              <CardDescription>
                Lịch sử đồng bộ dữ liệu với CRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingLogs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Đang tải...</span>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>CRM</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Object ID</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Error</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {syncLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {(log as any).crm_configurations?.crm_name || 'Unknown'}
                          </TableCell>
                          <TableCell>{log.sync_type}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(log.status)}
                            >
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.crm_object_id || '-'}</TableCell>
                          <TableCell>
                            {log.sync_duration_ms ? `${log.sync_duration_ms}ms` : '-'}
                          </TableCell>
                          <TableCell>
                            {log.error_message ? (
                              <span className="text-xs text-red-600">
                                {log.error_message.substring(0, 50)}...
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs">
                              {new Date(log.created_at).toLocaleString('vi-VN')}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add CRM Dialog */}
      <Dialog open={showAddCRM} onOpenChange={setShowAddCRM}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm CRM Configuration</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="crm-type">CRM Type</Label>
              <Select value={selectedCRMType} onValueChange={setSelectedCRMType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn CRM..." />
                </SelectTrigger>
                <SelectContent>
                  {CRM_TYPES.map((crm) => (
                    <SelectItem key={crm.value} value={crm.value}>
                      <div className="flex items-center gap-2">
                        <span>{crm.icon}</span>
                        <div>
                          <div>{crm.label}</div>
                          <div className="text-xs text-muted-foreground">{crm.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="crm-name">Tên CRM</Label>
              <Input
                id="crm-name"
                placeholder="My HubSpot"
                value={crmName}
                onChange={(e) => setCrmName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="api-key">
                {selectedCRMType ? getCRMTypeInfo(selectedCRMType).apiKeyLabel : 'API Key'}
              </Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Nhập API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            {selectedCRMType && (
              <div>
                <Label htmlFor="sync-frequency">Sync Frequency (giây)</Label>
                <Input
                  id="sync-frequency"
                  type="number"
                  min="60"
                  value={syncFrequency}
                  onChange={(e) => setSyncFrequency(parseInt(e.target.value) || 300)}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddCRM(false)}>
              Hủy
            </Button>
            <Button onClick={addCRMConfig}>
              Thêm CRM
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}