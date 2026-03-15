'use client';

import {HeroSection} from '@/components/hero/HeroSection';
import {RobotShowcase} from '@/components/robot/RobotShowcase';
import {AboutSection} from '@/components/about/AboutSection';

export default function HomePage() {
  return (
    <div className="min-h-dvh">
      {/* Hero section */}
      <HeroSection />

      {/* Section 2: Robot Showcase */}
      <RobotShowcase />

      {/* Section 3: About */}
      <div id="about">
        <AboutSection />
      </div>
    </div>
  );
}
