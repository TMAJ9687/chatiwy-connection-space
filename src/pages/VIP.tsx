
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Info, CreditCard, Paypal } from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$9.99',
    perMonth: '$9.99/month',
    period: 'Billed monthly',
    popular: false
  },
  {
    id: 'biannual',
    name: '6 Months',
    price: '$49.99',
    perMonth: '$8.33/month',
    period: 'Billed every 6 months',
    popular: true,
    savings: 'Save 17%'
  },
  {
    id: 'annual',
    name: 'Annual',
    price: '$79.99',
    perMonth: '$6.67/month',
    period: 'Billed annually',
    popular: false,
    savings: 'Save 33%'
  }
];

const benefits = [
  "Unlimited image uploads",
  "Voice messaging",
  "Message reactions",
  "Read receipts",
  "10-hour chat history",
  "Ad-free experience",
  "Customizable profile",
  "Priority in user listing",
  "Enhanced protection against bans",
  "Editable interests",
  "Free location selection"
];

const VIP = () => {
  const [selectedPlan, setSelectedPlan] = useState(plans[1].id);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const navigate = useNavigate();

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = () => {
    // This would integrate with a payment processor in a real app
    const planName = plans.find(p => p.id === selectedPlan)?.name;
    toast.success(`Processing ${paymentMethod === 'card' ? 'credit card' : 'PayPal'} payment for ${planName} plan`);
    
    setTimeout(() => {
      toast.success("You're now a VIP member! Enjoy your benefits.");
      navigate('/chat');
    }, 2000);
  };

  return (
    <>
      <Helmet>
        <title>VIP Membership - Chatiwy</title>
        <meta name="description" content="Upgrade to VIP membership and enjoy premium features like unlimited image uploads, voice messaging, and more." />
      </Helmet>
      
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-amber-500">VIP</span> Membership
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Unlock all premium features and enhance your chatting experience with our VIP membership options
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-semibold mb-4">VIP Benefits</h2>
              <div className="bg-muted p-6 rounded-lg">
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Your VIP status will be activated immediately after payment and will be visible to other users.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-4">Choose Your Plan</h2>
              <div className="space-y-4">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id}
                    className={`cursor-pointer relative overflow-hidden transition-all ${selectedPlan === plan.id ? 'ring-2 ring-amber-500' : 'hover:border-amber-200'}`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
                        Most Popular
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.period}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        {plan.savings && (
                          <span className="ml-2 text-sm text-green-600 dark:text-green-400">{plan.savings}</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{plan.perMonth}</div>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-2">Payment Method</h3>
                  <Tabs defaultValue="card" onValueChange={(value) => setPaymentMethod(value as 'card' | 'paypal')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="card" className="flex items-center justify-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Credit Card
                      </TabsTrigger>
                      <TabsTrigger value="paypal" className="flex items-center justify-center gap-2">
                        <Paypal className="h-4 w-4" />
                        PayPal
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="card" className="p-4 border rounded-md mt-2">
                      <p className="text-sm text-center text-muted-foreground">
                        Credit card payment will be securely processed via Stripe
                      </p>
                    </TabsContent>
                    <TabsContent value="paypal" className="p-4 border rounded-md mt-2">
                      <p className="text-sm text-center text-muted-foreground">
                        You'll be redirected to PayPal to complete your payment
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>
                
                <Button 
                  onClick={handleSubscribe} 
                  className="w-full mt-6 bg-amber-500 hover:bg-amber-600"
                >
                  Subscribe Now
                </Button>
                
                <p className="text-xs text-center text-gray-500 mt-4">
                  By subscribing you agree to our Terms of Service and Privacy Policy.
                  You can cancel your subscription anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default VIP;
