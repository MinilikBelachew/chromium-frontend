import React from "react";

import Footer from "@/components/layout/footer/Footer";
import Hero from "@/components/features/home/hero/Hero";
import Marquee from "@/components/features/home/marquee/Marquee";
import Features from "@/components/features/home/features/Features";
import HowItWorks from "@/components/features/home/how-it-works/HowItWorks";
import Testimonials from "@/components/features/home/testimonials/Testimonials";
import Pricing from "@/components/features/home/pricing/Pricing";
import Showcase from "@/components/features/home/showcase/Showcase";
import Faq from "@/components/features/home/faq/Faq";
import Integrations from "@/components/features/home/integrations/Integrations";
import BigCta from "@/components/features/home/cta/BigCta";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-svh bg-[#f7f5f0] text-[#1c1c1e]">
      <main>
        <Hero />
        <Marquee />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <Showcase />
        <Faq />
        <Integrations />
        <BigCta />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
