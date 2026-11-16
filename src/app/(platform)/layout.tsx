import { WorkspaceProvider } from "@/components/providers/workspace-provider";
import { AppShell } from "@/components/layout/app-shell";
import { makeDemoData } from "@/lib/demo-data";
export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider initialData={makeDemoData()}>
      <AppShell>{children}</AppShell>
    </WorkspaceProvider>
  );
}
