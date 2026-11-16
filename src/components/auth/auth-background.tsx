import Image from "next/image";

/** Decorative artwork stays separate from form state and keyboard interaction. */
export function AuthBackground() {
  return (
    <div
      className='absolute inset-0 -z-1 pointer-events-none select-none overflow-hidden after:[content:""] after:absolute after:inset-0 after:[background:radial-gradient(_ellipse_24%_70%_at_50%_46%,_#000_8%,_#000b_48%,_transparent_100%_),_linear-gradient(180deg,_#0005,_transparent_22%,_transparent_70%,_#0004)] max-[900px]:after:[background:radial-gradient(_ellipse_35%_72%_at_50%_48%,_#000_10%,_#000c_58%,_transparent_100%_)] max-[600px]:after:[background:linear-gradient(_180deg,_#0003_0%,_#0004_12%,_#000c_35%,_#000f_58%_)]'
      aria-hidden="true"
    >
      <Image
        src="/artwork/auth-sculpture.webp"
        alt=""
        fill
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        className="object-cover object-center [transform-origin:50%_50%] animate-[auth-material-drift_28s_ease-in-out_infinite_alternate] max-[900px]:object-[66%_center] max-[900px]:opacity-85 max-[600px]:object-[76%_top] max-[600px]:opacity-75 motion-reduce:animate-none motion-reduce:transform-none"
      />
    </div>
  );
}
