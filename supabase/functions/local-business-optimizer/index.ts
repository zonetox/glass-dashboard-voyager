import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessData, optimizationType, userId } = await req.json();

    if (!businessData) {
      throw new Error('Business data is required');
    }

    let result;
    
    if (optimizationType === 'schema') {
      result = await generateLocalBusinessSchema(businessData);
    } else if (optimizationType === 'content') {
      result = await generateLocalSEOContent(businessData);
    } else if (optimizationType === 'gmb') {
      result = await generateGMBOptimization(businessData);
    }

    // Save optimization result if userId provided
    if (userId) {
      await supabase
        .from('user_profiles')
        .update({
          business_name: businessData.name,
          business_address: businessData.address,
          business_phone: businessData.phone,
          business_category: businessData.category,
          business_description: businessData.description,
          business_hours: businessData.hours,
          google_my_business_url: businessData.gmbUrl,
          coordinates: businessData.coordinates
        })
        .eq('user_id', userId);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in local-business-optimizer:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to optimize local business'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function generateLocalBusinessSchema(businessData: any) {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": getBusinessType(businessData.category),
    "name": businessData.name,
    "description": businessData.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": businessData.address,
      "addressLocality": businessData.city || "Ho Chi Minh City",
      "addressCountry": "VN"
    },
    "telephone": businessData.phone,
    "url": businessData.website,
    "openingHours": formatOpeningHours(businessData.hours),
    "geo": businessData.coordinates ? {
      "@type": "GeoCoordinates",
      "latitude": businessData.coordinates.lat,
      "longitude": businessData.coordinates.lng
    } : undefined,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "25"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Trang chủ",
        "item": businessData.website
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": businessData.category,
        "item": `${businessData.website}/${businessData.category.toLowerCase()}`
      }
    ]
  };

  const productSchema = businessData.category === 'E-commerce' ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Sản phẩm mẫu",
    "description": "Mô tả sản phẩm chi tiết",
    "brand": {
      "@type": "Brand",
      "name": businessData.name
    },
    "offers": {
      "@type": "Offer",
      "price": "100000",
      "priceCurrency": "VND",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": businessData.name
      }
    }
  } : undefined;

  return {
    localBusinessSchema,
    breadcrumbSchema,
    productSchema: productSchema || null,
    reviewSchema: generateReviewSchema(businessData)
  };
}

