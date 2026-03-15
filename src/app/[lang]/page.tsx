'use client';

import {HeroSection} from '@/components/hero/HeroSection';
import {RobotShowcase} from '@/components/robot/RobotShowcase';
import {AboutSection} from '@/components/about/AboutSection';
import {SvgDivider} from '@/components/animations/SvgDivider';

export default function HomePage() {
  return (
    <div className="min-h-dvh">
      {/* Hero section */}
      <HeroSection />

      <SvgDivider />

      {/* Section 2: Robot Showcase */}
      <RobotShowcase />

      <SvgDivider />

      {/* Section 3: About */}
      <div id="about">
        <AboutSection />
      </div>
    </div>
  );
}
