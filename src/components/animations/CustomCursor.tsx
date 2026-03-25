'use client';

import {useRef, useEffect, useState} from 'react';
import {gsap} from '@/lib/gsap';

type CursorState = 'default' | 'expand' | 'text' | 'drag' | 'magnetic';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect pointer:fine (desktop with precise pointer)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsDesktop(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Set up cursor tracking, event delegation, and state management
  useEffect(() => {
    if (!isDesktop || !dotRef.current || !ringRef.current || !labelRef.current) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;

    let currentState: CursorState = 'default';
    let currentMagneticTarget: HTMLElement | null = null;

    // Hide default cursor
    document.documentElement.style.cursor = 'none';
    const styleTag = document.createElement('style');
    styleTag.textContent =
      'a, button, [role="button"], [data-cursor-hover], [data-cursor-text], [data-cursor-drag], [data-cursor-magnetic] { cursor: none !important; }';
    document.head.appendChild(styleTag);

    // Smooth cursor follow via gsap.quickTo
    // Dot: near-instant for precise tracking
    const dotXTo = gsap.quickTo(dot, 'x', {duration: 0.05, ease: 'none'});
    const dotYTo = gsap.quickTo(dot, 'y', {duration: 0.05, ease: 'none'});
    // Ring: starts immediately but decelerates — creates trailing/chasing feel
    const ringXTo = gsap.quickTo(ring, 'x', {duration: 0.35, ease: 'power3.out'});
    const ringYTo = gsap.quickTo(ring, 'y', {duration: 0.35, ease: 'power3.out'});

    // setCursorState — manages transitions between cursor states
    const setCursorState = (
      state: CursorState,
      magneticTarget?: HTMLElement | null,
      labelText?: string
    ) => {
      if (state === currentState) return;
      currentState = state;

      // Clean up previous magnetic target
      if (currentMagneticTarget && state !== 'magnetic') {
        gsap.to(currentMagneticTarget, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'elastic.out(1, 0.3)',
        });
        currentMagneticTarget = null;
      }

      switch (state) {
        case 'default':
          gsap.to(dot, {opacity: 1, duration: 0.3, ease: 'power2.out'});
          gsap.to(ring, {
            width: 32,
            height: 32,
            backgroundColor: 'transparent',
            borderColor: '#1A1A1A',
            borderWidth: 1,
            mixBlendMode: 'normal',
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(label, {opacity: 0, duration: 0.2});
          break;

        case 'expand':
          gsap.to(dot, {opacity: 1, duration: 0.3, ease: 'power2.out'});
          gsap.to(ring, {
            width: 64,
            height: 64,
            backgroundColor: 'transparent',
            borderColor: 'currentColor',
            borderWidth: 1,
            mixBlendMode: 'difference',
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(label, {opacity: 0, duration: 0.2});
          break;

        case 'text':
          gsap.to(dot, {opacity: 0, duration: 0.3, ease: 'power2.out'});
          gsap.to(ring, {
            width: 80,
            height: 80,
            backgroundColor: '#111111',
            borderColor: '#111111',
            borderWidth: 0,
            mixBlendMode: 'normal',
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
          label.textContent = labelText || 'View';
          gsap.to(label, {opacity: 1, duration: 0.3, ease: 'power2.out'});
          break;

        case 'drag':
          gsap.to(dot, {opacity: 0, duration: 0.3, ease: 'power2.out'});
          gsap.to(ring, {
            width: 64,
            height: 64,
            backgroundColor: '#111111',
            borderColor: '#111111',
            borderWidth: 0,
            mixBlendMode: 'normal',
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
          label.textContent = '\u2190\u2192 Drag';
          gsap.to(label, {opacity: 1, duration: 0.3, ease: 'power2.out'});
          break;

        case 'magnetic':
          gsap.to(dot, {opacity: 0, duration: 0.3, ease: 'power2.out'});
          gsap.to(ring, {opacity: 0, duration: 0.3, ease: 'power2.out'});
          if (magneticTarget) currentMagneticTarget = magneticTarget;
          break;
      }
    };

    // Mouse move handler — update cursor positions + magnetic effect
    const onMouseMove = (e: MouseEvent) => {
      dotXTo(e.clientX);
      dotYTo(e.clientY);
      ringXTo(e.clientX);
      ringYTo(e.clientY);

      // Magnetic effect: shift target element toward cursor
      if (currentState === 'magnetic' && currentMagneticTarget) {
        const rect = currentMagneticTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.15; // 15% of distance = ~5-10px shift
        const deltaY = (e.clientY - centerY) * 0.15;
        gsap.to(currentMagneticTarget, {
          x: deltaX,
          y: deltaY,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    // Event delegation: mouseover on document
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Priority 1: magnetic
      const magnetic = target.closest('[data-cursor-magnetic]') as HTMLElement | null;
      if (magnetic) {
        setCursorState('magnetic', magnetic);
        return;
      }

      // Priority 2: drag
      if (target.closest('[data-cursor-drag]')) {
        setCursorState('drag');
        return;
      }

      // Priority 3: text label
      const textEl = target.closest('[data-cursor-text]') as HTMLElement | null;
      if (textEl) {
        const text = textEl.getAttribute('data-cursor-text') || 'View';
        setCursorState('text', undefined, text);
        return;
      }

      // Priority 4: expand + blend
      if (target.closest('a, button, [data-cursor-hover]')) {
        setCursorState('expand');
        return;
      }
    };

    // Event delegation: mouseout on document
    const handleMouseOut = (e: MouseEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement | null;

      // Check if we're still inside any interactive element
      if (relatedTarget) {
        if (
          relatedTarget.closest('[data-cursor-magnetic]') ||
          relatedTarget.closest('[data-cursor-drag]') ||
          relatedTarget.closest('[data-cursor-text]') ||
          relatedTarget.closest('a, button, [data-cursor-hover]')
        ) {
          return; // Still inside an interactive element, don't reset
        }
      }

      setCursorState('default');
    };

    // Attach listeners
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);

      // Restore default cursor
      document.documentElement.style.cursor = '';
      styleTag.remove();

      // Reset any magnetic target
      if (currentMagneticTarget) {
        gsap.to(currentMagneticTarget, {x: 0, y: 0, duration: 0.3});
        currentMagneticTarget = null;
      }

      // Restore ring opacity (in case unmounted during magnetic state)
      gsap.set(ring, {opacity: 1});
    };
  }, [isDesktop]);

  // Do not render anything on touch/mobile
  if (!isDesktop) return null;

  return (
    <>
      {/* Dot - 8px filled circle, instant follow */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#1A1A1A',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* Ring - 32px border circle, delayed follow */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1px solid #1A1A1A',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Text label (hidden by default, shown for text/drag states) */}
        <span
          ref={labelRef}
          style={{
            fontSize: 14,
            fontWeight: 400,
            textTransform: 'uppercase',
            color: '#FFFFFF',
            opacity: 0,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        />
      </div>
    </>
  );
}
