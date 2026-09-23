"use client";

import { useState, type ReactNode } from "react";

import { PhoneIcon, SearchIcon } from "../../components/lantern/icons";
import type { Category, Resource } from "../../resources";

type LocalResource = {
  name: string;
  phone: string | null;
  address: string | null;
  url: string | null;
  desc: string;
};

export function LocalHelpFinder({ category }: { category: Category }) {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<LocalResource[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  async function search() {
    if (!state.trim()) return;
    setLoading(true);
    setError(null);
    setResources(null);
    try {
      const response = await fetch("/api/local-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, city: city.trim(), state: state.trim() }),
      });
      const data = (await response.json()) as {
        resources?: LocalResource[];
        error?: string;
      };
      if (response.status === 503) {
        setUnavailable(true);
        return;
      }
      if (!response.ok) {
        setError(data.error ?? "Search failed.");
        return;
      }
      setResources(data.resources ?? []);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (unavailable) return null;

  return (
    <div className="ttf-fade-in overflow-hidden rounded-feature border border-cobalt/20 bg-[#eef2ff]">
      <div className="p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-cobalt text-white">
            <SearchIcon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-ink">Find local help near you</h3>
            <p className="text-xs text-muted">
              Live web search for <span className="font-medium">{category}</span> programs beyond the national list.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-ink/15 bg-white px-3 text-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber"
            onChange={(event) => setCity(event.target.value)}
            placeholder="City (optional)"
            value={city}
          />
          <input
            className="min-h-11 rounded-xl border border-ink/15 bg-white px-3 text-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber sm:w-28"
            onChange={(event) => setState(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && void search()}
            placeholder="State *"
            value={state}
          />
          <button
            className="min-h-11 rounded-xl bg-cobalt px-4 text-sm font-bold text-white transition hover:bg-cobalt-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber disabled:opacity-40"
            disabled={loading || !state.trim()}
            onClick={() => void search()}
            type="button"
          >
            {loading ? <Spinner /> : "Search"}
          </button>
        </div>
        {error ? <p className="mt-2 text-sm text-review">{error}</p> : null}
      </div>

      {resources !== null ? (
        <div className="border-t border-cobalt/15 px-5 pb-5">
          {resources.length === 0 ? (
            <p className="pt-4 text-sm text-muted">
              No results found for {city || state}. Try a broader location.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {resources.map((resource, index) => (
                <li className="rounded-xl border border-ink/10 bg-white p-3" key={`${resource.name}-${index}`}>
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{resource.name}</p>
                      <p className="mt-0.5 text-sm text-muted">{resource.desc}</p>
                      {resource.address ? <p className="mt-0.5 text-xs text-muted">{resource.address}</p> : null}
                      {resource.url ? (
                        <a className="mt-1 inline-block break-all text-xs font-bold text-cobalt underline-offset-4 hover:underline" href={resource.url} rel="noopener noreferrer" target="_blank">
                          {resource.url.replace(/^https?:\/\//, "")}
                        </a>
                      ) : null}
                    </div>
                    {resource.phone ? (
                      <a className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink/15 px-3 text-sm font-bold text-cobalt" href={`tel:${resource.phone.replace(/[^+\d]/g, "")}`}>
                        <PhoneIcon className="h-4 w-4" /> Call {resource.phone}
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted">
            AI-generated from live web search — verify details before calling.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function Collapsible({
  title,
  subtitle,
  icon,
  accent = false,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  accent?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      className={`ttf-fade-in group overflow-hidden rounded-card bg-white shadow-sm [&_summary::-webkit-details-marker]:hidden ${
        accent ? "border-2 border-cobalt/35" : "border border-ink/10"
      }`}
      open={defaultOpen}
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 p-5">
        <div className="flex min-w-0 items-center gap-3">
          {icon}
          <div className="min-w-0">
            <h3 className="text-lg font-bold leading-tight text-ink">{title}</h3>
            {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
          </div>
        </div>
        <Chevron />
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  );
}

export function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-canvas p-3">
      <dt className="text-xs font-bold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
    </div>
  );
}

export function ResourceRow({ resource }: { resource: Resource }) {
  return (
    <li className="rounded-xl border border-ink/10 p-3">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
        <div className="min-w-0">
          <p className="font-semibold text-ink">{resource.name}</p>
          <p className="mt-0.5 text-sm text-muted">{resource.desc}</p>
          {resource.url ? (
            <a className="mt-1 inline-block break-all text-xs font-bold text-cobalt underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber" href={resource.url} rel="noopener noreferrer" target="_blank">
              {resource.url.replace(/^https?:\/\//, "")}
            </a>
          ) : null}
        </div>
        {resource.phone ? (
          <a className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink/15 px-3 text-sm font-bold text-cobalt" href={`tel:${resource.phone.replace(/[^+\d]/g, "")}`}>
            <PhoneIcon className="h-4 w-4" /> Call {resource.phone}
          </a>
        ) : null}
      </div>
    </li>
  );
}

function Chevron() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 flex-none text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export function Spinner() {
  return <span aria-hidden="true" className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />;
}
