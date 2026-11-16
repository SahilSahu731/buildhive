"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "@/components/ui/icons";

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
      data-ui={`modal ${wide ? "modal-wide" : ""}`}
      className="w-[calc(100%-36px)] max-w-135 max-h-[calc(100svh-60px)] p-7 border border-border-strong rounded-[15px] text-ink bg-surface [box-shadow:0_24px_90px_var(--color-shadow-color)] overflow-y-auto backdrop:bg-overlay backdrop:[backdrop-filter:blur(3px)]ata-ui~=modal-wide]]:max-w-190 max-[760px]:p-6 max-[760px]:max-h-[calc(100svh-36px)]"
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
      <div className="flex items-start justify-between gap-4.5 mb-6 [&_h2]:text-[23px] [&_h2]:font-medium [&_h2]:leading-[1.35] [&_h2]:tracking-[-0.8px] [&_h2]:mt-0.75[&_h2]:mx-0 [&_h2]:mb-0 [&_p]:text-[14px] [&_p]:leading-[1.7] [&_p]:text-muted [[&_p]:mt-2.25[&_p]:mx-0 [&_p]:mb-0 *:data-[ui~=icon-button]:-mt-0.75 *:data-[ui~=icon-button]:-mr-1.75_[data-ui~=icon-button]]:mb-0 *:data-[ui~=icon-button]:ml-0 *:data-[ui~=icon-button]:shrink-0 max-[760px]:[&_h2]:text-[22px]">
        <div>
          <h2 id={titleId}>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <button
          data-ui="icon-button"
          className="inline-flex items-center justify-center w-10.5 h-10.5 p-2 rounded-lg bg-transparent text-muted hover:bg-surface-hover hover:text-ink max-[760px]:w-10 max-[760px]:h-10"
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
