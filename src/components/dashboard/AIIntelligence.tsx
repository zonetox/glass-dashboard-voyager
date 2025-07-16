import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Network, 
  MousePointer, 
  Lightbulb, 
  TrendingUp, 
  Users,
  Target,
  ArrowRight,
  Sparkles,
  Eye,
  CheckCircle2,
  Info,
  Navigation,
  ShoppingCart,
  Briefcase,
  Filter,
  Link,
  Plus,
  Settings,
  RotateCcw,
  Globe,
  Languages,
  BarChart3,
  Loader2,
  AlertTriangle,
  Bell,
  Clock,
  Mic,
  Volume2,
  Download,
  Copy,
  BarChart4,
  TrendingDown,
  Search,
  MapPin,
  PenTool
} from "lucide-react";
import IntentCoverageChart from './IntentCoverageChart';
import TopicalAuthorityHeatmap from './TopicalAuthorityHeatmap';
import MultiLangContentWriter from './MultiLangContentWriter';

interface TopicNode {
  id: string;
  label: string;
  type: 'main' | 'sub' | 'related';
  size: number;
  connections: string[];
  suggestedContent: {
    title: string;
    content: string;
    keywords: string[];
    intent: string;
  };
}

interface SemanticTopicMapProps {
  topics: TopicNode[];
  className?: string;
}

interface ContentIntent {
  id: string;
  content_id: string;
  intent_type: 'informational' | 'navigational' | 'transactional' | 'commercial';
  confidence: number;
  generated_at: string;
}

interface ContentWithIntent {
  id: string;
  url: string;
  intent_type: string;
  confidence: number;
  created_at: string;
}

interface InternalLinkSuggestion {
  id: string;
  from_article_id: string;
  to_article_id: string;
  anchor_text: string;
  position: number;
  ai_score: number;
  status: string;
  created_at: string;
  from_article?: { id: string; title: string; url: string };
  to_article?: { id: string; title: string; url: string };
}

interface Translation {
  id: string;
  original_id: string;
  lang: string;
  translated_title: string;
  translated_content: string;
  translated_meta: any;
  ai_quality_score: number;
  status: string;
  created_at: string;
}

interface AIIntelligenceProps {
  className?: string;
  scanData?: any;
}

