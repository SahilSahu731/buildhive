export default function sitemap() {
  return [
    "",
    "/features",
    "/how-it-works",
    "/pricing",
    "/docs",
    "/faq",
    "/changelog",
    "/contact",
    "/privacy",
    "/terms",
    "/demo",
  ].map((path) => ({
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://buildhive.app"}${path}`,
  }));
}
