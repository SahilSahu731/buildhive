"use client";

import { useEffect, useId, useRef } from "react";
import { PiX as X } from "react-icons/pi";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog?.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      data-wide={wide || undefined}
      className="m-auto w-[calc(100%-36px)] max-w-135 max-h-[calc(100svh-60px)] overflow-y-auto rounded-2xl border border-border-strong bg-surface p-7 text-ink shadow-[0_24px_90px_var(--color-shadow-color)] backdrop:bg-overlay backdrop:backdrop-blur-sm data-[wide=true]:max-w-190 max-[760px]:max-h-[calc(100svh-36px)] max-[760px]:p-6"
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="mb-6 flex items-start justify-between gap-4.5">
        <div>
          <h2
            id={titleId}
            className="m-0 text-[23px] font-medium leading-[1.35] tracking-[-0.8px] max-[760px]:text-[22px]"
          >
            {title}
          </h2>
          {description && (
            <p className="mb-0 mt-2.25 text-sm leading-[1.7] text-muted">
              {description}
            </p>
          )}
        </div>
        <button
          className="-mr-1.75 -mt-0.75 inline-flex size-10.5 shrink-0 items-center justify-center rounded-lg bg-transparent p-2 text-muted hover:bg-surface-hover hover:text-ink max-[760px]:size-10"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {open && children}
    </dialog>
  );
}
