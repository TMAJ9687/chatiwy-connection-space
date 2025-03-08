
import { useState } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const [username, setUsername] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const handleStartChat = () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    
    // Validate username (max 20 chars, alphanumeric, max 2 numbers)
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(username)) {
      toast.error("Username can only contain letters and numbers");
      return;
    }
    
    const numberCount = (username.match(/[0-9]/g) || []).length;
    if (numberCount > 2) {
      toast.error("Username can contain a maximum of 2 numbers");
      return;
    }
    
    // Navigate to the profile page with the username
    navigate('/profile', { state: { username } });
  };

  const generateRandomUsername = () => {
    setIsGenerating(true);
    
    // Simulate API call for generating a username
    setTimeout(() => {
      const adjectives = ['Happy', 'Clever', 'Bright', 'Swift', 'Calm', 'Kind', 'Bold'];
      const nouns = ['Dolphin', 'Eagle', 'Tiger', 'Panda', 'Fox', 'Wolf', 'Lion'];
      
      const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
      const randomNum = Math.floor(Math.random() * 100);
      
      setUsername(`${randomAdjective}${randomNoun}${randomNum}`);
      setIsGenerating(false);
    }, 500);
  };

  return (
    <section className="relative min-h-screen flex items-center pt-16">
      {/* Decorative elements - Chat bubbles */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="chat-bubble bg-red-400 w-32 h-24 rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl top-1/4 left-1/5 opacity-90"></div>
        <div className="chat-bubble bg-orange-300 w-20 h-14 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl top-1/3 right-1/4 opacity-70 animate-delay-2"></div>
        <div className="chat-bubble bg-teal-500 w-48 h-40 rounded-tl-[40px] rounded-tr-[40px] rounded-br-[40px] bottom-1/4 left-1/5 opacity-80 animate-delay-1"></div>
        <div className="chat-bubble bg-teal-400 w-56 h-44 rounded-tl-[50px] rounded-tr-[50px] rounded-bl-[50px] bottom-1/5 right-1/5 opacity-90 animate-delay-3"></div>
        <div className="chat-bubble bg-red-500 w-12 h-12 rounded-full bottom-1/3 left-1/3 opacity-60"></div>
        <div className="chat-bubble bg-amber-400 w-16 h-16 rounded-tl-xl rounded-tr-xl rounded-br-xl top-2/5 right-1/3 opacity-80"></div>
        <div className="chat-bubble bg-red-300 w-8 h-8 rounded-full bottom-2/5 left-1/2 opacity-70"></div>
        <div className="chat-bubble bg-amber-500 w-5 h-5 rounded-full bottom-1/4 right-1/2 opacity-80"></div>
      </div>
      
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative z-10 animate-fade-in">
          {/* Empty div for the chat bubbles displayed via CSS */}
          <div className="relative h-96 md:h-auto"></div>
        </div>
        
        <div className="relative z-10">
          <div className="glass-card rounded-3xl p-8 animate-scale-in max-w-lg mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">
                Text <span className="text-amber-500">Anonymously</span>
                <br /> with <span className="text-teal-500">no registration</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Unleash your creativity and connect with like-minded individuals on our chatting website, 
                where conversations come to life.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Type your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pr-12"
                  maxLength={20}
                />
                <button 
                  onClick={generateRandomUsername}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-teal-500 transition-colors"
                  disabled={isGenerating}
                >
                  <RefreshCw className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              <Button 
                onClick={handleStartChat}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Start Chat <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
