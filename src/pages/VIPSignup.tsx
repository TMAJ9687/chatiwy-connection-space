import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { X, User, Mail, Lock, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { countries } from '@/utils/countryData';

const VIPSignupPage = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    nickname: '',
    age: '',
    gender: '',
    country: '',
    interests: [] as string[],
    email: '',
    password: '',
    confirmPassword: '',
    paymentMethod: 'credit-card',
    planDuration: 'monthly'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const interestOptions = [
    'Movies', 'Music', 'Sports', 'Reading', 'Travel', 'Gaming', 
    'Cooking', 'Art', 'Dance', 'Photography', 'Technology', 'Fashion'
  ];

  const handleClose = () => {
    navigate('/');
  };

  const updateForm = (field: string, value: string | string[]) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    const interests = [...formState.interests];
    if (interests.includes(interest)) {
      updateForm('interests', interests.filter(i => i !== interest));
    } else {
      updateForm('interests', [...interests, interest]);
    }
  };

  const validateStep1 = () => {
    if (!formState.nickname || !formState.age || !formState.gender || !formState.country) {
      toast.error('Please fill in all the required fields');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formState.email || !formState.password || !formState.confirmPassword) {
      toast.error('Please fill in all the required fields');
      return false;
    }
    
    if (!formState.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    if (formState.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    
    if (formState.password !== formState.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const goToNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    // Mock signup - in a real app, this would be an API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Registration successful! Welcome to VIP.');
      // Store a mock user profile in localStorage
      localStorage.setItem('userProfile', JSON.stringify({
        username: formState.nickname,
        gender: formState.gender,
        country: formState.country,
        isVIP: true,
        joinDate: new Date().toISOString()
      }));
      navigate('/chat');
    }, 1500);
  };

  const ageOptions = [];
  for (let i = 18; i <= 80; i++) {
    ageOptions.push(i);
  }

  const getPlanPrice = () => {
    switch (formState.planDuration) {
      case 'monthly': return '$5.00';
      case 'semiannual': return '$25.00';
      case 'annual': return '$45.00';
      default: return '$5.00';
    }
  };

  const getPlanDescription = () => {
    switch (formState.planDuration) {
      case 'monthly': return 'Billed monthly';
      case 'semiannual': return 'Billed every 6 months ($4.17/month)';
      case 'annual': return 'Billed annually ($3.75/month)';
      default: return 'Billed monthly';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Helmet>
        <title>VIP Signup | Chatiwy</title>
        <meta name="description" content="Register for VIP membership on Chatiwy" />
      </Helmet>
      
      <header className="border-b border-gray-200 py-3 px-4 flex items-center justify-between bg-white fixed w-full z-10">
        <div className="flex items-center">
          <div className="text-xl font-bold text-teal-500">Chatiwy</div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleClose}
            variant="ghost" 
            size="sm"
            className="mr-2"
          >
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
          <div className="h-7 w-7 flex items-center justify-center rounded-full border">
            <span className="sr-only">Toggle theme</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="M5 5l1.5 1.5"></path>
              <path d="M17.5 17.5L19 19"></path>
              <path d="M5 19l1.5-1.5"></path>
              <path d="M17.5 6.5L19 5"></path>
            </svg>
          </div>
          <div className="h-8 w-8 overflow-hidden rounded-full">
            <img src="https://i.pravatar.cc/32" alt="User avatar" className="h-full w-full object-cover" />
          </div>
          <Button variant="warning" size="sm" className="flex items-center gap-1">
            <span>VIP Membership</span>
          </Button>
        </div>
      </header>
      
      <main className="flex-1 py-4 pt-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>VIP Registration</CardTitle>
              <CardDescription>
                Register for VIP membership to unlock premium features
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent>
                <div className="flex justify-between mb-6">
                  <div className={`flex-1 border-b-2 pb-2 ${step >= 1 ? 'border-amber-500' : 'border-gray-200'}`}>
                    <div className="flex items-center">
                      <div className={`rounded-full h-6 w-6 flex items-center justify-center mr-2 ${step >= 1 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        1
                      </div>
                      <span className={step >= 1 ? 'text-amber-500' : 'text-gray-500'}>Profile</span>
                    </div>
                  </div>
                  <div className={`flex-1 border-b-2 pb-2 ${step >= 2 ? 'border-amber-500' : 'border-gray-200'}`}>
                    <div className="flex items-center">
                      <div className={`rounded-full h-6 w-6 flex items-center justify-center mr-2 ${step >= 2 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        2
                      </div>
                      <span className={step >= 2 ? 'text-amber-500' : 'text-gray-500'}>Account</span>
                    </div>
                  </div>
                  <div className={`flex-1 border-b-2 pb-2 ${step >= 3 ? 'border-amber-500' : 'border-gray-200'}`}>
                    <div className="flex items-center">
                      <div className={`rounded-full h-6 w-6 flex items-center justify-center mr-2 ${step >= 3 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        3
                      </div>
                      <span className={step >= 3 ? 'text-amber-500' : 'text-gray-500'}>Payment</span>
                    </div>
                  </div>
                </div>
                
                {
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nickname">Nickname</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="nickname" 
                          value={formState.nickname}
                          onChange={(e) => updateForm('nickname', e.target.value)}
                          placeholder="Choose a nickname"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Select value={formState.age} onValueChange={(value) => updateForm('age', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select age" />
                          </SelectTrigger>
                          <SelectContent>
                            {ageOptions.map(age => (
                              <SelectItem key={age} value={age.toString()}>
                                {age}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <RadioGroup 
                          value={formState.gender} 
                          onValueChange={(value) => updateForm('gender', value)}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="male" />
                            <Label htmlFor="male">Male</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="female" />
                            <Label htmlFor="female">Female</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select value={formState.country} onValueChange={(value) => updateForm('country', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(country => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.flag} {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Interests (optional)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {interestOptions.map(interest => (
                          <Button
                            key={interest}
                            type="button"
                            variant={formState.interests.includes(interest) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleInterest(interest)}
                            className={formState.interests.includes(interest) ? 'bg-amber-500 hover:bg-amber-600' : ''}
                          >
                            {interest}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                }
                
                {
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email" 
                          type="email"
                          value={formState.email}
                          onChange={(e) => updateForm('email', e.target.value)}
                          placeholder="Enter your email address"
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your email will be used for account recovery and payment confirmation
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="password" 
                          type="password"
                          value={formState.password}
                          onChange={(e) => updateForm('password', e.target.value)}
                          placeholder="Create a password"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="confirmPassword" 
                          type="password"
                          value={formState.confirmPassword}
                          onChange={(e) => updateForm('confirmPassword', e.target.value)}
                          placeholder="Confirm your password"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 dark:bg-amber-950/50 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div className="text-sm text-amber-800 dark:text-amber-300">
                          <p className="font-medium">Security Note</p>
                          <p>For your security, use a password that is:</p>
                          <ul className="list-disc pl-5 mt-1">
                            <li>At least 6 characters long</li>
                            <li>Contains both letters and numbers</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                
                {
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Plan Duration</Label>
                      <Tabs 
                        defaultValue="monthly" 
                        className="w-full"
                        value={formState.planDuration}
                        onValueChange={(value) => updateForm('planDuration', value)}
                      >
                        <TabsList className="grid grid-cols-3 w-full">
                          <TabsTrigger value="monthly">Monthly</TabsTrigger>
                          <TabsTrigger value="semiannual">6 Months</TabsTrigger>
                          <TabsTrigger value="annual">Yearly</TabsTrigger>
                        </TabsList>
                        <TabsContent value="monthly" className="py-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold mb-1">$5.00</div>
                            <div className="text-sm text-muted-foreground">Billed monthly</div>
                          </div>
                        </TabsContent>
                        <TabsContent value="semiannual" className="py-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold mb-1">$25.00</div>
                            <div className="text-sm text-muted-foreground">Billed every 6 months ($4.17/month)</div>
                            <div className="text-sm text-amber-500 font-medium mt-1">Save $5.00</div>
                          </div>
                        </TabsContent>
                        <TabsContent value="annual" className="py-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold mb-1">$45.00</div>
                            <div className="text-sm text-muted-foreground">Billed annually ($3.75/month)</div>
                            <div className="text-sm text-amber-500 font-medium mt-1">Save $15.00</div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div 
                          className={`border rounded-md p-4 cursor-pointer ${formState.paymentMethod === 'credit-card' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50' : 'border-gray-200 dark:border-gray-800'}`}
                          onClick={() => updateForm('paymentMethod', 'credit-card')}
                        >
                          <div className="flex items-center justify-center h-10">
                            <CreditCard className="h-6 w-6 text-amber-500" />
                          </div>
                          <div className="text-center mt-2">
                            <div className="font-medium">Credit Card</div>
                            <div className="text-xs text-muted-foreground">Visa, Mastercard, Amex</div>
                          </div>
                        </div>
                        
                        <div 
                          className={`border rounded-md p-4 cursor-pointer ${formState.paymentMethod === 'paypal' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50' : 'border-gray-200 dark:border-gray-800'}`}
                          onClick={() => updateForm('paymentMethod', 'paypal')}
                        >
                          <div className="flex items-center justify-center h-10">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M7.49604 5.5H15.9961C17.0961 5.5 17.9461 6.2 18.0961 7.25C18.2711 8.46 18.1461 10.03 17.6961 11.3C17.1961 12.7 16.0711 14.25 13.9461 14.25H12.2961C11.7461 14.25 11.2961 14.65 11.1961 15.15L10.6461 18.15C10.5961 18.45 10.3461 18.65 10.0961 18.65H7.64604C7.19604 18.65 6.84604 18.25 6.89604 17.8L8.89604 6.35C8.94604 5.85 9.19604 5.5 9.64604 5.5" stroke="#0070E0" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M13.5 18.6L14.35 14C14.45 13.55 14.85 13.25 15.35 13.25H17C19.6 13.25 21.5 11.25 22.05 8.95C22.25 8.1 22.25 7.2 22.05 6.25C21.9 5.4 21.5 4.65 20.95 4.1C20.2 3.4 19.2 3 18.15 3H10.15C9.29997 3 8.59997 3.65 8.44997 4.5L6.44997 15.9C6.39997 16.35 6.74997 16.75 7.19997 16.75H9.89997C10.15 16.75 10.4 16.55 10.45 16.25L10.9 13.7" stroke="#0070E0" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="text-center mt-2">
                            <div className="font-medium">PayPal</div>
                            <div className="text-xs text-muted-foreground">Fast & secure</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md mt-4">
                      <h4 className="font-medium">Order Summary</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span>VIP Membership</span>
                          <span>{getPlanPrice()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{getPlanDescription()}</span>
                          <span></span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>{getPlanPrice()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-center text-muted-foreground pt-2">
                      By completing your purchase, you agree to our <a href="#" className="text-amber-500 hover:underline">Terms of Service</a> and <a href="#" className="text-amber-500 hover:underline">Privacy Policy</a>.
                    </div>
                  </div>
                }
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6">
                {step > 1 ? (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={goToPreviousStep}
                  >
                    Previous
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => navigate('/vip/login')}
                  >
                    Already have an account?
                  </Button>
                )}
                
                {step < 3 ? (
                  <Button 
                    type="button"
                    onClick={goToNextStep}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading ? 'Processing...' : 'Complete Registration'}
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VIPSignupPage;
