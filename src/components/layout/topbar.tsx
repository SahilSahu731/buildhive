"use client";

import Link from "next/link";
import { useState } from "react";
import {
  PiList,
  PiMagnifyingGlass,
  PiChatTeardropText,
  PiQuestion,
  PiCaretDown,
  PiUserCircle,
  PiGearSix,
  PiSignOut,
  PiKeyboard,
  PiPlus,
  PiUsers,
  PiSquaresFour,
} from "react-icons/pi";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { Popover } from "@/components/ui/popover";
import { NotificationCenter } from "./notification-center";
import { FeedbackDialog } from "./feedback-dialog";

export function Topbar({
  label,
  pathname,
  menuOpen,
  onMenu,
  onSearch,
  onSettings,
  onSignOut,
  onCompose,
}: {
  label: string;
  pathname: string;
  menuOpen: boolean;
  onMenu: () => void;
  onSearch: () => void;
  onSettings: () => void;
  onSignOut: () => void;
  onCompose: () => void;
}) {
  const { me, demo } = useWorkspace();
  const [feedback, setFeedback] = useState(false);
  const [help, setHelp] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-30 flex h-15 items-center justify-between gap-4 border-b border-border bg-header px-10.5 backdrop-blur-xl max-[1200px]:px-7.5 max-[950px]:px-6.5 max-[760px]:h-15 max-[760px]:gap-2 max-[760px]:px-4 max-[390px]:px-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-transparent text-muted hover:bg-surface-hover hover:text-ink max-[760px]:flex"
            aria-label="Open navigation"
            aria-controls="workspace-sidebar"
            aria-expanded={menuOpen}
            onClick={onMenu}
          >
            <PiList size={23} />
          </button>
          {/* <strong className="truncate text-[17px] font-medium tracking-tight">
            {label}
          </strong> */}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 max-[760px]:gap-0.5">
          <button
            type="button"
            aria-label="Search builders and projects"
            title="Search (Ctrl / ⌘ K)"
            onClick={onSearch}
            className="mr-1 flex min-h-10 items-center gap-2 rounded-full bg-transparent px-3 text-muted transition-colors hover:bg-surface-hover hover:text-ink max-[760px]:mr-0 max-[760px]:px-2"
          >
            <PiMagnifyingGlass size={20} />
            <span className="text-sm max-[1000px]:hidden">Search</span>
            <kbd className="ml-3 rounded-md border border-border px-2 py-1 font-sans text-[10px] text-muted/70 max-[1200px]:hidden">
              ⌘ K / Ctrl K
            </kbd>
          </button>
          <button
            type="button"
            onClick={() => setFeedback(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-transparent px-3 text-sm text-blue-300 transition-colors hover:bg-surface-hover  max-[950px]:hidden"
          >
            <PiChatTeardropText size={19} />
            Feedback
          </button>
          <button
            type="button"
            aria-label="Help and shortcuts"
            title="Help and shortcuts"
            onClick={() => setHelp(true)}
            className="grid size-10 place-items-center rounded-full bg-transparent text-yellow-300 transition-colors hover:bg-surface-hover max-[760px]:hidden"
          >
            <PiQuestion size={21} />
          </button>
          <span
            aria-hidden="true"
            className="mx-2 h-5 w-px bg-border max-[760px]:hidden"
          />
          <NotificationCenter />
          <Popover
            label="Account menu"
            trigger={
              <>
                <Avatar profile={me} size={27} />
                <PiCaretDown size={12} className="mr-1 max-[760px]:hidden" />
              </>
            }
          >
            {(close) => (
              <div className="p-2 [&_button]:flex [&_button]:min-h-10 [&_button]:w-full [&_button]:items-center [&_button]:gap-3 [&_button]:rounded-xl [&_button]:bg-transparent [&_button]:px-3 [&_button]:text-left [&_button]:text-sm [&_button]:text-muted [&_button:hover]:bg-surface-hover [&_button:hover]:text-ink">
                <div className="mb-1 border-b border-border px-3 pb-4 pt-3">
                  <p className="mb-0 truncate text-sm font-medium">{me.name}</p>
                  <span className="mt-1 block text-xs text-muted">
                    {demo ? "Exploring the preview" : `@${me.username}`}
                  </span>
                </div>
                <Link
                  href="/profile"
                  onClick={close}
                  className="flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm text-muted hover:bg-surface-hover hover:text-ink"
                >
                  <PiUserCircle size={19} />
                  Your profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    onSettings();
                  }}
                >
                  <PiGearSix size={19} />
                  Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    setFeedback(true);
                  }}
                >
                  <PiChatTeardropText size={19} />
                  Send feedback
                </button>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    setHelp(true);
                  }}
                >
                  <PiKeyboard size={19} />
                  Help & shortcuts
                </button>
                <div className="mt-1 border-t border-border pt-1">
                  {demo ? (
                    <Link
                      href="/login"
                      onClick={close}
                      className="flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm hover:bg-surface-hover"
                    >
                      <PiSignOut size={19} />
                      Sign in
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        close();
                        onSignOut();
                      }}
                    >
                      <PiSignOut size={19} />
                      Sign out
                    </button>
                  )}
                </div>
              </div>
            )}
          </Popover>
        </div>
      </header>
      <FeedbackDialog
        open={feedback}
        onClose={() => setFeedback(false)}
        path={pathname}
      />
      <Modal
        open={help}
        onClose={() => setHelp(false)}
        title="A little help getting started"
        description="Find your people. Share what you're making. Build something together."
      >
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              setHelp(false);
              onCompose();
            }}
            className="flex w-full items-center gap-3 rounded-xl bg-transparent p-3 text-left hover:bg-surface-hover"
          >
            <PiPlus size={22} />
            <span>
              <span className="block text-sm font-medium">
                Share what you're building
              </span>
              <span className="text-xs text-muted">
                Post an update, a launch, or an idea.
              </span>
            </span>
          </button>
          <Link
            href="/cofounders"
            onClick={() => setHelp(false)}
            className="flex items-center gap-3 rounded-xl p-3 hover:bg-surface-hover"
          >
            <PiUsers size={22} />
            <span>
              <span className="block text-sm font-medium">
                Find a collaborator
              </span>
              <span className="text-xs text-muted">
                Connect with builders who complement your skills.
              </span>
            </span>
          </Link>
          <Link
            href="/explore"
            onClick={() => setHelp(false)}
            className="flex items-center gap-3 rounded-xl p-3 hover:bg-surface-hover"
          >
            <PiSquaresFour size={22} />
            <span>
              <span className="block text-sm font-medium">
                Explore projects
              </span>
              <span className="text-xs text-muted">
                Discover launches and share your own project.
              </span>
            </span>
          </Link>
        </div>
        <div className="mt-5 space-y-3 border-t border-border pt-5 text-xs text-muted">
          <div className="flex justify-between gap-3">
            <span>Search builders & projects</span>
            <kbd className="font-sans text-ink">Ctrl / ⌘ K</kbd>
          </div>
          <div className="flex justify-between gap-3">
            <span>Close a dialog or dropdown</span>
            <kbd className="font-sans text-ink">Esc</kbd>
          </div>
        </div>
      </Modal>
    </>
  );
}
