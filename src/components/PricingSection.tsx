import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Building } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const pricingPlans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for getting started',
    icon: Zap,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    features: [
      '5 SEO scans per month',
      '2 optimizations per month', 
      '10 AI rewrites per month',
      'Basic SEO analysis',
      'PageSpeed insights',
      'Basic reporting'
    ],
    limitations: [
      'Limited scan depth',
      'No competitor analysis',
      'No scheduled scans',
      'Basic support'
    ]
  },
  {
    name: 'Pro',
    price: 29,
    period: 'month',
    description: 'For growing businesses',
    icon: Crown,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    popular: true,
    features: [
      '100 SEO scans per month',
      '50 optimizations per month',
      '500 AI rewrites per month',
      'Advanced SEO analysis',
      'Competitor analysis',
      'Scheduled scans',
      'Full-site scanning',
      'Priority support',
      'Custom reporting'
    ]
  },
  {
    name: 'Agency',
    price: 99,
    period: 'month',
    description: 'For agencies and enterprises',
    icon: Building,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    features: [
      'Unlimited SEO scans',
      'Unlimited optimizations',
      'Unlimited AI rewrites',
      'Multi-organization management',
      'White-label reports',
      'API access',
      'Admin dashboard',
      'Custom integrations',
      'Dedicated support',
      'Training & onboarding'
    ]
  }
];

export function PricingSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleSelectPlan = (planName: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (planName === 'Free') {
      navigate('/dashboard');
      return;
    }

    // Here you would integrate with Stripe/payment system
    console.log(`Selected plan: ${planName}`);
    // For now, redirect to dashboard
    navigate('/dashboard');
  };

  const getPrice = (basePrice: number) => {
    if (basePrice === 0) return 0;
    return billingCycle === 'yearly' ? Math.round(basePrice * 12 * 0.8) : basePrice;
  };

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Choose Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Perfect Plan</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Scale your SEO strategy with our flexible pricing options
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Save 20%
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => {
            const Icon = plan.icon;
            const price = getPrice(plan.price);
            
            return (
              <Card
                key={plan.name}
                className={`glass-card relative ${plan.borderColor} ${
                  plan.popular ? 'ring-2 ring-purple-500/50 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className={`w-12 h-12 ${plan.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-6 h-6 ${plan.color}`} />
                  </div>
                  <CardTitle className="text-2xl font-bold text-white">
                    {plan.name}
                  </CardTitle>
                  <p className="text-gray-400 mt-2">{plan.description}</p>
                  
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-white">${price}</span>
                      {plan.price > 0 && (
                        <span className="text-gray-400 ml-2">
                          /{billingCycle === 'yearly' ? 'year' : plan.period}
                        </span>
                      )}
                    </div>
                    {plan.price > 0 && billingCycle === 'yearly' && (
                      <p className="text-sm text-gray-400 mt-1">
                        ${plan.price}/month billed annually
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <Button
                    onClick={() => handleSelectPlan(plan.name)}
                    className={`w-full mb-6 ${
                      plan.popular
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    {plan.name === 'Free' ? 'Get Started Free' : `Choose ${plan.name}`}
                  </Button>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-white mb-3">Everything included:</h4>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations && (
                      <>
                        <div className="pt-4 border-t border-gray-700">
                          <h4 className="font-semibold text-gray-400 mb-3 text-sm">Limitations:</h4>
                          {plan.limitations.map((limitation, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className="w-4 h-4 rounded-full bg-gray-600 flex-shrink-0" />
                              <span className="text-gray-400 text-sm">{limitation}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">
            Need a custom solution? Contact our sales team.
          </p>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Contact Sales
          </Button>
        </div>
      </div>
    </section>
  );
}