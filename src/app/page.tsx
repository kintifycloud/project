import type { Metadata } from "next";

import { FAQSection } from "@/components/FAQSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { FixInput } from "@/components/FixInput";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { PainSection } from "@/components/PainSection";
import { ProofSection } from "@/components/ProofSection";
import { siteDescription, siteTitle } from "@/lib/schemas";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <main className="overflow-x-hidden pb-24">
      <Hero>
        <FixInput defaultValue="Why is my cloud failing? My API is slow and timing out." showOutput={false} />
      </Hero>
      <PainSection />
      <HowItWorksSection />
      <ProofSection />
      <FeaturesSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
