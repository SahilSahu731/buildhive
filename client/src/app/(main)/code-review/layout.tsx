
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Code Review",
  description: "Get instant, AI-powered feedback on your code. Detect bugs, security vulnerabilities, and improve performance.",
};

export default function CodeReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
