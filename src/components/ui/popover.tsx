"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function Popover({
  label,
  trigger,
  children,
  wide = false,
}: {
  label: string;
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    function dismiss(event: Event) {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      button.current?.focus();
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("focusin", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("focusin", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div ref={root} className="relative shrink-0">
      <button
        ref={button}
        type="button"
        aria-label={label}
        title={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-10 items-center justify-center gap-2 rounded-full bg-transparent p-2 text-muted transition-colors hover:bg-surface-hover hover:text-ink aria-expanded:bg-surface-hover aria-expanded:text-ink"
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={panel}
          id={id}
          role="dialog"
          aria-label={label}
          tabIndex={-1}
          className={`absolute right-0 top-full z-50 mt-3 max-h-[calc(100svh-100px)] overflow-y-auto rounded-2xl  bg-surface text-ink shadow-2xl outline-none animate-[content-reveal_0.15s_ease-out_both] motion-reduce:animate-none ${wide ? "w-96 max-[760px]:fixed max-[760px]:left-3 max-[760px]:right-3 max-[760px]:top-17 max-[760px]:mt-0 max-[760px]:w-auto" : "w-64"}`}
        >
          {children(() => {
            setOpen(false);
            button.current?.focus();
          })}
        </div>
      )}
    </div>
  );
}
