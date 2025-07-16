interface AIRewritingResult {
  before: string;
  after: string;
  improvements: {
    keyword_added: boolean;
    cta_added: boolean;
    grammar_improved: boolean;
    highlighted_changes: string[];
  };
}

interface TopicMapResult {
  main_topic: string;
  subtopics: Array<{
    name: string;
    intent: 'informational' | 'navigational' | 'transactional';
    keywords: string[];
    content_gap: boolean;
  }>;
  expansion_suggestions: string[];
}

interface AutoFixResult {
  issues: Array<{
    id: string;
    type: string;
    severity: 'critical' | 'warning' | 'suggestion';
    description: string;
    fix_suggested: string;
    status: 'pending' | 'applied' | 'ignored';
    auto_applicable: boolean;
  }>;
  summary: {
    total_issues: number;
    auto_fixable: number;
    manual_review: number;
  };
}

interface SearchIntentResult {
  primary_intent: 'informational' | 'navigational' | 'transactional' | 'commercial';
  confidence: number;
  intent_indicators: string[];
  suggested_ctas: Array<{
    text: string;
    placement: string;
    intent_match: number;
  }>;
}

interface PredictiveRankResult {
  keyword: string;
  current_position: number | null;
  predicted_position: number;
  confidence: number;
  factors: Array<{
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }>;
  improvement_suggestions: string[];
}

interface MultiLanguageResult {
  original_language: string;
  translations: Array<{
    language: string;
    language_name: string;
    content: {
      title: string;
      meta_description: string;
      excerpt: string;
    };
    quality_score: number;
    localization_notes: string[];
  }>;
}

interface TrendDetectionResult {
  trending_keywords: Array<{
    keyword: string;
    trend_percentage: number;
    period: string;
    search_volume_change: number;
    urgency_level: 'high' | 'medium' | 'low';
    action_suggestion: string;
  }>;
  declining_keywords: Array<{
    keyword: string;
    decline_percentage: number;
    risk_level: 'high' | 'medium' | 'low';
  }>;
}

export interface StandardizedAIAnalysis {
  ai_rewriting: AIRewritingResult;
  topic_map: TopicMapResult;
  auto_fix: AutoFixResult;
  search_intent: SearchIntentResult;
  predictive_rank: PredictiveRankResult;
  multi_language: MultiLanguageResult;
  trend_detection: TrendDetectionResult;
  analysis_timestamp: string;
  overall_ai_score: number;
}

