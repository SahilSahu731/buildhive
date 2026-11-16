"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center py-13.75 px-7 text-muted [&_h3]:text-ink [&_h3]:text-[21px] [&_h3]:font-medium [&_h3]:mt-4.25 [&_h3]:mx-0 [&_h3]:mb-2.25 [&_h2]:text-ink [&_h2]:text-[21px] [&_h2]:font-medium [&_h2]:mt-4.25 [&_h2]:mx-0 [&_h2]:mb-2.25 [&_p]:text-muted [&_p]:text-[15px] [&_p]:leading-[1.7] [&_p]:max-w-90 [&_p]:mt-0 [&_p]:mx-0 [&_p]:mb-5.5 data-[ui~=compact]:py-6.25 data-[ui~=compact]:px-2.5">
      <span className="grid place-items-center text-brand w-8.75 h-9 mr-1.75 shrink-0 max-[950px]:mr-1 max-[950px]:w-7.5">
        ✳
      </span>
      <h2>A small bump in the build.</h2>
      <p>We couldn't load this page. Give it another try.</p>
      <button
        data-ui="button button-primary"
        className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-primary text-primary-ink enabled:hover:bg-primary-hover enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
        onClick={reset}
      >
        Try again
      </button>
    </div>
  );
}
