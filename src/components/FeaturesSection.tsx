
import { ImageIcon, Lock, MessageSquare, Shield, Star, Users } from 'lucide-react';

const features = [
  {
    icon: <MessageSquare className="h-6 w-6 text-teal-500" />,
    title: "Private Text Chat",
    description: "Enjoy exclusive one-on-one conversations with enhanced spam prevention"
  },
  {
    icon: <ImageIcon className="h-6 w-6 text-coral-500" />,
    title: "Image Sharing",
    description: "Share images with blurred previews for privacy, with reveal and revert options"
  },
  {
    icon: <Shield className="h-6 w-6 text-amber-500" />,
    title: "Enhanced Security",
    description: "Your privacy is our priority with robust security measures"
  },
  {
    icon: <Users className="h-6 w-6 text-teal-500" />,
    title: "User Roles",
    description: "Standard, VIP, and Admin roles with different privileges and features"
  },
  {
    icon: <Star className="h-6 w-6 text-coral-500" />,
    title: "VIP Benefits",
    description: "Enjoy ad-free experience, voice messaging, message reactions and more"
  },
  {
    icon: <Lock className="h-6 w-6 text-amber-500" />,
    title: "Privacy First",
    description: "No registration required, conversation history automatically cleared"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Premium Features</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Discover a secure platform for meaningful connections with advanced features designed for your privacy and enjoyment
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-card rounded-2xl p-6 hover-scale"
            >
              <div className="mb-4 p-3 inline-block rounded-xl bg-gray-100 dark:bg-gray-800">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
