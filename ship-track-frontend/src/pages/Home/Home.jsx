import { useEffect } from "react";
import Navbar from "./sections/Navbar";
import HeroSection from "./sections/HeroSection";
import FeaturesSection from "./sections/FeaturesSection";
import HowItWorksSection from "./sections/HowItWorksSection";
import ServicesSection from "./sections/ServicesSection";
import Footer from "./sections/Footer";
import "./Home.css";

const Home = () => {
  // UI only: fade sections in as they scroll into view
  useEffect(() => {
    const items = document.querySelectorAll(".hm-reveal");

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div id="home" className="hm">
      <Navbar />

      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ServicesSection />
      </main>

      <Footer />
    </div>
  );
};

export default Home;