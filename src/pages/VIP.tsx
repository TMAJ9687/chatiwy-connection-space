
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
            <Card>
              <CardHeader>
                <CardTitle>Credit Card Payment</CardTitle>
                <CardDescription>
                  Secure payment via Stripe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="first-name">
                        First name
                      </label>
                      <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" id="first-name" placeholder="First name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="last-name">
                        Last name
                      </label>
                      <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" id="last-name" placeholder="Last name" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="card-number">
                      Card number
                    </label>
                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" id="card-number" placeholder="XXXX XXXX XXXX XXXX" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="month">
                        Month
                      </label>
                      <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" id="month" placeholder="MM" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="year">
                        Year
                      </label>
                      <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" id="year" placeholder="YYYY" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="cvc">
                        CVC
                      </label>
                      <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" id="cvc" placeholder="CVC" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-amber-500 hover:bg-amber-600">
                  Subscribe for $9.99/month
                </Button>
              </CardFooter>
            </Card>
            <p className="text-xs text-center text-muted-foreground">
              By subscribing, you agree to our Terms of Service and Privacy Policy
            </p>
          </TabsContent>
          <TabsContent value="paypal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>PayPal Payment</CardTitle>
                <CardDescription>
                  Quick and secure payment via PayPal
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center p-6">
                <p className="mb-6">Click the button below to proceed to PayPal for payment processing</p>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  Pay with PayPal
                </Button>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Separator />
                <div className="text-sm text-muted-foreground">
                  <p>You will be redirected to PayPal to complete your purchase securely.</p>
                  <p>The subscription will be processed immediately after confirmation.</p>
                </div>
              </CardFooter>
            </Card>
            <p className="text-xs text-center text-muted-foreground">
              By subscribing, you agree to our Terms of Service and Privacy Policy
            </p>
          </TabsContent>
        </Tabs>
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
