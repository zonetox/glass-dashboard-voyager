import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ThankYou() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      navigate("/dashboard");
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white/5 backdrop-blur-lg border-white/10 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground mb-2">
            Cảm ơn bạn đã nâng cấp!
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Chúc mừng bạn đã trở thành thành viên Pro
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2 text-primary">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Đang cập nhật quyền hạn...</span>
              <Sparkles className="w-5 h-5" />
            </div>
            
            <p className="text-sm text-muted-foreground">
              Hệ thống sẽ tự động cập nhật quyền của bạn trong vài giây.
              Bạn có thể bắt đầu sử dụng các tính năng Pro ngay lập tức!
            </p>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
            <h3 className="font-semibold text-foreground mb-2">Tính năng Pro đã mở khóa:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>✓ Unlimited SEO scans</li>
              <li>✓ AI-powered analysis</li>
              <li>✓ PDF reports</li>
              <li>✓ Priority support</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/dashboard")}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về Dashboard
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Tự động chuyển hướng trong {countdown} giây
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}