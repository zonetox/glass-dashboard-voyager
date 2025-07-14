import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, CheckCircle2, Clock, RefreshCw, Activity, Database, Zap, AlertTriangle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface HealthReport {
  analyzeSiteStatus: "OK" | "NO_CALL" | "ERROR"
  scanRecordsLast24h: number
  lastScanTime: string | null
  aiAnalysisSample: any
  errorLogs: string[]
  checkedAt: string
  summary: {
    totalScans: number
    hasRecentActivity: boolean
    hasErrors: boolean
    lastActivityHoursAgo: number | null
  }
}

export function APIHealthPanel() {
  const [healthData, setHealthData] = useState<HealthReport | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchHealthData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('check-api-health')
      
      if (error) {
        throw error
      }

      setHealthData(data)
      toast({
        title: "✅ Cập nhật thành công",
        description: "Dữ liệu tình trạng API đã được làm mới"
      })
    } catch (error) {
      console.error('Error fetching health data:', error)
      toast({
        title: "❌ Lỗi",
        description: "Không thể tải dữ liệu tình trạng API",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthData()
  }, [])

  const getStatusColor = (status: "OK" | "NO_CALL" | "ERROR") => {
    switch (status) {
      case "OK": return "text-green-600 bg-green-50"
      case "NO_CALL": return "text-yellow-600 bg-yellow-50"
      case "ERROR": return "text-red-600 bg-red-50"
    }
  }

  const getStatusIcon = (status: "OK" | "NO_CALL" | "ERROR") => {
    switch (status) {
      case "OK": return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "NO_CALL": return <Clock className="h-5 w-5 text-yellow-600" />
      case "ERROR": return <AlertCircle className="h-5 w-5 text-red-600" />
    }
  }

  const getStatusText = (status: "OK" | "NO_CALL" | "ERROR") => {
    switch (status) {
      case "OK": return "Hoạt động bình thường"
      case "NO_CALL": return "Chưa có lượt gọi"
      case "ERROR": return "Có lỗi xảy ra"
    }
  }

  if (!healthData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Tình trạng API
          </CardTitle>
          <CardDescription>Giám sát hoạt động của hệ thống API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Đang kiểm tra...</span>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có dữ liệu
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Tình trạng API
            </CardTitle>
            <CardDescription>
              Cập nhật lần cuối: {format(new Date(healthData.checkedAt), 'HH:mm dd/MM/yyyy')}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchHealthData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="flex items-center gap-3">
          {getStatusIcon(healthData.analyzeSiteStatus)}
          <div>
            <div className="font-medium">Trạng thái analyze-site</div>
            <Badge variant="secondary" className={getStatusColor(healthData.analyzeSiteStatus)}>
              {getStatusText(healthData.analyzeSiteStatus)}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scan Count */}
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
            <Database className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{healthData.scanRecordsLast24h}</div>
              <div className="text-sm text-muted-foreground">Lượt gọi trong 24h</div>
            </div>
          </div>

          {/* Last Activity */}
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
            <Clock className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-lg font-semibold">
                {healthData.lastScanTime ? 
                  format(new Date(healthData.lastScanTime), 'HH:mm dd/MM') : 
                  'Chưa có'
                }
              </div>
              <div className="text-sm text-muted-foreground">
                {healthData.summary.lastActivityHoursAgo ? 
                  `${healthData.summary.lastActivityHoursAgo}h trước` : 
                  'Hoạt động gần nhất'
                }
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis Sample */}
        {healthData.aiAnalysisSample && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Mẫu dữ liệu AI Analysis</span>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <pre className="whitespace-pre-wrap text-xs overflow-x-auto">
                {JSON.stringify(healthData.aiAnalysisSample, null, 2).substring(0, 300)}
                {JSON.stringify(healthData.aiAnalysisSample).length > 300 && '...'}
              </pre>
            </div>
          </div>
        )}

        {/* Error Logs */}
        {healthData.errorLogs && healthData.errorLogs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-600">
                Lỗi ghi nhận ({healthData.errorLogs.length})
              </span>
            </div>
            <div className="space-y-2">
              {healthData.errorLogs.slice(0, 3).map((error, index) => (
                <div key={index} className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <code className="text-sm text-red-800">{error}</code>
                </div>
              ))}
              {healthData.errorLogs.length > 3 && (
                <div className="text-sm text-muted-foreground">
                  và {healthData.errorLogs.length - 3} lỗi khác...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={healthData.summary.hasRecentActivity ? "default" : "secondary"}>
            {healthData.summary.hasRecentActivity ? "✅" : "⏸️"} 
            {healthData.summary.hasRecentActivity ? "Có hoạt động" : "Không hoạt động"}
          </Badge>
          <Badge variant={healthData.summary.hasErrors ? "destructive" : "default"}>
            {healthData.summary.hasErrors ? "❌" : "✅"}
            {healthData.summary.hasErrors ? "Có lỗi" : "Không lỗi"}
          </Badge>
          <Badge variant="outline">
            📊 {healthData.summary.totalScans} scans
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}