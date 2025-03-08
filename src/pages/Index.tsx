
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { VIPSection } from '@/components/VIPSection';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';
import { AdSensePlaceholder } from '@/components/AdSensePlaceholder';

const Index = () => {
  // JSON-LD structured data for rich search results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Chatiwy",
    "url": "https://chatiwy.app",
    "description": "Chatiwy is a secure platform for private, one-on-one text and image-based conversations, designed to foster meaningful connections.",
    "applicationCategory": "ChatApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "alternativeHeadline": "Private, anonymous chat with no registration required",
    "keywords": "anonymous chat, private messaging, secure chat, instant messaging, online chat, text chat, image sharing, no registration",
    "screenshot": "https://chatiwy.app/screenshot.png"
  };

  return (
    <>
      <Helmet>
        <title>Chatiwy - Private One-on-One Chat Platform | No Registration Required</title>
        <meta name="description" content="Connect instantly with people worldwide on Chatiwy, a secure platform for private, one-on-one text and image-based conversations. No registration required." />
        <meta name="keywords" content="anonymous chat, private messaging, secure chat, instant messaging, online chat, text chat, image sharing, no registration" />
        
        {/* Structured data */}
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
        
        {/* Additional SEO meta tags */}
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Chatiwy - Private One-on-One Chat Platform | No Registration Required" />
        <meta property="og:description" content="Connect instantly with people worldwide on Chatiwy, a secure platform for private, one-on-one text and image-based conversations." />
        <meta property="og:image" content="https://chatiwy.app/og-image.png" />
        <meta property="og:url" content="https://chatiwy.app" />
        <meta property="og:site_name" content="Chatiwy" />
        
        {/* Twitter Card data */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Chatiwy - Private One-on-One Chat Platform" />
        <meta name="twitter:description" content="Connect instantly with people worldwide on Chatiwy, a secure platform for private, one-on-one conversations." />
        <meta name="twitter:image" content="https://chatiwy.app/og-image.png" />
      </Helmet>
      
      <Navbar />
      
      <main>
        <HeroSection />
        
        {/* First AdSense Placeholder - After Hero Section */}
        <div className="container mx-auto px-4 my-8">
          <AdSensePlaceholder 
            slot="1234567890" 
            format="horizontal" 
            className="h-24 sm:h-32 md:h-40" 
          />
        </div>
        
        <FeaturesSection />
        <VIPSection />
        
        {/* Second AdSense Placeholder - Before CTA Section */}
        <div className="container mx-auto px-4 my-8">
          <AdSensePlaceholder 
            slot="0987654321" 
            format="horizontal" 
            className="h-24 sm:h-32 md:h-40" 
          />
        </div>
        
        <CTASection />
      </main>
      
      <Footer />
    </>
  );
};

export default Index;
