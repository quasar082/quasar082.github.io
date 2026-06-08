"use client";

export function SiteFooter() {
  return (
    <footer aria-label="Site footer" className="min-h-0 mt-auto">
      <div className="@container w-full">
        <p className="text-[clamp(1rem,26.2cqw,100rem)] w-fit whitespace-nowrap font-medium tracking-[-0.04em] leading-[0.95] text-gradient-black-gray">
          QUASAR
        </p>
      </div>
      <div className="border-t border-black/35 pt-2">
        <p className="m-0 text-sm tracking-wide text-gradient-black-gray opacity-65">© 2026 Quasar. All rights reserved.</p>
      </div>
    </footer>
  );
}
