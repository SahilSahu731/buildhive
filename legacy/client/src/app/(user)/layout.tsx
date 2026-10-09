import { UserShell } from "@/components/layout/user-shell";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <UserShell>{children}</UserShell>;
}
