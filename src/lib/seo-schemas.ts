// SEO Result Schemas and Validation
export type ValidationStatus = 'valid' | 'warning' | 'error';

export interface ValidationResult {
  status: ValidationStatus;
  message: string;
  score?: number;
}

// Base schema interface
export interface SEOResultBase {
  type: string;
  status: ValidationStatus;
  value: any;
  validation: ValidationResult;
  timestamp: string;
  ai_enhanced?: boolean;
}

// Meta Title Schema
export interface MetaTitleResult extends SEOResultBase {
  type: 'meta_title';
  value: {
    title: string;
    length: number;
    keyword_present: boolean;
    suggested_title?: string;
  };
}

// Meta Description Schema
export interface MetaDescriptionResult extends SEOResultBase {
  type: 'meta_description';
  value: {
    description: string;
    length: number;
    unique: boolean;
    has_cta: boolean;
    suggested_description?: string;
  };
}

// Headings Schema
export interface HeadingsResult extends SEOResultBase {
  type: 'headings';
  value: {
    total_count: number;
    duplicates: number;
    missing: string[];
    structure: Array<{
      level: number;
      text: string;
      semantic_score: number;
    }>;
    suggested_structure?: Array<{
      level: number;
      text: string;
    }>;
  };
}

// Alt Text Schema
export interface AltTextResult extends SEOResultBase {
  type: 'alt_text';
  value: {
    total_images: number;
    missing_alt: number;
    keyword_match_count: number;
    suggestions: Array<{
      image_src: string;
      suggested_alt: string;
    }>;
  };
}

// PageSpeed Schema
export interface PageSpeedResult extends SEOResultBase {
  type: 'pagespeed';
  value: {
    mobile_score: number;
    desktop_score: number;
    issues: Array<{
      type: 'image' | 'js' | 'css' | 'font' | 'server';
      description: string;
      impact: 'high' | 'medium' | 'low';
      fix_suggestion: string;
    }>;
  };
}

// Schema Markup Schema
export interface SchemaResult extends SEOResultBase {
  type: 'schema';
  value: {
    found_types: string[];
    missing_types: string[];
    validation_errors: number;
    suggested_schema?: object;
  };
}

// Internal Links Schema
export interface InternalLinksResult extends SEOResultBase {
  type: 'internal_links';
  value: {
    total_links: number;
    orphaned_pages: number;
    suggestions: Array<{
      target_page: string;
      anchor_text: string;
      context: string;
    }>;
  };
}

// AI Rewriting Schema
export interface AIRewriteResult extends SEOResultBase {
  type: 'ai_rewrite';
  value: {
    original: string;
    rewritten: string;
    improvements: {
      keyword_density: number;
      readability_score: number;
      cta_added: boolean;
      grammar_fixes: number;
    };
    confidence: number;
  };
}

// Topic Map Schema
export interface TopicMapResult extends SEOResultBase {
  type: 'topic_map';
  value: {
    main_topic: string;
    subtopics: Array<{
      topic: string;
      intent: 'informational' | 'navigational' | 'transactional';
      expansion_suggestions: string[];
    }>;
    semantic_clusters: Array<{
      cluster_name: string;
      keywords: string[];
      content_gaps: string[];
    }>;
  };
}

// Auto-Fix Schema
export interface AutoFixResult extends SEOResultBase {
  type: 'auto_fix';
  value: {
    fixes_available: Array<{
      id: string;
      type: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      auto_applicable: boolean;
      preview?: string;
    }>;
    backup_created: boolean;
  };
}

// Search Intent Schema
export interface SearchIntentResult extends SEOResultBase {
  type: 'search_intent';
  value: {
    primary_intent: 'informational' | 'navigational' | 'transactional';
    confidence: number;
    suggested_cta: {
      text: string;
      placement: string;
      reasoning: string;
    };
    content_alignment: number;
  };
}

// Predictive Ranking Schema
export interface PredictiveRankingResult extends SEOResultBase {
  type: 'predictive_ranking';
  value: {
    keyword: string;
    current_position: number | null;
    predicted_position: number;
    confidence: number;
    improvement_factors: Array<{
      factor: string;
      impact: number;
      actionable: boolean;
    }>;
  };
}

// Multi-language Schema
export interface MultiLanguageResult extends SEOResultBase {
  type: 'multi_language';
  value: {
    languages: Array<{
      code: string;
      name: string;
      content: string;
      seo_score: number;
      localization_quality: number;
    }>;
    primary_language: string;
  };
}

// Trend Detection Schema
export interface TrendDetectionResult extends SEOResultBase {
  type: 'trend_detection';
  value: {
    trending_keywords: Array<{
      keyword: string;
      growth_percentage: number;
      timeframe: string;
      urgency: 'immediate' | 'soon' | 'monitor';
      opportunity_score: number;
    }>;
  };
}

// Union type for all result types
export type SEOAnalysisResult = 
  | MetaTitleResult
  | MetaDescriptionResult
  | HeadingsResult
  | AltTextResult
  | PageSpeedResult
  | SchemaResult
  | InternalLinksResult
  | AIRewriteResult
  | TopicMapResult
  | AutoFixResult
  | SearchIntentResult
  | PredictiveRankingResult
  | MultiLanguageResult
  | TrendDetectionResult;

// Complete analysis schema
export interface StandardizedSEOAnalysis {
  url: string;
  scan_id: string;
  timestamp: string;
  user_id: string;
  processing_time_ms: number;
  regular_seo: {
    meta_title?: MetaTitleResult;
    meta_description?: MetaDescriptionResult;
    headings?: HeadingsResult;
    alt_text?: AltTextResult;
    pagespeed?: PageSpeedResult;
    schema?: SchemaResult;
    internal_links?: InternalLinksResult;
  };
  ai_seo: {
    ai_rewrite?: AIRewriteResult;
    topic_map?: TopicMapResult;
    auto_fix?: AutoFixResult;
    search_intent?: SearchIntentResult;
    predictive_ranking?: PredictiveRankingResult;
    multi_language?: MultiLanguageResult;
    trend_detection?: TrendDetectionResult;
  };
  overall_score: number;
  validation_errors: string[];
}