import { Explore } from "@/components/features/explore";
export const metadata = { title: "Explore projects" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const params = await searchParams;
  return (
    <Explore
      initialProject={
        typeof params.project === "string" ? params.project : undefined
      }
    />
  );
}
