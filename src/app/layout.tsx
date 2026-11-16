import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BuildWithMe — Find your people. Build something great.",
    template: "%s · BuildWithMe",
  },
  description:
    "A home for people who make things. Share what you're building, discover your next cofounder, and turn a good idea into something real.",
  applicationName: "BuildWithMe",
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  colorScheme: "dark",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
