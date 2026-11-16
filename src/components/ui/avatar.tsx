"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";
import { initials } from "@/lib/utils";

// Literal classes let Tailwind generate every supported size at build time.
const avatarSizes = {
  23: "size-[23px] min-w-[23px] text-[7.36px]",
  27: "size-[27px] min-w-[27px] text-[8.64px]",
  30: "size-7.5 min-w-7.5 text-[9.6px]",
  33: "size-[33px] min-w-[33px] text-[10.56px]",
  38: "size-9.5 min-w-9.5 text-[12.16px]",
  39: "size-[39px] min-w-[39px] text-[12.48px]",
  40: "size-10 min-w-10 text-[12.8px]",
  42: "size-10.5 min-w-10.5 text-[13.44px]",
  43: "size-[43px] min-w-[43px] text-[13.76px]",
  44: "size-11 min-w-11 text-[14.08px]",
  72: "size-18 min-w-18 text-[23.04px]",
  76: "size-19 min-w-19 text-[24.32px]",
  90: "size-22.5 min-w-22.5 text-[28.8px]",
} as const;

export function Avatar({
  profile,
  size = 40,
}: {
  profile?: Profile;
  size?: keyof typeof avatarSizes;
}) {
  const [failed, setFailed] = useState(false);
  const name = profile?.name || "Builder";
  return (
    <span
      data-ui="avatar"
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-hover shadow-[inset_0_0_0_1px_var(--color-border)] align-middle font-medium text-text ${avatarSizes[size]}`}
      aria-label={name}
    >
      {profile?.avatar && !failed ? (
        <img
          className="size-full object-cover grayscale"
          src={profile.avatar}
          alt={name}
          width={size}
          height={size}
          onError={() => setFailed(true)}
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}
