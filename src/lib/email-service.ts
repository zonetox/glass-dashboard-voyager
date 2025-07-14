import { supabase } from "@/integrations/supabase/client";

export interface EmailTemplateData {
  user_name?: string;
  website_url?: string;
  report_url?: string;
  pdf_url?: string;
  seo_score?: number;
  plan_name?: string;
  amount?: number;
  remaining_scans?: number;
  dashboard_url?: string;
  upgrade_url?: string;
  issues_found?: number;
  recommendations?: number;
  new_quota?: number;
}

export type EmailType = 
  | 'welcome'
  | 'seo-report'
  | 'pdf-report'
  | 'reset-quota'
  | 'quota-warning'
  | 'payment-success';

export const sendEmail = async (
  email: string,
  emailType: EmailType,
  templateData: EmailTemplateData = {},
  userId?: string,
  customSubject?: string,
  customContent?: string
) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email-event', {
      body: {
        email,
        email_type: emailType,
        template_data: {
          ...templateData,
          dashboard_url: templateData.dashboard_url || `${window.location.origin}/dashboard`,
          upgrade_url: templateData.upgrade_url || `${window.location.origin}/upgrade`,
        },
        user_id: userId,
        subject: customSubject,
        content: customContent,
      }
    });

    if (error) {
      console.error('Email sending error:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
};

// Specific email functions for each use case
export const sendWelcomeEmail = async (email: string, userName?: string, userId?: string) => {
  return sendEmail(email, 'welcome', { user_name: userName }, userId);
};

export const sendSEOReportEmail = async (
  email: string,
  websiteUrl: string,
  reportUrl: string,
  seoScore: number,
  issuesFound: number,
  recommendations: number,
  userId?: string
) => {
  return sendEmail(email, 'seo-report', {
    website_url: websiteUrl,
    report_url: reportUrl,
    seo_score: seoScore,
    issues_found: issuesFound,
    recommendations: recommendations,
  }, userId);
};

export const sendPDFReportEmail = async (
  email: string,
  websiteUrl: string,
  pdfUrl: string,
  userId?: string
) => {
  return sendEmail(email, 'pdf-report', {
    website_url: websiteUrl,
    pdf_url: pdfUrl,
  }, userId);
};

export const sendQuotaResetEmail = async (
  email: string,
  userName: string,
  newQuota: number,
  planName: string,
  userId?: string
) => {
  return sendEmail(email, 'reset-quota', {
    user_name: userName,
    new_quota: newQuota,
    plan_name: planName,
  }, userId);
};

export const sendQuotaWarningEmail = async (
  email: string,
  userName: string,
  remainingScans: number,
  userId?: string
) => {
  return sendEmail(email, 'quota-warning', {
    user_name: userName,
    remaining_scans: remainingScans,
  }, userId);
};

export const sendPaymentSuccessEmail = async (
  email: string,
  userName: string,
  planName: string,
  amount: number,
  userId?: string
) => {
  return sendEmail(email, 'payment-success', {
    user_name: userName,
    plan_name: planName,
    amount: amount,
  }, userId);
};