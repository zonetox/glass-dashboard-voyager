import { supabase } from "@/integrations/supabase/client";

// Environment variables for tracking IDs
const GA_ID = import.meta.env.VITE_GA_ID || 'G-XXXXXXX';
const PIXEL_ID = import.meta.env.VITE_PIXEL_ID || 'YOUR_PIXEL_ID';

// Types
interface EventData {
  [key: string]: any;
}

// Global declarations for tracking scripts
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: any;
    dataLayer: any[];
    _fbq?: any;
  }
}

/**
 * Initialize Google Analytics 4
 */
export const initGA = (): void => {
  if (typeof window === 'undefined' || !GA_ID || GA_ID === 'G-XXXXXXX') {
    console.log('GA4 not initialized: missing GA_ID or not in browser environment');
    return;
  }

  try {
    // Create gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });

    console.log('GA4 initialized successfully');
  } catch (error) {
    console.error('Failed to initialize GA4:', error);
  }
};

/**
 * Initialize Meta Pixel
 */
export const initPixel = (): void => {
  if (typeof window === 'undefined' || !PIXEL_ID || PIXEL_ID === 'YOUR_PIXEL_ID') {
    console.log('Meta Pixel not initialized: missing PIXEL_ID or not in browser environment');
    return;
  }

  try {
    // Meta Pixel Code - simplified version that works with TypeScript
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    console.log('Meta Pixel initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Meta Pixel:', error);
  }
};

/**
 * Track custom events to GA4, Meta Pixel, and Supabase
 */
export const trackEvent = async (eventName: string, eventData: EventData = {}): Promise<void> => {
  try {
    // Track to Google Analytics 4
    if (window.gtag && GA_ID !== 'G-XXXXXXX') {
      window.gtag('event', eventName, {
        ...eventData,
        page_title: document.title,
        page_location: window.location.href,
      });
    }

    // Track to Meta Pixel
    if (window.fbq && PIXEL_ID !== 'YOUR_PIXEL_ID') {
      window.fbq('track', 'CustomEvent', {
        event_name: eventName,
        ...eventData,
      });
    }

    // Log to Supabase event_logs table
    await logEventToSupabase(eventName, eventData);

    console.log(`Event tracked: ${eventName}`, eventData);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

/**
 * Log events to Supabase for internal analytics
 */
const logEventToSupabase = async (eventName: string, eventData: EventData): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('event_logs').insert({
      user_id: user?.id || null,
      event_name: eventName,
      event_data: eventData,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      ip_address: null, // Will be handled by Supabase
    });
  } catch (error) {
    console.error('Failed to log event to Supabase:', error);
  }
};

/**
 * Track page views
 */
export const trackPageView = (pageName?: string): void => {
  const eventData = {
    page_name: pageName || document.title,
    page_path: window.location.pathname,
  };

  trackEvent('page_view', eventData);
};

/**
 * Track user registration
 */
export const trackUserRegistration = (method: string = 'email'): void => {
  trackEvent('user_registration', {
    registration_method: method,
  });
};

/**
 * Track SEO analysis started
 */
export const trackSEOAnalysis = (websiteUrl: string): void => {
  trackEvent('seo_analysis_started', {
    website_url: websiteUrl,
  });
};

/**
 * Track upgrade to Pro
 */
export const trackUpgradeToPro = (planType: string): void => {
  trackEvent('upgrade_to_pro', {
    plan_type: planType,
  });
  
  // Track as conversion event for Meta Pixel
  if (window.fbq && PIXEL_ID !== 'YOUR_PIXEL_ID') {
    window.fbq('track', 'Purchase', {
      value: planType === 'pro' ? 49.99 : 99.99,
      currency: 'USD',
    });
  }
};

/**
 * Track user login
 */
export const trackUserLogin = (method: string = 'email'): void => {
  trackEvent('user_login', {
    login_method: method,
  });
};

/**
 * Track feature usage
 */
export const trackFeatureUsage = (featureName: string, additionalData?: EventData): void => {
  trackEvent('feature_used', {
    feature_name: featureName,
    ...additionalData,
  });
};