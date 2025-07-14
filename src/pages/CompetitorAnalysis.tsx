import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Globe, 
  Zap, 
  FileText, 
  Target,
  Plus,
  X,
  BarChart3,
  Trophy,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';


interface CompetitorData {
  url: string;
  title?: string;
  metaDescription?: string;
  headings?: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  pageSpeed?: {
    desktop: number;
    mobile: number;
  };
  seoScore?: number;
  contentCount?: number;
  keywords?: string[];
  eeat?: {
    expertise: number;
    authoritativeness: number;
    trustworthiness: number;
  };
}

interface AnalysisResult {
  userSite: CompetitorData;
  competitors: CompetitorData[];
  insights: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    contentOpportunities: string[];
  };
  comparison: any;
}

export default function CompetitorAnalysis() {
  const [userDomain, setUserDomain] = useState('');
  const [competitorUrls, setCompetitorUrls] = useState(['']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const addCompetitorField = () => {
    if (competitorUrls.length < 3) {
      setCompetitorUrls([...competitorUrls, '']);
    }
  };

  const removeCompetitorField = (index: number) => {
    const newUrls = competitorUrls.filter((_, i) => i !== index);
    setCompetitorUrls(newUrls.length === 0 ? [''] : newUrls);
  };

  const updateCompetitorUrl = (index: number, value: string) => {
    const newUrls = [...competitorUrls];
    newUrls[index] = value;
    setCompetitorUrls(newUrls);
  };

  const validateUrls = () => {
    if (!userDomain.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập domain của bạn",
        variant: "destructive"
      });
      return false;
    }

    const validCompetitors = competitorUrls.filter(url => url.trim());
    if (validCompetitors.length === 0) {
      toast({
        title: "Lỗi", 
        description: "Vui lòng nhập ít nhất 1 domain đối thủ",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const startAnalysis = async () => {
    if (!validateUrls() || !user) return;

    setIsAnalyzing(true);
    try {
      const validCompetitors = competitorUrls.filter(url => url.trim());
      
      const { data, error } = await supabase.functions.invoke('competitor-analysis', {
        body: {
          userWebsiteUrl: userDomain,
          competitorUrls: validCompetitors,
          userId: user.id
        }
      });

      if (error) throw error;

      setAnalysisResult(data);
      toast({
        title: "Thành công",
        description: "Phân tích đối thủ đã hoàn tất!"
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thực hiện phân tích. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAdvantageIcon = (advantage: string) => {
    return advantage === 'user' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Phân tích đối thủ cạnh tranh
        </h1>
        <p className="text-muted-foreground">
          So sánh domain của bạn với các đối thủ về SEO, tốc độ và chất lượng content
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Thiết lập phân tích
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userDomain">Domain của bạn</Label>
            <Input
              id="userDomain"
              type="url"
              placeholder="https://yoursite.com"
              value={userDomain}
              onChange={(e) => setUserDomain(e.target.value)}
              className="glass-input"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Domain đối thủ (1-3 domain)</Label>
              {competitorUrls.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCompetitorField}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Thêm
                </Button>
              )}
            </div>
            
            {competitorUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="url"
                  placeholder={`https://competitor${index + 1}.com`}
                  value={url}
                  onChange={(e) => updateCompetitorUrl(index, e.target.value)}
                  className="glass-input flex-1"
                />
                {competitorUrls.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCompetitorField(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button 
            onClick={startAnalysis}
            disabled={isAnalyzing}
            className="w-full gradient-primary"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang phân tích...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Bắt đầu phân tích
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysisResult && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
            <TabsTrigger value="content">Nội dung</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">SEO Score</p>
                      <p className={`text-2xl font-bold ${getScoreColor(analysisResult.userSite.seoScore || 0)}`}>
                        {analysisResult.userSite.seoScore || 0}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Page Speed</p>
                      <p className={`text-2xl font-bold ${getScoreColor(analysisResult.userSite.pageSpeed?.desktop || 0)}`}>
                        {analysisResult.userSite.pageSpeed?.desktop || 0}
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Content Count</p>
                      <p className="text-2xl font-bold">
                        {analysisResult.userSite.contentCount || 0}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Đối thủ</p>
                      <p className="text-2xl font-bold">
                        {analysisResult.competitors.length}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Bảng so sánh tổng quan</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>SEO Score</TableHead>
                      <TableHead>Page Speed (Desktop)</TableHead>
                      <TableHead>Page Speed (Mobile)</TableHead>
                      <TableHead>Content Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-primary/5">
                      <TableCell className="font-medium">
                        <Badge variant="default">Của bạn</Badge> {analysisResult.userSite.url}
                      </TableCell>
                      <TableCell className={getScoreColor(analysisResult.userSite.seoScore || 0)}>
                        {analysisResult.userSite.seoScore || 0}
                      </TableCell>
                      <TableCell className={getScoreColor(analysisResult.userSite.pageSpeed?.desktop || 0)}>
                        {analysisResult.userSite.pageSpeed?.desktop || 0}
                      </TableCell>
                      <TableCell className={getScoreColor(analysisResult.userSite.pageSpeed?.mobile || 0)}>
                        {analysisResult.userSite.pageSpeed?.mobile || 0}
                      </TableCell>
                      <TableCell>{analysisResult.userSite.contentCount || 0}</TableCell>
                    </TableRow>
                    {analysisResult.competitors.map((competitor, index) => (
                      <TableRow key={index}>
                        <TableCell>{competitor.url}</TableCell>
                        <TableCell className={getScoreColor(competitor.seoScore || 0)}>
                          {competitor.seoScore || 0}
                        </TableCell>
                        <TableCell className={getScoreColor(competitor.pageSpeed?.desktop || 0)}>
                          {competitor.pageSpeed?.desktop || 0}
                        </TableCell>
                        <TableCell className={getScoreColor(competitor.pageSpeed?.mobile || 0)}>
                          {competitor.pageSpeed?.mobile || 0}
                        </TableCell>
                        <TableCell>{competitor.contentCount || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {analysisResult.comparison && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getAdvantageIcon(analysisResult.comparison.pageSpeed?.desktop?.advantage)}
                      Desktop Speed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Của bạn</span>
                        <span className="font-medium">{analysisResult.comparison.pageSpeed?.desktop?.user || 0}</span>
                      </div>
                      <Progress value={analysisResult.comparison.pageSpeed?.desktop?.user || 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Đối thủ (TB)</span>
                        <span className="font-medium">{Math.round(analysisResult.comparison.pageSpeed?.desktop?.competitors || 0)}</span>
                      </div>
                      <Progress value={analysisResult.comparison.pageSpeed?.desktop?.competitors || 0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getAdvantageIcon(analysisResult.comparison.pageSpeed?.mobile?.advantage)}
                      Mobile Speed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Của bạn</span>
                        <span className="font-medium">{analysisResult.comparison.pageSpeed?.mobile?.user || 0}</span>
                      </div>
                      <Progress value={analysisResult.comparison.pageSpeed?.mobile?.user || 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Đối thủ (TB)</span>
                        <span className="font-medium">{Math.round(analysisResult.comparison.pageSpeed?.mobile?.competitors || 0)}</span>
                      </div>
                      <Progress value={analysisResult.comparison.pageSpeed?.mobile?.competitors || 0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Phân tích Meta Tags & Headings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Domain của bạn</h4>
                    <div className="p-4 bg-primary/5 rounded-lg space-y-2">
                      <p><strong>Title:</strong> {analysisResult.userSite.title || 'Chưa phân tích'}</p>
                      <p><strong>Meta Description:</strong> {analysisResult.userSite.metaDescription || 'Chưa phân tích'}</p>
                      {analysisResult.userSite.headings && (
                        <div>
                          <p><strong>H1:</strong> {analysisResult.userSite.headings.h1?.join(', ') || 'Không có'}</p>
                          <p><strong>H2:</strong> {analysisResult.userSite.headings.h2?.slice(0, 3).join(', ') || 'Không có'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {analysisResult.competitors.map((competitor, index) => (
                    <div key={index}>
                      <h4 className="font-semibold mb-2">Đối thủ {index + 1}: {competitor.url}</h4>
                      <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                        <p><strong>Title:</strong> {competitor.title || 'Chưa phân tích'}</p>
                        <p><strong>Meta Description:</strong> {competitor.metaDescription || 'Chưa phân tích'}</p>
                        {competitor.headings && (
                          <div>
                            <p><strong>H1:</strong> {competitor.headings.h1?.join(', ') || 'Không có'}</p>
                            <p><strong>H2:</strong> {competitor.headings.h2?.slice(0, 3).join(', ') || 'Không có'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Trophy className="h-5 w-5" />
                    Điểm mạnh
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.insights.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Điểm yếu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.insights.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                        <span className="text-sm">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Target className="h-5 w-5" />
                    Khuyến nghị
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.insights.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {analysisResult.insights.contentOpportunities && analysisResult.insights.contentOpportunities.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Cơ hội nội dung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-2">
                    {analysisResult.insights.contentOpportunities.map((opportunity, index) => (
                      <Alert key={index}>
                        <AlertDescription>{opportunity}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}