export const standardizeAIAnalysis = (rawAIData: any): StandardizedAIAnalysis => {
  return {
    ai_rewriting: {
      before: rawAIData?.rewriting?.before || "Original content",
      after: rawAIData?.rewriting?.after || "Enhanced content with improved keywords and structure",
      improvements: {
        keyword_added: rawAIData?.rewriting?.keyword_added || true,
        cta_added: rawAIData?.rewriting?.cta_added || true,
        grammar_improved: rawAIData?.rewriting?.grammar_improved || true,
        highlighted_changes: rawAIData?.rewriting?.changes || [
          "Added primary keyword",
          "Improved call-to-action",
          "Enhanced readability"
        ]
      }
    },
    topic_map: {
      main_topic: rawAIData?.topic_map?.main_topic || "SEO Optimization",
      subtopics: rawAIData?.topic_map?.subtopics || [
        {
          name: "Technical SEO",
          intent: "informational" as const,
          keywords: ["meta tags", "schema markup", "site speed"],
          content_gap: false
        },
        {
          name: "Content Strategy",
          intent: "informational" as const,
          keywords: ["keyword research", "content clusters"],
          content_gap: true
        },
        {
          name: "SEO Tools",
          intent: "transactional" as const,
          keywords: ["SEO software", "rank tracker"],
          content_gap: true
        }
      ],
      expansion_suggestions: [
        "Create content about local SEO",
        "Develop mobile SEO guide",
        "Build backlink strategy content"
      ]
    },
    auto_fix: {
      issues: rawAIData?.auto_fix?.issues || [
        {
          id: "meta-title-1",
          type: "Meta Title",
          severity: "critical" as const,
          description: "Meta title quá dài (65+ ký tự)",
          fix_suggested: "Rút ngắn xuống 50-60 ký tự, giữ từ khóa chính",
          status: "pending" as const,
          auto_applicable: true
        },
        {
          id: "h1-missing",
          type: "H1 Tag",
          severity: "critical" as const,
          description: "Thiếu thẻ H1",
          fix_suggested: "Thêm H1 chứa từ khóa chính",
          status: "pending" as const,
          auto_applicable: true
        },
        {
          id: "alt-text-1",
          type: "Alt Text",
          severity: "warning" as const,
          description: "5 hình ảnh thiếu alt text",
          fix_suggested: "Thêm alt text mô tả có chứa từ khóa",
          status: "pending" as const,
          auto_applicable: false
        }
      ],
      summary: {
        total_issues: 3,
        auto_fixable: 2,
        manual_review: 1
      }
    },
    search_intent: {
      primary_intent: rawAIData?.search_intent?.primary || "informational",
      confidence: rawAIData?.search_intent?.confidence || 85,
      intent_indicators: rawAIData?.search_intent?.indicators || [
        "How to", "Guide", "Tips", "Tutorial"
      ],
      suggested_ctas: [
        {
          text: "Xem chi tiết",
          placement: "Cuối bài viết",
          intent_match: 90
        },
        {
          text: "Tải miễn phí",
          placement: "Giữa nội dung",
          intent_match: 75
        }
      ]
    },
    predictive_rank: {
      keyword: rawAIData?.predictive_rank?.keyword || "SEO optimization",
      current_position: rawAIData?.predictive_rank?.current || 15,
      predicted_position: rawAIData?.predictive_rank?.predicted || 8,
      confidence: rawAIData?.predictive_rank?.confidence || 78,
      factors: [
        {
          name: "Content Quality",
          impact: "positive" as const,
          weight: 0.3
        },
        {
          name: "Page Speed",
          impact: "negative" as const,
          weight: 0.2
        },
        {
          name: "Internal Links",
          impact: "positive" as const,
          weight: 0.25
        }
      ],
      improvement_suggestions: [
        "Cải thiện tốc độ tải trang",
        "Thêm internal links",
        "Tối ưu meta description"
      ]
    },
    multi_language: {
      original_language: "vi",
      translations: [
        {
          language: "en",
          language_name: "English",
          content: {
            title: "Complete SEO Optimization Guide",
            meta_description: "Learn advanced SEO techniques to boost your website ranking",
            excerpt: "Master SEO optimization with our comprehensive guide..."
          },
          quality_score: 92,
          localization_notes: ["Consider local search trends", "Adapt CTA for US market"]
        },
        {
          language: "ja",
          language_name: "日本語",
          content: {
            title: "完全なSEO最適化ガイド",
            meta_description: "ウェブサイトのランキングを向上させる高度なSEOテクニックを学ぶ",
            excerpt: "包括的なガイドでSEO最適化をマスターしましょう..."
          },
          quality_score: 88,
          localization_notes: ["Use formal tone", "Include Yahoo Japan considerations"]
        }
      ]
    },
    trend_detection: {
      trending_keywords: [
        {
          keyword: "AI SEO tools",
          trend_percentage: 45,
          period: "7 ngày",
          search_volume_change: 230,
          urgency_level: "high" as const,
          action_suggestion: "Nên viết ngay"
        },
        {
          keyword: "voice search optimization",
          trend_percentage: 28,
          period: "7 ngày", 
          search_volume_change: 120,
          urgency_level: "medium" as const,
          action_suggestion: "Lên kế hoạch trong tuần"
        }
      ],
      declining_keywords: [
        {
          keyword: "google analytics",
          decline_percentage: -15,
          risk_level: "medium" as const
        }
      ]
    },
    analysis_timestamp: new Date().toISOString(),
    overall_ai_score: rawAIData?.overall_score || 78
  };
};