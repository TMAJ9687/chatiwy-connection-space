
import { ImageIcon, Lock, MessageSquare, Shield, Star, Users } from 'lucide-react';

const features = [
  {
    icon: <MessageSquare className="h-6 w-6 text-teal-500" aria-hidden="true" />,
    title: "Private Text Chat",
    description: "Enjoy exclusive one-on-one conversations with enhanced spam prevention and privacy protection"
  },
  {
    icon: <ImageIcon className="h-6 w-6 text-coral-500" aria-hidden="true" />,
    title: "Secure Image Sharing",
    description: "Share images with blurred previews for enhanced privacy, with reveal and revert options for control"
  },
  {
    icon: <Shield className="h-6 w-6 text-amber-500" aria-hidden="true" />,
    title: "Enhanced Security",
    description: "Your privacy is our top priority with robust encryption and security measures for safe chatting"
  },
  {
    icon: <Users className="h-6 w-6 text-teal-500" aria-hidden="true" />,
    title: "User Roles & Privileges",
    description: "Standard, VIP, and Admin roles with different privileges and features for customized chat experiences"
  },
  {
    icon: <Star className="h-6 w-6 text-coral-500" aria-hidden="true" />,
    title: "Premium VIP Benefits",
    description: "Enjoy ad-free experience, voice messaging, message reactions and more exclusive features for VIPs"
  },
  {
    icon: <Lock className="h-6 w-6 text-amber-500" aria-hidden="true" />,
    title: "Privacy-First Messaging",
    description: "No registration required, conversation history automatically cleared for complete anonymity"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20" id="features" aria-labelledby="features-heading">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 id="features-heading" className="text-3xl font-bold mb-4">Premium Chat Features</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Discover a secure platform for meaningful connections with advanced features designed for your privacy, security, and chat enjoyment
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <article 
              key={index} 
              className="glass-card rounded-2xl p-6 hover-scale"
            >
              <div className="mb-4 p-3 inline-block rounded-xl bg-gray-100 dark:bg-gray-800">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
