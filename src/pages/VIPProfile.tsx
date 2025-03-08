
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Shield, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VIPAvatarSelector } from '@/components/VIPAvatarSelector';

// Import country data
import { countries } from '@/utils/countryData';

const VIPProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

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
      
      // Check if profile already exists and load it
      if (userProfile.age) {
        setAge(userProfile.age.toString());
        setGender(userProfile.gender || '');
        setCountry(userProfile.country || '');
        setSelectedInterests(userProfile.interests || []);
        setAvatarUrl(userProfile.avatar || '');
        setProfileLoaded(true);
        
        // If not explicitly editing, start in view mode
        if (!isEditing && !location.state?.edit) {
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      } else {
        // No profile exists yet, start in edit mode
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error parsing user profile:', error);
      navigate('/vip/login');
    }
  }, [navigate, location.state]);

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

  const handleAvatarChange = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
  };

  const handleSaveProfile = () => {
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
          isOnline: true,
          avatar: avatarUrl
        };
        
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        
        toast.success('Profile saved successfully!');
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating user profile:', error);
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  const handleStartChat = () => {
    // Use the current profile data from localStorage to ensure it's the most up-to-date
    const userProfileStr = localStorage.getItem('userProfile');
    if (userProfileStr) {
      try {
        const updatedProfile = JSON.parse(userProfileStr);
        
        // Navigate to chat page with the profile as state
        navigate('/chat', { 
          state: { userProfile: updatedProfile },
          replace: true // Use replace to prevent back button issues
        });
      } catch (error) {
        console.error('Error parsing user profile:', error);
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Generate age options from 18 to 80
  const ageOptions = Array.from({ length: 63 }, (_, i) => i + 18);

  // Get default avatar if none is selected
  const getDefaultAvatar = () => {
    if (avatarUrl) return avatarUrl;
    
    const style = gender === 'Male' ? 'male' : 'female';
    return `https://api.dicebear.com/7.x/personas/svg?seed=${style}1`;
  };

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
                <CardTitle className="text-3xl font-bold">VIP Profile {isEditing ? 'Setup' : 'Details'}</CardTitle>
              </div>
              <CardDescription className="text-center text-lg">
                {isEditing ? 'Customize your VIP profile before starting to chat' : 'Your VIP profile information'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {username && (
                <div className="mb-8 text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="w-24 h-24 border-4 border-amber-500">
                      <AvatarImage src={getDefaultAvatar()} />
                      <AvatarFallback className="text-xl">{username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  {isEditing && gender && (
                    <div className="mb-4">
                      <VIPAvatarSelector 
                        gender={gender} 
                        currentAvatar={avatarUrl}
                        onAvatarChange={handleAvatarChange} 
                      />
                    </div>
                  )}
                  <span className="text-lg">Welcome, </span>
                  <span className="text-2xl font-semibold text-amber-500">{username}</span>
                  <div className="flex items-center justify-center text-sm text-muted-foreground mt-1">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      <Shield className="h-3 w-3 mr-1" /> VIP Member
                    </Badge>
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Age Selection */}
                <div>
                  <label htmlFor="age" className="block text-sm font-medium mb-2">
                    Age (18-80)
                  </label>
                  {isEditing ? (
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
                  ) : (
                    <div className="p-3 border rounded-md">{age}</div>
                  )}
                </div>
                
                {/* Gender Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Gender
                  </label>
                  {isEditing ? (
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
                  ) : (
                    <div className="p-3 border rounded-md">{gender}</div>
                  )}
                </div>
                
                {/* Country Selection */}
                <div>
                  <label htmlFor="country" className="block text-sm font-medium mb-2">
                    Country
                  </label>
                  {isEditing ? (
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
                  ) : (
                    <div className="p-3 border rounded-md flex items-center">
                      {countries.find(c => c.name === country)?.flag} {country}
                    </div>
                  )}
                </div>
                
                {/* Interests Selection - VIP users can select up to 5 */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Interests {isEditing ? '(Select up to 5)' : ''}
                  </label>
                  {isEditing ? (
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
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedInterests.map(interest => (
                        <Badge key={interest} variant="secondary">{interest}</Badge>
                      ))}
                    </div>
                  )}
                  {isEditing && (
                    <p className="text-xs text-gray-500 mt-2">
                      Selected: {selectedInterests.length}/5
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-6 flex flex-col md:flex-row gap-3">
              {isEditing ? (
                <Button 
                  onClick={handleSaveProfile}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Save Profile
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={toggleEditMode}
                    className="w-full md:w-auto"
                    variant="outline"
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                  <Button 
                    onClick={handleStartChat}
                    className="w-full md:flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    Start VIP Chat
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default VIPProfilePage;
