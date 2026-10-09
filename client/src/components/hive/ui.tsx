"use client";
import Link from "next/link";
import { useEffect, useState, useRef, ReactNode } from "react";
import {
  Hexagon,
  ArrowUpRight,
  LoaderCircle,
  Check,
  AlertCircle,
  X,
  Sun,
  Moon,
  Plus,
} from "lucide-react";
import { ThemeProvider, useTheme } from "next-themes";
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
export function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" className="logo" aria-label="BuildHive home">
      <span className="logo-mark">
        <Hexagon size={small ? 20 : 25} strokeWidth={2.4} />
        <i />
      </span>
      BuildHive<span className="logo-dot">.</span>
    </Link>
  );
}
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <button
      className="icon-button"
      aria-label="Toggle color theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {ready && resolvedTheme === "dark" ? (
        <Sun size={17} />
      ) : (
        <Moon size={17} />
      )}
    </button>
  );
}
export function Badge({ status }: { status: string }) {
  return (
    <span className={`badge ${status}`}>
      <i />
      {status.replaceAll("_", " ")}
    </span>
  );
}
export function Button({
  children,
  busy,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button
      {...props}
      type={props.type || "button"}
      disabled={busy || props.disabled}
      className={`button ${props.className || ""}`}
    >
      {busy && <LoaderCircle className="spin" size={16} />} {children}
    </button>
  );
}
export function Notice({
  message,
  onClose,
}: {
  message: string;
  onClose?: () => void;
}) {
  return (
    <div role="alert" className="notice">
      <AlertCircle size={18} />
      <span>{message}</span>
      {onClose && (
        <button className="icon-button" onClick={onClose} aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
export function Empty({
  title,
  description,
  href,
  label = "Get started",
  icon,
}: {
  title: string;
  description: string;
  href?: string;
  label?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon || <Hexagon size={28} />}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {href && (
        <Link className="button primary" href={href}>
          <Plus size={16} />
          {label}
        </Link>
      )}
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={23} />
      <span>Loading your workspace…</span>
    </div>
  );
}
export function PageHead({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      <div className="head-actions">{children}</div>
    </div>
  );
}
export function CheckLine({ children }: { children: ReactNode }) {
  return (
    <div className="check-line">
      <Check size={16} />
      {children}
    </div>
  );
}
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link className="text-link" href={href}>
      {children}
      <ArrowUpRight size={15} />
    </Link>
  );
}
export function Confirm({
  title,
  description,
  confirm = "Confirm",
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirm?: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    return () => node?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="modal-backdrop"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="modal"
      >
        <h2 id="confirm-title">{title}</h2>
        <p>{description}</p>
        {error && <Notice message={error} />}
        <div className="form-actions">
          <Button autoFocus onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            className="danger"
            busy={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
                onClose();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirm}
          </Button>
        </div>
      </section>
    </dialog>
  );
}
