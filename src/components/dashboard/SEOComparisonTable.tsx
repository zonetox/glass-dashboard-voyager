import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ArrowRight,
  FileText,
  Hash,
  Image,
  Database,
  Link,
  Clock,
  Globe
} from "lucide-react";

interface SEOComparisonTableProps {
  scan: {
    seo?: any;
    ai_analysis?: any;
  };
}

type StatusType = "success" | "warning" | "error";

interface SEOItem {
  category: string;
  icon: React.ReactNode;
  current: {
    value: string;
    status: StatusType;
  };
  suggested: {
    value: string;
    status: StatusType;
  };
}

const getStatusIcon = (status: StatusType) => {
  switch (status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />;
  }
};

const getStatusBadge = (status: StatusType) => {
  switch (status) {
    case "success":
      return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Đạt</Badge>;
    case "warning":
      return <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">Cần cải thiện</Badge>;
    case "error":
      return <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">Thiếu</Badge>;
  }
};

const evaluateStatus = (value: string | undefined): StatusType => {
  if (!value || value === "N/A" || value === "Not found" || value === "") {
    return "error";
  }
  if (value.length < 50) {
    return "warning";
  }
  return "success";
};

export default function SEOComparisonTable({ scan }: SEOComparisonTableProps) {
  if (!scan.seo && !scan.ai_analysis) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Không có dữ liệu SEO để so sánh</p>
        </CardContent>
      </Card>
    );
  }

  const seoData = scan.seo as Record<string, any> || {};
  const aiData = scan.ai_analysis as Record<string, any> || {};

  // Prepare comparison data
  const comparisonItems: SEOItem[] = [
    {
      category: "Meta Description",
      icon: <FileText className="h-4 w-4" />,
      current: {
        value: seoData.metaDescription || "Không có meta description",
        status: evaluateStatus(seoData.metaDescription)
      },
      suggested: {
        value: aiData.suggestedMetaDescription || "AI chưa đưa ra gợi ý",
        status: aiData.suggestedMetaDescription ? "success" : "warning"
      }
    },
    {
      category: "Title Tag",
      icon: <Hash className="h-4 w-4" />,
      current: {
        value: seoData.title || "Không có title",
        status: evaluateStatus(seoData.title)
      },
      suggested: {
        value: aiData.suggestedTitle || "AI chưa đưa ra gợi ý",
        status: aiData.suggestedTitle ? "success" : "warning"
      }
    },
    {
      category: "H1 Heading",
      icon: <Hash className="h-4 w-4" />,
      current: {
        value: seoData.h1 || "Không có H1",
        status: evaluateStatus(seoData.h1)
      },
      suggested: {
        value: aiData.suggestedH1 || "AI chưa đưa ra gợi ý",
        status: aiData.suggestedH1 ? "success" : "warning"
      }
    },
    {
      category: "Alt Text Images",
      icon: <Image className="h-4 w-4" />,
      current: {
        value: seoData.imagesWithoutAlt ? `${seoData.imagesWithoutAlt} ảnh thiếu alt text` : "Tất cả ảnh có alt text",
        status: seoData.imagesWithoutAlt > 0 ? "warning" : "success"
      },
      suggested: {
        value: aiData.imageOptimization || "Cần tối ưu alt text cho tất cả ảnh",
        status: "warning"
      }
    },
    {
      category: "Schema Markup",
      icon: <Database className="h-4 w-4" />,
      current: {
        value: seoData.schemaMarkup ? "Có Schema" : "Không có Schema",
        status: seoData.schemaMarkup ? "success" : "error"
      },
      suggested: {
        value: aiData.suggestedSchema || "Thêm Schema phù hợp",
        status: "success"
      }
    },
    {
      category: "Internal Links",
      icon: <Link className="h-4 w-4" />,
      current: {
        value: seoData.internalLinks ? `${seoData.internalLinks} liên kết` : "Không có dữ liệu",
        status: seoData.internalLinks > 5 ? "success" : "warning"
      },
      suggested: {
        value: aiData.linkingStrategy || "Tăng liên kết nội bộ",
        status: "success"
      }
    },
    {
      category: "Page Speed",
      icon: <Clock className="h-4 w-4" />,
      current: {
        value: seoData.pageSpeed ? `${seoData.pageSpeed}/100` : "Chưa đo",
        status: seoData.pageSpeed > 80 ? "success" : seoData.pageSpeed > 50 ? "warning" : "error"
      },
      suggested: {
        value: aiData.speedOptimization || "Tối ưu tốc độ tải",
        status: "success"
      }
    },
    {
      category: "Mobile Friendly",
      icon: <Globe className="h-4 w-4" />,
      current: {
        value: seoData.mobileFriendly ? "Tương thích mobile" : "Chưa tối ưu mobile",
        status: seoData.mobileFriendly ? "success" : "error"
      },
      suggested: {
        value: aiData.mobileOptimization || "Cải thiện trải nghiệm mobile",
        status: "success"
      }
    }
  ];

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 So sánh SEO hiện tại và Gợi ý AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Hạng mục SEO</TableHead>
                <TableHead className="min-w-[300px]">SEO hiện tại</TableHead>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="min-w-[300px]">Gợi ý AI SEO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonItems.map((item, index) => (
                <TableRow key={index} className="group hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-sm">{item.category}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.current.status)}
                        {getStatusBadge(item.current.status)}
                      </div>
                      <p className="text-sm text-muted-foreground break-words">
                        {item.current.value}
                      </p>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto group-hover:text-primary transition-colors" />
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.suggested.status)}
                        {getStatusBadge(item.suggested.status)}
                      </div>
                      <p className="text-sm text-muted-foreground break-words">
                        {item.suggested.value}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Mobile responsive summary */}
        <div className="mt-6 md:hidden space-y-4">
          <h3 className="font-semibold text-sm">Tóm tắt mobile:</h3>
          {comparisonItems.map((item, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center gap-2 mb-2">
                {item.icon}
                <span className="font-medium text-sm">{item.category}</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">Hiện tại:</span>
                    {getStatusIcon(item.current.status)}
                  </div>
                  <p className="text-xs">{item.current.value}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">Gợi ý AI:</span>
                    {getStatusIcon(item.suggested.status)}
                  </div>
                  <p className="text-xs">{item.suggested.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}