"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type NavigationLink = {
  href: string;
  label: string;
  id: string;
};

export function MobileNavigation({
  active,
  links,
}: {
  active: string;
  links: readonly NavigationLink[];
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        window.requestAnimationFrame(() => buttonRef.current?.focus());
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        buttonRef.current?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        buttonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="relative lg:hidden">
      <button
        aria-controls="lantern-mobile-navigation"
        aria-expanded={open}
        aria-label={open ? "Close navigation" : "Open navigation"}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-ink/15 bg-white text-ink shadow-sm transition hover:bg-canvas focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber"
        onClick={() => setOpen((current) => !current)}
        ref={buttonRef}
        type="button"
      >
        <span aria-hidden="true" className="grid gap-1">
          <span className={`block h-0.5 w-5 bg-current transition ${open ? "translate-y-1.5 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-5 bg-current transition ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-5 bg-current transition ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
        </span>
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+.75rem)] z-50 w-[min(20rem,calc(100vw-2rem))] rounded-feature border border-ink/10 bg-surface p-3 shadow-[0_24px_70px_rgba(20,36,30,.18)]"
          id="lantern-mobile-navigation"
          ref={panelRef}
        >
          <nav aria-label="Mobile navigation" className="grid gap-1">
            {links.map((link) => (
              <Link
                aria-current={active === link.id ? "page" : undefined}
                className={`flex min-h-11 items-center rounded-xl px-4 text-sm font-bold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber ${
                  active === link.id
                    ? "bg-[#eef2ff] text-cobalt"
                    : "text-muted hover:bg-canvas hover:text-ink"
                }`}
                href={link.href}
                key={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            className="mt-2 flex min-h-11 items-center justify-center rounded-xl bg-cobalt px-4 text-sm font-bold text-white shadow-[0_10px_25px_rgba(53,86,212,.2)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber"
            href="/first-day?demo=1"
            onClick={() => setOpen(false)}
          >
            Start the guided demo
          </Link>
        </div>
      ) : null}
    </div>
  );
}
