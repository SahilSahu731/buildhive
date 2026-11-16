import Link from "next/link";
import {
  PiBracketsCurlyBold as Asterisk,
  PiArrowLeft as ArrowLeft,
} from "react-icons/pi";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthBackground } from "@/components/auth/auth-background";
import { supabaseConfigured } from "@/lib/env";
export const metadata = { title: "Sign in" };
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="relative isolate min-h-svh overflow-clip bg-canvas px-8 pb-18 max-[600px]:px-6 max-[600px]:pb-12">
      <AuthBackground />
      <header className="relative mx-auto flex h-25 max-w-350 items-center justify-between gap-5 max-[600px]:h-20.5">
        <Link
          data-ui="brand"
          className="inline-flex items-center text-[21px] font-semibold tracking-[-0.9px] whitespace-nowrap"
          href="/"
        >
          <span className="grid place-items-center text-brand w-8.75 h-9 mr-1.75 shrink-0 max-[950px]:mr-1 max-[950px]:w-7.5">
            <Asterisk size={30} />
          </span>
          buildwithme
          <span className="text-brand">.</span>
        </Link>
        <Link
          className="flex min-h-11 items-center gap-3 text-sm px-6 rounded-4xl text-text hover:text-ink hover:bg-surface/70 transition-all duration-500 max-[600px]:w-10 max-[600px]:justify-center max-[600px]:gap-0 max-[600px]:text-[0px]"
          href="/"
        >
          <ArrowLeft size={20} />
          Back to home
        </Link>
      </header>
      <main
        className="relative mx-auto mt-[clamp(35px,9vh,110px)] w-full max-w-102 animate-[auth-reveal_0.65s_cubic-bezier(0.22,1,0.36,1)_both] max-[600px]:mt-11.25 max-[600px]:max-w-100 [@media(max-height:700px)]:mt-6 motion-reduce:animate-none"
        aria-labelledby="auth-title"
      >
        {/* <span
          className="mb-6 inline-flex text-brand max-[600px]:mb-5.5 [@media(max-height:700px)]:mb-4"
          aria-hidden="true"
        >
          <Asterisk size={38} />
        </span> */}
        <AuthForm
          configured={supabaseConfigured}
          initialError={params.error}
          nextPath={params.next}
        />
      </main>
    </div>
  );
}
