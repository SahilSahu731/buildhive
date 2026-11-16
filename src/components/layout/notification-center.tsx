"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  PiBell,
  PiBellRinging,
  PiChatCircle,
  PiHeartFill,
  PiThumbsUpFill,
  PiUsers,
} from "react-icons/pi";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Popover } from "@/components/ui/popover";
import { Avatar } from "@/components/ui/avatar";
import { getNotifications } from "@/lib/notifications";
import { relativeTime } from "@/lib/utils";
import { BsCheckAll } from "react-icons/bs";

export function NotificationCenter() {
  const { data, me, demo, loading, error } = useWorkspace();
  const items = useMemo(() => getNotifications(data, me.id), [data, me.id]);
  const key = `buildwithme:notifications:${demo ? "preview" : "account"}:${me.id}`;
  const [read, setRead] = useState<{ key: string; ids: string[] }>({
    key: "",
    ids: [],
  });
  const [filter, setFilter] = useState<"all" | "unread">("all");
  useEffect(() => {
    function load() {
      let ids: string[] = [];
      try {
        const saved: unknown = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(saved))
          ids = saved
            .filter((id): id is string => typeof id === "string")
            .slice(-500);
      } catch {
        /* Read state still works in memory when storage is unavailable. */
      }
      setRead({ key, ids });
    }
    load();
    const sync = (event: StorageEvent) => {
      if (event.key === key || event.key === null) load();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [key]);
  const readIds = new Set(read.key === key ? read.ids : []);
  const unread = items.filter((item) => !item.read && !readIds.has(item.id));
  const visible = filter === "all" ? items : unread;
  function markRead(ids: string[]) {
    const next = [...new Set([...readIds, ...ids])].slice(-500);
    setRead({ key, ids: next });
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* Keep the current session usable. */
    }
  }
  return (
    <Popover
      label="Notifications"
      wide
      trigger={
        <span className="relative grid size-6 place-items-center">
          <PiBell size={21} />
          {unread.length > 0 && (
            <span
              aria-label={`${unread.length} unread notifications`}
              className="absolute -right-1 -top-1 size-2 rounded-full bg-red-600 ring-2 ring-canvas"
            />
          )}
        </span>
      }
    >
      {(close) => (
        <>
          <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
            <h2 className="m-0 text-base font-medium tracking-tight">
              Notifications{" "}
              {unread.length > 0 && (
                <span className="ml-1.5 text-xs text-white bg-white/30 px-1.5 py-0.5 rounded-full">
                  {unread.length}
                </span>
              )}
            </h2>
            <button
              type="button"
              disabled={!unread.length}
              onClick={() => markRead(items.map((item) => item.id))}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-transparent px-4 text-xs text-muted hover:bg-surface-hover hover:text-ink disabled:opacity-40"
            >
              <BsCheckAll size={15} /> Mark all read
            </button>
          </div>
          <div
            className="flex gap-1 border-b border-border px-4 pb-3"
            aria-label="Notification filter"
          >
            {(["all", "unread"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className="min-h-8 rounded-full bg-transparent px-3 text-xs text-muted transition-colors hover:text-ink aria-pressed:bg-surface-active aria-pressed:text-ink"
              >
                {value === "all" ? "All activity" : "Unread"}
              </button>
            ))}
          </div>
          <div className="max-h-[min(440px,calc(100svh-260px))] min-h-44 overflow-y-auto overscroll-contain p-2">
            {visible.length ? (
              <ul className="m-0 list-none p-0">
                {visible.map((item) => {
                  const Icon =
                    item.kind === "like"
                      ? PiHeartFill
                      : item.kind === "upvote"
                        ? PiThumbsUpFill
                        : item.kind === "connection"
                          ? PiUsers
                          : PiChatCircle;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          markRead([item.id]);
                          close();
                        }}
                        className="flex items-start gap-3 rounded-xl px-3 py-3.5 transition-colors hover:bg-surface-hover"
                      >
                        <span className="relative shrink-0">
                          <Avatar
                            profile={data.profiles.find(
                              (profile) => profile.id === item.actorId,
                            )}
                            size={33}
                          />
                          <span className="absolute -bottom-1 -right-1 grid size-4.5 place-items-center rounded-full bg-surface-active text-muted ring-2 ring-surface">
                            <Icon size={12} />
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium leading-relaxed">
                            {item.title}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted">
                            {item.description}
                          </span>
                          <time
                            dateTime={item.createdAt}
                            className="mt-1.5 block text-[11px] text-muted"
                          >
                            {relativeTime(item.createdAt) === "Just now"
                              ? "Just now"
                              : `${relativeTime(item.createdAt)} ago`}
                          </time>
                        </span>
                        {!item.read && !readIds.has(item.id) && (
                          <span
                            aria-label="Unread"
                            className="mt-2 size-1.5 shrink-0 rounded-full bg-red-600"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div
                className="flex min-h-44 flex-col items-center justify-center px-6 text-center"
                role="status"
              >
                <PiBellRinging size={26} className="mb-3 text-muted" />
                <p className="mb-1 text-sm font-medium">
                  {loading
                    ? "Loading your activity…"
                    : error
                      ? "Activity is unavailable"
                      : filter === "unread"
                        ? "You're all caught up"
                        : "A little quiet here"}
                </p>
                <p className="mb-0 text-xs leading-relaxed text-muted">
                  {error
                    ? "Refresh your workspace to try again."
                    : "Messages, connections and activity on your work appear here."}
                </p>
              </div>
            )}
          </div>
          {/* <p className="m-0 border-t border-border px-5 py-3 text-[11px] text-muted">
            Read status is saved on this device.
          </p> */}
        </>
      )}
    </Popover>
  );
}
