
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, ShoppingCart, TrendingUp, Activity, FileText } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12.5%",
      icon: Users,
      trend: "up" as const
    },
    {
      title: "Revenue",
      value: "$45,239",
      change: "+8.2%",
      icon: DollarSign,
      trend: "up" as const
    },
    {
      title: "Orders",
      value: "1,234",
      change: "-2.1%",
      icon: ShoppingCart,
      trend: "down" as const
    },
    {
      title: "Growth",
      value: "23.5%",
      change: "+5.4%",
      icon: TrendingUp,
      trend: "up" as const
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-gray-400 mt-2">Welcome back! Here's what's happening with your business today.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400" />
                Activity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">New Users</span>
                  <span className="text-white font-semibold">+127</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Revenue Growth</span>
                  <span className="text-white font-semibold">+15.3%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-4/5"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">User Engagement</span>
                  <span className="text-white font-semibold">89.2%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full w-5/6"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-white text-sm">New user registration</p>
                    <p className="text-gray-400 text-xs">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-white text-sm">Payment processed successfully</p>
                    <p className="text-gray-400 text-xs">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-white text-sm">System update completed</p>
                    <p className="text-gray-400 text-xs">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-white text-sm">New feature deployed</p>
                    <p className="text-gray-400 text-xs">3 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                View Reports
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 justify-start">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Process Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
