'use client';

import {useRef, useEffect, useState, useCallback} from 'react';
import {gsap} from '@/lib/animations/gsap';

type CursorState = 'default' | 'expand' | 'text' | 'drag' | 'magnetic';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
}

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // QuickTo setters for label position tracking
  const moveLabelX = useRef<((value: number) => void) | null>(null);
  const moveLabelY = useRef<((value: number) => void) | null>(null);

  // Detect pointer:fine (desktop with precise pointer)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsDesktop(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!isDesktop || !canvasRef.current || !labelRef.current || !dotRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const label = labelRef.current;
    const dot = dotRef.current;

    let currentState: CursorState = 'default';
    let currentMagneticTarget: HTMLElement | null = null;
    let mouseX = 0;
    let mouseY = 0;
    let lastRippleX = 0;
    let lastRippleY = 0;
    let animFrameId: number;
    let isVisible = true;

    // Pre-allocate quickTo setters for label position
    moveLabelX.current = gsap.quickTo(label, 'x', {duration: 0.2, ease: 'power3'});
    moveLabelY.current = gsap.quickTo(label, 'y', {duration: 0.2, ease: 'power3'});

    // Ripple pool
    const ripples: Ripple[] = [];
    const MAX_RIPPLES = 30;
    const RIPPLE_SPAWN_DISTANCE = 40; // Minimum px between ripple spawns

    // Theme colors from CSS variables (greige palette)
    const RIPPLE_COLOR = {r: 26, g: 26, b: 26}; // --greige-900
    const RIPPLE_MAX_OPACITY = 0.12;

    // Resize canvas to match viewport
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Hide default cursor
    document.documentElement.style.cursor = 'none';
    const styleTag = document.createElement('style');
    styleTag.textContent =
      'a, button, [role="button"], [data-cursor-hover], [data-cursor-text], [data-cursor-drag], [data-cursor-magnetic] { cursor: none !important; }';
    document.head.appendChild(styleTag);

    // Spawn a new ripple
    const spawnRipple = (x: number, y: number, isClick = false) => {
      const ripple: Ripple = {
        x,
        y,
        radius: isClick ? 4 : 2,
        maxRadius: isClick ? 120 : 60 + Math.random() * 30,
        opacity: isClick ? RIPPLE_MAX_OPACITY * 1.8 : RIPPLE_MAX_OPACITY,
        speed: isClick ? 2.5 : 1.5 + Math.random() * 0.8,
      };

      if (ripples.length >= MAX_RIPPLES) {
        // Reuse the oldest (most faded) ripple slot
        let minIdx = 0;
        let minOpacity = ripples[0].opacity;
        for (let i = 1; i < ripples.length; i++) {
          if (ripples[i].opacity < minOpacity) {
            minOpacity = ripples[i].opacity;
            minIdx = i;
          }
        }
        ripples[minIdx] = ripple;
      } else {
        ripples.push(ripple);
      }
    };

    // Animation loop
    const animate = () => {
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // Update and draw ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        // Fade based on how far the ripple has expanded
        const progress = r.radius / r.maxRadius;
        r.opacity = RIPPLE_MAX_OPACITY * (1 - progress) * (1 - progress);

        if (r.radius >= r.maxRadius || r.opacity <= 0.001) {
          ripples.splice(i, 1);
          continue;
        }

        // Draw ripple ring
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${RIPPLE_COLOR.r}, ${RIPPLE_COLOR.g}, ${RIPPLE_COLOR.b}, ${r.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animFrameId = requestAnimationFrame(animate);
    };
    animFrameId = requestAnimationFrame(animate);

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
          gsap.to(dot, {opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out'});
          gsap.to(label, {opacity: 0, duration: 0.2});
          break;

        case 'expand':
          gsap.to(dot, {opacity: 1, scale: 1.8, duration: 0.3, ease: 'power2.out'});
          gsap.to(label, {opacity: 0, duration: 0.2});
          break;

        case 'text':
          gsap.to(dot, {opacity: 0, duration: 0.3, ease: 'power2.out'});
          label.textContent = labelText || 'View';
          gsap.to(label, {opacity: 1, duration: 0.3, ease: 'power2.out'});
          break;

        case 'drag':
          gsap.to(dot, {opacity: 0, duration: 0.3, ease: 'power2.out'});
          label.textContent = '\u2190\u2192 Drag';
          gsap.to(label, {opacity: 1, duration: 0.3, ease: 'power2.out'});
          break;

        case 'magnetic':
          gsap.to(dot, {opacity: 0, duration: 0.3, ease: 'power2.out'});
          gsap.to(label, {opacity: 0, duration: 0.2});
          if (magneticTarget) currentMagneticTarget = magneticTarget;
          break;
      }
    };

    // Mouse move handler
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Dot follows instantly
      gsap.set(dot, {x: mouseX, y: mouseY});

      // Label trails with smooth follow
      moveLabelX.current?.(mouseX);
      moveLabelY.current?.(mouseY);

      // Spawn ripples at intervals based on distance moved
      const dx = mouseX - lastRippleX;
      const dy = mouseY - lastRippleY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > RIPPLE_SPAWN_DISTANCE) {
        spawnRipple(mouseX, mouseY);
        lastRippleX = mouseX;
        lastRippleY = mouseY;
      }

      // Magnetic effect: shift target element toward cursor
      if (currentState === 'magnetic' && currentMagneticTarget) {
        const rect = currentMagneticTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.15;
        const deltaY = (e.clientY - centerY) * 0.15;
        gsap.to(currentMagneticTarget, {
          x: deltaX,
          y: deltaY,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    // Click handler — stronger ripple
    const onClick = (e: MouseEvent) => {
      spawnRipple(e.clientX, e.clientY, true);
    };

    // Event delegation: mouseover
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const magnetic = target.closest('[data-cursor-magnetic]') as HTMLElement | null;
      if (magnetic) {
        setCursorState('magnetic', magnetic);
        return;
      }

      if (target.closest('[data-cursor-drag]')) {
        setCursorState('drag');
        return;
      }

      const textEl = target.closest('[data-cursor-text]') as HTMLElement | null;
      if (textEl) {
        const text = textEl.getAttribute('data-cursor-text') || 'View';
        setCursorState('text', undefined, text);
        return;
      }

      if (target.closest('a, button, [data-cursor-hover]')) {
        setCursorState('expand');
        return;
      }
    };

    // Event delegation: mouseout
    const handleMouseOut = (e: MouseEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement | null;

      if (relatedTarget) {
        if (
          relatedTarget.closest('[data-cursor-magnetic]') ||
          relatedTarget.closest('[data-cursor-drag]') ||
          relatedTarget.closest('[data-cursor-text]') ||
          relatedTarget.closest('a, button, [data-cursor-hover]')
        ) {
          return;
        }
      }

      setCursorState('default');
    };

    // Mouse enter/leave window
    const onMouseEnter = () => {
      isVisible = true;
      gsap.to(dot, {opacity: 1, duration: 0.2});
    };
    const onMouseLeave = () => {
      isVisible = false;
      gsap.to(dot, {opacity: 0, duration: 0.2});
      gsap.to(label, {opacity: 0, duration: 0.2});
    };

    // Attach listeners
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);

      document.documentElement.style.cursor = '';
      styleTag.remove();

      if (currentMagneticTarget) {
        gsap.to(currentMagneticTarget, {x: 0, y: 0, duration: 0.3});
        currentMagneticTarget = null;
      }
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <>
      {/* Canvas overlay for water ripple effect */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 9998,
        }}
      />
      {/* Small dot - instant follow */}
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
      {/* Floating label for text/drag states */}
      <span
        ref={labelRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          fontSize: 14,
          fontWeight: 400,
          textTransform: 'uppercase',
          color: '#FFFFFF',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 10000,
          whiteSpace: 'nowrap',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#111111',
          padding: '8px 16px',
          borderRadius: '20px',
        }}
      />
    </>
  );
}
