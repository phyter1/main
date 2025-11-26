import { CursorGlow } from "@/components/effects/CursorGlow";
import { GrainOverlay } from "@/components/effects/GrainOverlay";
import { Hero } from "@/components/sections/Hero";

export default function Home() {
  return (
    <>
      {/* Visual effects */}
      <GrainOverlay />
      <CursorGlow />

      {/* Main content */}
      <Hero />
    </>
  );
}
