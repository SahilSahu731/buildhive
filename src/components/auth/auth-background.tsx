import Image from "next/image";

/** Decorative artwork stays separate from form state and keyboard interaction. */
export function AuthBackground() {
  return (
    <div
      className='absolute inset-0 -z-1 pointer-events-none select-none overflow-hidden after:[content:""] after:absolute after:inset-0 after:[background:radial-gradient(ellipse_24%_70%_at_50%_46%,#000_8%,#000b_48%,transparent_100%),linear-gradient(180deg,#0005,transparent_22%,transparent_70%,#0004)] max-[900px]:after:[background:radial-gradient(ellipse_35%_72%_at_50%_48%,#000_10%,#000c_58%,transparent_100%)] max-[600px]:after:[background:linear-gradient(180deg,#0003_0%,#0004_12%,#000c_35%,#000f_58%)]'
      aria-hidden="true"
    >
      <Image
        src="/artwork/auth-sculpture.webp"
        alt=""
        fill
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        className="object-cover object-center origin-[50%_50%] animate-[auth-material-drift_28s_ease-in-out_infinite_alternate] max-[900px]:object-[66%_center] max-[900px]:opacity-85 max-[600px]:object-[76%_top] max-[600px]:opacity-75 motion-reduce:animate-none motion-reduce:transform-none"
      />
    </div>
  );
}
