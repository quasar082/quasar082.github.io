"use client";

export function SiteFooter() {
  return (
    <footer aria-label="Site footer" className="min-h-0 flex-1">
      <div className="@container w-full">
        <p className="text-[clamp(1rem,31.8cqw,100rem)] w-fit whitespace-nowrap font-bold leading-[0.95]">
          quasar
        </p>
      </div>
      {/* <div className="mt-3 border-t border-black/35 pt-3">
        <p className="m-0 text-sm tracking-wide text-black/65">© 2026 Quasar. All rights reserved.</p>
      </div> */}
    </footer>
  );
}
