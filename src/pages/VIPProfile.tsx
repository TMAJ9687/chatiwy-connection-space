
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Import country data
import { countries } from '@/utils/countryData';

const VIPProfilePage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Check if user is logged in as VIP
  useEffect(() => {
    const userProfileStr = localStorage.getItem('userProfile');
    
    if (!userProfileStr) {
      toast.error('Please login first');
      navigate('/vip/login');
      return;
    }
    
    try {
      const userProfile = JSON.parse(userProfileStr);
      if (!userProfile.isVIP) {
        toast.error('VIP access required');
        navigate('/vip/login');
        return;
      }
      
      // Pre-fill username from login
      setUsername(userProfile.username || '');
    } catch (error) {
      console.error('Error parsing user profile:', error);
      navigate('/vip/login');
    }
  }, [navigate]);

  // List of interests users can select from
  const interests = [
    "Music", "Movies", "Gaming", "Reading", "Sports", 
    "Cooking", "Travel", "Photography", "Art", "Technology",
    "Fashion", "Fitness", "Dance", "Writing", "Languages",
    "Science", "History", "Nature", "Animals", "Meditation"
  ];

  const handleGenderSelection = (selected: string) => {
    setGender(selected);
  };

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      if (selectedInterests.length < 5) { // VIP users can select up to 5 interests
        setSelectedInterests([...selectedInterests, interest]);
      } else {
        toast.warning('You can select a maximum of 5 interests');
      }
    }
  };

  const handleStartChat = () => {
    if (!age) {
      toast.error('Please select your age');
      return;
    }
    if (!gender) {
      toast.error('Please select your gender');
      return;
    }
    if (!country) {
      toast.error('Please select your country');
      return;
    }
    if (selectedInterests.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }

    // Get the country flag emoji
    const selectedCountry = countries.find(c => c.name === country);
    const flag = selectedCountry ? selectedCountry.flag : '🌍';

    // Update user profile with additional information
    const userProfileStr = localStorage.getItem('userProfile');
    if (userProfileStr) {
      try {
        const userProfile = JSON.parse(userProfileStr);
        const updatedProfile = {
          ...userProfile,
          age: parseInt(age),
          gender,
          interests: selectedInterests,
          country,
          flag,
          isOnline: true
        };
        
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        
        toast.success('Profile completed! Starting chat...');
        
        // Navigate to chat page with user profile
        navigate('/chat');
      } catch (error) {
        console.error('Error updating user profile:', error);
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  // Generate age options from 18 to 80
  const ageOptions = Array.from({ length: 63 }, (_, i) => i + 18);

  return (
    <>
      <Helmet>
        <title>VIP Profile Setup | Chatiwy</title>
        <meta name="description" content="Set up your VIP profile on Chatiwy" />
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <Card className="glass-card rounded-3xl p-8 max-w-2xl mx-auto">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-amber-500" />
                <CardTitle className="text-3xl font-bold">VIP Profile Setup</CardTitle>
              </div>
              <CardDescription className="text-center text-lg">
                Customize your VIP profile before starting to chat
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {username && (
                <div className="mb-8 text-center">
                  <span className="text-lg">Welcome, </span>
                  <span className="text-2xl font-semibold text-amber-500">{username}</span>
                  <div className="text-sm text-muted-foreground mt-1">VIP Member</div>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Age Selection */}
                <div>
                  <label htmlFor="age" className="block text-sm font-medium mb-2">
                    Age (18-80)
                  </label>
                  <Select value={age} onValueChange={setAge}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your age" />
                    </SelectTrigger>
                    <SelectContent>
                      {ageOptions.map((age) => (
                        <SelectItem key={age} value={age.toString()}>
                          {age}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Gender Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Gender
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={gender === 'Male' ? 'default' : 'outline'}
                      className={`h-12 ${gender === 'Male' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                      onClick={() => handleGenderSelection('Male')}
                    >
                      Male
                    </Button>
                    <Button
                      type="button"
                      variant={gender === 'Female' ? 'default' : 'outline'}
                      className={`h-12 ${gender === 'Female' ? 'bg-pink-500 hover:bg-pink-600' : ''}`}
                      onClick={() => handleGenderSelection('Female')}
                    >
                      Female
                    </Button>
                  </div>
                </div>
                
                {/* Country Selection */}
                <div>
                  <label htmlFor="country" className="block text-sm font-medium mb-2">
                    Country
                  </label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          <div className="flex items-center">
                            <span className="mr-2">{country.flag}</span>
                            <span>{country.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Interests Selection - VIP users can select up to 5 */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Interests (Select up to 5)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {interests.map((interest) => {
                      const isSelected = selectedInterests.includes(interest);
                      return (
                        <Button
                          key={interest}
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          className={`flex justify-between items-center ${isSelected ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                          onClick={() => handleInterestToggle(interest)}
                        >
                          <span>{interest}</span>
                          {isSelected && <CheckCircle className="h-4 w-4 ml-1" />}
                        </Button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {selectedInterests.length}/5
                  </p>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-6">
              {/* Submit Button */}
              <Button 
                onClick={handleStartChat}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                Start VIP Chat
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default VIPProfilePage;
