
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Projects",
  description: "Discover amazing open source projects, find collaborators, and join teams building the next big thing.",
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
