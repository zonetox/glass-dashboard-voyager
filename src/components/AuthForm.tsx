
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { sendWelcomeEmail } from '@/lib/email-service';
import { LogOut, User, Mail, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { signIn, signUp, signOut, user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi hệ thống",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể đăng xuất",
      });
    }
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  };

  // Load profile when user is available
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // If user is logged in, show profile and logout option
  if (user) {
    return (
      <Card className="glass-card w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Thông tin tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <Mail className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            
            {userProfile && (
              <>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <User className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tên đầy đủ</p>
                    <p className="font-medium">{userProfile.full_name || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={userProfile.user_tier === 'free' ? 'secondary' : 'default'}
                      className="text-sm"
                    >
                      {userProfile.user_tier === 'free' ? 'Miễn phí' : 
                       userProfile.user_tier === 'premium' ? 'Premium' : 'Enterprise'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Đã sử dụng</p>
                    <p className="font-medium">{userProfile.scans_used}/{userProfile.scans_limit} lần quét</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                  {user.email_confirmed_at ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">Email đã xác thực</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-yellow-400">Chưa xác thực email</span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
          
          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password, fullName);

      if (error) {
        // Handle specific error types
        if (error.message.includes('Invalid login credentials')) {
          toast({
            variant: "destructive",
            title: "Đăng nhập thất bại",
            description: "Email hoặc mật khẩu không đúng. Vui lòng thử lại.",
          });
        } else if (error.message.includes('User already registered')) {
          toast({
            variant: "destructive", 
            title: "Email đã tồn tại",
            description: "Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: error.message,
          });
        }
      } else if (!isLogin) {
        // Send welcome email after successful signup
        sendWelcomeEmail(email).catch(emailError => {
          console.error('Failed to send welcome email:', emailError);
        });
        
        toast({
          title: "Đăng ký thành công",
          description: "Vui lòng kiểm tra email để xác thực tài khoản. Tài khoản miễn phí đã được tạo với 10 lần quét SEO/tháng.",
        });
        
        // Clear form
        setEmail('');
        setPassword('');
        setFullName('');
      } else {
        toast({
          title: "Đăng nhập thành công", 
          description: "Chào mừng bạn trở lại!",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}
        </CardTitle>
        <p className="text-muted-foreground mt-2">
          {isLogin ? 'Chào mừng bạn trở lại!' : 'Tạo tài khoản miễn phí với 10 lần quét SEO/tháng'}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Nhập họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="glass bg-white/5 border-white/20 focus:border-blue-400"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Nhập địa chỉ email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="glass bg-white/5 border-white/20 focus:border-blue-400"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder={isLogin ? "Nhập mật khẩu" : "Tạo mật khẩu (tối thiểu 6 ký tự)"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="glass bg-white/5 border-white/20 focus:border-blue-400"
            />
          </div>

          {!isLogin && (
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-300">
                <strong>Gói miễn phí bao gồm:</strong>
              </p>
              <ul className="text-sm text-blue-200 mt-1 space-y-1">
                <li>• 10 lần quét SEO mỗi tháng</li>
                <li>• Phân tích cơ bản</li>
                <li>• Báo cáo PDF</li>
                <li>• Hỗ trợ email</li>
              </ul>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Tạo tài khoản miễn phí')}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <Button
            type="button"
            variant="link"
            onClick={() => {
              setIsLogin(!isLogin);
              setEmail('');
              setPassword('');
              setFullName('');
            }}
            className="text-blue-400 hover:text-blue-300"
          >
            {isLogin ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
