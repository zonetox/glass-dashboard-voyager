import { 
  SEOAnalysisResult, 
  ValidationStatus, 
  ValidationResult,
  StandardizedSEOAnalysis 
} from './seo-schemas';
import { supabase } from '@/integrations/supabase/client';

export class SEOValidator {
  
  // Validate Meta Title
  static validateMetaTitle(title: string, keyword?: string): ValidationResult {
    const length = title.length;
    
    if (length === 0) {
      return { status: 'error', message: 'Meta title trống', score: 0 };
    }
    
    if (length < 30) {
      return { status: 'warning', message: `${length} ký tự - Quá ngắn`, score: 50 };
    }
    
    if (length > 60) {
      return { status: 'warning', message: `${length} ký tự - Quá dài`, score: 70 };
    }
    
    const keywordPresent = keyword ? title.toLowerCase().includes(keyword.toLowerCase()) : false;
    
    if (!keywordPresent && keyword) {
      return { status: 'warning', message: `${length} ký tự - Thiếu từ khóa chính`, score: 75 };
    }
    
    return { status: 'valid', message: `${length} ký tự - Tối ưu tốt`, score: 95 };
  }

  // Validate Meta Description
  static validateMetaDescription(description: string, keyword?: string): ValidationResult {
    const length = description.length;
    
    if (length === 0) {
      return { status: 'error', message: 'Meta description trống', score: 0 };
    }
    
    if (length < 120) {
      return { status: 'warning', message: `${length} ký tự - Quá ngắn`, score: 60 };
    }
    
    if (length > 160) {
      return { status: 'warning', message: `${length} ký tự - Quá dài`, score: 70 };
    }
    
    const hasCTA = /\b(mua|đặt|tải|xem|liên hệ|đăng ký|tìm hiểu)\b/i.test(description);
    const keywordPresent = keyword ? description.toLowerCase().includes(keyword.toLowerCase()) : false;
    
    let score = 80;
    let issues = [];
    
    if (!hasCTA) {
      score -= 10;
      issues.push('thiếu CTA');
    }
    
    if (!keywordPresent && keyword) {
      score -= 15;
      issues.push('thiếu từ khóa');
    }
    
    const message = issues.length > 0 
      ? `${length} ký tự - ${issues.join(', ')}`
      : `${length} ký tự - Tối ưu tốt`;
    
    return { 
      status: score >= 80 ? 'valid' : 'warning', 
      message, 
      score 
    };
  }

  // Validate Headings Structure
  static validateHeadings(headings: Array<{ level: number; text: string }>): ValidationResult {
    if (headings.length === 0) {
      return { status: 'error', message: 'Không có heading nào', score: 0 };
    }

    const h1Count = headings.filter(h => h.level === 1).length;
    const duplicates = this.findDuplicateHeadings(headings);
    const hasProperStructure = this.validateHeadingStructure(headings);

    let score = 70;
    let issues = [];

    if (h1Count === 0) {
      score -= 30;
      issues.push('thiếu H1');
    } else if (h1Count > 1) {
      score -= 20;
      issues.push(`${h1Count} H1 tags`);
    }

    if (duplicates.length > 0) {
      score -= 15;
      issues.push(`${duplicates.length} heading trùng`);
    }

    if (!hasProperStructure) {
      score -= 10;
      issues.push('cấu trúc không logic');
    }

    const message = issues.length > 0 
      ? `${headings.length} headings - ${issues.join(', ')}`
      : `${headings.length} headings - Cấu trúc tốt`;

    return {
      status: score >= 80 ? 'valid' : score >= 60 ? 'warning' : 'error',
      message,
      score
    };
  }

  // Validate Page Speed
  static validatePageSpeed(mobileScore: number, desktopScore: number): ValidationResult {
    const avgScore = (mobileScore + desktopScore) / 2;
    
    if (avgScore >= 90) {
      return { status: 'valid', message: `Mobile: ${mobileScore}/100 - Desktop: ${desktopScore}/100 - Xuất sắc`, score: 100 };
    }
    
    if (avgScore >= 70) {
      return { status: 'warning', message: `Mobile: ${mobileScore}/100 - Desktop: ${desktopScore}/100 - Cần cải thiện`, score: 75 };
    }
    
    return { status: 'error', message: `Mobile: ${mobileScore}/100 - Desktop: ${desktopScore}/100 - Cần tối ưu gấp`, score: 40 };
  }

  // Validate Alt Text Coverage
  static validateAltText(totalImages: number, missingAlt: number, keywordMatches: number): ValidationResult {
    if (totalImages === 0) {
      return { status: 'valid', message: 'Không có hình ảnh', score: 100 };
    }

    const coverage = ((totalImages - missingAlt) / totalImages) * 100;
    const keywordCoverage = (keywordMatches / totalImages) * 100;

    let score = coverage;
    let issues = [];

    if (missingAlt > 0) {
      issues.push(`${missingAlt} ảnh thiếu alt`);
    }

    if (keywordCoverage < 30) {
      score -= 20;
      issues.push('ít từ khóa trong alt');
    }

    const message = issues.length > 0 
      ? `${totalImages} ảnh - ${issues.join(', ')}`
      : `${totalImages} ảnh - Alt text tối ưu`;

    return {
      status: score >= 80 ? 'valid' : score >= 60 ? 'warning' : 'error',
      message,
      score
    };
  }

