
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

// List of interests users can select from
const interests = [
  "Music", "Movies", "Gaming", "Reading", "Sports", 
  "Cooking", "Travel", "Photography", "Art", "Technology",
  "Fashion", "Fitness", "Dance", "Writing", "Languages",
  "Science", "History", "Nature", "Animals", "Meditation"
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Get the username from the location state passed during navigation
  useEffect(() => {
    if (location.state?.username) {
      setUsername(location.state.username);
    } else {
      // If no username, redirect back to home
      navigate('/');
      toast.error('Please enter a username first');
    }
  }, [location.state, navigate]);

  const handleGenderSelection = (selected: string) => {
    setGender(selected);
  };

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      if (selectedInterests.length < 3) {
        setSelectedInterests([...selectedInterests, interest]);
      } else {
        toast.warning('You can select a maximum of 3 interests');
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
    if (selectedInterests.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }

    // Create user profile object
    const userProfile = {
      username,
      age: parseInt(age),
      gender,
      interests: selectedInterests,
      country: 'Unknown', // In a real app, this could be detected
      flag: '🌍', // Default flag
      isVIP: false,
      isOnline: true
    };

    // Navigate to chat page with user profile
    navigate('/chat', {
      state: { userProfile }
    });
    
    toast.success('Profile completed! Redirecting to chat...');
  };

  // Generate age options from 18 to 80
  const ageOptions = Array.from({ length: 63 }, (_, i) => i + 18);

  return (
    <>
      <Helmet>
        <title>Complete Your Profile | Chatiwy</title>
        <meta name="description" content="Complete your profile to start chatting on Chatiwy" />
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-3xl p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">Complete Your Profile</h1>
            
            {username && (
              <div className="mb-8 text-center">
                <span className="text-lg">Welcome, </span>
                <span className="text-2xl font-semibold text-teal-500">{username}</span>
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
              
              {/* Interests Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Interests (Select up to 3)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {interests.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <Button
                        key={interest}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        className={`flex justify-between items-center ${isSelected ? 'bg-teal-500 hover:bg-teal-600' : ''}`}
                        onClick={() => handleInterestToggle(interest)}
                      >
                        <span>{interest}</span>
                        {isSelected && <CheckCircle className="h-4 w-4 ml-1" />}
                      </Button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {selectedInterests.length}/3
                </p>
              </div>
              
              {/* Submit Button */}
              <Button 
                onClick={handleStartChat}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white"
              >
                Start Chatting
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ProfilePage;
