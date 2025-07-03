
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Shield, Zap, Globe } from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  const features = [
    {
      icon: Sparkles,
      title: "Modern Design",
      description: "Beautiful glassmorphism UI with smooth animations"
    },
    {
      icon: Shield,
      title: "Secure",
      description: "Built with security best practices and authentication"
    },
    {
      icon: Zap,
      title: "Fast",
      description: "Optimized performance with modern React patterns"
    },
    {
      icon: Globe,
      title: "Responsive",
      description: "Works perfectly on all devices and screen sizes"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 animate-fade-in">
            Glass Dashboard
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the future of web applications with our modern glassmorphism design and powerful features.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="glass-card border-white/10 hover:border-white/20 transition-all duration-300">
                  <CardContent className="p-6">
                    <feature.icon className="h-8 w-8 text-blue-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="glass-card p-6 border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Modern React with TypeScript
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Supabase Integration
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Tailwind CSS & Shadcn/ui
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Responsive Design
                </li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-center">
            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  );
}
