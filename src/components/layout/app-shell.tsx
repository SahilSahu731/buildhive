"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  PiBell as Bell,
  PiCheck as Check,
  PiCaretRight as ChevronRight,
  PiUserCircle as CircleUserRound,
  PiUserCircleFill as CircleUserRoundFill,
  PiSignOut as LogOut,
  PiList as Menu,
  PiMagnifyingGlass as Search,
  PiX as X,
  PiHouseSimple as Home,
  PiHouseSimpleFill as HomeFill,
  PiSquaresFour as Compass,
  PiSquaresFourFill as CompassFill,
  PiUsers as Users,
  PiUsersFill as UsersFill,
  PiChatCircle as MessageCircle,
  PiChatCircleFill as MessageCircleFill,
} from "react-icons/pi";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { Composer } from "@/components/feed/composer";
import { ProfilePreview } from "@/components/ui/profile-preview";
import type { Profile } from "@/lib/types";
import { Sidebar } from "./sidebar";
import { SettingsDialog } from "./settings-dialog";
import { useSidebarPreference } from "./use-sidebar-preference";

const mobileLinks = [
  ["/", "Feed", Home, HomeFill],
  ["/explore", "Projects", Compass, CompassFill],
  ["/cofounders", "Builders", Users, UsersFill],
  ["/messages", "Messages", MessageCircle, MessageCircleFill],
] as const;

