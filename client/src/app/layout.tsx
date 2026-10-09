import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/hive/ui";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://buildhive.app",
  ),
  title: {
    default: "BuildHive — Build it. Test it. Ship it.",
    template: "%s · BuildHive",
  },
  description:
    "Catch broken user journeys before your customers do. Repeatable browser tests, clear failure reports, and continuous monitoring for developers who ship.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
