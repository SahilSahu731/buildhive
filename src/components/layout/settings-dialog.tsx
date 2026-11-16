"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import {
  PiCaretRight as ChevronRight,
  PiSignOut as LogOut,
  PiArrowCounterClockwise as RotateCcw,
} from "react-icons/pi";
import { TbLayoutSidebarLeftCollapse as SidebarCollapse } from "react-icons/tb";
import { Modal } from "@/components/ui/modal";
import type { Profile } from "@/lib/types";

type SettingsDialogProps = {
  open: boolean;
  onClose: () => void;
  me: Profile;
  demo: boolean;
  collapsed: boolean;
  onToggleSidebar: () => void;
  onResetDemo: () => void;
  onSignOut: () => void;
};

export function SettingsDialog({
  open,
  onClose,
  me,
  demo,
  collapsed,
  onToggleSidebar,
  onResetDemo,
  onSignOut,
}: SettingsDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="space-y-7">
        <section aria-labelledby="settings-account">
          <h3
            id="settings-account"
            className="mb-3 text-xs font-medium tracking-normal text-muted"
          >
            Your account
          </h3>
          <Link
            href="/profile"
            onClick={onClose}
            className="flex items-center gap-3 rounded-2xl bg-surface-raised p-4 transition-colors hover:bg-surface-hover"
          >
            <Avatar profile={me} size={40} />
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-sm font-medium">
                {me.name}
              </strong>
              <span className="mt-1 block text-xs text-muted">
                View and edit your profile
              </span>
            </span>
            <ChevronRight size={18} className="text-muted" />
          </Link>
        </section>
        <section aria-labelledby="settings-preferences">
          <h3
            id="settings-preferences"
            className="mb-3 text-xs font-medium tracking-normal text-muted"
          >
            Preferences
          </h3>
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border/60 p-4">
            <SidebarCollapse size={23} className="text-muted" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Compact sidebar</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                Keep more room for what you're building.
              </span>
            </span>
            <input
              type="checkbox"
              role="switch"
              aria-label="Compact sidebar"
              checked={collapsed}
              onChange={onToggleSidebar}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="relative h-6 w-10 shrink-0 rounded-full bg-surface-active transition-colors after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-muted after:transition-transform peer-checked:bg-brand peer-checked:after:translate-x-4 peer-checked:after:bg-brand-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-brand motion-reduce:transition-none motion-reduce:after:transition-none"
            />
          </label>
        </section>
        <div className="border-t border-border/60 pt-4">
          {demo ? (
            <>
              <p className="mb-3 text-xs leading-relaxed text-muted">
                You're exploring a local preview. Sign in to save your work to
                your account.
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onResetDemo();
                    onClose();
                  }}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-transparent px-3 text-sm text-muted hover:bg-surface-hover hover:text-ink"
                >
                  <RotateCcw size={18} />
                  Reset demo workspace
                </button>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-ink hover:bg-primary-hover"
                >
                  Sign in
                </Link>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-transparent px-3 text-sm text-muted hover:bg-surface-hover hover:text-ink"
            >
              <LogOut size={18} />
              Sign out
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