const pageLabels: Record<string, string> = {
  "/": "Feed",
  "/explore": "Projects",
  "/cofounders": "Builders",
  "/messages": "Messages",
  "/bookmarks": "Saved",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, me, demo, loading, error, refresh, resetDemo, notify } =
    useWorkspace();
  const [menu, setMenu] = useState(false);
  const [collapsed, toggleSidebar] = useSidebarPreference();
  const closeMenu = useCallback(() => setMenu(false), []);
  const [compose, setCompose] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [settings, setSettings] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState<Profile>();
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMenu(false);
        setSearch((value) => !value);
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  const requests = data.connections.filter(
    (c) => c.recipientId === me.id && c.status === "pending",
  );
  const label = pageLabels[pathname] || "Profile";
  const profiles = data.profiles
    .filter(
      (p) =>
        p.id !== me.id &&
        `${p.name} ${p.role} ${p.skills.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .slice(0, 4);
  const projects = data.projects
    .filter((p) =>
      `${p.name} ${p.tagline}`.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 4);
  async function signOut() {
    try {
      const response = await fetch("/api/auth/signout", { method: "POST" });
      if (!response.ok) throw new Error();
      window.location.assign("/");
    } catch {
      notify("Couldn't sign out. Please try again.");
    }
  }
  return (
    <div
      data-sidebar-collapsed={collapsed}
      className="min-h-svh [--sidebar-width:264px] min-[761px]:data-[sidebar-collapsed=true]:[--sidebar-width:72px]"
    >
      <a
        className="fixed left-5 -top-17.5 z-2000 py-3 px-4.5 bg-primary text-primary-ink rounded-[7px] focus:top-3"
        href="#main-content"
      >
        Skip to content
      </a>
      <Sidebar
        pathname={pathname}
        me={me}
        demo={demo}
        collapsed={collapsed}
        mobileOpen={menu}
        pendingRequests={requests.length}
        unreadMessages={data.conversations
          .filter((conversation) => conversation.memberIds.includes(me.id))
          .reduce(
            (count, conversation) =>
              count +
              conversation.messages.filter(
                (message) => message.senderId !== me.id && !message.readAt,
              ).length,
            0,
          )}
        onToggle={toggleSidebar}
        onClose={closeMenu}
        onCompose={() => {
          setCompose(true);
          closeMenu();
        }}
        settingsOpen={settings}
        onSettings={() => {
          setSettings(true);
          closeMenu();
        }}
      />
      <div className="ml-(--sidebar-width) min-h-screen transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none max-[760px]:ml-0 max-[760px]:pb-17.5">
        <header className="h-19 py-0 px-10.5 bg-header [border-bottom:1px_solid_var(--color-border)] flex items-center justify-between gap-5 sticky top-0 z-30 [backdrop-filter:blur(12px)] max-[1200px]:py-0 max-[1200px]:px-7.5 max-[950px]:px-6.5 max-[760px]:h-16.5 max-[760px]:py-0 max-[760px]:px-3.75 max-[760px]:gap-2.5 max-[390px]:px-3">
          <div className="flex items-center gap-3 [&_strong]:font-medium [&_strong]:text-[18px] [&_strong]:tracking-[-0.5px] max-[760px]:gap-2.5 max-[760px]:[&_strong]:text-[17px]">
            <button
              data-ui="icon-button mobile-menu"
              className="hidden items-center justify-center w-10.5 h-10.5 p-2 rounded-lg bg-transparent text-muted hover:bg-surface-hover hover:text-ink max-[760px]:flex max-[760px]:w-10 max-[760px]:h-10"
              aria-label="Open navigation"
              aria-controls="workspace-sidebar"
              aria-expanded={menu}
              onClick={() => setMenu(true)}
            >
              <Menu size={24} />
            </button>
            <strong>{label}</strong>
          </div>
          <div className="flex items-center gap-2 *:data-[ui~=button]:ml-2.5 max-[760px]:gap-px max-[760px]:*:data-[ui~=button]:ml-1.25 max-[760px]:*:data-[ui~=button]:min-h-9 max-[760px]:*:data-[ui~=button]:py-1.75 max-[760px]:*:data-[ui~=button]:px-3 max-[760px]:*:data-[ui~=button]:text-[12px]">
            <button
              data-ui="icon-button"
              className="inline-flex items-center justify-center w-10.5 h-10.5 p-2 rounded-lg bg-transparent text-muted hover:bg-surface-hover hover:text-ink max-[760px]:w-10 max-[760px]:h-10"
              aria-label="Search builders and projects"
              title="Search (Ctrl / ⌘ K)"
              onClick={() => setSearch(true)}
            >
              <Search size={22} />
            </button>
            <button
              data-ui="icon-button notification-button"
              className="inline-flex items-center justify-center w-10.5 h-10.5 p-2 rounded-lg bg-transparent text-muted hover:bg-surface-hover hover:text-ink relative [&_>_i]:absolute [&_>_i]:right-2.25 [&_>_i]:top-2.25 [&_>_i]:w-1.5 [&_>_i]:h-1.5 [&_>_i]:bg-brand [&_>_i]:border [&_>_i]:rounded-full [&_>_i]:border-canvas max-[760px]:w-10 max-[760px]:h-10"
              aria-label="Connection requests"
              onClick={() => setNotifications(true)}
            >
              <Bell size={22} />
              {requests.length > 0 && <i />}
            </button>
            {demo ? (
              <Link
                href="/login"
                data-ui="button button-secondary button-small"
                className="inline-flex items-center justify-center gap-2.25 min-h-9.5 py-2 px-3.5 border border-transparent rounded-lg text-[13px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-surface text-ink enabled:hover:bg-surface-hover enabled:hover:border-faint enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
              >
                Sign in
              </Link>
            ) : (
              <button
                data-ui="icon-button"
                className="inline-flex items-center justify-center w-10.5 h-10.5 p-2 rounded-lg bg-transparent text-muted hover:bg-surface-hover hover:text-ink max-[760px]:w-10 max-[760px]:h-10"
                aria-label="Sign out"
                onClick={() => void signOut()}
              >
                <LogOut size={22} />
              </button>
            )}
          </div>
        </header>
        <main
          id="main-content"
          className="max-w-280 my-0 mx-auto pt-8 px-11 pb-16 min-[1600px]:pt-10 max-[1200px]:pt-7 max-[1200px]:px-8 max-[1200px]:pb-13.75 max-[950px]:px-6.5 max-[760px]:pt-5 max-[760px]:px-5 max-[760px]:pb-8.75 max-[760px]:max-w-190 max-[390px]:px-4"
        >
          {error && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3.75 border bg-brand-soft text-brand-text rounded-lg py-3 px-4 text-[14px] mb-6 border-brand-border [&_button]:py-1 [&_button]:px-0 [&_button]:bg-transparent [&_button]:text-inherit [&_button]:underline [&_button]:whitespace-nowrap max-[760px]:text-[13px]"
            >
              <span>{error}</span>
              <button onClick={() => void refresh()}>Try again</button>
            </div>
          )}
          {loading && (
            <div
              className="fixed right-5 bottom-4 text-[12px] text-muted z-20 max-[760px]:bottom-19 max-[760px]:text-[11px]"
              role="status"
            >
              Loading workspace…
            </div>
          )}
          {children}
        </main>
        <nav
          className="hidden max-[760px]:flex max-[760px]:justify-around max-[760px]:items-center max-[760px]:fixed max-[760px]:bottom-0 max-[760px]:left-0 max-[760px]:right-0 max-[760px]:z-40 max-[760px]:h-17 max-[760px]:pt-2 max-[760px]:px-2.5 max-[760px]:pb-[max(8px,env(safe-area-inset-bottom))] max-[760px]:bg-header max-[760px]:[border-top:1px_solid_var(--color-border)] max-[760px]:[backdrop-filter:blur(12px)] max-[760px]:[&_>_a]:flex max-[760px]:[&_>_a]:items-center max-[760px]:[&_>_a]:flex-col max-[760px]:[&_>_a]:gap-1 max-[760px]:[&_>_a]:min-w-11.25 max-[760px]:[&_>_a]:text-muted max-[760px]:[&_>_a]:text-[10px] max-[760px]:[&_>_a[data-ui~=active]]:text-brand-text"
          aria-label="Mobile navigation"
        >
          {mobileLinks.map(([href, name, icon, activeIcon]) => {
            const active = pathname === href;
            const Icon = active ? activeIcon : icon;
            return (
              <Link
                key={href}
                href={href}
                data-ui={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={24} />
                <span>{name}</span>
              </Link>
            );
          })}
          <Link
            href="/profile"
            data-ui={pathname === "/profile" ? "active" : ""}
            className=""
          >
            {pathname === "/profile" ? (
              <CircleUserRoundFill size={24} />
            ) : (
              <CircleUserRound size={24} />
            )}
            <span>Profile</span>
          </Link>
        </nav>
      </div>
      <SettingsDialog
        open={settings}
        onClose={() => setSettings(false)}
        me={me}
        demo={demo}
        collapsed={collapsed}
        onToggleSidebar={toggleSidebar}
        onResetDemo={resetDemo}
        onSignOut={() => void signOut()}
      />
      <Modal
        open={compose}
        onClose={() => setCompose(false)}
        title="Create a post"
      >
        <Composer expanded onDone={() => setCompose(false)} />
      </Modal>
      <Modal
        open={notifications}
        onClose={() => setNotifications(false)}
        title="Connection requests"
      >
        <div className="[&_>_a]:flex [&_>_a]:items-center [&_>_a]:gap-3 [&_>_a]:py-4.25 [&_>_a]:px-0 [&_>_a]:text-[15px] [&_>_a]:leading-[1.6] [&_>_a]:[border-bottom:1px_solid_var(--color-border)] [&_>_a_>_span:nth-child(2)]:flex-1 [&_strong]:font-medium [&_small]:block [&_small]:text-[13px] [&_small]:text-muted">
          {requests.length ? (
            requests.map((c) => {
              const sender = data.profiles.find((p) => p.id === c.senderId);
              return (
                <Link
                  href="/cofounders"
                  key={c.id}
                  onClick={() => setNotifications(false)}
                >
                  <Avatar profile={sender} size={44} />
                  <span>
                    <strong>{sender?.name || "A builder"}</strong> wants to
                    connect.<small>View their profile and respond.</small>
                  </span>
                  <ChevronRight size={20} />
                </Link>
              );
            })
          ) : (
            <div
              data-ui="empty-state compact"
              className="flex flex-col items-center text-center py-13.75 px-7 text-muted [&_h3]:text-ink [&_h3]:text-[21px] [&_h3]:font-medium [&_h3]:mt-4.25 [&_h3]:mx-0 [&_h3]:mb-2.25 [&_h2]:text-ink [&_h2]:text-[21px] [&_h2]:font-medium [&_h2]:mt-4.25 [&_h2]:mx-0 [&_h2]:mb-2.25 [&_p]:text-muted [&_p]:text-[15px] [&_p]:leading-[1.7] [&_p]:max-w-90 [&_p]:mt-0 [&_p]:mx-0 [&_p]:mb-5.5 data-[ui~=compact]:py-6.25 data-[ui~=compact]:px-2.5"
            >
              <Check size={28} />
              <h3>You're all caught up.</h3>
              <p>New connection requests will appear here.</p>
            </div>
          )}
        </div>
      </Modal>
      <Modal
        open={search}
        onClose={() => {
          setSearch(false);
          setQuery("");
        }}
        title="Search"
      >
        <div className="flex items-center gap-2.5 border border-border rounded-lg py-0 px-3 text-muted **:data-[ui~=input]:border-0 **:data-[ui~=input]:[outline:0] **:data-[ui~=input]:py-3.5 **:data-[ui~=input]:px-0 **:data-[ui~=input]:bg-transparent focus-within:border-focus">
          <Search size={21} />
          <input
            data-ui="input"
            className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink placeholder:text-faint [textarea]:resize-y [textarea]:leading-[1.7]"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="People, skills, projects…"
            aria-label="Search builders and projects"
          />
          {query && (
            <button
              data-ui="icon-button"
              className="inline-flex items-center justify-center w-10.5 h-10.5 p-2 rounded-lg bg-transparent text-muted hover:bg-surface-hover hover:text-ink max-[760px]:w-10 max-[760px]:h-10"
              aria-label="Clear search"
              onClick={() => setQuery("")}
            >
              <X size={18} />
            </button>
          )}
        </div>
        <h3 className="text-[13px] font-medium tracking-normal text-muted mt-6.25 mx-0 mb-2.25">
          Builders
        </h3>
        <div className="grid gap-0.75 [&_>_button]:flex [&_>_button]:items-center [&_>_button]:gap-2.75 [&_>_button]:w-full [&_>_button]:bg-transparent [&_>_button]:py-2.5 [&_>_button]:px-1.75 [&_>_button]:rounded-[7px] [&_>_button]:text-left [&_>_a]:flex [&_>_a]:items-center [&_>_a]:gap-2.75 [&_>_a]:w-full [&_>_a]:bg-transparent [&_>_a]:py-2.5 [&_>_a]:px-1.75 [&_>_a]:rounded-[7px] [&_>_a]:text-left [&_>_button:hover]:bg-surface-hover [&_>_a:hover]:bg-surface-hover [&_>_button_>_span:nth-child(2)]:flex-1 [&_>_button_>_span:nth-child(2)]:min-w-0 [&_>_a_>_span:nth-child(2)]:flex-1 [&_>_a_>_span:nth-child(2)]:min-w-0 [&_strong]:block [&_strong]:text-[15px] [&_strong]:font-medium [&_small]:block [&_small]:text-[12px] [&_small]:text-muted [&_small]:leading-normal [&_small]:mt-1 [&_>_p]:text-[14px] [&_>_button_>_svg]:text-muted [&_>_a_>_svg]:text-muted">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setProfile(p);
                setSearch(false);
              }}
            >
              <Avatar profile={p} size={42} />
              <span>
                <strong>{p.name}</strong>
                <small>{p.role}</small>
              </span>
              <ChevronRight size={19} />
            </button>
          ))}
          {!profiles.length && <p className="text-muted">No builders found.</p>}
        </div>
        <h3 className="text-[13px] font-medium tracking-normal text-muted mt-6.25 mx-0 mb-2.25">
          Projects
        </h3>
        <div className="grid gap-0.75 [&_>_button]:flex [&_>_button]:items-center [&_>_button]:gap-2.75 [&_>_button]:w-full [&_>_button]:bg-transparent [&_>_button]:py-2.5 [&_>_button]:px-1.75 [&_>_button]:rounded-[7px] [&_>_button]:text-left [&_>_a]:flex [&_>_a]:items-center [&_>_a]:gap-2.75 [&_>_a]:w-full [&_>_a]:bg-transparent [&_>_a]:py-2.5 [&_>_a]:px-1.75 [&_>_a]:rounded-[7px] [&_>_a]:text-left [&_>_button:hover]:bg-surface-hover [&_>_a:hover]:bg-surface-hover [&_>_button_>_span:nth-child(2)]:flex-1 [&_>_button_>_span:nth-child(2)]:min-w-0 [&_>_a_>_span:nth-child(2)]:flex-1 [&_>_a_>_span:nth-child(2)]:min-w-0 [&_strong]:block [&_strong]:text-[15px] [&_strong]:font-medium [&_small]:block [&_small]:text-[12px] [&_small]:text-muted [&_small]:leading-normal [&_small]:mt-1 [&_>_p]:text-[14px] [&_>_button_>_svg]:text-muted [&_>_a_>_svg]:text-muted">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/explore?project=${p.id}`}
              onClick={() => setSearch(false)}
            >
              <span
                data-ui="project-monogram"
                className="grid place-items-center w-10.5 h-10.5 rounded-lg bg-surface-hover text-ink font-medium text-[22px] shrink-0"
              >
                {p.name[0]}
              </span>
              <span>
                <strong>{p.name}</strong>
                <small>{p.tagline}</small>
              </span>
              <ChevronRight size={19} />
            </Link>
          ))}
          {!projects.length && <p className="text-muted">No projects found.</p>}
        </div>
      </Modal>
      <ProfilePreview profile={profile} onClose={() => setProfile(undefined)} />
    </div>
  );
}
