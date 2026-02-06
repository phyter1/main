"use client";

import { useEffect } from "react";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { GrainOverlay } from "@/components/effects/GrainOverlay";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { Hero } from "@/components/sections/Hero";
import { PrinciplesPreview } from "@/components/sections/PrinciplesPreview";

export default function Home() {
  // Add scroll-snap to html element for homepage only
  useEffect(() => {
    const html = document.documentElement;
    html.style.scrollSnapType = "y mandatory";
    html.style.scrollBehavior = "smooth";

    return () => {
      // Cleanup: remove scroll-snap when leaving page
      html.style.scrollSnapType = "";
      html.style.scrollBehavior = "";
    };
  }, []);

  return (
    <>
      {/* Visual effects */}
      <GrainOverlay />
      <CursorGlow />

      {/* Main content sections with scroll snap */}
      <section id="hero" className="snap-start">
        <Hero />
      </section>

      <section id="featured-projects" className="snap-start">
        <FeaturedProjects />
      </section>

      <section id="principles-preview" className="snap-start">
        <PrinciplesPreview />
      </section>
    </>
  );
}
