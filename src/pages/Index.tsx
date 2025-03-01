
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { ChatPreview } from '@/components/ChatPreview';
import { VIPSection } from '@/components/VIPSection';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Chatiwy - Private One-on-One Chat Platform</title>
        <meta name="description" content="Chatiwy is a secure platform for private, one-on-one text and image-based conversations, designed to foster meaningful connections." />
      </Helmet>
      
      <Navbar />
      
      <main>
        <HeroSection />
        <FeaturesSection />
        <ChatPreview />
        <VIPSection />
        <CTASection />
      </main>
      
      <Footer />
    </>
  );
};

export default Index;
