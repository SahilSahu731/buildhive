import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PublicHeader,
  PublicFooter,
  Pricing,
  FAQ,
  Features,
  HowItWorks,
  Login,
  Docs,
  Legal,
  Contact,
  DemoPreview,
} from "@/components/hive/marketing";
const titles: Record<string, string> = {
  features: "Features",
  "how-it-works": "How it works",
  pricing: "Pricing",
  login: "Sign in",
  docs: "Documentation",
  faq: "FAQ",
  privacy: "Privacy policy",
  terms: "Terms of service",
  contact: "Contact",
  demo: "Sample test report",
  changelog: "Changelog",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: titles[slug] || "Not found" };
}
export default async function PublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  if (slug === "login") {
    const error = (await searchParams).error;
    return <Login error={typeof error === "string" ? error : undefined} />;
  }
  const pages: Record<string, React.ReactNode> = {
    changelog: (
      <>
        <div className="public-page-head">
          <span className="eyebrow">PRODUCT UPDATES</span>
          <h1>A better check, every release.</h1>
          <p>What’s new in BuildHive.</p>
        </div>
        <article className="panel form-section">
          <span className="eyebrow">V1 · INITIAL IMPLEMENTATION</span>
          <h2>Your release checklist, running in a browser.</h2>
          <p>
            Verified projects, a manual and AI-assisted test editor,
            deterministic Chromium execution, detailed reports, private
            artifacts, monitoring schedules and failure alerts.
          </p>
          <p>
            V1 also includes signed deployment hooks, plan allowances, account
            controls and an internal operations dashboard. Production
            availability depends on service configuration and release
            verification.
          </p>
          <Link className="text-link" href="/docs">
            Read the documentation →
          </Link>
        </article>
      </>
    ),
    features: <Features />,
    "how-it-works": <HowItWorks />,
    pricing: <Pricing />,
    docs: <Docs />,
    faq: <FAQ />,
    privacy: <Legal privacy />,
    terms: <Legal />,
    contact: <Contact />,
    demo: (
      <>
        <div className="public-page-head">
          <span className="eyebrow">ILLUSTRATIVE DATA · NO LIVE EXECUTION</span>
          <h1>
            Less “something broke.”
            <br />
            More “here’s what happened.”
          </h1>
          <p>
            Explore the steps below to see how a BuildHive report makes failures
            actionable.
          </p>
        </div>
        <DemoPreview large />
      </>
    ),
  };
  if (!pages[slug]) notFound();
  return (
    <>
      <PublicHeader />
      <main className="section-wrap public-page">{pages[slug]}</main>
      <PublicFooter />
    </>
  );
}
