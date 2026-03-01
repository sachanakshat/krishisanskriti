import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import PillarsSection from "@/components/PillarsSection";
import TrainingSection from "@/components/TrainingSection";
import VideosSection from "@/components/VideosSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <PillarsSection />
      <TrainingSection />
      <VideosSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
