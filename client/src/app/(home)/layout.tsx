import { AnnouncementBanner } from "@/components/layout/announcement-banner";
import { Navbar } from "@/components/layout/navbar";

export default function HomeLayout({
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
