"use client";

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, CheckCircle2, Copy, Info, Loader2, X } from "lucide-react";
import { initials } from "@/lib/format";

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------- logo */

export function Logo({ invert, className }: { invert?: boolean; className?: string }) {
  return (
    <Image
      src="/logo-tiles/agncy-logo.png"
      alt="AGNCY"
      width={303}
      height={51}
      priority
      className={cx("h-[18px] w-auto", invert && "logo-invert", className)}
    />
  );
}

/* ---------------------------------------------------------------- buttons */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-black/80 disabled:bg-ink/30",
  accent: "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-600/40",
  secondary: "border border-line bg-white text-ink hover:border-ink/30 hover:bg-paper disabled:text-ink/35",
  ghost: "text-ink hover:bg-ink/5 disabled:text-ink/35",
  danger: "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 disabled:text-rose-700/40",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-3 text-[13px]",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2 px-6 text-[15px]",
};

const buttonClass = (variant: Variant, size: Size, className?: string) =>
  cx(
    "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full font-medium transition-colors disabled:cursor-not-allowed",
    VARIANTS[variant],
    SIZES[size],
    className
  );

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ variant = "primary", size = "md", loading, icon, className, children, disabled, type, ...rest }: ButtonProps) {
  return (
    <button type={type ?? "button"} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {icon}
      {children}
    </Link>
  );
}

export function CopyButton({ value, label = "Copy link", size = "sm" }: { value: string; label?: string; size?: Size }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="secondary"
      size={size}
      icon={copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {copied ? "Copied" : label}
    </Button>
  );
}

/* ---------------------------------------------------------------- surface */

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("rounded-2xl border border-line bg-white", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, hint, action }: { title: string; hint?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {hint && <p className="mt-0.5 text-[13px] text-muted">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-ink sm:text-[30px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export type Tone = "neutral" | "green" | "amber" | "red" | "blue" | "ink" | "violet";

const TONES: Record<Tone, string> = {
  neutral: "bg-ink/5 text-ink/70",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-800",
  red: "bg-rose-50 text-rose-700",
  blue: "bg-sky-50 text-sky-700",
  violet: "bg-violet-50 text-violet-700",
  ink: "bg-ink text-white",
};

const DOTS: Record<Tone, string> = {
  neutral: "bg-ink/40",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-rose-500",
  blue: "bg-sky-500",
  violet: "bg-violet-500",
  ink: "bg-white",
};

export function Pill({ tone = "neutral", dot, className, children }: { tone?: Tone; dot?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", TONES[tone], className)}>
      {dot && <span className={cx("h-1.5 w-1.5 rounded-full", DOTS[tone])} />}
      {children}
    </span>
  );
}

export function TestModeBadge({ className }: { className?: string }) {
  return (
    <span
      title="Beta test mode — no real money moves"
      className={cx("inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800", className)}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Test mode
    </span>
  );
}

const BANNER: Record<"info" | "warn" | "danger" | "success", { box: string; icon: React.ReactNode }> = {
  info: { box: "border-line bg-white", icon: <Info className="h-4 w-4 text-ink/60" /> },
  warn: { box: "border-amber-200 bg-amber-50", icon: <AlertTriangle className="h-4 w-4 text-amber-600" /> },
  danger: { box: "border-rose-200 bg-rose-50", icon: <AlertTriangle className="h-4 w-4 text-rose-600" /> },
  success: { box: "border-emerald-200 bg-emerald-50", icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" /> },
};

export function Banner({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: "info" | "warn" | "danger" | "success";
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-wrap items-start gap-3 rounded-2xl border px-4 py-3", BANNER[tone].box, className)}>
      <span className="mt-0.5 shrink-0">{BANNER[tone].icon}</span>
      <div className="min-w-0 flex-1 text-sm">
        {title && <p className="font-medium text-ink">{title}</p>}
        {children && <div className={cx("text-ink/70", title && "mt-0.5")}>{children}</div>}
      </div>
      {action}
    </div>
  );
}

export function Avatar({ name, size = 36, tone = "paper" }: { name: string; size?: number; tone?: "paper" | "ink" }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.36)) }}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        tone === "ink" ? "bg-ink text-white" : "border border-line bg-paper text-ink/70"
      )}
    >
      {initials(name)}
    </span>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: React.ReactNode; hint?: React.ReactNode; tone?: "green" | "red" | "amber" }) {
  return (
    <Card className="p-5">
      <p className="text-[13px] text-muted">{label}</p>
      <p
        className={cx(
          "font-display tabular mt-2 text-[28px] font-semibold leading-none tracking-tight",
          tone === "green" ? "text-emerald-700" : tone === "red" ? "text-rose-700" : tone === "amber" ? "text-amber-700" : "text-ink"
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </Card>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: React.ReactNode; title: string; body?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icon && <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-paper text-ink/60">{icon}</div>}
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {body && <p className="mt-1.5 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className)} />;
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="h-9 w-9 !rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function Splash({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-5 bg-paper">
      <Logo />
      <Loader2 className="h-5 w-5 animate-spin text-ink/40" aria-label={label} />
    </div>
  );
}

/* ------------------------------------------------------------------ forms */

const CONTROL =
  "w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink placeholder:text-ink/35 transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10 disabled:bg-paper disabled:text-ink/50";

export function Field({ label, hint, error, children, className }: { label: string; hint?: React.ReactNode; error?: string | null; children: React.ReactNode; className?: string }) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>
      {children}
      {error ? <span className="mt-1.5 block text-xs text-rose-600">{error}</span> : hint ? <span className="mt-1.5 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(CONTROL, "h-11", className)} {...rest} />;
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(CONTROL, "min-h-[88px] py-2.5", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx(CONTROL, "h-11 appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9", className)} style={{ backgroundImage: CHEVRON }} {...rest}>
      {children}
    </select>
  );
}

const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b6a66' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

export function Checkbox({ checked, onChange, label, disabled, indeterminate }: { checked: boolean; onChange: (next: boolean) => void; label: string; disabled?: boolean; indeterminate?: boolean }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cx(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
        checked || indeterminate ? "border-ink bg-ink text-white" : "border-ink/25 bg-white hover:border-ink/60",
        disabled && "cursor-not-allowed opacity-40"
      )}
    >
      {indeterminate ? <span className="h-0.5 w-2.5 rounded bg-white" /> : checked ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
    </button>
  );
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (next: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-ink" : "bg-ink/15", disabled && "cursor-not-allowed opacity-50")}
    >
      <span className={cx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all", checked ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

/* ------------------------------------------------------------------- tabs */

export interface TabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
}

export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: TabItem<T>[]; value: T; onChange: (id: T) => void; className?: string }) {
  return (
    <div role="tablist" className={cx("flex gap-1 overflow-x-auto", className)}>
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={cx(
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium transition-colors",
              active ? "bg-ink text-white" : "text-ink/65 hover:bg-ink/5 hover:text-ink"
            )}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={cx("tabular rounded-full px-1.5 text-[11px] leading-[18px]", active ? "bg-white/20 text-white" : "bg-ink/8 text-ink/60")}>{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------- split bar */

export interface Segment {
  label: string;
  value: number;
  color: string;
}

/** A single horizontal bar showing how an invoice or payout divides up. */
export function SplitBar({ segments, className }: { segments: Segment[]; className?: string }) {
  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0);
  if (total <= 0) return null;
  return (
    <div className={cx("flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full", className)} role="img" aria-label={segments.map((s) => `${s.label} ${Math.round((s.value / total) * 100)}%`).join(", ")}>
      {segments
        .filter((s) => s.value > 0)
        .map((s, i) => (
          <span key={i} title={s.label} style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }} className="h-full min-w-[3px] first:rounded-l-full last:rounded-r-full" />
        ))}
    </div>
  );
}

export const SPLIT_COLORS = ["#101010", "#059669", "#d97706", "#7c3aed", "#0284c7", "#db2777", "#65a30d"];
export const RETAINED_COLOR = "#d9d6cd";

/* ------------------------------------------------------- modal and drawer */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** `drawer` slides in from the right for longer review flows. */
  variant?: "center" | "drawer";
  wide?: boolean;
}

