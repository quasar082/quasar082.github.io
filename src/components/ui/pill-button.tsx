'use client';

import {useRef, useCallback, useEffect} from 'react';
import {gsap} from '@/lib/animations/gsap';
import {TextRoll} from './text-roll';

interface PillButtonProps {
  label: string;
  variant: 'dark' | 'light' | 'outline';
  onClick?: () => void;
  href?: string;
  /** Open link in new tab */
  external?: boolean;
  dots?: 'single' | 'double' | 'none';
  dotsRotated?: boolean;
  /** SVG icon element — shown with expand/collapse animation like DownloadCV button */
  icon?: React.ReactNode;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
  className?: string;
  hidden?: boolean;
  /** Fixed width to prevent layout shift when label changes */
  fixedWidth?: number;
}

const VARIANT_STYLES = {
  dark: {
    bg: 'var(--greige-900)',
    hoverBg: 'var(--greige-700)',
    text: 'var(--warm-white)',
    border: 'none',
  },
  light: {
    bg: 'var(--warm-white-overlay)',
    hoverBg: 'var(--greige-200)',
    text: 'var(--greige-900)',
    border: 'none',
  },
  outline: {
    bg: 'transparent',
    hoverBg: 'var(--greige-100)',
    text: 'var(--greige-900)',
    border: '1px solid var(--greige-900)',
  },
} as const;

const ICON_SLOT_WIDTH = 20;

export function PillButton({
  label,
  variant,
  onClick,
  href,
  external = false,
  dots = 'none',
  dotsRotated = false,
  icon,
  ariaLabel,
  ariaExpanded,
  ariaControls,
  className = '',
  hidden = false,
  fixedWidth,
}: PillButtonProps) {
  const ref = useRef<HTMLButtonElement & HTMLAnchorElement>(null);
  const dotsRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Animate dot rotation when dotsRotated changes
  useEffect(() => {
    if (!dotsRef.current || dots !== 'double') return;
    if (reducedMotion.current) {
      gsap.set(dotsRef.current, {rotate: dotsRotated ? 90 : 0});
    } else {
      gsap.to(dotsRef.current, {rotate: dotsRotated ? 90 : 0, duration: 0.3, ease: 'power2.inOut'});
    }
  }, [dotsRotated, dots]);

  const handleMouseEnter = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.backgroundColor = VARIANT_STYLES[variant].hoverBg;
    if (reducedMotion.current) return;
    const spans = el.querySelectorAll('.roll-text');
    gsap.to(spans, {y: '-100%', duration: 0.35, ease: 'power3.inOut', overwrite: true});
    // Icon slot animation
    if (icon) {
      const iconSlot = el.querySelector('.pill-icon-slot') as HTMLElement;
      const dotSlot = el.querySelector('.pill-dot-slot') as HTMLElement;
      if (iconSlot) gsap.to(iconSlot, {width: ICON_SLOT_WIDTH, duration: 0.35, ease: 'power3.inOut', overwrite: true});
      if (dotSlot) gsap.to(dotSlot, {width: 0, duration: 0.35, ease: 'power3.inOut', overwrite: true});
    }
  }, [variant, icon]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.backgroundColor = VARIANT_STYLES[variant].bg;
    if (reducedMotion.current) return;
    const spans = el.querySelectorAll('.roll-text');
    gsap.to(spans, {y: '0%', duration: 0.35, ease: 'power3.inOut', overwrite: true});
    // Icon slot animation
    if (icon) {
      const iconSlot = el.querySelector('.pill-icon-slot') as HTMLElement;
      const dotSlot = el.querySelector('.pill-dot-slot') as HTMLElement;
      if (iconSlot) gsap.to(iconSlot, {width: 0, duration: 0.35, ease: 'power3.inOut', overwrite: true});
      if (dotSlot) gsap.to(dotSlot, {width: ICON_SLOT_WIDTH, duration: 0.35, ease: 'power3.inOut', overwrite: true});
    }
  }, [variant, icon]);

  const style = VARIANT_STYLES[variant];
  const hasDots = dots !== 'none';
  const hasIcon = !!icon;

  const commonProps = {
    ref,
    className: `pill-btn inline-flex items-center ${fixedWidth ? 'justify-center' : ''} cursor-pointer select-none font-body text-[15px] font-medium uppercase tracking-[0.08em] ${hidden ? 'hidden sm:inline-flex' : ''} ${className}`.trim(),
    style: {
      backgroundColor: style.bg,
      color: style.text,
      border: style.border,
      borderRadius: '9999px',
      height: '48px',
      ...(fixedWidth
        ? {width: `${fixedWidth}px`, paddingLeft: 0, paddingRight: 0}
        : {paddingLeft: '30px', paddingRight: hasDots || hasIcon ? '30px' : '30px'}),
      gap: hasDots ? '10px' : undefined,
      transition: 'background-color 300ms ease',
    } as React.CSSProperties,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    'aria-label': ariaLabel,
    'aria-expanded': ariaExpanded,
    'aria-controls': ariaControls,
  };

  const content = (
    <>
      {/* Icon slot — width 0 by default, expands on hover */}
      {hasIcon && (
        <span
          className="pill-icon-slot"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            overflow: 'hidden',
            width: 0,
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      )}

      <TextRoll>{label}</TextRoll>

      {/* Dot slot — visible by default when icon mode, collapses on hover */}
      {hasIcon && (
        <span
          className="pill-dot-slot"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            overflow: 'hidden',
            width: ICON_SLOT_WIDTH,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: style.text,
              flexShrink: 0,
            }}
          />
        </span>
      )}

      {!hasIcon && dots === 'single' && (
        <span
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: style.text,
            flexShrink: 0,
          }}
        />
      )}
      {!hasIcon && dots === 'double' && (
        <span
          style={{
            width: '14px',
            height: '14px',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <span
            ref={dotsRef}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: dotsRotated ? 'var(--greige-900)' : 'var(--greige-500)',
                transition: 'background-color 200ms ease',
              }}
            />
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: dotsRotated ? 'var(--greige-900)' : 'var(--greige-500)',
                transition: 'background-color 200ms ease',
              }}
            />
          </span>
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        {...commonProps}
        href={href}
        {...(external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <button {...commonProps} onClick={onClick} type="button">
      {content}
    </button>
  );
}