async function generateLocalSEOContent(businessData: any) {
  if (!openAIApiKey) {
    return {
      title: `${businessData.name} - ${businessData.category} tại ${businessData.city || 'TP.HCM'}`,
      metaDescription: `${businessData.name} cung cấp dịch vụ ${businessData.category} chất lượng cao. Liên hệ ${businessData.phone} để được tư vấn.`,
      headings: [
        `${businessData.category} chuyên nghiệp tại ${businessData.city || 'TP.HCM'}`,
        `Tại sao chọn ${businessData.name}?`,
        `Dịch vụ của chúng tôi`,
        `Liên hệ và địa chỉ`
      ],
      localKeywords: [
        `${businessData.category.toLowerCase()} ${businessData.city || 'tp hcm'}`,
        `${businessData.category.toLowerCase()} gần đây`,
        `${businessData.category.toLowerCase()} uy tín`,
        `${businessData.name.toLowerCase()}`
      ]
    };
  }

  const prompt = `
  Create local SEO optimized content for this Vietnamese business:
  
  Business: ${businessData.name}
  Category: ${businessData.category}
  Address: ${businessData.address}
  Description: ${businessData.description}
  
  Generate JSON response with:
  {
    "title": "SEO optimized title with location",
    "metaDescription": "compelling meta description with local keywords",
    "headings": ["H1", "H2", "H3 headings array"],
    "localKeywords": ["local keyword variations"],
    "contentSuggestions": ["content topics for local SEO"],
    "gmbTips": ["Google My Business optimization tips"]
  }
  
  Focus on Vietnamese local search behavior and include location-based keywords.
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
            content: 'You are a Vietnamese local SEO expert. Provide structured JSON responses only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error generating local SEO content:', error);
    return generateFallbackContent(businessData);
  }
}

async function generateGMBOptimization(businessData: any) {
  return {
    optimizationChecklist: [
      {
        category: "Thông tin cơ bản",
        items: [
          { task: "Điền đầy đủ tên doanh nghiệp", completed: !!businessData.name },
          { task: "Thêm địa chỉ chính xác", completed: !!businessData.address },
          { task: "Cập nhật số điện thoại", completed: !!businessData.phone },
          { task: "Thiết lập giờ mở cửa", completed: !!businessData.hours }
        ]
      },
      {
        category: "Nội dung",
        items: [
          { task: "Viết mô tả doanh nghiệp hấp dẫn", completed: !!businessData.description },
          { task: "Thêm ảnh chất lượng cao", completed: false },
          { task: "Cập nhật sản phẩm/dịch vụ", completed: false },
          { task: "Đăng bài viết định kỳ", completed: false }
        ]
      },
      {
        category: "Tương tác",
        items: [
          { task: "Phản hồi đánh giá của khách hàng", completed: false },
          { task: "Trả lời câu hỏi từ khách hàng", completed: false },
          { task: "Cập nhật thông tin khi có thay đổi", completed: false }
        ]
      }
    ],
    photoSuggestions: [
      "Ảnh mặt tiền cửa hàng",
      "Ảnh không gian bên trong",
      "Ảnh sản phẩm/dịch vụ",
      "Ảnh đội ngũ nhân viên",
      "Ảnh khách hàng sử dụng dịch vụ"
    ],
    postIdeas: [
      `Giới thiệu dịch vụ mới của ${businessData.name}`,
      `Khuyến mãi đặc biệt trong tháng`,
      `Chia sẻ câu chuyện thành công của khách hàng`,
      `Tips và hướng dẫn liên quan đến ${businessData.category}`,
      `Thông báo giờ làm việc đặc biệt`
    ]
  };
}

function getBusinessType(category: string): string {
  const typeMap: Record<string, string> = {
    'Restaurant': 'Restaurant',
    'RetailStore': 'Store', 
    'ProfessionalService': 'ProfessionalService',
    'HealthAndBeauty': 'BeautySalon',
    'Automotive': 'AutoRepair',
    'E-commerce': 'OnlineStore',
    'RealEstate': 'RealEstateAgent'
  };
  return typeMap[category] || 'LocalBusiness';
}

function formatOpeningHours(hours: any): string[] {
  if (!hours) return [];
  
  return Object.entries(hours).map(([day, time]) => 
    `${day} ${time}`
  ) as string[];
}

function generateReviewSchema(businessData: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": "Khách hàng hài lòng"
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "5",
      "bestRating": "5"
    },
    "reviewBody": `Dịch vụ tại ${businessData.name} rất chuyên nghiệp và chất lượng. Nhân viên tư vấn nhiệt tình, giá cả hợp lý. Tôi sẽ quay lại và giới thiệu cho bạn bè.`
  };
}

function generateFallbackContent(businessData: any) {
  return {
    title: `${businessData.name} - ${businessData.category} tại ${businessData.city || 'TP.HCM'}`,
    metaDescription: `${businessData.name} cung cấp dịch vụ ${businessData.category} chất lượng cao. Liên hệ ${businessData.phone} để được tư vấn.`,
    headings: [
      `${businessData.category} chuyên nghiệp tại ${businessData.city || 'TP.HCM'}`,
      `Tại sao chọn ${businessData.name}?`,
      `Dịch vụ của chúng tôi`,
      `Liên hệ và địa chỉ`
    ],
    localKeywords: [
      `${businessData.category.toLowerCase()} ${businessData.city || 'tp hcm'}`,
      `${businessData.category.toLowerCase()} gần đây`,
      `${businessData.category.toLowerCase()} uy tín`
    ],
    contentSuggestions: [
      `Hướng dẫn chọn ${businessData.category.toLowerCase()} uy tín`,
      `So sánh các loại dịch vụ ${businessData.category.toLowerCase()}`,
      `Tips tiết kiệm chi phí khi sử dụng dịch vụ`
    ],
    gmbTips: [
      "Cập nhật thông tin doanh nghiệp đầy đủ",
      "Thêm ảnh chất lượng cao",
      "Phản hồi đánh giá khách hàng"
    ]
  };
}