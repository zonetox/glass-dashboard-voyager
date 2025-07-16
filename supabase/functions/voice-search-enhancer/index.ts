import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoiceSearchRequest {
  content?: string;
  keyword?: string;
  url?: string;
  user_id: string;
}

interface QuestionVariant {
  question: string;
  intent: 'informational' | 'navigational' | 'transactional';
  difficulty: 'simple' | 'complex';
  voice_pattern: string;
}

interface AnswerSnippet {
  question: string;
  answer: string;
  word_count: number;
  readability_score: number;
  optimized_for_voice: boolean;
}

interface VoiceSearchResult {
  success: boolean;
  question_variants: QuestionVariant[];
  answer_snippets: AnswerSnippet[];
  schema_faq: any;
  voice_optimization_score: number;
  recommendations: string[];
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

async function analyzeVoiceSearchQueries(content: string, keyword?: string): Promise<QuestionVariant[]> {
  const prompt = `
Analyze the following content and ${keyword ? `keyword "${keyword}"` : ''} to generate voice search question variants that users might ask:

Content: ${content.substring(0, 2000)}

Generate 8-12 natural voice search questions that people would ask about this content. Consider:
1. How people speak vs how they type
2. Question patterns: Who, What, When, Where, Why, How
3. Long-tail conversational queries
4. Local and contextual variations
5. Different complexity levels

Return a JSON array with this structure:
[
  {
    "question": "natural voice question",
    "intent": "informational|navigational|transactional",
    "difficulty": "simple|complex",
    "voice_pattern": "question_word|direct_ask|comparison|how_to"
  }
]

Focus on questions that sound natural when spoken aloud.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are a voice search optimization expert. Generate natural, conversational questions that people would ask voice assistants.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content_text = data.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = content_text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('Error generating voice questions:', error);
    return [];
  }
}

async function generateAnswerSnippets(questions: QuestionVariant[], content: string): Promise<AnswerSnippet[]> {
  const snippets: AnswerSnippet[] = [];

  for (const question of questions.slice(0, 8)) { // Process top 8 questions
    const prompt = `
Based on this content: ${content.substring(0, 1500)}

Create a voice-optimized answer for: "${question.question}"

Requirements:
1. 20-50 words for simple answers, 50-100 for complex
2. Use natural, conversational language
3. Include the question context in the answer
4. Make it easy to understand when spoken
5. Use active voice and simple sentence structure

Return only the answer text, no additional formatting.
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: 'You are a voice search optimization expert. Create concise, natural answers optimized for voice assistants.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 200
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const answer = data.choices[0].message.content.trim();
        const wordCount = answer.split(' ').length;
        
        snippets.push({
          question: question.question,
          answer: answer,
          word_count: wordCount,
          readability_score: calculateReadabilityScore(answer),
          optimized_for_voice: wordCount <= 100 && isVoiceOptimized(answer)
        });
      }
    } catch (error) {
      console.error(`Error generating answer for question: ${question.question}`, error);
    }
  }

  return snippets;
}

function calculateReadabilityScore(text: string): number {
  // Simple readability calculation based on sentence and word length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/);
  const avgWordsPerSentence = words.length / sentences.length;
  const avgCharsPerWord = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  // Score from 0-100, higher is more readable
  const score = Math.max(0, 100 - (avgWordsPerSentence * 2) - (avgCharsPerWord * 3));
  return Math.round(score);
}

function isVoiceOptimized(text: string): boolean {
  // Check for voice optimization factors
  const hasConversationalTone = /\b(you|your|we|our|let's|here's|that's)\b/i.test(text);
  const hasShortSentences = text.split(/[.!?]+/).every(sentence => sentence.split(' ').length <= 15);
  const avoidsTechnicalJargon = !/\b(implementation|configuration|optimization|infrastructure)\b/i.test(text);
  
  return hasConversationalTone && hasShortSentences && avoidsTechnicalJargon;
}

function generateFAQSchema(snippets: AnswerSnippet[]): any {
  const faqItems = snippets.slice(0, 6).map(snippet => ({
    "@type": "Question",
    "name": snippet.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": snippet.answer
    }
  }));

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems
  };
}

function calculateVoiceOptimizationScore(snippets: AnswerSnippet[]): number {
  if (snippets.length === 0) return 0;
  
  const voiceOptimizedCount = snippets.filter(s => s.optimized_for_voice).length;
  const avgReadability = snippets.reduce((sum, s) => sum + s.readability_score, 0) / snippets.length;
  const avgWordCount = snippets.reduce((sum, s) => sum + s.word_count, 0) / snippets.length;
  
  // Scoring factors
  const optimizationRatio = (voiceOptimizedCount / snippets.length) * 40;
  const readabilityScore = (avgReadability / 100) * 30;
  const wordCountScore = avgWordCount <= 50 ? 30 : Math.max(0, 30 - (avgWordCount - 50));
  
  return Math.round(optimizationRatio + readabilityScore + wordCountScore);
}

function generateRecommendations(score: number, snippets: AnswerSnippet[]): string[] {
  const recommendations: string[] = [];
  
  if (score < 60) {
    recommendations.push("Cải thiện cấu trúc câu trả lời để phù hợp với giọng nói");
    recommendations.push("Sử dụng ngôn ngữ đàm thoại và tự nhiên hơn");
  }
  
  if (snippets.some(s => s.word_count > 80)) {
    recommendations.push("Rút gọn câu trả lời để dưới 80 từ cho voice search");
  }
  
  if (snippets.filter(s => s.readability_score < 70).length > 0) {
    recommendations.push("Đơn giản hóa từ ngữ và cấu trúc câu");
  }
  
  if (snippets.length < 5) {
    recommendations.push("Tạo thêm câu hỏi để bao phủ nhiều ý định tìm kiếm");
  }
  
  recommendations.push("Thêm FAQ schema vào trang web để tăng khả năng hiển thị");
  recommendations.push("Tối ưu hóa cho local search với câu hỏi địa phương");
  
  return recommendations;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, keyword, url, user_id }: VoiceSearchRequest = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!content && !keyword) {
      return new Response(
        JSON.stringify({ error: 'Either content or keyword is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting voice search enhancement for user: ${user_id}`);

    // Use provided content or fetch from URL
    let analysisContent = content || '';
    if (!analysisContent && url) {
      // In a real implementation, you might fetch content from the URL
      analysisContent = `Content analysis for ${url} with keyword: ${keyword}`;
    }

    // Generate voice search question variants
    const questionVariants = await analyzeVoiceSearchQueries(analysisContent, keyword);
    
    // Generate optimized answer snippets
    const answerSnippets = await generateAnswerSnippets(questionVariants, analysisContent);
    
    // Generate FAQ schema
    const schemaFaq = generateFAQSchema(answerSnippets);
    
    // Calculate optimization score
    const voiceOptimizationScore = calculateVoiceOptimizationScore(answerSnippets);
    
    // Generate recommendations
    const recommendations = generateRecommendations(voiceOptimizationScore, answerSnippets);

    const result: VoiceSearchResult = {
      success: true,
      question_variants: questionVariants,
      answer_snippets: answerSnippets,
      schema_faq: schemaFaq,
      voice_optimization_score: voiceOptimizationScore,
      recommendations
    };

    console.log(`Voice search enhancement completed. Generated ${questionVariants.length} questions and ${answerSnippets.length} answers.`);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in voice-search-enhancer function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});