
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans",
  description: "Choose the perfect plan for your coding needs. Unlock advanced AI reviews and premium features.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
