import Link from "next/link";
export default function NotFound() {
  return (
    <main className="flex flex-col items-center text-center py-[55px] px-7 text-muted [&_h3]:text-ink [&_h3]:text-[21px] [&_h3]:font-medium [&_h3]:mt-[17px] [&_h3]:mx-0 [&_h3]:mb-[9px] [&_h2]:text-ink [&_h2]:text-[21px] [&_h2]:font-medium [&_h2]:mt-[17px] [&_h2]:mx-0 [&_h2]:mb-[9px] [&_p]:text-muted [&_p]:text-[15px] [&_p]:leading-[1.7] [&_p]:max-w-90 [&_p]:mt-0 [&_p]:mx-0 [&_p]:mb-5.5 [&[data-ui~=compact]]:py-[25px] [&[data-ui~=compact]]:px-2.5 min-h-svh justify-center">
      <span
        data-ui="eyebrow"
        className="text-[12px] text-muted font-medium tracking-[0] mb-2.5 flex gap-1.5 items-center"
      >
        404 · UNCHARTED TERRITORY
      </span>
      <h1>This idea hasn't been built yet.</h1>
      <p>Let's get you back to the people who are building.</p>
      <Link
        data-ui="button button-primary"
        className="inline-flex items-center justify-center gap-[9px] min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,_color_0.18s,_border-color_0.18s,_transform_0.18s] bg-primary text-primary-ink enabled:hover:bg-primary-hover enabled:hover:[transform:translateY(-1px)] enabled:active:[transform:translateY(0)] motion-reduce:enabled:hover:transform-none"
        href="/"
      >
        Back to the community
      </Link>
    </main>
  );
}
