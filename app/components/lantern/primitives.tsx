import type {
  ButtonHTMLAttributes,
  DetailsHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";

const buttonStyles = {
  primary: "bg-cobalt text-white shadow-[0_10px_24px_rgba(53,86,212,.2)] hover:bg-cobalt-dark",
  secondary: "border border-ink/15 bg-white text-ink hover:bg-canvas",
  danger: "border border-review/25 bg-[#fbe8e3] text-review hover:bg-[#f7dcd5]",
} as const;

export function Button({
  busy = false,
  children,
  className = "",
  disabled,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  busy?: boolean;
  variant?: keyof typeof buttonStyles;
}) {
  return (
    <button
      aria-busy={busy || undefined}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyles[variant]} ${className}`}
      disabled={disabled || busy}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({
  "aria-label": ariaLabel,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { "aria-label": string }) {
  return (
    <button
      aria-label={ariaLabel}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-ink/15 bg-white text-ink transition hover:bg-canvas focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

const badgeStyles = {
  neutral: "bg-[#edf0ed] text-[#405049]",
  info: "bg-[#e9edff] text-cobalt-dark",
  success: "bg-[#e3f4e8] text-[#24633a]",
  attention: "bg-[#fff0cc] text-[#704c0e]",
  error: "bg-[#fbe8e3] text-review",
} as const;

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof badgeStyles;
}) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${badgeStyles[tone]}`}>
      {children}
    </span>
  );
}

export function SurfaceCard({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <article
      className={`rounded-card border border-ink/10 bg-surface p-5 shadow-[0_12px_36px_rgba(20,36,30,.05)] ${className}`}
      {...props}
    />
  );
}

export function ProgressControl({
  label,
  max,
  value,
}: {
  label: string;
  max: number;
  value: number;
}) {
  return (
    <label className="block text-sm font-bold text-ink">
      <span className="flex justify-between gap-3"><span>{label}</span><span>{value}/{max}</span></span>
      <progress className="mt-2 h-2 w-full accent-cobalt" max={max} value={value} />
    </label>
  );
}

export function ActionDock({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`fd-action-dock ${className}`} {...props} />;
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-feature border border-dashed border-ink/20 bg-white/60 p-8 text-center">
      <p className="font-bold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </div>
  );
}

export function InlineNotice({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "error" | "success";
}) {
  const styles = tone === "error" ? "border-review/25 bg-[#fbe8e3] text-review" : tone === "success" ? "border-confirmed/20 bg-[#e3f4e8] text-[#24633a]" : "border-cobalt/20 bg-[#eef2ff] text-[#34487f]";
  return <div className={`rounded-card border p-4 text-sm leading-6 ${styles}`} role={tone === "error" ? "alert" : "status"}>{children}</div>;
}

export function Toast({ children }: { children: ReactNode }) {
  return <div className="fd-toast print:hidden" role="status">{children}</div>;
}

export function Disclosure({ className = "", ...props }: DetailsHTMLAttributes<HTMLDetailsElement>) {
  return <details className={`rounded-card border border-ink/10 bg-white p-4 ${className}`} {...props} />;
}

export function Dialog({
  children,
  labelId,
}: {
  children: ReactNode;
  labelId: string;
}) {
  return <section aria-labelledby={labelId} aria-modal="true" role="dialog">{children}</section>;
}

export function EvidenceQuote({
  children,
  source,
}: {
  children: ReactNode;
  source: string;
}) {
  return (
    <figure className="rounded-card border border-ink/10 bg-canvas p-4">
      <blockquote className="border-l-2 border-amber pl-4 font-serif text-lg leading-7 text-ink">“{children}”</blockquote>
      <figcaption className="mt-3 text-xs font-bold text-muted">{source}</figcaption>
    </figure>
  );
}

export function MetricCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-card border border-ink/10 bg-white/80 p-4">
      <p className="text-2xl font-black tracking-[-0.04em] text-ink">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-muted">{label}</p>
    </div>
  );
}

export function AccessibilityControls({
  highContrast,
  largeText,
  onToggleHighContrast,
  onToggleLargeText,
  compact = false,
}: {
  highContrast: boolean;
  largeText: boolean;
  onToggleHighContrast: () => void;
  onToggleLargeText: () => void;
  compact?: boolean;
}) {
  return (
    <div aria-label="Reading preferences" className="flex items-center gap-2" role="group">
      <button
        aria-label="Toggle large text"
        aria-pressed={largeText}
        className={`fd-utility-button inline-flex ${
          largeText ? "border-cobalt bg-[#eef2ff] text-cobalt" : ""
        }`}
        onClick={onToggleLargeText}
        type="button"
      >
        {compact ? "Aa" : "A+"}
      </button>
      <button
        aria-label="Toggle high contrast"
        aria-pressed={highContrast}
        className={`fd-utility-button inline-flex ${
          highContrast ? "border-cobalt bg-[#eef2ff] text-cobalt" : ""
        }`}
        onClick={onToggleHighContrast}
        type="button"
      >
        ◐
      </button>
    </div>
  );
}

export function SegmentedControl<T extends string | number>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: T) => void;
  options: readonly { icon?: ReactNode; label: string; value: T }[];
  value: T;
}) {
  return (
    <div aria-label={label} className="lantern-segmented" role="tablist">
      {options.map((option) => (
        <button
          aria-selected={value === option.value}
          className="lantern-segmented-option"
          data-selected={value === option.value ? "true" : undefined}
          key={option.value}
          onClick={() => onChange(option.value)}
          role="tab"
          type="button"
        >
          {option.icon}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
