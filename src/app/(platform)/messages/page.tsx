import { Messages } from "@/components/features/messages";
import { Suspense } from "react";
export const metadata = { title: "Your conversations" };
export default function Page() {
  return (
    <Suspense
      fallback={
        <p role="status" className="text-sm text-muted">
          Loading conversations…
        </p>
      }
    >
      <Messages />
    </Suspense>
  );
}