  // Validate complete analysis
  static async validateAnalysis(analysis: any, originalUrl: string): Promise<{
    isValid: boolean;
    errors: string[];
    standardized: StandardizedSEOAnalysis | null;
  }> {
    const errors: string[] = [];
    let isValid = true;

    try {
      // Check required fields
      if (!analysis.url && !originalUrl) {
        errors.push('Missing URL');
        isValid = false;
      }

      // Validate structure
      const standardized = this.convertToStandardized(analysis, originalUrl);
      
      // Log validation results
      await this.logValidation(originalUrl, isValid, errors);

      return {
        isValid,
        errors,
        standardized: isValid ? standardized : null
      };

    } catch (error) {
      errors.push(`Validation error: ${error}`);
      await this.logValidation(originalUrl, false, errors);
      
      return {
        isValid: false,
        errors,
        standardized: null
      };
    }
  }

  // Convert legacy format to standardized format
  static convertToStandardized(analysis: any, url: string): StandardizedSEOAnalysis {
    const timestamp = new Date().toISOString();
    
    return {
      url: url || analysis.url,
      scan_id: analysis.id || crypto.randomUUID(),
      timestamp,
      user_id: analysis.user_id || '',
      processing_time_ms: analysis.processing_time || 0,
      regular_seo: this.extractRegularSEO(analysis),
      ai_seo: this.extractAISEO(analysis),
      overall_score: this.calculateOverallScore(analysis),
      validation_errors: []
    };
  }

  // Extract regular SEO data
  private static extractRegularSEO(analysis: any) {
    const seo = analysis.seo || {};
    
    return {
      meta_title: seo.title ? {
        type: 'meta_title' as const,
        status: 'valid' as ValidationStatus,
        value: {
          title: seo.title,
          length: seo.title.length,
          keyword_present: true,
          suggested_title: seo.suggested_title
        },
        validation: this.validateMetaTitle(seo.title),
        timestamp: new Date().toISOString()
      } : undefined,
      
      meta_description: seo.description ? {
        type: 'meta_description' as const,
        status: 'valid' as ValidationStatus,
        value: {
          description: seo.description,
          length: seo.description.length,
          unique: true,
          has_cta: /\b(mua|đặt|tải|xem|liên hệ|đăng ký|tìm hiểu)\b/i.test(seo.description),
          suggested_description: seo.suggested_description
        },
        validation: this.validateMetaDescription(seo.description),
        timestamp: new Date().toISOString()
      } : undefined
    };
  }

  // Extract AI SEO data  
  private static extractAISEO(analysis: any) {
    const ai = analysis.ai_analysis || {};
    
    return {
      ai_rewrite: ai.rewrite ? {
        type: 'ai_rewrite' as const,
        status: 'valid' as ValidationStatus,
        value: {
          original: ai.rewrite.original || '',
          rewritten: ai.rewrite.improved || '',
          improvements: {
            keyword_density: ai.rewrite.keyword_density || 0,
            readability_score: ai.rewrite.readability || 0,
            cta_added: ai.rewrite.cta_added || false,
            grammar_fixes: ai.rewrite.grammar_fixes || 0
          },
          confidence: ai.rewrite.confidence || 0
        },
        validation: { status: 'valid' as ValidationStatus, message: 'AI rewrite completed', score: 95 },
        timestamp: new Date().toISOString(),
        ai_enhanced: true
      } : undefined
    };
  }

  // Calculate overall score
  private static calculateOverallScore(analysis: any): number {
    let totalScore = 0;
    let components = 0;

    // Add regular SEO scores
    if (analysis.seo?.title) {
      totalScore += this.validateMetaTitle(analysis.seo.title).score || 0;
      components++;
    }

    if (analysis.seo?.description) {
      totalScore += this.validateMetaDescription(analysis.seo.description).score || 0;
      components++;
    }

    // Add AI scores
    if (analysis.ai_analysis?.score) {
      totalScore += analysis.ai_analysis.score;
      components++;
    }

    return components > 0 ? Math.round(totalScore / components) : 0;
  }

  // Helper methods
  private static findDuplicateHeadings(headings: Array<{ text: string }>): string[] {
    const seen = new Set();
    const duplicates = new Set();
    
    headings.forEach(heading => {
      if (seen.has(heading.text)) {
        duplicates.add(heading.text);
      } else {
        seen.add(heading.text);
      }
    });
    
    return Array.from(duplicates) as string[];
  }

  private static validateHeadingStructure(headings: Array<{ level: number }>): boolean {
    for (let i = 1; i < headings.length; i++) {
      const prev = headings[i - 1].level;
      const curr = headings[i].level;
      
      // Check if we're skipping levels (e.g., H1 -> H3)
      if (curr > prev + 1) {
        return false;
      }
    }
    return true;
  }

  // Log validation to api_logs
  private static async logValidation(url: string, isValid: boolean, errors: string[]) {
    try {
      await supabase.from('api_logs').insert({
        api_name: 'seo_validation',
        domain: new URL(url).hostname,
        method: 'POST',
        endpoint: '/validate-seo',
        status_code: isValid ? 200 : 400,
        success: isValid,
        error_message: errors.length > 0 ? errors.join('; ') : null,
        request_payload: { url, validation_type: 'schema_check' },
        response_data: { valid: isValid, error_count: errors.length }
      });
    } catch (error) {
      console.error('Failed to log validation:', error);
    }
  }
}