-- Create CRM tracking tables
CREATE TABLE public.crm_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  crm_type TEXT NOT NULL, -- 'hubspot', 'zoho', 'salesforce'
  crm_name TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  api_endpoint TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  sync_frequency INTEGER DEFAULT 300, -- seconds
  last_sync_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create SEO tracking data table
CREATE TABLE public.seo_tracking_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  page_url TEXT NOT NULL,
  visitor_id TEXT, -- Anonymous visitor tracking
  session_id TEXT,
  keyword TEXT,
  campaign_id TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  visit_duration INTEGER, -- seconds
  page_views INTEGER DEFAULT 1,
  bounce_rate NUMERIC,
  conversion_goal TEXT,
  conversion_value NUMERIC,
  crm_contact_id TEXT,
  crm_deal_id TEXT,
  synced_to_crm BOOLEAN DEFAULT false,
  sync_error TEXT,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CRM sync logs table
CREATE TABLE public.crm_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  crm_config_id UUID NOT NULL,
  tracking_data_id UUID,
  sync_type TEXT NOT NULL, -- 'contact', 'deal', 'activity'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed'
  crm_object_id TEXT,
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,
  sync_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_tracking_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_sync_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for crm_configurations
CREATE POLICY "Users can manage their own CRM configs" 
ON public.crm_configurations 
FOR ALL 
USING (auth.uid() = user_id);

-- Create policies for seo_tracking_data
CREATE POLICY "Users can view their own tracking data" 
ON public.seo_tracking_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert tracking data" 
ON public.seo_tracking_data 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own tracking data" 
ON public.seo_tracking_data 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for crm_sync_logs
CREATE POLICY "Users can view their own sync logs" 
ON public.crm_sync_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert sync logs" 
ON public.crm_sync_logs 
FOR INSERT 
WITH CHECK (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_crm_configurations_updated_at
BEFORE UPDATE ON public.crm_configurations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_seo_tracking_data_updated_at
BEFORE UPDATE ON public.seo_tracking_data
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_crm_configurations_user_id ON public.crm_configurations(user_id);
CREATE INDEX idx_crm_configurations_crm_type ON public.crm_configurations(crm_type);
CREATE INDEX idx_seo_tracking_data_user_id ON public.seo_tracking_data(user_id);
CREATE INDEX idx_seo_tracking_data_domain ON public.seo_tracking_data(domain);
CREATE INDEX idx_seo_tracking_data_campaign_id ON public.seo_tracking_data(campaign_id);
CREATE INDEX idx_seo_tracking_data_visitor_id ON public.seo_tracking_data(visitor_id);
CREATE INDEX idx_seo_tracking_data_visited_at ON public.seo_tracking_data(visited_at);
CREATE INDEX idx_seo_tracking_data_synced ON public.seo_tracking_data(synced_to_crm);
CREATE INDEX idx_crm_sync_logs_config_id ON public.crm_sync_logs(crm_config_id);
CREATE INDEX idx_crm_sync_logs_status ON public.crm_sync_logs(status);

-- Add foreign key constraints
ALTER TABLE public.crm_sync_logs 
ADD CONSTRAINT fk_crm_sync_logs_config 
FOREIGN KEY (crm_config_id) REFERENCES public.crm_configurations(id) ON DELETE CASCADE;

ALTER TABLE public.crm_sync_logs 
ADD CONSTRAINT fk_crm_sync_logs_tracking 
FOREIGN KEY (tracking_data_id) REFERENCES public.seo_tracking_data(id) ON DELETE SET NULL;