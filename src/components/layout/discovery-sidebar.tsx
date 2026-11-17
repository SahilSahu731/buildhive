"use client";

import Link from "next/link";
import { useState } from "react";
import {
  PiCaretRight,
  PiCaretUp,
  PiMegaphone,
  PiSparkle,
} from "react-icons/pi";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Avatar } from "@/components/ui/avatar";
import { ProfilePreview } from "@/components/ui/profile-preview";
import type { Profile } from "@/lib/types";
import { FeedbackDialog } from "./feedback-dialog";

export function DiscoverySidebar({ pathname }: { pathname: string }) {
  const { data, me, loading } = useWorkspace();
  const [promotion, setPromotion] = useState(false);
  const [profile, setProfile] = useState<Profile>();
  const connected = new Set(
    data.connections
      .filter(
        (connection) =>
          connection.senderId === me.id || connection.recipientId === me.id,
      )
      .flatMap((connection) => [connection.senderId, connection.recipientId]),
  );
  const projects = loading
    ? []
    : data.projects
        .filter((project) => project.ownerId !== me.id)
        .sort((a, b) => b.upvotes - a.upvotes)
        .slice(0, 3);
  const builders = loading
    ? []
    : data.profiles
        .filter(
          (person) =>
            person.id !== me.id &&
            person.availability === "open" &&
            !connected.has(person.id),
        )
        .slice(0, 3);

  return (
    <>
      <aside
        aria-label="Discover builders and products"
        tabIndex={0}
        className="sticky top-21 hidden max-h-[calc(100svh-108px)] min-w-0 self-start space-y-5 overflow-y-auto pb-3 scrollbar-thin @min-[980px]:block"
      >
        <section
          aria-labelledby="promotion-heading"
          className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/4 blur-2xl"
          />
          <div className="relative">
            <span className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-medium text-muted">
              <PiMegaphone size={14} />
              For builders, by builders
            </span>
            <h2
              id="promotion-heading"
              className="mb-2 text-[23px] font-medium leading-tight tracking-tight"
            >
              Built something
              <br />
              worth sharing?
            </h2>
            <p className="mb-5 text-[13px] leading-relaxed text-muted">
              Put your product in front of people who love discovering what’s
              next.
            </p>
            <button
              type="button"
              onClick={() => setPromotion(true)}
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-[13px] font-medium text-primary-ink transition-colors hover:bg-primary-hover"
            >
              <PiSparkle size={16} />
              Promote your product
            </button>
          </div>
        </section>

        <section
          aria-labelledby="discovery-projects"
          className="overflow-hidden rounded-2xl border border-border"
        >
          <div className="px-5 pb-1 pt-4">
            <h2
              id="discovery-projects"
              className="m-0 text-[17px] font-semibold tracking-tight"
            >
              Products to discover
            </h2>
            <p className="mb-0 mt-1 text-xs text-muted">
              Getting noticed by the community.
            </p>
          </div>
          {projects.length ? (
            <ul className="m-0 list-none px-2 py-2">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/explore?project=${encodeURIComponent(project.id)}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-surface-hover"
                  >
                    <span
                      aria-hidden="true"
                      className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-surface text-lg font-medium"
                    >
                      {project.name[0]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">
                        {project.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted">
                        {project.tagline}
                      </span>
                    </span>
                    <span
                      aria-label={`${project.upvotes} upvotes`}
                      className="flex shrink-0 flex-col items-center text-[11px] text-muted"
                    >
                      <PiCaretUp size={13} />
                      {project.upvotes}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p
              className="mb-0 px-5 py-5 text-xs leading-relaxed text-muted"
              role="status"
            >
              {loading
                ? "Finding projects…"
                : "Looking for inspiration? Explore the latest projects."}
            </p>
          )}
          <Link
            href="/explore"
            className="flex min-h-11 items-center justify-between border-t border-border px-5 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-ink"
          >
            Explore all projects
            <PiCaretRight size={14} />
          </Link>
        </section>

        <section
          aria-labelledby="discovery-builders"
          className="overflow-hidden rounded-2xl border border-border"
        >
          <div className="px-5 pb-1 pt-4">
            <h2
              id="discovery-builders"
              className="m-0 text-[17px] font-semibold tracking-tight"
            >
              Builders to meet
            </h2>
            <p className="mb-0 mt-1 text-xs text-muted">
              Open to building something together.
            </p>
          </div>
          {builders.length ? (
            <ul className="m-0 list-none px-2 py-2">
              {builders.map((builder) => (
                <li key={builder.id}>
                  <button
                    type="button"
                    aria-label={`View ${builder.name}'s profile`}
                    onClick={() => setProfile(builder)}
                    className="flex min-h-17 w-full items-center gap-3 rounded-xl bg-transparent px-3 py-3 text-left transition-colors hover:bg-surface-hover"
                  >
                    <Avatar profile={builder} size={38} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">
                        {builder.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted">
                        {builder.role || `@${builder.username}`}
                      </span>
                    </span>
                    <PiCaretRight size={15} className="text-muted" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p
              className="mb-0 px-5 py-5 text-xs leading-relaxed text-muted"
              role="status"
            >
              {loading
                ? "Finding your people…"
                : "Explore the directory to find more people to build with."}
            </p>
          )}
          <Link
            href="/cofounders"
            className="flex min-h-11 items-center justify-between border-t border-border px-5 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-ink"
          >
            Discover more builders
            <PiCaretRight size={14} />
          </Link>
        </section>
        <p className="m-0 px-2 text-[11px] leading-relaxed text-muted/65">
          BuildWithMe
          <span aria-hidden="true" className="mx-1.5">
            ·
          </span>
          A little less solo. A lot more possible.
        </p>
      </aside>
      <FeedbackDialog
        open={promotion}
        onClose={() => setPromotion(false)}
        path={pathname}
        intent="promotion"
      />
      <ProfilePreview profile={profile} onClose={() => setProfile(undefined)} />
    </>
  );
}
