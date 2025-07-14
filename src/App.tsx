
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import AIKeywords from "./pages/AIKeywords";
import CompetitorAnalysis from "./pages/CompetitorAnalysis";
import VoiceSearchOptimizer from "./pages/VoiceSearchOptimizer";
import ContentTrendsPredictor from "./pages/ContentTrendsPredictor";
import Admin from "./pages/Admin";
import AdminPlans from "./pages/AdminPlans";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import SharedScanView from "./pages/SharedScanView";
import Upgrade from "./pages/Upgrade";
import ThankYou from "./pages/ThankYou";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SEO Auto Tool...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/scan/:id" element={<SharedScanView />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-keywords" 
              element={
                <ProtectedRoute>
                  <AIKeywords />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/competitor-analysis" 
              element={
                <ProtectedRoute>
                  <CompetitorAnalysis />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/voice-search" 
              element={
                <ProtectedRoute>
                  <VoiceSearchOptimizer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/content-trends" 
              element={
                <ProtectedRoute>
                  <ContentTrendsPredictor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/plans" 
              element={
                <ProtectedRoute>
                  <AdminPlans />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
