import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Download, Eye, FileText, Mail, Plus, Filter } from "lucide-react";
import { format } from "date-fns";

interface Report {
  id: string;
  url: string;
  file_url: string;
  report_type: string;
  include_ai: boolean;
  created_at: string;
  scan_id: string | null;
}

export function ReportViewer() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [domainFilter, setDomainFilter] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (domainFilter.trim()) {
      setFilteredReports(
        reports.filter(report => 
          report.url.toLowerCase().includes(domainFilter.toLowerCase())
        )
      );
    } else {
      setFilteredReports(reports);
    }
  }, [reports, domainFilter]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách báo cáo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewReport = async () => {
    const url = prompt("Nhập URL cần tạo báo cáo:");
    if (!url) return;

    const includeAI = confirm("Bao gồm phân tích AI SEO?");
    
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-pdf-report", {
        body: {
          url,
          include_ai: includeAI,
          scan_id: null
        }
      });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Báo cáo đã được tạo thành công",
      });
      
      fetchReports();
    } catch (error) {
      console.error("Error creating report:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo báo cáo",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const downloadReport = (report: Report) => {
    window.open(report.file_url, '_blank');
  };

  const sendEmail = async (report: Report) => {
    const email = prompt("Nhập email người nhận:");
    if (!email) return;

    try {
      // This would call an email sending edge function
      toast({
        title: "Thông báo",
        description: "Tính năng gửi email sẽ được triển khai trong phiên bản tiếp theo",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi email",
        variant: "destructive",
      });
    }
  };

  const getFileSize = (url: string) => {
    // Placeholder for file size - would need to fetch this info
    return "~2.5 MB";
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Báo cáo PDF</h2>
          <p className="text-muted-foreground">Quản lý và xem các báo cáo SEO đã tạo</p>
        </div>
        <Button onClick={createNewReport} disabled={creating}>
          <Plus className="w-4 h-4 mr-2" />
          {creating ? "Đang tạo..." : "Tạo báo cáo mới"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <Input
              placeholder="Lọc theo domain..."
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có báo cáo nào</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <Card 
                  key={report.id} 
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedReport?.id === report.id ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{getDomainFromUrl(report.url)}</h3>
                          <Badge variant={report.include_ai ? "default" : "secondary"}>
                            {report.include_ai ? "AI SEO" : "Thường"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{format(new Date(report.created_at), "dd/MM/yyyy HH:mm")}</p>
                          <p>Kích thước: {getFileSize(report.file_url)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(report);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadReport(report);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            sendEmail(report);
                          }}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Xem trước</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-4">
              {selectedReport ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Thông tin báo cáo</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Domain:</span>
                        <p className="text-muted-foreground">{getDomainFromUrl(selectedReport.url)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Ngày tạo:</span>
                        <p className="text-muted-foreground">
                          {format(new Date(selectedReport.created_at), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Loại:</span>
                        <p className="text-muted-foreground">
                          {selectedReport.include_ai ? "AI SEO Report" : "Standard SEO Report"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={() => downloadReport(selectedReport)} 
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Tải xuống PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => sendEmail(selectedReport)}
                      className="w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Gửi qua email
                    </Button>
                  </div>
                  
                  {/* PDF Preview Placeholder */}
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <div className="aspect-[3/4] bg-white border rounded flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <FileText className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">PDF Preview</p>
                        <p className="text-xs">Click "Tải xuống" để xem</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Chọn báo cáo để xem chi tiết</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}