export function Modal({ open, onClose, title, description, children, footer, variant = "center", wide }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const drawer = variant === "drawer";
  return (
    <AnimatePresence>
      {open && (
        <div className={cx("fixed inset-0 z-50 flex", drawer ? "justify-end" : "items-end justify-center sm:items-center sm:p-6")}>
          <motion.div
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={drawer ? { x: 48, opacity: 0 } : { y: 24, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={drawer ? { x: 48, opacity: 0 } : { y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className={cx(
              "relative flex w-full flex-col bg-white shadow-2xl outline-none",
              drawer
                ? cx("h-full", wide ? "max-w-2xl" : "max-w-xl")
                : cx("max-h-[92vh] rounded-t-3xl sm:rounded-3xl", wide ? "sm:max-w-2xl" : "sm:max-w-md")
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
              <div className="min-w-0">
                <h2 id={titleId} className="text-lg font-semibold tracking-tight text-ink">
                  {title}
                </h2>
                {description && <p className="mt-1 text-sm text-muted">{description}</p>}
              </div>
              <button onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5 hover:text-ink">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-paper/60 px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ toast */

type ToastTone = "success" | "error" | "info";
interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const push = useCallback((message: string, tone: ToastTone = "success") => {
    const id = nextId.current++;
    setItems((list) => [...list.slice(-2), { id, message, tone }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), tone === "error" ? 6500 : 4200);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="no-print pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              className="pointer-events-auto flex max-w-md items-start gap-2.5 rounded-2xl bg-ink px-4 py-3 text-sm text-white shadow-xl"
            >
              {t.tone === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              ) : t.tone === "error" ? (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              ) : (
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-white/60" />
              )}
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

/** Runs an async action with a busy flag and reports failures as a toast. */
export function useAction() {
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const run = useCallback(
    async (key: string, fn: () => Promise<void>): Promise<boolean> => {
      setBusy(key);
      try {
        await fn();
        return true;
      } catch (err) {
        toast(err instanceof Error ? err.message : "Something went wrong.", "error");
        return false;
      } finally {
        setBusy(null);
      }
    },
    [toast]
  );
  return { busy, run };
}

/* ----------------------------------------------------------- definitions */

export function Row({ label, children, strong }: { label: React.ReactNode; children: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className={cx("tabular text-right", strong ? "font-semibold text-ink" : "text-ink")}>{children}</span>
    </div>
  );
}
