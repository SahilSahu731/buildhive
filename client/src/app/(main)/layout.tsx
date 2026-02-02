
import { Navbar } from "@/components/layout/navbar";
import { AnnouncementBanner } from "@/components/layout/announcement-banner";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AnnouncementBanner />
      <Navbar />
      {children}
    </>
  );
}
