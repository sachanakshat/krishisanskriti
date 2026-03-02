import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import PillarsSection from "@/components/PillarsSection";
import TrainingSection from "@/components/TrainingSection";
import CalendarSection from "@/components/CalendarSection";
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
      <CalendarSection />
      <VideosSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
