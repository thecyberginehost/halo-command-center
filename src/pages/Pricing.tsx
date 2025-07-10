import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, ArrowRight, Users, Zap, Clock, Download } from "lucide-react";
import { Link } from "react-router-dom";

const cloudPlans = [
  {
    id: "masp_starter",
    name: "MASP Starter",
    description: "Perfect for small automation agencies",
    monthlyPrice: 49,
    yearlyPrice: 470,
    organizationLimit: 3,
    popular: false,
    features: [
      "Up to 3 managed organizations",
      "Unlimited workflows & executions", 
      "Standard support",
      "Core integrations",
      "Basic analytics",
      "Email support"
    ]
  },
  {
    id: "masp_pro", 
    name: "MASP Pro",
    description: "For growing automation service providers",
    monthlyPrice: 149,
    yearlyPrice: 1430,
    organizationLimit: 10,
    popular: true,
    features: [
      "Up to 10 managed organizations",
      "Unlimited workflows & executions",
      "Priority support", 
      "Advanced integrations",
      "Advanced analytics & reporting",
      "Phone & email support",
      "Custom integrations"
    ]
  },
  {
    id: "masp_enterprise",
    name: "MASP Enterprise", 
    description: "For large-scale automation operations",
    monthlyPrice: 399,
    yearlyPrice: 3830,
    organizationLimit: null,
    popular: false,
    features: [
      "Unlimited managed organizations",
      "Unlimited workflows & executions",
      "Dedicated support",
      "White-label branding",
      "SSO & advanced security",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantees"
    ]
  }
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  const formatPrice = (monthly: number, yearly: number) => {
    if (isYearly) {
      const monthlyEquivalent = Math.round(yearly / 12);
      return { price: monthlyEquivalent, period: "paid annually" };
    }
    return { price: monthly, period: "month" };
  };

  const getSavings = (monthly: number, yearly: number) => {
    const monthlyCost = monthly * 12;
    const savings = monthlyCost - yearly;
    const percentSaved = Math.round((savings / monthlyCost) * 100);
    return percentSaved;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient-primary mb-4">
            Choose Your MASP Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Unlock the power of automation with HALO. All plans include unlimited workflows and executions - 
            you're only limited by the number of organizations you manage.
          </p>
          
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Label htmlFor="billing-toggle" className="text-sm font-medium">
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <Label htmlFor="billing-toggle" className="text-sm font-medium">
              Yearly
              <Badge variant="secondary" className="ml-2">Save 20%</Badge>
            </Label>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {cloudPlans.map((plan) => {
            const { price, period } = formatPrice(plan.monthlyPrice, plan.yearlyPrice);
            const savings = getSavings(plan.monthlyPrice, plan.yearlyPrice);
            
            return (
              <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <div className="text-3xl font-bold">
                      ${price}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{period}
                      </span>
                    </div>
                    {isYearly && (
                      <div className="text-sm text-green-600">
                        Save {savings}% annually
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-primary" />
                    <span>
                      {plan.organizationLimit ? `${plan.organizationLimit} organizations` : 'Unlimited organizations'}
                    </span>
                  </div>
                  
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Self-hosted CTA */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-muted/50">
            <CardHeader>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Download className="h-5 w-5" />
                <CardTitle className="text-lg">Self-Hosted Option Available</CardTitle>
              </div>
              <CardDescription>
                Prefer to host HALO on your own infrastructure? Our self-hosted version gives you complete control.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center space-x-1">
                  <Zap className="h-4 w-4" />
                  <span>Free Community Edition</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>5-minute setup</span>
                </div>
              </div>
              <Link to="/self-hosted">
                <Button variant="outline" className="w-full sm:w-auto">
                  Learn About Self-Hosting
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features comparison */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Why Choose HALO?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Unlimited Everything</h3>
              <p className="text-sm text-muted-foreground">
                No limits on workflows, executions, or features. Only limited by organizations managed.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">MASP Certified</h3>
              <p className="text-sm text-muted-foreground">
                Built specifically for Managed Automation Service Providers with enterprise features.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Quick Setup</h3>
              <p className="text-sm text-muted-foreground">
                Get started in minutes with our cloud platform or deploy self-hosted with Docker.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}