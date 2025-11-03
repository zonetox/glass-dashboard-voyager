import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create client with user's JWT for authentication
    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Create service role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user has admin role using security definer function
    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      console.log(`Unauthorized access attempt by user ${user.id}`);
      throw new Error('Insufficient permissions');
    }

    // Fetch metrics using service role (admin verified)
    const [
      { data: userStats },
      { data: scanStats },
      { data: apiLogs },
      { data: pdfReports },
      { data: storageInfo }
    ] = await Promise.all([
      supabaseAdmin.from('user_profiles').select('id, email, tier, created_at, last_active_at'),
      supabaseAdmin.from('scans').select('url, created_at'),
      supabaseAdmin.from('api_logs')
        .select('api_name, success, error_message, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabaseAdmin.from('reports').select('id').eq('report_type', 'seo_analysis'),
      supabaseAdmin.storage.listBuckets()
    ]);

    // Calculate storage usage
    let totalStorageSize = 0;
    if (storageInfo) {
      for (const bucket of storageInfo) {
        const { data: files } = await supabaseAdmin.storage.from(bucket.name).list();
        if (files) {
          totalStorageSize += files.length;
        }
      }
    }
    const storagePercentage = Math.min(Math.round((totalStorageSize / 1000) * 100), 100);

    // Process metrics
    const currentDate = new Date();
    const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date().toDateString();

    // User metrics
    const totalUsers = userStats?.length || 0;
    const newUsersThisWeek = userStats?.filter(user => 
      new Date(user.created_at) >= oneWeekAgo
    ).length || 0;
    const activeUsersToday = userStats?.filter(user => 
      new Date(user.created_at).toDateString() === today
    ).length || 0;

    // Scan metrics
    const totalScansThisMonth = scanStats?.filter(scan => 
      new Date(scan.created_at).getMonth() === currentDate.getMonth()
    ).length || 0;

    // API error analysis
    const failedAPIs = apiLogs ? Object.entries(
      apiLogs
        .filter(log => !log.success)
        .reduce((acc, log) => {
          if (!acc[log.api_name]) {
            acc[log.api_name] = { count: 0, last_error: '' };
          }
          acc[log.api_name].count++;
          acc[log.api_name].last_error = log.error_message || 'Unknown error';
          return acc;
        }, {} as Record<string, { count: number; last_error: string }>)
    ).map(([name, data]) => ({
      name,
      failures: data.count,
      last_error: data.last_error
    })).sort((a, b) => b.failures - a.failures).slice(0, 5) : [];

    // Top domains analysis
    const domainCounts = scanStats ? Object.entries(
      scanStats.reduce((acc, scan) => {
        try {
          const domain = new URL(scan.url).hostname;
          acc[domain] = (acc[domain] || 0) + 1;
        } catch {
          // Invalid URL, skip
        }
        return acc;
      }, {} as Record<string, number>)
    ).sort(([,a], [,b]) => b - a).slice(0, 10) : [];

    const totalDomainScans = domainCounts.reduce((sum, [, count]) => sum + count, 0);
    const topDomains = domainCounts.map(([domain, scans]) => ({
      domain,
      scans,
      percentage: totalDomainScans > 0 ? Math.round((scans / totalDomainScans) * 100) : 0
    }));

    // Users by tier
    const tierCounts = userStats ? userStats.reduce((acc, user) => {
      acc[user.tier] = (acc[user.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) : {};

    const usersByTier = Object.entries(tierCounts).map(([tier, count]) => ({
      tier: tier.charAt(0).toUpperCase() + tier.slice(1),
      count,
      percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0
    }));

    // Monthly trends
    const monthlyScansData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthScans = scanStats?.filter(scan => {
        const scanDate = new Date(scan.created_at);
        return scanDate >= monthStart && scanDate <= monthEnd;
      }).length || 0;
      
      const monthUsers = userStats?.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate >= monthStart && userDate <= monthEnd;
      }).length || 0;
      
      monthlyScansData.push({
        month: date.toLocaleDateString('vi-VN', { month: 'short' }),
        scans: monthScans,
        users: monthUsers
      });
    }

    // Recent users (sanitize emails for privacy)
    const recentUsers = userStats
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(user => ({
        id: user.id,
        email: user.email || 'N/A',
        tier: user.tier || 'free',
        created_at: user.created_at,
        last_active: user.last_active_at || user.created_at
      })) || [];

    // Log admin access for audit
    await supabaseAdmin.from('event_logs').insert({
      user_id: user.id,
      event_name: 'admin_metrics_accessed',
      event_data: { timestamp: new Date().toISOString() },
      page_url: '/admin'
    });

    const metrics = {
      totalUsers,
      newUsersThisWeek,
      activeUsersToday,
      totalScansThisMonth,
      totalAPICallsToday: apiLogs?.length || 0,
      totalPDFReports: pdfReports?.length || 0,
      failedAPIs,
      topDomains,
      usersByTier,
      monthlyScansData,
      systemHealth: {
        database: 'healthy',
        apis: failedAPIs.length > 10 ? 'warning' : 'healthy',
        storage: storagePercentage
      },
      recentUsers
    };

    return new Response(JSON.stringify(metrics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in admin-metrics:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 403 : 500,
      }
    );
  }
});
