"use client";
import Link from "next/link";
import {
  PiMapPin as MapPin,
  PiCaretRight as ChevronRight,
  PiUserPlus as UserPlus,
  PiCheck as Check,
  PiClock as Clock,
} from "react-icons/pi";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Avatar } from "./avatar";
import { Modal } from "./modal";
import { safeUrl } from "@/lib/utils";
import type { Profile } from "@/lib/types";
export function ProfilePreview({
  profile,
  onClose,
}: {
  profile?: Profile;
  onClose: () => void;
}) {
  const { data, me, requestConnection } = useWorkspace();
  const c = data.connections.find(
    (c) =>
      c.status !== "declined" &&
      ((c.senderId === me.id && c.recipientId === profile?.id) ||
        (c.recipientId === me.id && c.senderId === profile?.id)),
  );
  return (
    <Modal open={!!profile} onClose={onClose} title="Builder profile">
      {profile && (
        <div className="[&_>_p]:text-[16px] [&_>_p]:leading-[1.8] [&_>_p]:text-text [&_h4]:text-[14px] [&_h4]:tracking-normal [&_h4]:font-medium [&_h4]:mt-6.25 [&_h4]:mx-0 [&_h4]:mb-3 max-[760px]:[&_>_p]:text-[15px]">
          <div className="flex items-center gap-4.5 mb-6 [&_h2]:text-[26px] [&_h2]:font-medium [&_h2]:mt-0 [&_h2]:mx-0 [&_h2]:mb-1.5 [&_p]:text-[15px] [&_p]:text-text [&_p]:mt-0 [&_p]:mx-0 [&_p]:mb-1 [&_small]:text-[13px] [&_small]:text-muted max-[760px]:[&_h2]:text-[24px]">
            <Avatar profile={profile} size={76} />
            <div>
              <h2>{profile.name}</h2>
              <p>{profile.role}</p>
              <small>@{profile.username}</small>
            </div>
          </div>
          <p>{profile.bio || "No bio yet."}</p>
          {profile.location && (
            <span className="flex items-center gap-1.75 text-[13px] text-muted mb-5">
              <MapPin size={15} />
              {profile.location}
            </span>
          )}
          <div className="flex gap-1.75 flex-wrap">
            {profile.skills.map((s) => (
              <span
                data-ui="badge"
                className="inline-flex items-center gap-1.25 py-1.25 px-2.25 bg-surface-raised border border-border rounded-[5px] text-muted text-[12px] font-normal leading-[1.3]"
                key={s}
              >
                {s}
              </span>
            ))}
          </div>
          <h4>Open to</h4>
          <div className="flex gap-1.75 flex-wrap">
            {profile.lookingFor.map((s) => (
              <span
                data-ui="badge"
                className="inline-flex items-center gap-1.25 py-1.25 px-2.25 bg-surface-raised border border-border rounded-[5px] text-muted text-[12px] font-normal leading-[1.3]"
                key={s}
              >
                {s}
              </span>
            ))}
          </div>
          <div className="flex items-center flex-wrap gap-2.5 mt-7.5">
            {profile.id === me.id ? (
              <Link
                data-ui="button button-primary"
                className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-primary text-primary-ink enabled:hover:bg-primary-hover enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
                href="/profile"
                onClick={onClose}
              >
                Your profile <ChevronRight size={16} />
              </Link>
            ) : c?.status === "accepted" ? (
              <Link
                href="/messages"
                onClick={onClose}
                data-ui="button button-primary"
                className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-primary text-primary-ink enabled:hover:bg-primary-hover enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
              >
                <Check size={16} /> Send a message
              </Link>
            ) : c ? (
              <button
                data-ui="button button-secondary"
                className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-surface text-ink enabled:hover:bg-surface-hover enabled:hover:border-faint enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
                disabled
              >
                <Clock size={16} /> Request pending
              </button>
            ) : (
              <button
                data-ui="button button-primary"
                className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-primary text-primary-ink enabled:hover:bg-primary-hover enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
                onClick={() => void requestConnection(profile.id)}
              >
                <UserPlus size={16} /> Let's connect
              </button>
            )}
            {safeUrl(profile.website) && (
              <a
                data-ui="button button-secondary"
                className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-surface border-border-strong text-ink enabled:hover:bg-surface-hover enabled:hover:border-faint enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
                href={safeUrl(profile.website)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Website <ChevronRight size={16} />
              </a>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
