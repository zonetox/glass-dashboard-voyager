
import { useAuth } from "../hooks/useAuth";
import { AuthForm } from "../components/AuthForm";
import { Button } from "@/components/ui/button";
import { Navigate } from "react-router-dom";
import { 
  BarChart3, 
  Search, 
  Target, 
  TrendingUp,
  Globe,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: Search,
      title: "Website Analysis",
      description: "Comprehensive SEO audits with detailed reports and actionable insights."
    },
    {
      icon: Target,
      title: "Issue Detection",
      description: "Automatically identify SEO problems and prioritize fixes by impact."
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your SEO improvements with real-time score tracking."
    },
    {
      icon: CheckCircle,
      title: "Optimization Guide",
      description: "Step-by-step recommendations to boost your search rankings."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  SEO Auto Tool
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Automate Your 
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {" "}SEO Success
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Analyze, optimize, and track your website's SEO performance with our 
                comprehensive automation tool. Get actionable insights and boost your 
                search rankings.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-3 text-lg"
                >
                  View Demo
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">50K+</div>
                <div className="text-sm text-gray-400">Websites Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">98%</div>
                <div className="text-sm text-gray-400">Issue Detection</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">3x</div>
                <div className="text-sm text-gray-400">Faster Results</div>
              </div>
            </div>
          </div>

          {/* Auth Form */}
          <div className="lg:max-w-md lg:mx-auto">
            <AuthForm />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">
            Everything You Need for 
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}SEO Success
            </span>
          </h3>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Our comprehensive SEO automation platform provides all the tools 
            and insights you need to improve your search rankings.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-2 text-white">
                  {feature.title}
                </h4>
                <p className="text-gray-400 text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="glass-card p-8 lg:p-12 text-center">
          <Globe className="h-16 w-16 text-blue-400 mx-auto mb-6" />
          <h3 className="text-3xl font-bold mb-4 text-white">
            Ready to Boost Your SEO?
          </h3>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of websites that have improved their search rankings 
            with our automated SEO analysis and optimization tools.
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
          >
            Start Your Free Analysis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2024 SEO Auto Tool. Built with React, TypeScript & Supabase.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
