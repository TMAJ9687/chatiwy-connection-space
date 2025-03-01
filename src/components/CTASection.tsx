
import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CTASection() {
  const handleGetStarted = () => {
    toast("Let's get started!");
    // In a real app, this would navigate to the username input
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-500/5 to-coral-500/5"></div>
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
