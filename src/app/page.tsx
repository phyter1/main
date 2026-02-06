import { CursorGlow } from "@/components/effects/CursorGlow";
import { GrainOverlay } from "@/components/effects/GrainOverlay";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { Hero } from "@/components/sections/Hero";
import { PrinciplesPreview } from "@/components/sections/PrinciplesPreview";

export default function Home() {
  return (
    <>
      {/* Visual effects */}
      <GrainOverlay />
      <CursorGlow />

      {/* Main content */}
      <Hero />

      {/* Featured content sections */}
      <FeaturedProjects />
      <PrinciplesPreview />
    </>
  );
}
