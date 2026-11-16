"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  Asterisk,
  ChevronRight,
  Menu,
  Plus,
  RotateCcw,
  Search,
  X,
} from "@/components/ui/icons";
import { Avatar } from "@/components/ui/avatar";
import type { Profile } from "@/lib/types";
import { navigation } from "./navigation";

type SidebarProps = {
  pathname: string;
  me: Profile;
  demo: boolean;
  collapsed: boolean;
  mobileOpen: boolean;
  pendingRequests: number;
  unreadMessages: number;
  onToggle: () => void;
  onClose: () => void;
  onCompose: () => void;
  onSearch: () => void;
  onResetDemo: () => void;
};

export function Sidebar({
  pathname,
  me,
  demo,
  collapsed,
  mobileOpen,
  pendingRequests,
  unreadMessages,
  onToggle,
  onClose,
  onCompose,
  onSearch,
  onResetDemo,
}: SidebarProps) {
  const drawer = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const media = window.matchMedia("(max-width: 760px)");
    if (!media.matches) {
      onClose();
      return;
    }
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key !== "Tab") return;
      const items = drawer.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]):not([data-desktop-control])",
      );
      const first = items?.[0];
      const last = items?.[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    const onResize = () => {
      if (!media.matches) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    media.addEventListener("change", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      media.removeEventListener("change", onResize);
      if (
        previouslyFocused instanceof HTMLElement &&
        previouslyFocused.isConnected
      )
        previouslyFocused.focus();
    };
  }, [mobileOpen, onClose]);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close navigation backdrop"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm min-[761px]:hidden"
        />
      )}
      <aside
        ref={drawer}
        id="workspace-sidebar"
        aria-label="Sidebar"
        data-collapsed={collapsed}
        data-mobile-open={mobileOpen}
        className="group/sidebar fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-width)] flex-col border-r border-border/50 bg-surface transition-[width,translate,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none max-[760px]:invisible max-[760px]:w-72 max-[760px]:max-w-[calc(100vw-24px)] max-[760px]:-translate-x-full max-[760px]:shadow-2xl max-[760px]:data-[mobile-open=true]:visible max-[760px]:data-[mobile-open=true]:translate-x-0"
      >
        <div className="flex h-20 shrink-0 items-center gap-3 px-4">
          <button
            type="button"
            data-desktop-control
            aria-controls="workspace-sidebar"
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggle}
            className="grid size-12 shrink-0 place-items-center rounded-full bg-transparent text-muted transition-colors hover:bg-surface-hover hover:text-ink max-[760px]:hidden"
          >
            <Menu size={23} />
          </button>
          <button
            ref={closeButton}
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="hidden size-12 shrink-0 place-items-center rounded-full bg-transparent text-muted hover:bg-surface-hover hover:text-ink max-[760px]:grid"
          >
            <X size={23} />
          </button>
          <Link
            href="/"
            aria-label="BuildWithMe home"
            onClick={onClose}
            className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[19px] font-semibold tracking-[-0.8px] min-[761px]:group-data-[collapsed=true]/sidebar:hidden"
          >
            <Asterisk size={22} className="text-brand" />
            <span>
              buildwithme<span className="text-brand">.</span>
            </span>
          </Link>
        </div>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-4">
          <button
            type="button"
            onClick={onCompose}
            aria-label="Create a post"
            title="Create a post"
            className="mb-7 mt-2 flex h-12 w-full items-center gap-3.5 rounded-2xl bg-surface-active px-3.5 text-[15px] font-medium text-ink transition-colors hover:bg-brand/15 hover:text-brand-text min-[761px]:group-data-[collapsed=true]/sidebar:justify-center min-[761px]:group-data-[collapsed=true]/sidebar:px-0"
          >
            <Plus size={23} />
            <span className="whitespace-nowrap min-[761px]:group-data-[collapsed=true]/sidebar:hidden">
              Create post
            </span>
          </button>
          <button
            type="button"
            onClick={onSearch}
            aria-label="Search builders and projects"
            aria-keyshortcuts="Control+k Meta+k"
            title="Search (Ctrl / ⌘ K)"
            className="mb-5 flex h-12 w-full items-center gap-3.5 rounded-2xl bg-transparent px-3.5 text-left text-[15px] text-muted transition-colors hover:bg-surface-hover hover:text-ink min-[761px]:group-data-[collapsed=true]/sidebar:justify-center min-[761px]:group-data-[collapsed=true]/sidebar:px-0"
          >
            <Search size={22} />
            <span className="min-[761px]:group-data-[collapsed=true]/sidebar:hidden">
              Search
            </span>
            <kbd className="ml-auto whitespace-nowrap rounded-md border border-border/60 px-1.5 py-0.5 font-sans text-[10px] text-muted min-[761px]:group-data-[collapsed=true]/sidebar:hidden">
              Ctrl K
            </kbd>
          </button>
          <p className="mb-2 px-3.5 text-[11px] font-medium tracking-[0.1em] text-muted/70 uppercase min-[761px]:group-data-[collapsed=true]/sidebar:sr-only">
            Workspace
          </p>
          <nav aria-label="Main navigation" className="grid gap-1.5">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href ||
                (href !== "/" && pathname.startsWith(`${href}/`));
              const count =
                href === "/messages"
                  ? unreadMessages
                  : href === "/cofounders"
                    ? pendingRequests
                    : 0;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  aria-label={label}
                  title={label}
                  aria-current={active ? "page" : undefined}
                  className="relative flex min-h-12 items-center gap-3.5 rounded-2xl px-3.5 py-3 text-[15px] text-muted transition-colors hover:bg-surface-hover hover:text-ink aria-[current=page]:bg-brand/10 aria-[current=page]:font-medium aria-[current=page]:text-ink min-[761px]:group-data-[collapsed=true]/sidebar:justify-center min-[761px]:group-data-[collapsed=true]/sidebar:px-0"
                >
                  <Icon
                    size={23}
                    className={active ? "text-brand-text" : "text-muted"}
                  />
                  <span className="whitespace-nowrap min-[761px]:group-data-[collapsed=true]/sidebar:hidden">
                    {label}
                  </span>
                  {count > 0 && (
                    <span
                      aria-label={`${count} ${href === "/messages" ? "unread messages" : "pending requests"}`}
                      className="ml-auto grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-brand-soft px-1 text-[10px] font-semibold leading-none text-brand-text min-[761px]:group-data-[collapsed=true]/sidebar:absolute min-[761px]:group-data-[collapsed=true]/sidebar:right-0 min-[761px]:group-data-[collapsed=true]/sidebar:top-0 min-[761px]:group-data-[collapsed=true]/sidebar:h-4 min-[761px]:group-data-[collapsed=true]/sidebar:min-w-4"
                    >
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 border-t border-border/50 px-4 pb-4 pt-3">
          {demo && (
            <div className="mb-2 flex h-9 items-center justify-between gap-2 px-2 min-[761px]:group-data-[collapsed=true]/sidebar:justify-center min-[761px]:group-data-[collapsed=true]/sidebar:px-0">
              <span className="flex min-w-0 items-center gap-2 whitespace-nowrap text-[11px] text-muted min-[761px]:group-data-[collapsed=true]/sidebar:hidden">
                <span className="size-1.5 rounded-full bg-brand/70" />
                Local preview
              </span>
              <button
                type="button"
                aria-label="Reset demo workspace"
                title="Reset local demo"
                onClick={onResetDemo}
                className="grid size-9 shrink-0 place-items-center rounded-full bg-transparent text-muted transition-colors hover:bg-surface-hover hover:text-ink"
              >
                <RotateCcw size={17} />
              </button>
            </div>
          )}
          <Link
            href="/profile"
            onClick={onClose}
            aria-label={`Your profile, ${me.name}`}
            title={me.name}
            aria-current={pathname === "/profile" ? "page" : undefined}
            className="flex min-h-13 items-center gap-3 rounded-2xl px-2 text-ink transition-colors hover:bg-surface-hover aria-[current=page]:bg-surface-hover min-[761px]:group-data-[collapsed=true]/sidebar:justify-center min-[761px]:group-data-[collapsed=true]/sidebar:px-0"
          >
            <Avatar profile={me} size={33} />
            <span className="min-w-0 flex-1 min-[761px]:group-data-[collapsed=true]/sidebar:hidden">
              <strong className="block truncate text-[14px] font-medium">
                {me.name}
              </strong>
              <span className="mt-0.5 block truncate text-[11px] text-muted">
                @{me.username}
              </span>
            </span>
            <ChevronRight
              size={16}
              className="text-muted min-[761px]:group-data-[collapsed=true]/sidebar:hidden"
            />
          </Link>
        </div>
      </aside>
    </>
  );
}
