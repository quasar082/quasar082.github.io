'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let initialized = false;

export function getGsap() {
  if (!initialized) {
    gsap.registerPlugin(useGSAP, ScrollTrigger);
    initialized = true;
  }

  return gsap;
}

export { gsap, ScrollTrigger, useGSAP };