export default function AIIntelligence({ className, scanData }: AIIntelligenceProps) {
  const [selectedTopic, setSelectedTopic] = useState<TopicNode | null>(null);
  const [activeTab, setActiveTab] = useState('map');
  const [contentIntent, setContentIntent] = useState<ContentIntent | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [contentWithIntent, setContentWithIntent] = useState<ContentWithIntent[]>([]);
  const [selectedIntentFilter, setSelectedIntentFilter] = useState<string>('all');
  const [loadingContent, setLoadingContent] = useState(false);
  const [internalLinks, setInternalLinks] = useState<InternalLinkSuggestion[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState('en');
  const [contentGaps, setContentGaps] = useState<any[]>([]);
  const [loadingGaps, setLoadingGaps] = useState(false);
  const [competitorUrls, setCompetitorUrls] = useState('');
  const [abTests, setAbTests] = useState<any[]>([]);
  const [isCreatingABTest, setIsCreatingABTest] = useState(false);
  const [newTestUrl, setNewTestUrl] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [voiceSearchData, setVoiceSearchData] = useState<any>(null);
  const [loadingVoiceSearch, setLoadingVoiceSearch] = useState(false);
  const [voiceSearchInput, setVoiceSearchInput] = useState('');
  const [keywordRankings, setKeywordRankings] = useState<any[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [trackingDomain, setTrackingDomain] = useState('');
  const [keywordsToTrack, setKeywordsToTrack] = useState('');
  const [targetUrls, setTargetUrls] = useState<{ [key: string]: string }>({});
  const [predictiveData, setPredictiveData] = useState<any[]>([]);
  const [loadingPredictive, setLoadingPredictive] = useState(false);
  const [predictiveDomain, setPredictiveDomain] = useState('');
  const [predictiveKeywords, setPredictiveKeywords] = useState('');
  const { toast } = useToast();

  // Fetch intent classification on component mount
  useEffect(() => {
    if (scanData?.id) {
      fetchContentIntent(scanData.id);
    }
    fetchAllContentWithIntent();
  }, [scanData?.id]);

  // Fetch content when filter changes
  useEffect(() => {
    fetchAllContentWithIntent();
  }, [selectedIntentFilter]);

  // Fetch internal links when tab is switched
  useEffect(() => {
    if (activeTab === 'internal-links') {
      fetchInternalLinks();
    }
    if (activeTab === 'multilang') {
      fetchTranslations();
    }
    if (activeTab === 'market-gaps') {
      fetchContentGaps();
    }
    if (activeTab === 'abtest') {
      fetchABTests();
    }
    if (activeTab === 'alerts') {
      fetchAlerts();
    }
    if (activeTab === 'voice-seo') {
      // Voice SEO data is generated on demand
    }
    if (activeTab === 'keyword-tracker') {
      fetchKeywordRankings();
    }
    if (activeTab === 'predictive-seo') {
      // Predictive SEO data is generated on demand
    }
  }, [activeTab]);

  const fetchContentIntent = async (contentId: string) => {
    try {
      const { data, error } = await supabase
        .from('content_intent')
        .select('*')
        .eq('content_id', contentId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setContentIntent(data as ContentIntent);
      }
    } catch (error) {
      console.error('Error fetching intent:', error);
    }
  };

  const fetchAllContentWithIntent = async () => {
    try {
      setLoadingContent(true);
      
      let query = supabase
        .from('content_intent')
        .select(`
          id,
          content_id,
          intent_type,
          confidence,
          created_at,
          scans!inner(url)
        `)
        .order('created_at', { ascending: false });

      if (selectedIntentFilter !== 'all') {
        query = query.eq('intent_type', selectedIntentFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedData = data?.map(item => ({
        id: item.content_id,
        url: (item as any).scans.url,
        intent_type: item.intent_type,
        confidence: item.confidence,
        created_at: item.created_at
      })) || [];

      setContentWithIntent(formattedData);
    } catch (error) {
      console.error('Error fetching content with intent:', error);
      setContentWithIntent([]);
    } finally {
      setLoadingContent(false);
    }
  };

  const fetchInternalLinks = async () => {
    try {
      setLoadingLinks(true);
      
      const { data, error } = await supabase
        .from('auto_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInternalLinks(data || []);
    } catch (error) {
      console.error('Error fetching internal links:', error);
      setInternalLinks([]);
    } finally {
      setLoadingLinks(false);
    }
  };

  const generateInternalLinks = async () => {
    try {
      setLoadingLinks(true);
      
      const { data, error } = await supabase.functions.invoke('auto-internal-links', {
        body: {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          auto_publish: false
        }
      });

      if (error) throw error;

      toast({
        title: "Phân tích hoàn thành",
        description: `Tìm thấy ${data.total_suggestions || 0} gợi ý liên kết nội bộ`
      });

      // Refresh the internal links list
      fetchInternalLinks();
    } catch (error) {
      console.error('Error generating internal links:', error);
      toast({
        title: "Lỗi phân tích",
        description: error.message || "Không thể tạo gợi ý liên kết",
        variant: "destructive"
      });
    } finally {
      setLoadingLinks(false);
    }
  };

  const updateLinkStatus = async (linkId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('auto_links')
        .update({ status })
        .eq('id', linkId);

      if (error) throw error;

      // Update local state
      setInternalLinks(prev => prev.map(link => 
        link.id === linkId ? { ...link, status } : link
      ));

      toast({
        title: "Cập nhật thành công",
        description: `Trạng thái liên kết đã được ${status === 'applied' ? 'áp dụng' : 'từ chối'}`
      });
    } catch (error) {
      console.error('Error updating link status:', error);
      toast({
        title: "Lỗi cập nhật",
        description: "Không thể cập nhật trạng thái liên kết",
        variant: "destructive"
      });
    }
  };

  // Translation functions
  const fetchTranslations = async () => {
    if (!scanData?.id) return;
    
    try {
      setLoadingTranslations(true);
      
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('original_id', scanData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTranslations(data || []);
    } catch (error) {
      console.error('Error fetching translations:', error);
      setTranslations([]);
    } finally {
      setLoadingTranslations(false);
    }
  };

  const translateContent = async () => {
    if (!scanData?.id) return;
    
    try {
      setLoadingTranslations(true);
      
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          original_id: scanData.id,
          target_language: selectedTargetLanguage,
          content: {
            title: scanData.seo?.title || 'Untitled',
            content: scanData.seo?.content || scanData.ai_analysis?.content || '',
            meta_description: scanData.seo?.meta_description || '',
            keywords: scanData.seo?.keywords || [],
            url_slug: scanData.url
          },
          preserve_keywords: ['SEO', 'AI', 'HTML', 'CSS', 'JavaScript'],
          auto_publish: false
        }
      });

      if (error) throw error;

      toast({
        title: "Dịch thuật hoàn thành",
        description: `Nội dung đã được dịch sang ${getLanguageName(selectedTargetLanguage)} với chất lượng ${Math.round((data.ai_quality_score || 0.8) * 100)}%`
      });

      // Refresh translations
      fetchTranslations();
    } catch (error) {
      console.error('Error translating content:', error);
      toast({
        title: "Lỗi dịch thuật",
        description: error.message || "Không thể dịch nội dung",
        variant: "destructive"
      });
    } finally {
      setLoadingTranslations(false);
    }
  };

  const publishTranslation = async (translationId: string) => {
    try {
      const { error } = await supabase
        .from('translations')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', translationId);

      if (error) throw error;

      // Update local state
      setTranslations(prev => prev.map(t => 
        t.id === translationId 
          ? { ...t, status: 'published', published_at: new Date().toISOString() } 
          : t
      ));

      toast({
        title: "Xuất bản thành công",
        description: "Bản dịch đã được xuất bản"
      });
    } catch (error) {
      console.error('Error publishing translation:', error);
      toast({
        title: "Lỗi xuất bản",
        description: "Không thể xuất bản bản dịch",
        variant: "destructive"
      });
    }
  };

  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      'en': 'English',
      'vi': 'Tiếng Việt',
      'zh': '中文',
      'ja': '日本語',
      'ko': '한국어',
      'es': 'Español',
      'fr': 'Français',
      'de': 'Deutsch',
      'it': 'Italiano',
      'pt': 'Português',
      'ru': 'Русский',
      'ar': 'العربية',
      'hi': 'हिन्दी',
      'th': 'ไทย'
    };
    return languages[code] || code;
  };

  const getLanguageFlag = (code: string) => {
    const flags: { [key: string]: string } = {
      'en': '🇺🇸',
      'vi': '🇻🇳',
      'zh': '🇨🇳',
      'ja': '🇯🇵',
      'ko': '🇰🇷',
      'es': '🇪🇸',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'it': '🇮🇹',
      'pt': '🇵🇹',
      'ru': '🇷🇺',
      'ar': '🇸🇦',
      'hi': '🇮🇳',
      'th': '🇹🇭'
    };
    return flags[code] || '🌐';
  };

  // Content gaps functions
  const fetchContentGaps = async () => {
    if (!scanData?.url) return;
    
    try {
      setLoadingGaps(true);
      
      const { data, error } = await supabase
        .from('competitor_analysis')
        .select('analysis_data')
        .eq('user_website_url', scanData.url)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.analysis_data && typeof data.analysis_data === 'object' && 'content_gaps' in data.analysis_data) {
        setContentGaps((data.analysis_data as any).content_gaps || []);
      }
    } catch (error) {
      console.error('Error fetching content gaps:', error);
      setContentGaps([]);
    } finally {
      setLoadingGaps(false);
    }
  };

  const analyzeContentGaps = async () => {
    if (!scanData?.url) return;
    
    const competitors = competitorUrls.split('\n').filter(url => url.trim()).map(url => url.trim());
    
    if (competitors.length === 0) {
      toast({
        title: "Cần danh sách đối thủ",
        description: "Vui lòng nhập ít nhất một URL đối thủ",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoadingGaps(true);
      
      const { data, error } = await supabase.functions.invoke('detect-content-gaps', {
        body: {
          domain: scanData.url,
          competitors: competitors,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;

      setContentGaps(data.content_gaps || []);
      
      toast({
        title: "Phân tích hoàn thành",
        description: `Tìm thấy ${data.gaps_found || 0} cơ hội nội dung từ ${data.competitors_analyzed} đối thủ`
      });

    } catch (error) {
      console.error('Error analyzing content gaps:', error);
      toast({
        title: "Lỗi phân tích",
        description: error.message || "Không thể phân tích cơ hội thị trường",
        variant: "destructive"
      });
    } finally {
      setLoadingGaps(false);
    }
  };

  // A/B Testing functions
  const fetchABTests = async () => {
    try {
      const { data, error } = await supabase
        .from('ab_tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAbTests(data || []);
    } catch (error) {
      console.error('Error loading A/B tests:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách A/B test",
        variant: "destructive",
      });
    }
  };

  const createABTest = async () => {
    if (!newTestUrl.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập URL",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingABTest(true);
    try {
      const { data, error } = await supabase.functions.invoke('run-ab-meta-test', {
        body: {
          url: newTestUrl.trim(),
          original_title: originalTitle.trim() || undefined,
          original_description: originalDescription.trim() || undefined,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã tạo A/B test thành công!",
      });

      setNewTestUrl('');
      setOriginalTitle('');
      setOriginalDescription('');
      fetchABTests();
    } catch (error) {
      console.error('Error creating A/B test:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo A/B test",
        variant: "destructive",
      });
    } finally {
      setIsCreatingABTest(false);
    }
  };

  const chooseWinner = async (testId: string, winner: 'a' | 'b') => {
    try {
      const { error } = await supabase
        .from('ab_tests')
        .update({ 
          winner_version: winner,
          status: 'completed',
          end_date: new Date().toISOString()
        })
        .eq('id', testId);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: `Đã chọn phiên bản ${winner.toUpperCase()} là winner!`,
      });

      fetchABTests();
    } catch (error) {
      console.error('Error choosing winner:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật kết quả",
        variant: "destructive",
      });
    }
  };

  // Alerts functions
  const fetchAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải cảnh báo",
        variant: "destructive",
      });
    } finally {
      setLoadingAlerts(false);
    }
  };

  const runSEOAlertsAnalysis = async () => {
    if (!selectedDomain.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập domain để phân tích",
        variant: "destructive",
      });
      return;
    }

    setLoadingAlerts(true);
    try {
      const { data, error } = await supabase.functions.invoke('seo-alerts-watcher', {
        body: {
          domain: selectedDomain.trim(),
          userId: (await supabase.auth.getUser()).data.user?.id,
          isScheduled: false
        }
      });

      if (error) throw error;

      toast({
        title: "Phân tích hoàn thành",
        description: `Đã tạo ${data.alertsGenerated || 0} cảnh báo từ phân tích SEO`,
      });

      fetchAlerts();
    } catch (error) {
      console.error('Error running SEO alerts analysis:', error);
      toast({
        title: "Lỗi",
        description: "Không thể chạy phân tích cảnh báo SEO",
        variant: "destructive",
      });
    } finally {
      setLoadingAlerts(false);
    }
  };

  const markAlertAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'emergency': return '🆘';
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📋';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'bg-red-50 border-red-200 text-red-700';
      case 'critical': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  // Voice Search functions
  const analyzeVoiceSearch = async () => {
    if (!voiceSearchInput.trim() && !scanData?.seo?.content) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung hoặc keyword để phân tích",
        variant: "destructive",
      });
      return;
    }

    setLoadingVoiceSearch(true);
    try {
      const content = scanData?.seo?.content || scanData?.ai_analysis?.content || '';
      
      const { data, error } = await supabase.functions.invoke('voice-search-enhancer', {
        body: {
          content: content,
          keyword: voiceSearchInput.trim() || undefined,
          url: scanData?.url,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;

      setVoiceSearchData(data);
      
      toast({
        title: "Phân tích hoàn thành",
        description: `Tạo thành công ${data.question_variants?.length || 0} câu hỏi và ${data.answer_snippets?.length || 0} câu trả lời`,
      });

    } catch (error) {
      console.error('Error analyzing voice search:', error);
      toast({
        title: "Lỗi phân tích",
        description: "Không thể phân tích voice search",
        variant: "destructive",
      });
    } finally {
      setLoadingVoiceSearch(false);
    }
  };

  const exportFAQSchema = () => {
    if (!voiceSearchData?.schema_faq) {
      toast({
        title: "Không có dữ liệu",
        description: "Chưa có schema FAQ để export",
        variant: "destructive",
      });
      return;
    }

    const schemaText = JSON.stringify(voiceSearchData.schema_faq, null, 2);
    const blob = new Blob([schemaText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faq-schema.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Thành công",
      description: "Đã export FAQ schema",
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Đã copy",
        description: `${type} đã được copy vào clipboard`,
      });
    }).catch(() => {
      toast({
        title: "Lỗi",
        description: "Không thể copy vào clipboard",
        variant: "destructive",
      });
    });
  };

  const getVoiceScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getIntentBadgeColor = (intent: string) => {
    switch (intent) {
      case 'informational': return 'bg-blue-100 text-blue-700';
      case 'navigational': return 'bg-green-100 text-green-700';
      case 'transactional': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Predictive SEO functions
  const generatePredictions = async () => {
    if (!predictiveDomain || !predictiveKeywords) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập domain và keywords",
        variant: "destructive",
      });
      return;
    }

    setLoadingPredictive(true);
    try {
      const keywords = predictiveKeywords.split(',').map(k => k.trim()).filter(k => k);
      
      const { data, error } = await supabase.functions.invoke('predict-seo-ranking', {
        body: {
          domain: predictiveDomain.trim(),
          keywords: keywords
        }
      });

      if (error) throw error;

      setPredictiveData(data.predictions || []);
      
      toast({
        title: "Dự đoán hoàn thành",
        description: `Phân tích ${keywords.length} từ khóa cho domain ${predictiveDomain}`,
      });

    } catch (error) {
      console.error('Error generating predictions:', error);
      toast({
        title: "Lỗi dự đoán",
        description: "Không thể tạo dự đoán ranking",
        variant: "destructive",
      });
    } finally {
      setLoadingPredictive(false);
    }
  };

  const getPredictionChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 bg-green-50';
    if (change < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getPredictionIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <BarChart3 className="h-4 w-4" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 60) return 'text-blue-600 bg-blue-50';
    if (confidence >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Keyword Rankings functions
  const fetchKeywordRankings = async () => {
    try {
      setLoadingRankings(true);
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setKeywordRankings(data || []);
    } catch (error) {
      console.error('Error loading keyword rankings:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu ranking",
        variant: "destructive",
      });
    } finally {
      setLoadingRankings(false);
    }
  };

  const trackKeywords = async () => {
    if (!trackingDomain.trim() || !keywordsToTrack.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập domain và danh sách từ khóa",
        variant: "destructive",
      });
      return;
    }

    const keywords = keywordsToTrack.split('\n').filter(k => k.trim()).map(k => k.trim());
    
    if (keywords.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập ít nhất một từ khóa",
        variant: "destructive",
      });
      return;
    }

    setLoadingRankings(true);
    try {
      const { data, error } = await supabase.functions.invoke('track-keyword-ranking', {
        body: {
          domain: trackingDomain.trim(),
          keywords: keywords,
          target_urls: targetUrls,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) {
        if (data?.setup_required) {
          toast({
            title: "Cần thiết lập API",
            description: "Vui lòng thêm SERPAPI_KEY vào Supabase secrets để sử dụng tính năng này",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Tracking hoàn thành",
        description: `Đã track ${data.summary?.tracked_keywords || 0}/${data.summary?.total_keywords || 0} từ khóa`,
      });

      fetchKeywordRankings();
    } catch (error) {
      console.error('Error tracking keywords:', error);
      toast({
        title: "Lỗi tracking",
        description: "Không thể track từ khóa",
        variant: "destructive",
      });
    } finally {
      setLoadingRankings(false);
    }
  };

  const updateTargetUrl = (keyword: string, url: string) => {
    setTargetUrls(prev => ({
      ...prev,
      [keyword]: url
    }));
  };

  const getRankBadgeColor = (currentRank: number | null, previousRank: number | null) => {
    if (!currentRank) return 'bg-gray-100 text-gray-700';
    if (!previousRank) return 'bg-blue-100 text-blue-700';
    
    if (currentRank < previousRank) return 'bg-green-100 text-green-700'; // Improved
    if (currentRank > previousRank) return 'bg-red-100 text-red-700'; // Declined
    return 'bg-gray-100 text-gray-700'; // Same
  };

  const getRankChangeIcon = (currentRank: number | null, previousRank: number | null) => {
    if (!currentRank || !previousRank) return null;
    
    if (currentRank < previousRank) return TrendingUp;
    if (currentRank > previousRank) return TrendingDown;
    return null;
  };

  const groupRankingsByKeyword = (rankings: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    rankings.forEach(ranking => {
      if (!grouped[ranking.keyword]) {
        grouped[ranking.keyword] = [];
      }
      grouped[ranking.keyword].push(ranking);
    });
    
    // Return latest ranking for each keyword
    return Object.keys(grouped).map(keyword => {
      const keywordRankings = grouped[keyword].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return keywordRankings[0]; // Most recent
    });
  };

  const getOpportunityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getOpportunityLabel = (score: number) => {
    if (score >= 80) return 'Cao';
    if (score >= 60) return 'Trung bình';
    if (score >= 40) return 'Thấp';
    return 'Rất thấp';
  };

  const classifyIntent = async () => {
    if (!scanData?.id) {
      toast({
        title: "Lỗi",
        description: "Không có dữ liệu scan để phân tích",
        variant: "destructive"
      });
      return;
    }

    setIsClassifying(true);
    try {
      // Extract content from scan data
      const content = scanData?.seo?.content || scanData?.ai_analysis?.content || '';
      
      if (!content) {
        throw new Error('Không tìm thấy nội dung để phân tích');
      }

      const { data, error } = await supabase.functions.invoke('classify-intent', {
        body: {
          content_id: scanData.id,
          content: content
        }
      });

      if (error) throw error;

      setContentIntent({
        id: data.stored_id,
        content_id: scanData.id,
        intent_type: data.intent_type,
        confidence: data.confidence,
        generated_at: new Date().toISOString()
      });

      toast({
        title: "Phân tích hoàn thành",
        description: `Phân loại intent: ${data.intent_type} (${Math.round(data.confidence * 100)}% confidence)`
      });

    } catch (error) {
      console.error('Intent classification error:', error);
      toast({
        title: "Lỗi phân tích",
        description: error.message || "Không thể phân tích intent",
        variant: "destructive"
      });
    } finally {
      setIsClassifying(false);
    }
  };

  const getIntentIcon = (intentType: string) => {
    switch (intentType) {
      case 'informational': return Info;
      case 'navigational': return Navigation;
      case 'transactional': return ShoppingCart;
      case 'commercial': return Briefcase;
      default: return Brain;
    }
  };

  const getIntentColor = (intentType: string) => {
    switch (intentType) {
      case 'informational': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'navigational': return 'bg-green-100 text-green-700 border-green-200';
      case 'transactional': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'commercial': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getIntentDescription = (intentType: string) => {
    switch (intentType) {
      case 'informational': return 'Cung cấp thông tin, giải đáp câu hỏi';
      case 'navigational': return 'Tìm kiếm website, thương hiệu cụ thể';
      case 'transactional': return 'Thực hiện hành động: mua, đăng ký, tải';
      case 'commercial': return 'So sánh sản phẩm, đánh giá, hướng dẫn mua';
      default: return 'Chưa phân loại';
    }
  };

  // Mock semantic topic data
  const semanticTopics: TopicNode[] = [
    {
      id: 'main-1',
      label: 'SEO Optimization',
      type: 'main',
      size: 100,
      connections: ['sub-1', 'sub-2', 'related-1'],
      suggestedContent: {
        title: 'Complete SEO Optimization Guide',
        content: 'Comprehensive guide covering on-page, off-page, and technical SEO strategies for maximum search engine visibility.',
        keywords: ['SEO optimization', 'search engine ranking', 'website optimization'],
        intent: 'informational'
      }
    },
    {
      id: 'sub-1',
      label: 'On-Page SEO',
      type: 'sub',
      size: 80,
      connections: ['main-1', 'related-2', 'related-3'],
      suggestedContent: {
        title: 'Master On-Page SEO Techniques',
        content: 'Learn how to optimize your website pages for better search rankings with proper title tags, meta descriptions, and content structure.',
        keywords: ['on-page SEO', 'title optimization', 'meta tags'],
        intent: 'informational'
      }
    },
    {
      id: 'sub-2',
      label: 'Technical SEO',
      type: 'sub',
      size: 75,
      connections: ['main-1', 'related-4'],
      suggestedContent: {
        title: 'Technical SEO Best Practices',
        content: 'Optimize your website\'s technical foundation with proper site structure, page speed, and mobile responsiveness.',
        keywords: ['technical SEO', 'site speed', 'mobile optimization'],
        intent: 'informational'
      }
    },
    {
      id: 'related-1',
      label: 'Keyword Research',
      type: 'related',
      size: 60,
      connections: ['main-1', 'sub-1'],
      suggestedContent: {
        title: 'Advanced Keyword Research Strategies',
        content: 'Discover high-value keywords that your competitors are missing using AI-powered research tools.',
        keywords: ['keyword research', 'search intent', 'keyword analysis'],
        intent: 'commercial'
      }
    },
    {
      id: 'related-2',
      label: 'Content Strategy',
      type: 'related',
      size: 65,
      connections: ['sub-1', 'related-3'],
      suggestedContent: {
        title: 'AI-Driven Content Strategy',
        content: 'Create content that ranks higher with AI-assisted topic research and semantic optimization.',
        keywords: ['content strategy', 'semantic SEO', 'AI content'],
        intent: 'commercial'
      }
    },
    {
      id: 'related-3',
      label: 'Link Building',
      type: 'related',
      size: 55,
      connections: ['sub-1', 'related-2'],
      suggestedContent: {
        title: 'Modern Link Building Techniques',
        content: 'Build high-quality backlinks that improve your domain authority and search rankings.',
        keywords: ['link building', 'backlinks', 'domain authority'],
        intent: 'commercial'
      }
    },
    {
      id: 'related-4',
      label: 'Core Web Vitals',
      type: 'related',
      size: 50,
      connections: ['sub-2'],
      suggestedContent: {
        title: 'Optimize Core Web Vitals',
        content: 'Improve your website\'s user experience metrics that Google uses for ranking.',
        keywords: ['core web vitals', 'page speed', 'user experience'],
        intent: 'informational'
      }
    }
  ];

  const getTopicColor = (type: string) => {
    switch (type) {
      case 'main': return 'bg-blue-500';
      case 'sub': return 'bg-green-500';
      case 'related': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getTopicSize = (size: number) => {
    if (size >= 80) return 'w-24 h-24 text-sm';
    if (size >= 60) return 'w-20 h-20 text-xs';
    return 'w-16 h-16 text-xs';
  };

  const handleTopicClick = (topic: TopicNode) => {
    setSelectedTopic(topic);
  };

  // SEO Comparison data
  const seoComparison = {
    traditional: {
      title: 'Traditional SEO',
      metrics: [
        { label: 'Keyword Density', value: '2.5%', status: 'good' },
        { label: 'Meta Tags', value: 'Optimized', status: 'good' },
        { label: 'Page Speed', value: '3.2s', status: 'warning' },
        { label: 'Mobile Score', value: '72/100', status: 'warning' },
        { label: 'Backlinks', value: '156', status: 'good' }
      ]
    },
    ai: {
      title: 'AI-Enhanced SEO',
      metrics: [
        { label: 'Semantic Match', value: '94%', status: 'excellent' },
        { label: 'Intent Alignment', value: '88%', status: 'excellent' },
        { label: 'Content Quality', value: '91/100', status: 'excellent' },
        { label: 'User Experience', value: '96/100', status: 'excellent' },
        { label: 'E-A-T Score', value: '89/100', status: 'excellent' }
      ]
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 dark:bg-green-950/20';
      case 'good': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20';
      case 'warning': return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">🧠 AI Intelligence</h2>
          <p className="text-muted-foreground mt-1">
            Khám phá semantic topic map và so sánh SEO thông minh
          </p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <Sparkles className="h-3 w-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      {/* Intent Classification Section */}
      {scanData && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Phân loại Intent
              </div>
              <Button 
                onClick={classifyIntent} 
                disabled={isClassifying}
                size="sm"
                variant="outline"
              >
                {isClassifying ? 'Đang phân tích...' : 'Phân tích Intent'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contentIntent ? (
              <div className="flex items-center gap-4">
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getIntentColor(contentIntent.intent_type)}`}>
                  {React.createElement(getIntentIcon(contentIntent.intent_type), { className: "h-4 w-4" })}
                  <span className="font-medium capitalize">{contentIntent.intent_type}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Confidence: {Math.round(contentIntent.confidence * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {getIntentDescription(contentIntent.intent_type)}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Chưa có dữ liệu phân loại intent. Nhấn "Phân tích Intent" để bắt đầu.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-11">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            AI Writer
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Semantic Topic Map
          </TabsTrigger>
          <TabsTrigger value="intent" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Search Intent Map
          </TabsTrigger>
          <TabsTrigger value="authority" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Topical Authority
          </TabsTrigger>
          <TabsTrigger value="internal-links" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Internal Links
          </TabsTrigger>
        <TabsTrigger value="multilang" className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          Đa ngôn ngữ
        </TabsTrigger>
        <TabsTrigger value="market-gaps" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Cơ hội thị trường
        </TabsTrigger>
        <TabsTrigger value="abtest" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          AI A/B Testing
        </TabsTrigger>
        <TabsTrigger value="alerts" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Smart Alerts
        </TabsTrigger>
        <TabsTrigger value="voice-seo" className="flex items-center gap-2">
          <Mic className="h-4 w-4" />
          Voice SEO
        </TabsTrigger>
        <TabsTrigger value="keyword-tracker" className="flex items-center gap-2">
          <BarChart4 className="h-4 w-4" />
          Keyword Tracker
        </TabsTrigger>
        <TabsTrigger value="predictive-seo" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Predictive SEO
        </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            SEO Comparison
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <MultiLangContentWriter />
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Semantic Topic Network
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Nhấn vào từng chủ đề để xem nội dung AI gợi ý
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Topic nodes positioned in a network layout */}
                <div className="absolute inset-4">
                  {/* Main topic - center */}
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    onClick={() => handleTopicClick(semanticTopics[0])}
                  >
                    <div className={`${getTopicSize(semanticTopics[0].size)} ${getTopicColor(semanticTopics[0].type)} rounded-full flex items-center justify-center text-white font-medium shadow-lg hover:scale-110 transition-all duration-200`}>
                      <div className="text-center leading-tight">
                        {semanticTopics[0].label.split(' ').map((word, i) => (
                          <div key={i}>{word}</div>
                        ))}
                      </div>
                    </div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Click để xem gợi ý
                    </div>
                  </div>

                  {/* Sub topics - positioned around main */}
                  <div 
                    className="absolute top-1/4 left-1/4 cursor-pointer group"
                    onClick={() => handleTopicClick(semanticTopics[1])}
                  >
                    <div className={`${getTopicSize(semanticTopics[1].size)} ${getTopicColor(semanticTopics[1].type)} rounded-full flex items-center justify-center text-white font-medium shadow-lg hover:scale-110 transition-all duration-200`}>
                      <div className="text-center leading-tight">
                        {semanticTopics[1].label.split(' ').map((word, i) => (
                          <div key={i}>{word}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div 
                    className="absolute top-1/4 right-1/4 cursor-pointer group"
                    onClick={() => handleTopicClick(semanticTopics[2])}
                  >
                    <div className={`${getTopicSize(semanticTopics[2].size)} ${getTopicColor(semanticTopics[2].type)} rounded-full flex items-center justify-center text-white font-medium shadow-lg hover:scale-110 transition-all duration-200`}>
                      <div className="text-center leading-tight">
                        {semanticTopics[2].label.split(' ').map((word, i) => (
                          <div key={i}>{word}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Related topics - positioned on edges */}
                  {semanticTopics.slice(3).map((topic, index) => {
                    const positions = [
                      'top-1/6 left-1/6',
                      'bottom-1/6 left-1/6', 
                      'top-1/6 right-1/6',
                      'bottom-1/6 right-1/6'
                    ];
                    
                    return (
                      <div 
                        key={topic.id}
                        className={`absolute ${positions[index]} cursor-pointer group`}
                        onClick={() => handleTopicClick(topic)}
                      >
                        <div className={`${getTopicSize(topic.size)} ${getTopicColor(topic.type)} rounded-full flex items-center justify-center text-white font-medium shadow-lg hover:scale-110 transition-all duration-200`}>
                          <div className="text-center leading-tight">
                            {topic.label.split(' ').map((word, i) => (
                              <div key={i}>{word}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                    <defs>
                      <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    {/* Main to sub connections */}
                    <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="url(#connectionGradient)" strokeWidth="2" strokeDasharray="5,5" />
                    <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="url(#connectionGradient)" strokeWidth="2" strokeDasharray="5,5" />
                    {/* Additional connections */}
                    <line x1="25%" y1="25%" x2="16.67%" y2="16.67%" stroke="url(#connectionGradient)" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="25%" y1="25%" x2="16.67%" y2="83.33%" stroke="url(#connectionGradient)" strokeWidth="1" strokeDasharray="3,3" />
                  </svg>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg p-3 shadow-lg">
                  <div className="text-xs font-medium mb-2">Chú thích:</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Chủ đề chính</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Chủ đề phụ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span>Chủ đề liên quan</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Chủ đề chính</p>
                    <p className="text-2xl font-bold">1</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Network className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Chủ đề phụ</p>
                    <p className="text-2xl font-bold">2</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Chủ đề liên quan</p>
                    <p className="text-2xl font-bold">4</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="intent" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Intent Coverage Chart */}
            <IntentCoverageChart />

            {/* Content List with Intent Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Danh sách bài viết
                  </div>
                  <Select value={selectedIntentFilter} onValueChange={setSelectedIntentFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Lọc theo intent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="informational">Thông tin</SelectItem>
                      <SelectItem value="navigational">Điều hướng</SelectItem>
                      <SelectItem value="transactional">Giao dịch</SelectItem>
                      <SelectItem value="commercial">Thương mại</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingContent ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-muted-foreground">Đang tải...</div>
                  </div>
                ) : contentWithIntent.length === 0 ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <div className="mb-2">Không có bài viết nào</div>
                      <div className="text-sm">
                        {selectedIntentFilter === 'all' 
                          ? 'Hãy phân tích intent cho các trang web'
                          : `Không có bài viết với intent "${selectedIntentFilter}"`
                        }
                      </div>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {contentWithIntent.map((content) => {
                        const IconComponent = getIntentIcon(content.intent_type);
                        return (
                          <div key={content.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getIntentColor(content.intent_type)}`}>
                              <IconComponent className="h-3 w-3" />
                              <span className="capitalize">{content.intent_type}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {content.url}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Confidence: {Math.round(content.confidence * 100)}% • 
                                Phân tích: {new Date(content.created_at).toLocaleDateString('vi-VN')}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="authority" className="space-y-6">
          <TopicalAuthorityHeatmap />
        </TabsContent>

        <TabsContent value="internal-links" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Gợi ý liên kết nội bộ
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={fetchInternalLinks} 
                    disabled={loadingLinks}
                    size="sm"
                    variant="outline"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Tải lại
                  </Button>
                  <Button 
                    onClick={generateInternalLinks} 
                    disabled={loadingLinks}
                    size="sm"
                  >
                    {loadingLinks ? 'Đang phân tích...' : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo gợi ý
                      </>
                    )}
                  </Button>
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                AI phân tích và đề xuất vị trí chèn liên kết nội bộ tự nhiên
              </p>
            </CardHeader>
            <CardContent>
              {loadingLinks ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-muted-foreground">Đang phân tích liên kết...</div>
                </div>
              ) : internalLinks.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Link className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <div className="mb-2">Chưa có gợi ý liên kết nội bộ</div>
                    <div className="text-sm">
                      Nhấn "Tạo gợi ý" để AI phân tích và đề xuất liên kết
                    </div>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {internalLinks.map((link) => (
                      <div key={link.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={link.status === 'applied' ? 'default' : 
                                       link.status === 'rejected' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {link.status === 'applied' ? 'Đã áp dụng' :
                               link.status === 'rejected' ? 'Đã từ chối' : 'Gợi ý'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              AI Score: {Math.round(link.ai_score * 100)}%
                            </Badge>
                          </div>
                          {link.status === 'suggested' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateLinkStatus(link.id, 'rejected')}
                                className="text-xs"
                              >
                                Từ chối
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => updateLinkStatus(link.id, 'applied')}
                                className="text-xs"
                              >
                                Áp dụng
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm">
                            <strong>Anchor text:</strong> 
                            <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-300">
                              "{link.anchor_text}"
                            </span>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            <strong>Vị trí chèn:</strong> {link.position}% vào bài viết
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            Từ bài: {link.from_article?.title || link.from_article_id} → 
                            Đến bài: {link.to_article?.title || link.to_article_id}
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            Tạo: {new Date(link.created_at).toLocaleDateString('vi-VN', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Settings Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Cài đặt liên kết tự động
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tự động chèn liên kết</p>
                    <p className="text-sm text-muted-foreground">
                      Tự động áp dụng các gợi ý có AI Score cao
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Bật tính năng
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ngưỡng AI Score tối thiểu</p>
                    <p className="text-sm text-muted-foreground">
                      Chỉ hiển thị gợi ý có độ tin cậy từ 70% trở lên
                    </p>
                  </div>
                  <Badge variant="outline">70%</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Kiểm tra định kỳ</p>
                    <p className="text-sm text-muted-foreground">
                      Tự động tạo gợi ý cho nội dung mới
                    </p>
                  </div>
                  <Badge variant="secondary">Hàng tuần</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multilang" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Dịch thuật đa ngôn ngữ
                </div>
                <div className="flex gap-2">
                  <Select value={selectedTargetLanguage} onValueChange={setSelectedTargetLanguage}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Chọn ngôn ngữ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="zh">🇨🇳 中文</SelectItem>
                      <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                      <SelectItem value="ko">🇰🇷 한국어</SelectItem>
                      <SelectItem value="es">🇪🇸 Español</SelectItem>
                      <SelectItem value="fr">🇫🇷 Français</SelectItem>
                      <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                      <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                      <SelectItem value="pt">🇵🇹 Português</SelectItem>
                      <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                      <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                      <SelectItem value="hi">🇮🇳 हिन्दी</SelectItem>
                      <SelectItem value="th">🇹🇭 ไทย</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={translateContent} 
                    disabled={loadingTranslations || !scanData?.id}
                    size="sm"
                  >
                    {loadingTranslations ? 'Đang dịch...' : (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        Dịch nội dung
                      </>
                    )}
                  </Button>
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                AI dịch thuật thông minh với tối ưu SEO và giữ ngữ cảnh
              </p>
            </CardHeader>
            <CardContent>
              {loadingTranslations ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-muted-foreground">Đang thực hiện dịch thuật...</div>
                </div>
              ) : translations.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <div className="mb-2">Chưa có bản dịch nào</div>
                    <div className="text-sm">
                      Chọn ngôn ngữ và nhấn "Dịch nội dung" để tạo bản dịch
                    </div>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {translations.map((translation) => (
                      <div key={translation.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 text-lg">
                              {getLanguageFlag(translation.lang)}
                              <span className="font-medium">{getLanguageName(translation.lang)}</span>
                            </div>
                            <Badge 
                              variant={translation.status === 'published' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {translation.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Quality: {Math.round(translation.ai_quality_score * 100)}%
                            </Badge>
                          </div>
                          {translation.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => publishTranslation(translation.id)}
                            >
                              Xuất bản
                            </Button>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm mb-1">Tiêu đề dịch:</h4>
                            <p className="text-sm bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                              {translation.translated_title}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-1">Meta description:</h4>
                            <p className="text-xs text-muted-foreground">
                              {translation.translated_meta?.description || 'Chưa có'}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-1">Keywords:</h4>
                            <div className="flex flex-wrap gap-1">
                              {(translation.translated_meta?.keywords || []).map((keyword: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground pt-2 border-t">
                            <div className="flex justify-between items-center">
                              <span>
                                Tạo: {new Date(translation.created_at).toLocaleDateString('vi-VN', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {translation.translated_meta?.preserved_elements && (
                                <span>
                                  Giữ nguyên: {translation.translated_meta.preserved_elements.length} từ khóa
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Translation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Cài đặt dịch thuật
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tự động xuất bản</p>
                    <p className="text-sm text-muted-foreground">
                      Tự động xuất bản bản dịch có chất lượng cao (&gt;85%)
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Bật tự động
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Giữ nguyên từ khóa SEO</p>
                    <p className="text-sm text-muted-foreground">
                      Danh sách từ khóa không dịch: SEO, AI, HTML, CSS, JavaScript
                    </p>
                  </div>
                  <Badge variant="outline">5 từ khóa</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ngưỡng chất lượng tối thiểu</p>
                    <p className="text-sm text-muted-foreground">
                      Chỉ lưu bản dịch có chất lượng từ 70% trở lên
                    </p>
                  </div>
                  <Badge variant="secondary">70%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Gaps Tab */}
        <TabsContent value="market-gaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Phân tích cơ hội thị trường
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Danh sách đối thủ (mỗi URL một dòng):
                </label>
                <textarea
                  value={competitorUrls}
                  onChange={(e) => setCompetitorUrls(e.target.value)}
                  className="w-full p-3 border rounded-lg h-24 text-sm"
                  placeholder="https://competitor1.com&#10;https://competitor2.com&#10;https://competitor3.com"
                />
              </div>
              
              <Button 
                onClick={analyzeContentGaps}
                disabled={loadingGaps}
                className="w-full"
              >
                {loadingGaps ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Phân tích cơ hội nội dung
                  </>
                )}
              </Button>

              {contentGaps.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-lg">Cơ hội được tìm thấy:</h3>
                  <div className="space-y-2">
                    {contentGaps
                      .sort((a, b) => b.opportunity_score - a.opportunity_score)
                      .map((gap, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-base mb-1">{gap.topic}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Từ khóa: <span className="font-mono bg-muted px-1 rounded">{gap.keyword}</span>
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {gap.competitor_count} đối thủ
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getOpportunityColor(gap.opportunity_score)}`}>
                                {getOpportunityLabel(gap.opportunity_score)} ({gap.opportunity_score}/100)
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-4"
                            onClick={() => {
                              // Navigate to content creation with pre-filled data
                              window.open(`/dashboard?tab=content&topic=${encodeURIComponent(gap.topic)}&keyword=${encodeURIComponent(gap.keyword)}`, '_blank');
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Viết ngay
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {contentGaps.length > 10 && (
                    <div className="text-center">
                      <Button variant="outline" size="sm">
                        Xem thêm cơ hội...
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {contentGaps.length === 0 && !loadingGaps && (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có phân tích cơ hội thị trường.</p>
                  <p className="text-sm">Nhập danh sách đối thủ và bắt đầu phân tích.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B Testing Tab */}
        <TabsContent value="abtest" className="space-y-6">
          <div className="space-y-6">
            {/* Create new A/B test */}
            <Card>
              <CardHeader>
                <CardTitle>Tạo A/B Test mới</CardTitle>
                <CardDescription>
                  Tạo 2 phiên bản title và meta description để kiểm tra hiệu quả
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="test-url">URL cần test *</Label>
                  <Input
                    id="test-url"
                    value={newTestUrl}
                    onChange={(e) => setNewTestUrl(e.target.value)}
                    placeholder="https://example.com/page"
                    disabled={isCreatingABTest}
                  />
                </div>
                <div>
                  <Label htmlFor="original-title">Title hiện tại (tùy chọn)</Label>
                  <Input
                    id="original-title"
                    value={originalTitle}
                    onChange={(e) => setOriginalTitle(e.target.value)}
                    placeholder="Để trống để tự động lấy từ trang"
                    disabled={isCreatingABTest}
                  />
                </div>
                <div>
                  <Label htmlFor="original-desc">Meta Description hiện tại (tùy chọn)</Label>
                  <Textarea
                    id="original-desc"
                    value={originalDescription}
                    onChange={(e) => setOriginalDescription(e.target.value)}
                    placeholder="Để trống để tự động lấy từ trang"
                    disabled={isCreatingABTest}
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={createABTest} 
                  disabled={isCreatingABTest || !newTestUrl.trim()}
                  className="w-full"
                >
                  {isCreatingABTest && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Tạo A/B Test
                </Button>
              </CardContent>
            </Card>

            {/* A/B Tests list */}
            <div className="space-y-4">
              {abTests.map((test) => (
                <Card key={test.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{test.url}</CardTitle>
                        <CardDescription>
                          Tạo lúc: {new Date(test.created_at).toLocaleDateString('vi-VN')}
                          {test.end_date && ` • Kết thúc: ${new Date(test.end_date).toLocaleDateString('vi-VN')}`}
                        </CardDescription>
                      </div>
                      <Badge variant={test.status === 'running' ? 'default' : 'secondary'}>
                        {test.status === 'running' ? 'Đang chạy' : 'Hoàn thành'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Version A */}
                      <div className={`p-4 border rounded-lg ${test.winner_version === 'a' ? 'border-green-500 bg-green-50' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-lg">Phiên bản A</h4>
                          {test.winner_version === 'a' && (
                            <Badge variant="default" className="bg-green-500">Winner</Badge>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium">Title:</Label>
                            <p className="mt-1 text-sm bg-muted p-2 rounded">
                              {test.version_a.title}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Description:</Label>
                            <p className="mt-1 text-sm bg-muted p-2 rounded">
                              {test.version_a.description}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Lý do:</Label>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {test.version_a.reasoning}
                            </p>
                          </div>
                          {test.ctr_data?.version_a && (
                            <div className="text-sm">
                              <strong>CTR:</strong> {
                                test.ctr_data.version_a.impressions > 0 
                                  ? ((test.ctr_data.version_a.clicks / test.ctr_data.version_a.impressions) * 100).toFixed(2)
                                  : 0
                              }% 
                              ({test.ctr_data.version_a.clicks}/{test.ctr_data.version_a.impressions})
                            </div>
                          )}
                          {test.status === 'running' && !test.winner_version && (
                            <Button 
                              size="sm" 
                              onClick={() => chooseWinner(test.id, 'a')}
                              variant="outline"
                            >
                              Chọn phiên bản này
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Version B */}
                      <div className={`p-4 border rounded-lg ${test.winner_version === 'b' ? 'border-green-500 bg-green-50' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-lg">Phiên bản B</h4>
                          {test.winner_version === 'b' && (
                            <Badge variant="default" className="bg-green-500">Winner</Badge>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium">Title:</Label>
                            <p className="mt-1 text-sm bg-muted p-2 rounded">
                              {test.version_b.title}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Description:</Label>
                            <p className="mt-1 text-sm bg-muted p-2 rounded">
                              {test.version_b.description}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Lý do:</Label>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {test.version_b.reasoning}
                            </p>
                          </div>
                          {test.ctr_data?.version_b && (
                            <div className="text-sm">
                              <strong>CTR:</strong> {
                                test.ctr_data.version_b.impressions > 0 
                                  ? ((test.ctr_data.version_b.clicks / test.ctr_data.version_b.impressions) * 100).toFixed(2)
                                  : 0
                              }% 
                              ({test.ctr_data.version_b.clicks}/{test.ctr_data.version_b.impressions})
                            </div>
                          )}
                          {test.status === 'running' && !test.winner_version && (
                            <Button 
                              size="sm" 
                              onClick={() => chooseWinner(test.id, 'b')}
                              variant="outline"
                            >
                              Chọn phiên bản này
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {abTests.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Chưa có A/B test nào</h3>
                    <p className="text-muted-foreground">
                      Tạo A/B test đầu tiên để kiểm tra hiệu quả title và meta description
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="compare" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traditional SEO */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  {seoComparison.traditional.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Phương pháp SEO truyền thống dựa trên từ khóa và metric cơ bản
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {seoComparison.traditional.metrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{metric.label}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getStatusColor(metric.status)}>
                        {metric.value}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI-Enhanced SEO */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  {seoComparison.ai.title}
                  <Badge variant="outline" className="ml-auto">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  SEO thông minh với AI phân tích semantic và user intent
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {seoComparison.ai.metrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{metric.label}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getStatusColor(metric.status)}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {metric.value}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Comparison Summary */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Kết quả so sánh</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    AI-Enhanced SEO cho thấy hiệu quả vượt trội với semantic understanding và user intent optimization.
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      +34% improvement
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">So với phương pháp truyền thống</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Smart SEO Alerts
              </CardTitle>
              <CardDescription>
                Hệ thống cảnh báo thông minh theo dõi ranking, PageSpeed và content changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="domain">Domain cần theo dõi</Label>
                  <Input
                    id="domain"
                    placeholder="https://example.com"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={runSEOAlertsAnalysis}
                    disabled={loadingAlerts}
                  >
                    {loadingAlerts ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang phân tích...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Chạy phân tích
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Alerts List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Cảnh báo gần đây</h3>
                  <Badge variant="outline">
                    {alerts.filter(alert => !alert.is_read).length} chưa đọc
                  </Badge>
                </div>

                {loadingAlerts && alerts.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Đang tải cảnh báo...
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Chưa có cảnh báo nào</p>
                    <p className="text-sm">Chạy phân tích để tạo cảnh báo SEO</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <Card
                        key={alert.id}
                        className={`${getSeverityColor(alert.severity)} ${
                          alert.is_read ? 'opacity-60' : ''
                        } cursor-pointer hover:shadow-md transition-all`}
                        onClick={() => !alert.is_read && markAlertAsRead(alert.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">
                              {getSeverityIcon(alert.severity)}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="capitalize">
                                  {alert.type}
                                </Badge>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {new Date(alert.created_at).toLocaleDateString('vi-VN')}
                                </div>
                              </div>
                              <p className="font-medium">{alert.message}</p>
                              <p className="text-sm text-muted-foreground">
                                Domain: {alert.domain}
                              </p>
                              {alert.link && (
                                <Button variant="link" className="p-0 h-auto text-xs">
                                  <Link className="h-3 w-3 mr-1" />
                                  Xem chi tiết
                                </Button>
                              )}
                            </div>
                            {!alert.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Alert Summary */}
              {alerts.length > 0 && (
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Thống kê cảnh báo</h4>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl">🆘</div>
                        <div className="text-sm font-medium">
                          {alerts.filter(a => a.severity === 'emergency').length}
                        </div>
                        <div className="text-xs text-muted-foreground">Khẩn cấp</div>
                      </div>
                      <div>
                        <div className="text-2xl">🚨</div>
                        <div className="text-sm font-medium">
                          {alerts.filter(a => a.severity === 'critical').length}
                        </div>
                        <div className="text-xs text-muted-foreground">Nghiêm trọng</div>
                      </div>
                      <div>
                        <div className="text-2xl">⚠️</div>
                        <div className="text-sm font-medium">
                          {alerts.filter(a => a.severity === 'warning').length}
                        </div>
                        <div className="text-xs text-muted-foreground">Cảnh báo</div>
                      </div>
                      <div>
                        <div className="text-2xl">ℹ️</div>
                        <div className="text-sm font-medium">
                          {alerts.filter(a => a.severity === 'info').length}
                        </div>
                        <div className="text-xs text-muted-foreground">Thông tin</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice-seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Search Optimization
              </CardTitle>
              <CardDescription>
                Tối ưu hóa nội dung cho tìm kiếm bằng giọng nói và trợ lý ảo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="voice-input">Nội dung hoặc từ khóa để phân tích</Label>
                  <Input
                    id="voice-input"
                    placeholder="Nhập từ khóa chính hoặc để trống để sử dụng nội dung scan hiện tại"
                    value={voiceSearchInput}
                    onChange={(e) => setVoiceSearchInput(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={analyzeVoiceSearch}
                    disabled={loadingVoiceSearch}
                  >
                    {loadingVoiceSearch ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang phân tích...
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4 mr-2" />
                        Phân tích Voice Search
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Voice Search Results */}
              {voiceSearchData && (
                <div className="space-y-6">
                  {/* Optimization Score */}
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Voice Search Score</h3>
                        <Badge variant="outline" className={getVoiceScoreColor(voiceSearchData.voice_optimization_score || 0)}>
                          {voiceSearchData.voice_optimization_score || 0}/100
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Tạo được {voiceSearchData.question_variants?.length || 0} câu hỏi và {voiceSearchData.answer_snippets?.length || 0} câu trả lời
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={exportFAQSchema}
                            disabled={!voiceSearchData.schema_faq}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export FAQ Schema
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Question Variants */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Câu hỏi Voice Search</CardTitle>
                      <CardDescription>
                        Các dạng câu hỏi người dùng có thể hỏi bằng giọng nói
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {voiceSearchData.question_variants?.map((question: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg bg-white/50 dark:bg-slate-800/50">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="font-medium mb-2">{question.question}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={getIntentBadgeColor(question.intent)}>
                                    {question.intent}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {question.difficulty}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {question.voice_pattern}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(question.question, "Câu hỏi")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Answer Snippets */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Câu trả lời được tối ưu</CardTitle>
                      <CardDescription>
                        Câu trả lời ngắn gọn, phù hợp cho voice search
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {voiceSearchData.answer_snippets?.map((snippet: any, index: number) => (
                          <div key={index} className="border rounded-lg overflow-hidden">
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <p className="font-medium text-sm mb-2">{snippet.question}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {snippet.word_count} từ
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      Readability: {snippet.readability_score}%
                                    </Badge>
                                    {snippet.optimized_for_voice && (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                        Voice Optimized
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(`Q: ${snippet.question}\nA: ${snippet.answer}`, "Q&A")}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="p-4">
                              <p className="text-muted-foreground leading-relaxed">
                                {snippet.answer}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  {voiceSearchData.recommendations?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Gợi ý cải thiện</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {voiceSearchData.recommendations.map((rec: string, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* No Data State */}
              {!voiceSearchData && !loadingVoiceSearch && (
                <div className="text-center p-8 text-muted-foreground">
                  <Mic className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Chưa có dữ liệu Voice Search</p>
                  <p className="text-sm">Nhập từ khóa và chạy phân tích để bắt đầu</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keyword-tracker" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart4 className="h-5 w-5" />
                Keyword Ranking Tracker
              </CardTitle>
              <CardDescription>
                Theo dõi vị trí từ khóa trên Google và phân tích thay đổi ranking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tracking Setup */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardHeader>
                  <CardTitle className="text-lg">Thiết lập tracking mới</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="tracking-domain">Domain để track</Label>
                      <Input
                        id="tracking-domain"
                        placeholder="https://example.com"
                        value={trackingDomain}
                        onChange={(e) => setTrackingDomain(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={trackKeywords}
                        disabled={loadingRankings}
                        className="w-full"
                      >
                        {loadingRankings ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Đang track...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Bắt đầu tracking
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="keywords-list">Danh sách từ khóa (mỗi từ khóa một dòng)</Label>
                    <Textarea
                      id="keywords-list"
                      placeholder="từ khóa 1&#10;từ khóa 2&#10;từ khóa 3"
                      value={keywordsToTrack}
                      onChange={(e) => setKeywordsToTrack(e.target.value)}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Rankings Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kết quả tracking gần đây</CardTitle>
                  <CardDescription>
                    Dữ liệu ranking được cập nhật từ SerpApi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingRankings && keywordRankings.length === 0 ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Đang tải dữ liệu ranking...
                    </div>
                  ) : keywordRankings.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      <BarChart4 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>Chưa có dữ liệu ranking</p>
                      <p className="text-sm">Thiết lập tracking để bắt đầu theo dõi từ khóa</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {groupRankingsByKeyword(keywordRankings).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Từ khóa tracking</div>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {groupRankingsByKeyword(keywordRankings).filter(r => 
                                r.current_rank && r.current_rank <= 10
                              ).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Top 10</div>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                              {groupRankingsByKeyword(keywordRankings).filter(r => 
                                r.current_rank && r.previous_rank && r.current_rank < r.previous_rank
                              ).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Tăng hạng</div>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {groupRankingsByKeyword(keywordRankings).filter(r => 
                                r.current_rank && r.previous_rank && r.current_rank > r.previous_rank
                              ).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Giảm hạng</div>
                          </div>
                        </Card>
                      </div>

                      {/* Rankings Table */}
                      <div className="space-y-3">
                        {groupRankingsByKeyword(keywordRankings).map((ranking, index) => {
                          const RankChangeIcon = getRankChangeIcon(ranking.current_rank, ranking.previous_rank);
                          
                          return (
                            <Card key={index} className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-medium">{ranking.keyword}</h4>
                                    <Badge variant="outline" className={getRankBadgeColor(ranking.current_rank, ranking.previous_rank)}>
                                      {ranking.current_rank ? `#${ranking.current_rank}` : 'Not found'}
                                    </Badge>
                                    {RankChangeIcon && (
                                      <div className="flex items-center gap-1">
                                        <RankChangeIcon className="h-4 w-4" />
                                        <span className="text-xs">
                                          {ranking.previous_rank ? `từ #${ranking.previous_rank}` : ''}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>Domain: {ranking.domain}</span>
                                    {ranking.search_volume && (
                                      <span>Volume: {ranking.search_volume.toLocaleString()}</span>
                                    )}
                                    {ranking.difficulty_score && (
                                      <span>Độ khó: {ranking.difficulty_score}/100</span>
                                    )}
                                    <span>Cập nhật: {new Date(ranking.created_at).toLocaleDateString('vi-VN')}</span>
                                  </div>

                                  {ranking.target_url && (
                                    <div className="mt-2 flex items-center gap-2">
                                      <MapPin className="h-3 w-3" />
                                      <span className="text-xs text-muted-foreground">
                                        Target: {ranking.target_url}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="text-right">
                                  <div className="space-y-1">
                                    {ranking.current_rank && ranking.current_rank <= 3 && (
                                      <Badge variant="outline" className="bg-green-50 text-green-700">
                                        Top 3
                                      </Badge>
                                    )}
                                    {ranking.current_rank && ranking.current_rank <= 10 && ranking.current_rank > 3 && (
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                        Top 10
                                      </Badge>
                                    )}
                                    {ranking.current_rank && ranking.current_rank > 50 && (
                                      <Badge variant="outline" className="bg-red-50 text-red-700">
                                        Cần cải thiện
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive-seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Predictive SEO Analysis
              </CardTitle>
              <CardDescription>
                Dự đoán thay đổi thứ hạng từ khóa trong 7 ngày tới
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Input Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="predictive-domain">Domain</Label>
                  <Input
                    id="predictive-domain"
                    placeholder="example.com"
                    value={predictiveDomain}
                    onChange={(e) => setPredictiveDomain(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="predictive-keywords">Keywords (phân cách bằng dấu phẩy)</Label>
                  <Input
                    id="predictive-keywords"
                    placeholder="SEO, marketing, content..."
                    value={predictiveKeywords}
                    onChange={(e) => setPredictiveKeywords(e.target.value)}
                  />
                </div>
              </div>
              
              <Button
                onClick={generatePredictions}
                disabled={loadingPredictive}
                className="w-full"
              >
                {loadingPredictive ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-2" />
                )}
                Phân tích dự đoán
              </Button>

              {/* Results */}
              {predictiveData.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Dự đoán thứ hạng (7 ngày tới)</h3>
                    <Badge variant="outline" className="text-sm">
                      {predictiveData.length} từ khóa
                    </Badge>
                  </div>

                  <div className="grid gap-4">
                    {predictiveData.map((prediction, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium">{prediction.keyword}</h4>
                              <Badge variant="outline">
                                Hiện tại: #{prediction.current_rank || 'N/A'}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={getPredictionChangeColor(prediction.predicted_change)}
                              >
                                <div className="flex items-center gap-1">
                                  {getPredictionIcon(prediction.predicted_change)}
                                  <span>
                                    {prediction.predicted_change > 0 ? '+' : ''}
                                    {prediction.predicted_change}
                                  </span>
                                </div>
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center gap-1">
                                <span>Độ tin cậy:</span>
                                <Badge 
                                  variant="outline"
                                  className={getConfidenceColor(prediction.confidence)}
                                >
                                  {prediction.confidence}%
                                </Badge>
                              </div>
                            </div>

                            <div className="text-sm">
                              <span className="font-medium">Hành động đề xuất:</span>
                              <p className="text-muted-foreground mt-1">
                                {prediction.suggested_action}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Tối ưu nội dung",
                                  description: `Bắt đầu tối ưu cho từ khóa: ${prediction.keyword}`,
                                });
                              }}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Tối ưu ngay
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Summary Stats */}
                  <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {predictiveData.filter(p => p.predicted_change > 0).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Từ khóa tăng hạng</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {predictiveData.filter(p => p.predicted_change < 0).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Từ khóa giảm hạng</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(predictiveData.reduce((acc, p) => acc + p.confidence, 0) / predictiveData.length)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Độ tin cậy TB</div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Alerts */}
              {predictiveData.some(p => p.predicted_change < -3) && (
                <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h4 className="font-medium text-red-800">Cảnh báo nội dung</h4>
                  </div>
                  <p className="text-sm text-red-700">
                    Một số từ khóa có khả năng giảm mạnh. Cần làm mới nội dung ngay!
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {predictiveData
                      .filter(p => p.predicted_change < -3)
                      .map((p, i) => (
                        <Badge key={i} variant="destructive" className="text-xs">
                          {p.keyword}
                        </Badge>
                      ))}
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <Dialog open={!!selectedTopic} onOpenChange={() => setSelectedTopic(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Nội dung AI gợi ý cho: {selectedTopic.label}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-2">
                <Badge className={getTopicColor(selectedTopic.type)}>
                  {selectedTopic.type === 'main' ? 'Chủ đề chính' : 
                   selectedTopic.type === 'sub' ? 'Chủ đề phụ' : 'Chủ đề liên quan'}
                </Badge>
                <Badge variant="outline">
                  Relevance: {selectedTopic.size}%
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">📝 Tiêu đề đề xuất</h3>
                <p className="text-lg bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                  {selectedTopic.suggestedContent.title}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">💡 Nội dung gợi ý</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedTopic.suggestedContent.content}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">🎯 Từ khóa target</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTopic.suggestedContent.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">🧭 Search Intent</h3>
                <Badge className="capitalize">
                  {selectedTopic.suggestedContent.intent}
                </Badge>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedTopic(null)}>
                  Đóng
                </Button>
                <Button>
                  <Eye className="h-4 w-4 mr-2" />
                  Tạo nội dung
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}