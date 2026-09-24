// Small shared presentational pieces, kept together so the pages stay readable.

export const inputStyles =
  "w-full px-2.5 py-2 text-sm bg-surface text-ink border border-line-strong rounded-sm";

export const panelStyles =
  "bg-surface border border-line rounded-sm";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
}) {
  const base =
    "text-sm font-semibold px-4 py-2 rounded-sm border cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed";

  const look =
    variant === "primary"
      ? "bg-accent text-accent-ink border-transparent hover:bg-accent-hover"
      : "bg-surface text-ink border-line-strong hover:bg-surface-2";

  return <button className={`${base} ${look} ${className}`} {...props} />;
}

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm text-dim">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-sm bg-surface-2 border border-line text-dim">
      {children}
    </span>
  );
}

// State is encoded in colour as well as words, so it reads at a glance
export function Status({ state }: { state: string }) {
  const looks: Record<string, string> = {
    open: "bg-surface-2 text-dim",
    pending: "bg-surface-2 text-dim",
    delivered: "bg-warn-bg text-warn",
    accepted: "bg-good-bg text-good",
    approved: "bg-good-bg text-good",
    contracted: "bg-good-bg text-good",
    complete: "bg-good-bg text-good",
    declined: "bg-surface-2 text-dim",
    closed: "bg-surface-2 text-dim",
  };

  const labels: Record<string, string> = {
    open: "State One",
    pending: "State Two",
    delivered: "State Three",
    accepted: "State Four",
    approved: "State Five",
    contracted: "State Six",
    complete: "State Seven",
    declined: "State Eight",
    closed: "State Nine",
  };

  return (
    <span
      className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-sm ${
        looks[state] ?? looks.open
      }`}
    >
      {labels[state] ?? state}
    </span>
  );
}

export function Notice({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2.5 bg-surface border border-line border-l-[3px] border-l-accent px-3.5 py-3 text-sm text-dim">
      <p>
        <strong className="text-ink font-semibold">{title}</strong>{" "}
        {children}
      </p>
    </div>
  );
}

export function money(amount: number): string {
  return `$${amount.toLocaleString("en-AU")}`;
}

export function sinceLabel(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);

  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;

  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}
