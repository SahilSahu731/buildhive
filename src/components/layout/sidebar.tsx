"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  PiBracketsCurlyBold as Asterisk,
  PiCaretRight as ChevronRight,
  PiPlus as Plus,
  PiGearSix as Settings2,
  PiGearSixFill as SettingsFill,
  PiX as X,
  PiUsers as Users,
  PiUsersFill as UsersFill,
  PiChatCircle as MessageCircle,
  PiChatCircleFill as MessageCircleFill,
  PiBookmarkSimple as Bookmark,
  PiBookmarkSimpleFill as BookmarkFill,
} from "react-icons/pi";
import { GoHome as Home, GoHomeFill as HomeFill} from "react-icons/go";
import { RiDashboardHorizontalFill as CompassFill, RiDashboardHorizontalLine as Compass } from "react-icons/ri";
import {
  TbLayoutSidebarLeftCollapse as SidebarCollapse,
  TbLayoutSidebarLeftExpand as SidebarExpand,
} from "react-icons/tb";
import { Avatar } from "@/components/ui/avatar";
import type { Profile } from "@/lib/types";

const links = [
  ["/", "Feed", Home, HomeFill],
  ["/explore", "Projects", Compass, CompassFill],
  ["/cofounders", "Builders", Users, UsersFill],
  ["/messages", "Messages", MessageCircle, MessageCircleFill],
  ["/bookmarks", "Saved", Bookmark, BookmarkFill],
] as const;

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
  settingsOpen: boolean;
  onSettings: () => void;
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
  settingsOpen,
  onSettings,
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
    const bodyWasLocked = document.body.classList.contains("overflow-hidden");
    document.body.classList.add("overflow-hidden");
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
      if (!bodyWasLocked) document.body.classList.remove("overflow-hidden");
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
        role={mobileOpen ? "dialog" : undefined}
        aria-modal={mobileOpen || undefined}
        data-collapsed={collapsed}
        data-mobile-open={mobileOpen}
        className="group/sidebar fixed inset-y-0 left-0 z-50 flex w-(--sidebar-width) flex-col overflow-hidden border-r border-border/80 transition-[width,translate,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none max-[760px]:invisible max-[760px]:w-72 max-[760px]:max-w-[calc(100vw-24px)] max-[760px]:-translate-x-full max-[760px]:shadow-2xl max-[760px]:data-[mobile-open=true]:visible max-[760px]:data-[mobile-open=true]:translate-x-0"
      >
        <div className="flex h-20 shrink-0 items-center justify-between gap-2 overflow-hidden px-4">
          <Link
            href="/"
            aria-label="BuildWithMe home"
            onClick={onClose}
            className="inline-flex mt-1 min-h-12 min-w-0 items-center gap-2 whitespace-nowrap text-[17px] font-semibold tracking-[-0.8px] min-[761px]:group-data-[collapsed=true]/sidebar:hidden"
          >
            <Asterisk size={22} className="text-brand" />
            <span>
              buildwithme<span className="text-brand">.</span>
            </span>
          </Link>
          <button
            type="button"
            data-desktop-control
            aria-controls="workspace-sidebar"
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggle}
            className={`relative grid shrink-0 place-items-center rounded-full bg-transparent text-muted transition-colors hover:bg-surface-hover hover:text-ink motion-reduce:transition-none max-[760px]:hidden ${collapsed ? "group/expand size-10 cursor-e-resize" : " size-10 cursor-w-resize"}`}
          >
            {collapsed ? (
              <>
                <Asterisk
                  size={22}
                  aria-hidden="true"
                  className="absolute inset-0 mt-4 ml-2 text-brand transition-opacity duration-150 group-hover/expand:opacity-0 group-focus-visible/expand:opacity-0 motion-reduce:transition-none"
                />
                <SidebarExpand
                  size={24}
                  aria-hidden="true"
                  className="absolute inset-0 m-auto opacity-0 transition-opacity duration-150 group-hover/expand:opacity-100 group-focus-visible/expand:opacity-100 motion-reduce:transition-none"
                />
              </>
            ) : (
              <SidebarCollapse size={22} aria-hidden="true" />
            )}
          </button>
          <button
            ref={closeButton}
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="ml-auto hidden size-10 shrink-0 place-items-center rounded-xl bg-transparent text-muted hover:bg-surface-hover hover:text-ink max-[760px]:grid"
          >
            <X size={23} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-4 min-[761px]:group-data-[collapsed=true]/sidebar:px-3">
          <button
            type="button"
            onClick={onCompose}
            aria-label="Create a post"
            title="Create a post"
            className="mb-7 mt-2 flex h-11 w-full items-center gap-3 rounded-full bg-white/95 px-3 text-sm font-medium text-black transition-colors hover:bg-white min-[761px]:group-data-[collapsed=true]/sidebar:justify-center min-[761px]:group-data-[collapsed=true]/sidebar:px-0"
          >
            <Plus size={20} strokeWidth={6} />
            <span className="whitespace-nowrap min-[761px]:group-data-[collapsed=true]/sidebar:hidden">
              Create post
            </span>
          </button>

          <nav aria-label="Main navigation" className="grid gap-1.5">
            {links.map(([href, label, icon, activeIcon]) => {
              const active =
                pathname === href ||
                (href !== "/" && pathname.startsWith(`${href}/`));
              const Icon = active ? activeIcon : icon;
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
                  className="relative flex min-h-11 items-center gap-3 rounded-full px-4 py-1 text-sm text-white/80 font-medium transition-colors hover:bg-surface-hover hover:text-ink aria-[current=page]:bg-white/20 aria-[current=page]:font-semibold aria-[current=page]:text-ink min-[761px]:group-data-[collapsed=true]/sidebar:justify-center min-[761px]:group-data-[collapsed=true]/sidebar:px-0"
                >
                  <Icon size={22} className="text-white" />
                  <span className="whitespace-nowrap min-[761px]:group-data-[collapsed=true]/sidebar:hidden">
                    {label}
                  </span>
                  {count > 0 && (
                    <span
                      aria-label={`${count} ${href === "/messages" ? "unread messages" : "pending requests"}`}
                      className="ml-auto grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-white px-1 text-[10px] font-semibold leading-none text-black min-[761px]:group-data-[collapsed=true]/sidebar:absolute min-[761px]:group-data-[collapsed=true]/sidebar:right-0 min-[761px]:group-data-[collapsed=true]/sidebar:top-0 min-[761px]:group-data-[collapsed=true]/sidebar:h-4 min-[761px]:group-data-[collapsed=true]/sidebar:min-w-4"
                    >
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 border-t border-border/50 px-4 pb-4 pt-3 min-[761px]:group-data-[collapsed=true]/sidebar:px-3">
          <button
            type="button"
            onClick={onSettings}
            aria-label="Settings"
            aria-haspopup="dialog"
            aria-expanded={settingsOpen}
            title="Settings"
            className="mb-2 flex min-h-11 w-full items-center gap-3 rounded-full px-3 py-1 text-left text-[15px] text-white transition-colors hover:bg-surface-hover hover:text-ink aria-expanded:bg-surface-hover aria-expanded:text-ink min-[761px]:group-data-[collapsed=true]/sidebar:justify-center min-[761px]:group-data-[collapsed=true]/sidebar:px-0"
          >
            {settingsOpen ? (
              <SettingsFill size={20} />
            ) : (
              <Settings2 size={20} />
            )}
            <span className="min-[761px]:group-data-[collapsed=true]/sidebar:hidden">
              Settings
            </span>
          </button>
          <Link
            href="/profile"
            onClick={onClose}
            aria-label={`Your profile, ${me.name}`}
            title={me.name}
            aria-current={pathname === "/profile" ? "page" : undefined}
            className="flex min-h-11 items-center gap-3 rounded-full px-2 text-ink transition-colors hover:bg-surface-hover aria-[current=page]:bg-surface-hover min-[761px]:group-data-[collapsed=true]/sidebar:justify-center min-[761px]:group-data-[collapsed=true]/sidebar:px-0"
          >
            <Avatar profile={me} size={33} />
            <span className="min-w-0 flex-1 min-[761px]:group-data-[collapsed=true]/sidebar:hidden">
              <strong className="block truncate text-[14px] font-medium">
                {me.name}
              </strong>
              <span className="mt-0.5 block truncate text-[11px] text-muted">
                {demo ? "Local preview" : `@${me.username}`}
              </span>
            </span>
            <ChevronRight
              size={18}
              className="text-muted min-[761px]:group-data-[collapsed=true]/sidebar:hidden"
            />
          </Link>
        </div>
      </aside>
    </>
  );
}
