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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "login") return <Login />;
  const pages: Record<string, React.ReactNode> = {
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
