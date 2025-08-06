import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile, getCurrentUsage } from '@/lib/user-management';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Calendar, Award, BarChart3, Settings } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  tier: 'free' | 'pro' | 'agency' | 'enterprise';
  scans_limit: number;
  optimizations_limit: number;
  ai_rewrites_limit: number;
  created_at: string;
  updated_at: string;
}

interface UserUsage {
  id: string;
  user_id: string;
  scans_used: number;
  optimizations_used: number;
  ai_rewrites_used: number;
  reset_date: string;
  created_at: string;
  updated_at: string;
}

export function UserProfile() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [profileData, usageData] = await Promise.all([
        getUserProfile(),
        getCurrentUsage()
      ]);
      
      setProfile(profileData);
      setUsage(usageData);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out",
      });
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'pro': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'agency': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'enterprise': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'free': return 'Free Plan';
      case 'pro': return 'Pro Plan';
      case 'agency': return 'Agency Plan';
      case 'enterprise': return 'Enterprise Plan';
      default: return 'Unknown Plan';
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !profile || !usage) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-400">Unable to load profile data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
              <AvatarFallback className="bg-blue-500/20 text-blue-400 text-lg">
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">
                {user.user_metadata?.full_name || user.email}
              </h2>
              <div className="flex items-center space-x-4 text-gray-400">
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="mt-2">
                <Badge className={getTierColor(profile.tier)}>
                  <Award className="w-3 h-3 mr-1" />
                  {getTierName(profile.tier)}
                </Badge>
              </div>
            </div>
            <Button onClick={handleSignOut} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="usage" className="data-[state=active]:bg-blue-600">
            <BarChart3 className="w-4 h-4 mr-2" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="account" className="data-[state=active]:bg-blue-600">
            <User className="w-4 h-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scans Usage */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                  SEO Scans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Used</span>
                    <span className="text-white font-medium">
                      {usage.scans_used} / {profile.scans_limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getUsageColor(getUsagePercentage(usage.scans_used, profile.scans_limit))}`}
                      style={{ width: `${getUsagePercentage(usage.scans_used, profile.scans_limit)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Resets on {new Date(usage.reset_date).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Optimizations Usage */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-400" />
                  Optimizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Used</span>
                    <span className="text-white font-medium">
                      {usage.optimizations_used} / {profile.optimizations_limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getUsageColor(getUsagePercentage(usage.optimizations_used, profile.optimizations_limit))}`}
                      style={{ width: `${getUsagePercentage(usage.optimizations_used, profile.optimizations_limit)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Resets on {new Date(usage.reset_date).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI Rewrites Usage */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center">
                  <Award className="w-5 h-5 mr-2 text-green-400" />
                  AI Rewrites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Used</span>
                    <span className="text-white font-medium">
                      {usage.ai_rewrites_used} / {profile.ai_rewrites_limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getUsageColor(getUsagePercentage(usage.ai_rewrites_used, profile.ai_rewrites_limit))}`}
                      style={{ width: `${getUsagePercentage(usage.ai_rewrites_used, profile.ai_rewrites_limit)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Resets on {new Date(usage.reset_date).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {profile.tier === 'free' && (
            <Card className="glass-card border-purple-500/30">
              <CardContent className="pt-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Upgrade to Pro</h3>
                <p className="text-gray-400 mb-4">
                  Get more scans, unlimited optimizations, and advanced features
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Email</Label>
                  <Input
                    value={user.email || ''}
                    disabled
                    className="bg-gray-700/50 text-gray-300"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">User ID</Label>
                  <Input
                    value={user.id}
                    disabled
                    className="bg-gray-700/50 text-gray-300 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Account Created</Label>
                  <Input
                    value={new Date(user.created_at).toLocaleString()}
                    disabled
                    className="bg-gray-700/50 text-gray-300"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Last Updated</Label>
                  <Input
                    value={new Date(user.updated_at || user.created_at).toLocaleString()}
                    disabled
                    className="bg-gray-700/50 text-gray-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400">
                Advanced account settings will be available soon.
              </p>
              <div className="space-y-4">
                <Button variant="outline" className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}