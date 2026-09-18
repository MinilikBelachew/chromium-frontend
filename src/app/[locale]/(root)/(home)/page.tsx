import React from "react";

import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";
import Hero from "@/components/features/home/hero/Hero";
import Marquee from "@/components/features/home/marquee/Marquee";
import Features from "@/components/features/home/features/Features";
import HowItWorks from "@/components/features/home/how-it-works/HowItWorks";
import Faq from "@/components/features/home/faq/Faq";
import BigCta from "@/components/features/home/cta/BigCta";

const HomePage: React.FC = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Features />
        <HowItWorks />
        <Faq />
        <BigCta />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
