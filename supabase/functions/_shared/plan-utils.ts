// Shared utility functions for user plan checking
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

export interface UserPlan {
  plan_id: string;
  plan_name: string;
  monthly_limit: number;
  pdf_enabled: boolean;
  ai_enabled: boolean;
  used_count: number;
  remaining_count: number;
}

export interface PlanCheckResult {
  allowed: boolean;
  plan?: UserPlan;
  error?: string;
}

/**
 * Check if user can perform an action based on their plan
 */
export async function checkUserPlanLimit(
  userId: string, 
  requiredFeature?: 'pdf' | 'ai'
): Promise<PlanCheckResult> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return { allowed: true }; // If no Supabase config, allow access
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's current plan using the database function
    const { data: planData, error } = await supabase.rpc('get_user_current_plan', {
      _user_id: userId
    });

    if (error) {
      console.error('Error getting user plan:', error);
      return { allowed: false, error: 'Không thể kiểm tra gói dịch vụ' };
    }

    if (!planData || planData.length === 0) {
      // User has no plan, create free plan
      await supabase.from('user_plans').insert({
        user_id: userId,
        plan_id: 'free'
      });
      
      // Try again
      const { data: newPlanData } = await supabase.rpc('get_user_current_plan', {
        _user_id: userId
      });
      
      if (!newPlanData || newPlanData.length === 0) {
        return { allowed: false, error: 'Không thể tạo gói miễn phí' };
      }
      
      const plan = newPlanData[0];
      return checkPlanFeatures(plan, requiredFeature);
    }

    const plan = planData[0];
    return checkPlanFeatures(plan, requiredFeature);

  } catch (error) {
    console.error('Plan check error:', error);
    return { allowed: false, error: 'Lỗi hệ thống khi kiểm tra gói' };
  }
}

/**
 * Check if plan supports required features and has remaining usage
 */
function checkPlanFeatures(plan: UserPlan, requiredFeature?: 'pdf' | 'ai'): PlanCheckResult {
  // Check feature availability
  if (requiredFeature === 'pdf' && !plan.pdf_enabled) {
    return { 
      allowed: false, 
      plan,
      error: 'Tính năng PDF chỉ khả dụng cho gói Pro. Vui lòng nâng cấp gói.' 
    };
  }

  if (requiredFeature === 'ai' && !plan.ai_enabled) {
    return { 
      allowed: false, 
      plan,
      error: 'Tính năng AI chỉ khả dụng cho gói Pro. Vui lòng nâng cấp gói.' 
    };
  }

  // Check usage limit
  if (plan.remaining_count <= 0) {
    return { 
      allowed: false, 
      plan,
      error: `Bạn đã sử dụng hết lượt phân tích trong tháng (${plan.used_count}/${plan.monthly_limit}). Vui lòng nâng cấp gói hoặc chờ tháng sau.` 
    };
  }

  return { allowed: true, plan };
}

/**
 * Increment user's usage count after successful operation
 */
export async function incrementUserUsage(userId: string): Promise<boolean> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return true; // If no Supabase config, don't track usage
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase.rpc('increment_user_usage', {
      _user_id: userId
    });

    if (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Usage increment error:', error);
    return false;
  }
}

/**
 * Extract user ID from Authorization header
 */
export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('Could not verify user token:', error?.message);
      return null;
    }

    return user.id;
  } catch (error) {
    console.error('Auth extraction error:', error);
    return null;
  }
}