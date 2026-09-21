import Link from "next/link";
import type { ReactNode } from "react";

import { LanternMark } from "./brand";

type ProductHeaderProps = {
  active?: "home" | "explain" | "first-day" | "how" | "privacy";
  controls?: ReactNode;
};

const links = [
  { href: "/first-day", label: "First Day", id: "first-day" },
  { href: "/explain", label: "Explain a letter", id: "explain" },
  { href: "/first-day/how-it-works", label: "How it works", id: "how" },
  { href: "/privacy", label: "Privacy", id: "privacy" },
] as const;

export function ProductHeader({ active = "home", controls }: ProductHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-canvas/88 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex min-h-18 w-full max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
        <Link
          aria-label="Lantern home"
          className="group inline-flex min-h-11 items-center gap-3 rounded-xl focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber"
          href="/"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-amber shadow-[0_10px_28px_rgba(20,36,30,.17)] transition-transform group-hover:-translate-y-0.5">
            <LanternMark />
          </span>
          <span>
            <span className="block text-sm font-extrabold tracking-[-0.02em] text-ink">Lantern</span>
            <span className="hidden text-[11px] font-medium text-muted sm:block">Evidence into action</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              aria-current={active === link.id ? "page" : undefined}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber ${
                active === link.id
                  ? "bg-white text-ink shadow-sm"
                  : "text-muted hover:bg-white/70 hover:text-ink"
              }`}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {controls ? (
          <div className="flex min-h-11 items-center gap-2">{controls}</div>
        ) : (
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cobalt px-4 text-sm font-bold text-white shadow-[0_10px_25px_rgba(53,86,212,.2)] transition hover:-translate-y-0.5 hover:bg-cobalt-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber"
            href="/first-day?demo=1"
          >
            Try the demo
          </Link>
        )}
      </div>
    </header>
  );
}
