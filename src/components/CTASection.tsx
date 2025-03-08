
import { ArrowRight, MessageCircle, MessageSquare, MessageCircleHeart, MessageSquareHeart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface ChatBubble {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  icon: 'MessageCircle' | 'MessageSquare' | 'MessageCircleHeart' | 'MessageSquareHeart';
  color: string;
}

export function CTASection() {
  const navigate = useNavigate();
  const [chatBubbles, setChatBubbles] = useState<ChatBubble[]>([]);
  
  useEffect(() => {
    // Generate random chat bubbles
    const icons = ['MessageCircle', 'MessageSquare', 'MessageCircleHeart', 'MessageSquareHeart'] as const;
    const colors = ['text-teal-500', 'text-coral-500', 'text-cyan-500', 'text-purple-500', 'text-amber-500'];
    const bubbles: ChatBubble[] = [];
    
    for (let i = 0; i < 15; i++) {
      bubbles.push({
        id: i,
        x: Math.random() * 80 + 10, // 10% to 90% of container width
        y: Math.random() * 80 + 10, // 10% to 90% of container height
        size: Math.random() * 20 + 20, // 20px to 40px
        rotation: Math.random() * 40 - 20, // -20deg to 20deg
        icon: icons[Math.floor(Math.random() * icons.length)],
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    setChatBubbles(bubbles);
  }, []);
  
  const handleGetStarted = () => {
    // Scroll to the top where the username input is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderIcon = (iconName: string, size: number, className: string) => {
    switch(iconName) {
      case 'MessageCircle':
        return <MessageCircle size={size} className={className} />;
      case 'MessageSquare':
        return <MessageSquare size={size} className={className} />;
      case 'MessageCircleHeart':
        return <MessageCircleHeart size={size} className={className} />;
      case 'MessageSquareHeart':
        return <MessageSquareHeart size={size} className={className} />;
      default:
        return <MessageCircle size={size} className={className} />;
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-500/5 to-coral-500/5"></div>
      </div>
      
      {/* Chat bubbles decorations */}
      <div className="absolute inset-0 -z-5 overflow-hidden">
        {chatBubbles.map((bubble) => (
          <div
            key={bubble.id}
            className={`absolute opacity-20 hover:opacity-50 transition-opacity duration-300 ${bubble.color}`}
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              transform: `rotate(${bubble.rotation}deg)`,
            }}
          >
            {renderIcon(bubble.icon, bubble.size, 'opacity-70')}
          </div>
        ))}
      </div>
      
      <div className="container mx-auto px-4">
        <div className="glass-card rounded-3xl p-8 md:p-12 max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start <span className="text-teal-500">Chatting</span>?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Join thousands of users already connecting on our platform. 
            No registration required, just pick a username and start chatting instantly.
          </p>
          
          <Button 
            onClick={handleGetStarted}
            className="btn-primary text-lg px-8 py-3"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
