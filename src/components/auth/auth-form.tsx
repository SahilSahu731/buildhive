"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LoaderCircle } from "@/components/ui/icons";
import { SiGithub } from "react-icons/si";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { safeNext } from "@/lib/auth-redirect";
import { authFailure, type AuthOperation } from "@/lib/auth-errors";
import { OtpInput, emptyOtp } from "./otp-input";
import Image from "next/image";
import GoogleIcon from "../../../public/google.svg";
import { MdEmail } from "react-icons/md";

export function AuthForm({
  configured,
  initialError,
  nextPath,
}: {
  configured: boolean;
  initialError?: string;
  nextPath?: string;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string[]>(emptyOtp);
  const [busy, setBusy] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(
    initialError === "oauth_failed"
      ? "We couldn't complete that sign-in. Please try again."
      : "",
  );
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  const callbackUrl = () => {
    const url = new URL("/auth/callback", window.location.origin);
    url.searchParams.set("next", safeNext(nextPath, window.location.origin));
    return url.href;
  };
  function showError(error: unknown, operation: AuthOperation) {
    const failure = authFailure(error, operation);
    setError(
      process.env.NODE_ENV === "development"
        ? `${failure.message} ${failure.hint} [${failure.code}${failure.status ? `, HTTP ${failure.status}` : ""}]`
        : failure.message,
    );
  }
  async function oauth(provider: "google" | "github") {
    if (!configured || busy) return;
    setBusy(provider);
    setError("");
    try {
      const { error } = await createClient().auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl(),
          ...(provider === "github" ? { scopes: "read:user user:email" } : {}),
        },
      });
      if (error) throw error;
    } catch (e) {
      showError(e, "oauth");
      setBusy(null);
    }
  }
  async function sendCode(resend = false) {
    const normalized = email.trim().toLowerCase();
    if (!z.email().safeParse(normalized).success) {
      setError("Enter a valid email address.");
      return;
    }
    if (!configured || busy || (resend && cooldown > 0)) return;
    setBusy("email");
    setError("");
    setNotice("");
    try {
      const { error } = await createClient().auth.signInWithOtp({
        email: normalized,
        options: { shouldCreateUser: true, emailRedirectTo: callbackUrl() },
      });
      if (error) throw error;
      setEmail(normalized);
      setStage("verify");
      setCode(emptyOtp());
      setCooldown(60);
      setNotice(resend ? "A fresh code is on its way. Check your inbox." : "");
    } catch (e) {
      showError(e, "send-code");
    } finally {
      setBusy(null);
    }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured || busy) return;
    if (stage === "email") return sendCode();
    const token = code.join("");
    if (!/^\d{6}$/.test(token)) {
      setError("Enter the six-digit code from your email.");
      return;
    }
    setBusy("verify");
    setError("");
    try {
      const { error } = await createClient().auth.verifyOtp({
        email,
        token,
        type: "email",
      });
      if (error) throw error;
      router.replace(safeNext(nextPath, window.location.origin));
      router.refresh();
    } catch (e) {
      showError(e, "verify-code");
      setBusy(null);
    }
  }
  return (
    <div>
      {stage === "verify" && (
        <button
          type="button"
          className="mb-5.5 flex min-h-9 items-center gap-2 bg-transparent p-0 text-sm text-text hover:text-ink"
          disabled={!!busy}
          onClick={() => {
            setStage("email");
            setCode(emptyOtp());
            setError("");
            setNotice("");
          }}
        >
          <ArrowLeft size={18} />
          Use a different email
        </button>
      )}
      <h1
        id="auth-title"
        className="mb-4 max-w-85 text-4xl font-medium leading-[1.18] tracking-[-1.5px] max-[600px]:text-[34px]"
      >
        {stage === "email" ? "Build something together." : "Check your email"}
      </h1>
      <p className="mb-8 text-base leading-[1.75] wrap-anywhere max-[600px]:text-[13px] [@media(max-height:700px)]:mb-6">
        {stage === "email" ? (
          "Sign in or create your builder profile."
        ) : (
          <>
            We sent a six-digit verification code to{" "}
            <strong className="font-medium text-ink">{email}</strong>. Enter it
            below to continue.
          </>
        )}
      </p>
      {!configured && (
        <div className="mb-6.5 border-l-2 border-brand pl-3.25 text-[13px] leading-[1.7] text-muted">
          <span>
            Sign-in isn't connected yet. You can explore the local demo.
          </span>
        </div>
      )}
      {stage === "email" && (
        <>
          <div className="grid gap-3">
            <button
              className="flex min-h-13 w-full items-center justify-center gap-3 rounded-lg bg-surface px-4.5 py-3 font-medium text-ink transition-[background,border-color,transform] duration-180 enabled:hover:-translate-y-px enabled:hover:border-faint enabled:hover:bg-surface-hover motion-reduce:translate-y-0"
              disabled={!configured || !!busy}
              onClick={() => void oauth("google")}
            >
              {busy === "google" ? (
                <LoaderCircle
                  className="animate-spin motion-reduce:animate-none"
                  size={22}
                />
              ) : (
                <Image src={GoogleIcon} alt="Google" width={22} height={22} />
              )}
              Continue with Google
            </button>
            <button
              className="flex min-h-13 w-full items-center justify-center gap-3 rounded-lg bg-surface px-4.5 py-3 font-medium text-ink transition-[background,border-color,transform] duration-180 enabled:hover:-translate-y-px enabled:hover:border-faint enabled:hover:bg-surface-hover motion-reduce:translate-y-0"
              disabled={!configured || !!busy}
              onClick={() => void oauth("github")}
            >
              {busy === "github" ? (
                <LoaderCircle
                  className="animate-spin motion-reduce:animate-none"
                  size={22}
                />
              ) : (
                <SiGithub size={24} />
              )}
              Continue with GitHub
            </button>
          </div>
          <div className="my-6.5 flex items-center gap-4 whitespace-nowrap text-[14px] text-muted">
            <span className="h-px flex-1 bg-border" />
            or continue with email
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}
      <form onSubmit={submit} className="grid gap-4.75" aria-busy={!!busy}>
        {stage === "email" ? (
          <label
            className="grid gap-3 text-sm font-medium"
            htmlFor="auth-email"
          >
            Email address
            <div className="flex items-center gap-2.75 rounded-lg bg-surface px-4  focu">
              <MdEmail size={22} />
              <input
                className="min-h-13 w-full min-w-0 bg-transparent py-3 text-ink outline-none placeholder:text-faint focus:outline-none"
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!configured || !!busy}
              />
            </div>
          </label>
        ) : (
          <OtpInput
            value={code}
            onChange={(digits) => {
              setCode(digits);
              setError("");
            }}
            disabled={!!busy}
            invalid={!!error}
          />
        )}
        {error && (
          <p
            id="auth-error"
            className="m-0 text-sm leading-[1.6] text-danger-text"
            role="alert"
          >
            {error}
          </p>
        )}
        {notice && (
          <p className="m-0 text-sm leading-[1.6] text-text" role="status">
            {notice}
          </p>
        )}
        <button
          data-ui="button button-primary auth-submit"
          className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-transparent bg-brand px-5 py-3 font-semibold leading-[1.4] text-brand-ink transition-[background,color,border-color,transform] duration-180 enabled:hover:-translate-y-px enabled:hover:bg-brand-hover enabled:active:translate-y-0 motion-reduce:translate-y-0"
          type="submit"
          disabled={!configured || !!busy}
        >
          {busy === "email" || busy === "verify" ? (
            <LoaderCircle
              className="animate-spin motion-reduce:animate-none"
              size={17}
            />
          ) : null}
          {busy === "email"
            ? "Sending you code…"
            : busy === "verify"
              ? "Verifying…"
              : stage === "email"
                ? "Continue with email"
                : "Verify email"}
        </button>
      </form>
      {stage === "verify" ? (
        <p className="mt-6 text-center text-sm leading-[1.8] text-muted">
          Didn't get it?{" "}
          <button
            className="min-h-9 bg-transparent p-1 hover:underline text-brand-text"
            disabled={!!busy || cooldown > 0}
            onClick={() => void sendCode(true)}
          >
            {cooldown ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </p>
      ) : (
        <p className="mt-6 text-center text-[13px] leading-[1.8] text-muted">
          {/* New here? Signing in creates your account. */}
        </p>
      )}
      {!configured && (
        <Link
          className="mx-auto mt-5.75 flex min-h-11 w-max items-center justify-center gap-2.25 text-sm text-brand-text hover:underline"
          href="/"
        >
          Explore the demo <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
