"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  PiLightbulb,
  PiBug,
  PiChatCircle,
  PiPaperPlaneTilt,
  PiSpinnerGap,
} from "react-icons/pi";
import { Modal } from "@/components/ui/modal";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { feedbackSchema } from "@/lib/validation";

export function FeedbackDialog({
  open,
  onClose,
  path,
}: {
  open: boolean;
  onClose: () => void;
  path: string;
}) {
  const { demo, notify } = useWorkspace();
  const [category, setCategory] = useState<"idea" | "bug" | "other">("idea");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (sending || demo) return;
    const parsed = feedbackSchema.safeParse({ category, message, path });
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message || "Please check your feedback.",
      );
      return;
    }
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.error || "Couldn't send your feedback. Please try again.",
        );
      }
      setMessage("");
      onClose();
      notify("Thanks for helping make BuildWithMe better. Feedback received.");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Couldn't send your feedback. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Help shape BuildWithMe"
      description="An idea, a rough edge, or something you love. We're listening."
    >
      <form onSubmit={submit} className="space-y-5">
        <fieldset disabled={sending} className="m-0 min-w-0 border-0 p-0">
          <legend className="mb-2.5 text-xs text-muted">
            What's on your mind?
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["idea", "Idea", PiLightbulb],
                ["bug", "Issue", PiBug],
                ["other", "Other", PiChatCircle],
              ] as const
            ).map(([value, label, Icon]) => (
              <label key={value} className="cursor-pointer">
                <input
                  type="radio"
                  name="feedback-category"
                  value={value}
                  checked={category === value}
                  onChange={() => setCategory(value)}
                  className="peer sr-only"
                />
                <span className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border text-sm text-muted transition-colors hover:bg-surface-hover peer-checked:border-ink/60 peer-checked:bg-surface-hover peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand">
                  <Icon size={18} />
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label
            htmlFor="feedback-message"
            className="mb-2.5 block text-xs text-muted"
          >
            Tell us a little more
          </label>
          <textarea
            id="feedback-message"
            required
            minLength={10}
            maxLength={3000}
            value={message}
            disabled={sending}
            onChange={(event) => setMessage(event.target.value)}
            aria-describedby="feedback-note"
            aria-invalid={!!error}
            placeholder={
              category === "bug"
                ? "What happened, and what did you expect?"
                : "What would make building together better?"
            }
            className="min-h-36 w-full resize-y rounded-xl border border-border bg-canvas p-4 text-sm leading-relaxed text-ink placeholder:text-muted/60"
          />
          <div className="mt-2 flex justify-between gap-3 text-[11px] text-muted">
            <span id="feedback-note">
              The current page is included. Please leave out sensitive details.
            </span>
            <span className="shrink-0">{message.length}/3000</span>
          </div>
        </div>
        {error && (
          <p role="alert" className="m-0 text-sm text-danger-text">
            {error}
          </p>
        )}
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
          {demo ? (
            <>
              <span className="text-xs text-muted">
                Sign in to send your feedback.
              </span>
              <Link
                href="/login"
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-ink hover:bg-primary-hover"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              <span className="text-xs text-muted">
                Small details make a big difference.
              </span>
              <button
                type="submit"
                disabled={sending || message.trim().length < 10}
                className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-ink hover:bg-primary-hover"
              >
                {sending ? (
                  <PiSpinnerGap
                    size={17}
                    className="animate-spin motion-reduce:animate-none"
                  />
                ) : (
                  <PiPaperPlaneTilt size={17} />
                )}
                {sending ? "Sending…" : "Send feedback"}
              </button>
            </>
          )}
        </div>
      </form>
    </Modal>
  );
}
