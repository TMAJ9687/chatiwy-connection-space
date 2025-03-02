
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { VIPSection } from "@/components/VIPSection";
import { 
  CreditCard, 
  CheckCircle, 
  ShieldCheck, 
  Image, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Settings
} from "lucide-react";

export default function VIPPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/vip/register");
  };

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-center mb-2">VIP Membership</h1>
      <p className="text-center text-muted-foreground mb-10">
        Enhance your experience with exclusive features
      </p>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-amber-500" />
              <span>Premium Content</span>
            </CardTitle>
            <CardDescription>
              Unlimited image uploads and content access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>• Unlimited high-resolution photo uploads</p>
            <p>• No waiting period for content approval</p>
            <p>• Access to premium filters and effects</p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-amber-500" />
              <span>Enhanced Messaging</span>
            </CardTitle>
            <CardDescription>
              Advanced messaging features for better communication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>• Voice messages up to 5 minutes</p>
            <p>• Message reactions and read receipts</p>
            <p>• 10-hour chat history with search</p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" />
              <span>Priority Protection</span>
            </CardTitle>
            <CardDescription>
              Additional security and protection benefits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>• Enhanced protection against bans</p>
            <p>• Priority customer support</p>
            <p>• Profile verification badge</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Choose Your Plan</h2>
          <p className="text-muted-foreground">Select the plan that works best for you</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Monthly</CardTitle>
              <div className="text-3xl font-bold mt-2">$3.99<span className="text-base font-normal text-muted-foreground">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>All premium features</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Billed monthly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Cancel anytime</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" onClick={handleGetStarted}>Get Started</Button>
            </CardFooter>
          </Card>
          
          <Card className="border-amber-500 shadow-lg relative">
            <div className="absolute -top-3 right-0 left-0 mx-auto w-max px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
              Most Popular
            </div>
            <CardHeader className="text-center">
              <CardTitle>6 Months</CardTitle>
              <div className="text-3xl font-bold mt-2">$20.99<span className="text-base font-normal text-muted-foreground">/6 months</span></div>
              <p className="text-sm text-muted-foreground">$3.50/month</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>All premium features</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Save $2.95 vs monthly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Billed every 6 months</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-amber-500 hover:bg-amber-600" onClick={handleGetStarted}>Get Started</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Annual</CardTitle>
              <div className="text-3xl font-bold mt-2">$39.99<span className="text-base font-normal text-muted-foreground">/year</span></div>
              <p className="text-sm text-muted-foreground">$3.33/month</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>All premium features</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Save $7.89 vs monthly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Billed annually</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" onClick={handleGetStarted}>Get Started</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Why Choose VIP?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center text-center p-4">
            <MapPin className="h-10 w-10 text-amber-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Location Selection</h3>
            <p className="text-muted-foreground">Choose any location to appear from and connect with users worldwide</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <Clock className="h-10 w-10 text-amber-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Extended History</h3>
            <p className="text-muted-foreground">Access your chat history for up to 10 hours with full search functionality</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <Settings className="h-10 w-10 text-amber-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Customization</h3>
            <p className="text-muted-foreground">Fully customize your profile and chat experience with exclusive options</p>
          </div>
        </div>
      </div>
    </div>
  );
}
