
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { countries } from "@/utils/countryData";
import { toast } from "sonner";
import { 
  CreditCard, 
  CheckCircle, 
  Gift,
  User,
  Calendar,
  MapPin,
  Heart,
  ChevronsUpDown,
  Users
} from "lucide-react";

export default function VIPRegistration() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>("monthly");
  const [formData, setFormData] = useState({
    nickname: "",
    age: "",
    country: "",
    interests: "",
    gender: ""
  });

  // Plans data
  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: "$3.99/month",
      billingInfo: "Billed every month",
      features: [
        "Send unlimited photos",
        "Send unlimited voice messages",
        "Chat history view",
        "Find matches according to interests",
        "Customer Support",
        "Customized avatars",
        "Appear at the top of the list",
        "Ad free",
        "React, reply, edit, unsend messages",
        "View message status",
        "Hide your own message status",
        "Control your online status"
      ]
    },
    {
      id: "biannual",
      name: "6 Months",
      price: "$20.99/6 months",
      billingInfo: "$3.50/month, billed every 6 months",
      popular: true,
      features: [
        "Send unlimited photos",
        "Send unlimited voice messages",
        "Chat history view",
        "Find matches according to interests",
        "Customer Support",
        "Customized avatars",
        "Appear at the top of the list",
        "Ad free",
        "React, reply, edit, unsend messages",
        "View message status",
        "Hide your own message status",
        "Control your online status"
      ]
    },
    {
      id: "annual",
      name: "Annual",
      price: "$39.99/year",
      billingInfo: "$3.33/month, billed annually",
      features: [
        "Send unlimited photos",
        "Send unlimited voice messages",
        "Chat history view",
        "Find matches according to interests",
        "Customer Support",
        "Customized avatars",
        "Appear at the top of the list",
        "Ad free",
        "React, reply, edit, unsend messages",
        "View message status",
        "Hide your own message status",
        "Control your online status"
      ]
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would integrate with a payment processor
    toast.success("Registration submitted successfully!");
    navigate("/chat");
  };

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-center mb-2">Create Your VIP Account</h1>
      <p className="text-center text-muted-foreground mb-10">
        Complete your profile and select a membership plan
      </p>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left side - Personal information */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-amber-500" />
                <span>Your Information</span>
              </CardTitle>
              <CardDescription>
                Tell us about yourself
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input 
                  id="nickname" 
                  name="nickname" 
                  placeholder="Your nickname" 
                  value={formData.nickname}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  name="age" 
                  type="number" 
                  placeholder="Your age" 
                  min="18" 
                  max="120"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <div className="relative">
                  <select
                    id="country"
                    name="country"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select your country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                  <ChevronsUpDown className="absolute right-3 top-3 h-4 w-4 opacity-50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <div className="relative">
                  <select
                    id="gender"
                    name="gender"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                  <ChevronsUpDown className="absolute right-3 top-3 h-4 w-4 opacity-50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interests">Interests</Label>
                <Textarea 
                  id="interests" 
                  name="interests" 
                  placeholder="Share your interests (music, movies, sports, etc.)"
                  value={formData.interests}
                  onChange={handleInputChange}
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Plan selection and payment */}
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-amber-500" />
                <span>Select Your Plan</span>
              </CardTitle>
              <CardDescription>
                Choose the membership plan that works best for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div 
                    key={plan.id} 
                    className={`border rounded-xl p-4 relative cursor-pointer transition-all ${
                      selectedPlan === plan.id 
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20" 
                        : "border-gray-200 dark:border-gray-700 hover:border-amber-300"
                    }`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 right-4 bg-amber-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                        Most popular!
                      </div>
                    )}
                    <div className="mb-4 flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{plan.name}</h3>
                        <p className="text-xs text-muted-foreground">{plan.billingInfo}</p>
                      </div>
                      {selectedPlan === plan.id && (
                        <CheckCircle className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <p className="text-2xl font-bold mb-2">{plan.price}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-500" />
                <span>Payment Method</span>
              </CardTitle>
              <CardDescription>
                Choose your preferred payment method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="card" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="card" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Credit Card
                  </TabsTrigger>
                  <TabsTrigger value="paypal" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> PayPal
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="card" className="space-y-4">
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input id="first-name" placeholder="First name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input id="last-name" placeholder="Last name" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card number</Label>
                      <Input id="card-number" placeholder="XXXX XXXX XXXX XXXX" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="month">Month</Label>
                        <Input id="month" placeholder="MM" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Input id="year" placeholder="YYYY" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" placeholder="CVC" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="paypal" className="space-y-4">
                  <div className="text-center p-6">
                    <p className="mb-6">Click the button below to proceed to PayPal for payment processing</p>
                    <Button className="bg-blue-500 hover:bg-blue-600 w-full">
                      Pay with PayPal
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSubmit} 
                className="w-full" 
                variant="warning"
              >
                Complete Registration
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        By subscribing, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  );
}
